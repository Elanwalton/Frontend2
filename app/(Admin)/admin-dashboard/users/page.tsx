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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
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
  status: "Active" | "Unverified" | "Suspended";
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

  const [refreshKey, setRefreshKey] = useState(0);

  const [actionPending, setActionPending] = useState<Record<number, boolean>>({});
  const [globalPending, setGlobalPending] = useState(false);

  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addFirstName, setAddFirstName] = useState('');
  const [addSecondName, setAddSecondName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addRole, setAddRole] = useState<User['role']>('customer');
  const [addStatus, setAddStatus] = useState<User['status']>('Unverified');
  const [addPassword, setAddPassword] = useState('');

  const [editRole, setEditRole] = useState<User["role"]>("customer");
  const [editStatus, setEditStatus] = useState<User["status"]>("Active");

  const [toast, setToast] = useState<{ open: boolean; severity: "success" | "error" | "info"; message: string }>(
    { open: false, severity: "info", message: "" }
  );

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
  }, [logout, router, refreshKey]);

  const refetchUsers = () => setRefreshKey((k) => k + 1);

  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const withRowLock = async (userId: number, fn: () => Promise<void>) => {
    if (actionPending[userId]) return;
    setActionPending((m) => ({ ...m, [userId]: true }));
    try {
      await fn();
    } finally {
      setActionPending((m) => ({ ...m, [userId]: false }));
    }
  };

  const resetAddForm = () => {
    setAddFirstName('');
    setAddSecondName('');
    setAddEmail('');
    setAddPhone('');
    setAddRole('customer');
    setAddStatus('Unverified');
    setAddPassword('');
  };

  const withGlobalLock = async (fn: () => Promise<void>) => {
    if (globalPending) return;
    setGlobalPending(true);
    try {
      await fn();
    } finally {
      setGlobalPending(false);
    }
  };

  const apiPost = async (path: string, body: any) => {
    const url = getApiUrl(path);
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      throw new Error(data?.message || `HTTP ${res.status}`);
    }
    return data;
  };

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
    const colors: Record<User['status'], string> = {
      Active: '#10b981',
      Unverified: '#f59e0b',
      Suspended: '#ef4444',
    };
    return colors[status];
  };

  const getStatusIcon = (status: User["status"]) => {
    const icons: Record<User['status'], React.ReactElement> = {
      Active: <CheckCircleIcon size={14} />,
      Unverified: <CheckCircleIcon size={14} />,
      Suspended: <XCircleIcon size={14} />,
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
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.25,
            py: 0.5,
            borderRadius: '999px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            textTransform: 'capitalize',
            backgroundColor: `${getRoleColor(value as User['role'])}15`,
            border: `1px solid ${getRoleColor(value as User['role'])}30`,
            color: getRoleColor(value as User['role']),
          }}
        >
          {getRoleIcon(value as User['role'])}
          {prettyRole(value as User['role'])}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.25,
            py: 0.5,
            borderRadius: '999px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            textTransform: 'capitalize',
            backgroundColor: `${getStatusColor(value as User['status'])}15`,
            border: `1px solid ${getStatusColor(value as User['status'])}30`,
            color: getStatusColor(value as User['status']),
          }}
        >
          {getStatusIcon(value as User['status'])}
          {String(value as User['status'])}
        </Box>
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
    setEditUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
  };

  const handleDelete = (user: User) => {
    setDeleteUser(user);
  };

  const handleView = (user: User) => {
    setViewUser(user);
  };

  const handleExport = () => {
    void withGlobalLock(async () => {
      const header = ['id', 'name', 'email', 'phone', 'role', 'status', 'joined'];
      const rows = visible.map((u) => [u.id, u.name, u.email, u.phone, u.role, u.status, u.joined]);
      const escape = (v: any) => {
        const s = String(v ?? '');
        if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
        return s;
      };
      const csv = [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToast({ open: true, severity: 'success', message: 'Export generated' });
    });
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
          disabled={globalPending}
        >
          Export
        </Button>

        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          disabled={globalPending}
          onClick={() => {
            resetAddForm();
            setAddOpen(true);
          }}
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

      {/* View dialog */}
      <Dialog open={!!viewUser} onClose={() => setViewUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {viewUser && (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography><strong>Name:</strong> {viewUser.name}</Typography>
              <Typography><strong>Email:</strong> {viewUser.email}</Typography>
              <Typography><strong>Phone:</strong> {viewUser.phone}</Typography>
              <Typography><strong>Role:</strong> {prettyRole(viewUser.role)}</Typography>
              <Typography><strong>Status:</strong> {viewUser.status}</Typography>
              <Typography><strong>Joined:</strong> {new Date(viewUser.joined).toLocaleString()}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          {editUser && (
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Typography><strong>{editUser.name}</strong> ({editUser.email})</Typography>
              <FormControl size="small">
                <InputLabel>Role</InputLabel>
                <Select value={editRole} label="Role" onChange={(e) => setEditRole(e.target.value as User['role'])}>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>Status</InputLabel>
                <Select value={editStatus} label="Status" onChange={(e) => setEditStatus(e.target.value as User['status'])}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Unverified">Unverified</MenuItem>
                  <MenuItem value="Suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)} disabled={!!editUser && actionPending[editUser.id]}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!editUser || !!actionPending[editUser.id]}
            onClick={() => {
              if (!editUser) return;
              void withRowLock(editUser.id, async () => {
                // NOTE: API endpoints for these actions may not exist yet.
                // We'll attempt conventional endpoints; if missing you will see a toast.
                try {
                  await apiPost('/api/admin/updateUser', {
                    id: editUser.id,
                    role: editRole,
                    status: editStatus,
                  });
                  setToast({ open: true, severity: 'success', message: 'User updated' });
                  setEditUser(null);
                  refetchUsers();
                } catch (e: any) {
                  setToast({ open: true, severity: 'error', message: e?.message || 'Failed to update user' });
                }
              });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteUser} onClose={() => setDeleteUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent dividers>
          {deleteUser && (
            <Typography>
              Delete <strong>{deleteUser.name}</strong> ({deleteUser.email})? This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUser(null)} disabled={!!deleteUser && actionPending[deleteUser.id]}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!deleteUser || !!actionPending[deleteUser.id]}
            onClick={() => {
              if (!deleteUser) return;
              void withRowLock(deleteUser.id, async () => {
                try {
                  await apiPost('/api/admin/deleteUser', { id: deleteUser.id });
                  setToast({ open: true, severity: 'success', message: 'User deleted' });
                  setDeleteUser(null);
                  refetchUsers();
                } catch (e: any) {
                  setToast({ open: true, severity: 'error', message: e?.message || 'Failed to delete user' });
                }
              });
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add user dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="First name"
              value={addFirstName}
              onChange={(e) => setAddFirstName(e.target.value)}
              size="small"
            />
            <TextField
              label="Second name"
              value={addSecondName}
              onChange={(e) => setAddSecondName(e.target.value)}
              size="small"
            />
            <TextField
              label="Email"
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              size="small"
            />
            <TextField
              label="Phone (optional)"
              value={addPhone}
              onChange={(e) => setAddPhone(e.target.value)}
              size="small"
            />
            <TextField
              label="Temporary password"
              type="password"
              value={addPassword}
              onChange={(e) => setAddPassword(e.target.value)}
              size="small"
              helperText="User can change later"
            />
            <FormControl size="small">
              <InputLabel>Role</InputLabel>
              <Select value={addRole} label="Role" onChange={(e) => setAddRole(e.target.value as User['role'])}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select value={addStatus} label="Status" onChange={(e) => setAddStatus(e.target.value as User['status'])}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Unverified">Unverified</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={globalPending}>Cancel</Button>
          <Button
            variant="contained"
            disabled={globalPending}
            onClick={() => {
              void withGlobalLock(async () => {
                try {
                  const first_name = addFirstName.trim();
                  const second_name = addSecondName.trim();
                  const email = addEmail.trim();
                  const password = addPassword;
                  const phone = addPhone.trim();

                  if (!first_name || !second_name || !email || !password) {
                    setToast({ open: true, severity: 'error', message: 'First name, second name, email and password are required' });
                    return;
                  }

                  await apiPost('/api/admin/createUser', {
                    first_name,
                    second_name,
                    email,
                    phone: phone ? phone : null,
                    role: addRole,
                    status: addStatus,
                    password,
                  });

                  setToast({ open: true, severity: 'success', message: 'User created' });
                  setAddOpen(false);
                  refetchUsers();
                } catch (e: any) {
                  setToast({ open: true, severity: 'error', message: e?.message || 'Failed to create user' });
                }
              });
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={closeToast}>
        <Alert onClose={closeToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
