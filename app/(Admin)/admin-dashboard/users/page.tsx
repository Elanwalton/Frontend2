"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/apiUrl';
import {
  Box,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Typography,
} from "@mui/material";
import { 
  Search as SearchIcon, 
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  FileDownload as ExportIcon,
} from "@mui/icons-material";
import { PageHeader, DataTable, StatusBadge, MetricCard, Column } from '@/components/admin';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  CheckCircle as CheckCircleIcon, 
  XCircle as XCircleIcon, 
  User as UserIcon, 
  Shield as ShieldIcon, 
  ShoppingBag as CustomerIcon,
  CircleUser as PersonIcon
} from 'lucide-react';
import styles from '@/styles/adminDashboard.module.css';

/* ───── Types ───── */
export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "staff" | "customer";
  status: "Active" | "Suspended";
  joined: string; // ISO date
};

export default function UserManagement() {
  /* global helpers */
  const { logout } = useAuth();
  const router = useRouter();

  /* state */
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"" | User["role"]>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof User>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  /* fetch on mount */
  useEffect(() => {
    (async () => {
      try {
        const usersEndpoint = getApiUrl('/api/admin/getUsers');
        const res = await fetch(usersEndpoint, {
          credentials: 'include',
          headers: {}
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.message || 'Failed to fetch users');
          return;
        }
        setUsers(data.users as User[]);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [logout, router]);

  /* live filtering and sorting */
  const visible = useMemo(() => {
    let filtered = users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search);
      const matchRole = filterRole ? u.role === filterRole : true;
      return matchSearch && matchRole;
    });

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, search, filterRole, order, orderBy]);

  /* helpers */
  const prettyRole = (r: User["role"]) =>
    r.charAt(0).toUpperCase() + r.slice(1);

  const getStatusColor = (status: User["status"]) => {
    const colors = {
      Active: '#10b981',
      Suspended: '#ef4444'
    };
    return colors[status];
  };

  const getStatusIcon = (status: User["status"]) => {
    const icons = {
      Active: <CheckCircleIcon size={14} />,
      Suspended: <XCircleIcon size={14} />
    };
    return icons[status];
  };

  const getRoleColor = (role: User["role"]) => {
    const colors = {
      admin: '#dc2626',
      staff: '#3b82f6', 
      customer: '#6b7280'
    };
    return colors[role];
  };

  const getRoleIcon = (role: User["role"]) => {
    const icons = {
      admin: <ShieldIcon size={14} />,
      staff: <UserIcon size={14} />,
      customer: <CustomerIcon size={14} />
    };
    return icons[role];
  };

  const handleRequestSort = (property: keyof User) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Define columns for DataTable
  const columns: Column[] = [
    { 
      id: 'name', 
      label: 'Name', 
      minWidth: 150,
      format: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PersonIcon size={16} style={{ color: '#666' }} />
          {value}
        </div>
      )
    },
    { id: 'email', label: 'Email', minWidth: 200 },
    { id: 'phone', label: 'Phone', minWidth: 120 },
    {
      id: 'role',
      label: 'Role',
      minWidth: 100,
      format: (value, row) => (
        <span 
          className={styles.statusBadge}
          style={{ 
            backgroundColor: `${getRoleColor(value as User["role"])}15`,
            color: getRoleColor(value as User["role"]),
            borderColor: `${getRoleColor(value as User["role"])}30` 
          }}
        >
          {getRoleIcon(value as User["role"])}
          {prettyRole(value as User["role"])}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <span 
          className={styles.statusBadge}
          style={{ 
            backgroundColor: `${getStatusColor(value as User["status"])}15`,
            color: getStatusColor(value as User["status"]),
            borderColor: `${getStatusColor(value as User["status"])}30` 
          }}
        >
          {getStatusIcon(value as User["status"])}
          {value as User["status"]}
        </span>
      ),
    },
    {
      id: 'joined',
      label: 'Joined',
      minWidth: 120,
      format: (value) => new Date(value as string).toLocaleDateString(),
    },
  ];

  const handleEdit = (user: User) => {
    console.log('Edit user:', user);
  };

  const handleDelete = (user: User) => {
    console.log('Delete user:', user);
  };

  const handleView = (user: User) => {
    console.log('View user:', user);
  };

  const handleExport = () => {
    console.log('Export users');
  };

  /* Calculate metrics */
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const staffCount = users.filter(u => u.role === 'staff').length;
    const customerCount = users.filter(u => u.role === 'customer').length;
    const activeCount = users.filter(u => u.status === 'Active').length;
    
    return [
      {
        title: 'Total Users',
        value: totalUsers.toString(),
        change: '+12%',
        trend: 'up' as const,
        period: 'All time',
        sparklineData: [totalUsers - 10, totalUsers - 8, totalUsers - 6, totalUsers - 5, totalUsers - 3, totalUsers - 2, totalUsers - 1, totalUsers, totalUsers, totalUsers],
        color: '#3b82f6'
      },
      {
        title: 'Administrators',
        value: adminCount.toString(),
        change: `${((adminCount / totalUsers) * 100).toFixed(0)}% of total`,
        trend: 'neutral' as const,
        period: 'Current',
        sparklineData: [adminCount, adminCount, adminCount, adminCount, adminCount, adminCount, adminCount, adminCount, adminCount, adminCount],
        color: '#ef4444'
      },
      {
        title: 'Staff Members',
        value: staffCount.toString(),
        change: `${((staffCount / totalUsers) * 100).toFixed(0)}% of total`,
        trend: 'neutral' as const,
        period: 'Current',
        sparklineData: [staffCount, staffCount, staffCount, staffCount, staffCount, staffCount, staffCount, staffCount, staffCount, staffCount],
        color: '#8b5cf6'
      },
      {
        title: 'Customers',
        value: customerCount.toString(),
        change: '+8%',
        trend: 'up' as const,
        period: 'This month',
        sparklineData: [customerCount - 5, customerCount - 4, customerCount - 3, customerCount - 2, customerCount - 1, customerCount, customerCount, customerCount, customerCount, customerCount],
        color: '#10b981'
      }
    ];
  }, [users]);

  /* render */
  if (loading) return <LoadingSpinner fullScreen message="Loading users" />;
  if (error) return <Box sx={{ p: 3 }}><Typography color="error">Error: {error}</Typography></Box>;

  const paginatedUsers = visible.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle="Manage users, roles, and permissions across the platform"
        icon={<PeopleIcon sx={{ fontSize: 32 }} />}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Users' },
        ]}
      />

      {/* Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <MetricCard {...metric} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={filterRole}
            label="Role"
            onChange={(e) => setFilterRole(e.target.value as any)}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="customer">Customer</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          onClick={handleExport}
        >
          Export
        </Button>

        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
        >
          Add User
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={visible}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        selectable
        loading={loading}
      />
    </Box>
  );
}
