import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  Tooltip,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import styles from '@/styles/adminDashboard.module.css';

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onDeleteRecord?: (row: any) => void;
  onView?: (row: any) => void;
  deleteLabel?: string;
  deleteIcon?: 'delete' | 'cancel';
  selectable?: boolean;
  onSelectionChange?: (selected: any[]) => void;
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
}

export default function DataTable({
  columns,
  rows,
  onEdit,
  onDelete,
  onDeleteRecord,
  onView,
  deleteLabel = 'Delete',
  deleteIcon = 'delete',
  selectable = false,
  onSelectionChange,
  loading = false,
  pagination,
  onPageChange,
}: DataTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<any[]>([]);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [actionMenuRow, setActionMenuRow] = useState<any | null>(null);

  // Use pagination from props if provided, otherwise use internal state
  const currentPage = pagination?.page || page + 1;
  const currentRowsPerPage = pagination?.limit || rowsPerPage;
  const totalRows = pagination?.total || (rows?.length || 0);

  const handleChangePage = (event: unknown, newPage: number) => {
    if (pagination && onPageChange) {
      onPageChange(newPage + 1); // Convert to 1-based indexing
    } else {
      setPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(rows);
      onSelectionChange?.(rows);
    } else {
      setSelected([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (row: any) => {
    const selectedIndex = selected.indexOf(row);
    let newSelected: any[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, row];
    } else {
      newSelected = selected.filter((item) => item !== row);
    }

    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const isSelected = (row: any) => selected.indexOf(row) !== -1;

  const sortedRows = React.useMemo(() => {
    if (!rows || !Array.isArray(rows)) return [];
    if (!orderBy) return rows;
    
    return [...rows].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, orderBy, order]);

  const paginatedRows = (sortedRows || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const hasActions = onEdit || onDelete || onView;

  const closeActionMenu = () => {
    setActionMenuAnchorEl(null);
    setActionMenuRow(null);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < (rows?.length || 0)}
                    checked={(rows?.length || 0) > 0 && selected.length === (rows?.length || 0)}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth, fontWeight: 600 }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell align="center" style={{ minWidth: 120, fontWeight: 600 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, index) => {
                const isItemSelected = isSelected(row);
                
                return (
                  <TableRow hover key={index} selected={isItemSelected}>
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={() => handleSelectRow(row)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format ? column.format(value, row) : value}
                        </TableCell>
                      );
                    })}
                    {hasActions && (
                      <TableCell align="center">
                        <Tooltip title="Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuAnchorEl(e.currentTarget);
                              setActionMenuRow(row);
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={closeActionMenu}
      >
        {onView && (
          <MenuItem
            onClick={() => {
              const r = actionMenuRow;
              closeActionMenu();
              if (r) onView(r);
            }}
          >
            <ViewIcon fontSize="small" style={{ marginRight: 8 }} />
            View
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem
            onClick={() => {
              const r = actionMenuRow;
              closeActionMenu();
              if (r) onEdit(r);
            }}
          >
            <EditIcon fontSize="small" style={{ marginRight: 8 }} />
            Edit
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              const r = actionMenuRow;
              closeActionMenu();
              if (r) onDelete(r);
            }}
          >
            {(deleteIcon === 'cancel' ? <CancelIcon fontSize="small" style={{ marginRight: 8 }} /> : <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />)}
            {deleteLabel}
          </MenuItem>
        )}
        {onDeleteRecord && (
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              const r = actionMenuRow;
              closeActionMenu();
              if (r) onDeleteRecord(r);
            }}
          >
            <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalRows}
        rowsPerPage={currentRowsPerPage}
        page={currentPage - 1} // Convert to 0-based indexing for TablePagination
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
