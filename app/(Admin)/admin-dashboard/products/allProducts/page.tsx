"use client";
import { getApiUrl } from '@/utils/apiUrl';
import { useState, useEffect } from "react";
import CreateProductModal from '@/components/CreateProduct';
import EditProductModal from '@/components/EditProductModal';
import ViewProductModal from '@/components/ViewProductModal';
import styles from '@/styles/adminDashboard.module.css';
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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Chip,
  Rating,
  Checkbox,
  Toolbar,
  Menu,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  FileDownload as FileDownloadIcon,
  Inventory as InventoryIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { PageHeader, DataTable, StatusBadge, MetricCard, Column } from '@/components/admin';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminErrorState from '@/components/admin/AdminErrorState';
import { 
  CheckCircle as CheckCircleIcon, 
  XCircle as XCircleIcon, 
  User as UserIcon, 
  Shield as ShieldIcon, 
  ShoppingBag as CustomerIcon,
  Package as PackageIcon,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  status: string;
  revenue: number;
  price: number;
  quantity: number;
  stock_quantity?: number;
  rating: number;
  is_featured?: boolean;
  featured_priority?: number;
}

const ProductManagement = () => {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof Product>("name");

  // Bulk selection state
  const [selected, setSelected] = useState<number[]>([]);
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  // Edit and View modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  
  // Feature toggle state
  const [featureLoading, setFeatureLoading] = useState<number | null>(null);

  // Calculate metrics
  const metrics = [
    { 
      title: "Total Products", 
      value: products.length.toString(), 
      change: "+2.79%", 
      trend: 'up' as const,
      period: 'All time',
      sparklineData: [products.length - 10, products.length - 8, products.length - 6, products.length - 4, products.length - 2, products.length - 1, products.length, products.length, products.length, products.length],
      color: "#3b82f6"
    },
    { 
      title: "Low Stock Items", 
      value: lowStockCount.toString(), 
      change: lowStockCount > 0 ? "Requires attention" : "All good", 
      trend: lowStockCount > 0 ? 'down' as const : 'up' as const,
      period: 'Current',
      sparklineData: [3, 3, 4, 4, 3, 3, 2, 2, 2, lowStockCount],
      color: lowStockCount > 0 ? "#ef4444" : "#10b981"
    },
    { 
      title: "Total Revenue", 
      value: new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(products.reduce((sum, p) => sum + (p.revenue || 0), 0)), 
      change: "+4.23%", 
      trend: 'up' as const,
      period: 'All time',
      sparklineData: [80000, 85000, 90000, 95000, 100000, 105000, 110000, 115000, 120000, products.reduce((sum, p) => sum + (p.revenue || 0), 0)],
      color: "#10b981"
    },
    { 
      title: "In Stock", 
      value: products.filter(p => p.status === 'Stock OK').length.toString(), 
      change: "+5.23%", 
      trend: 'up' as const,
      period: 'Available',
      sparklineData: [10, 15, 20, 25, 30, 35, 40, 45, 50, products.filter(p => p.status === 'Stock OK').length],
      color: "#8b5cf6"
    }
  ];

  // Fetch dashboard metrics for real low stock count
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(getApiUrl('/api/admin/getDashboardMetrics'), {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.low_stock) {
            setLowStockCount(data.low_stock.length);
          }
        }
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      }
    };

    fetchMetrics();
  }, []);

  // Fetch products from Next.js API route
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(getApiUrl('/api/admin/getProducts'), {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();

        if (!data.success) throw new Error(data.message);
        const normalized = (data.data || []).map((item: Product) => ({
          ...item,
          stock: item.stock_quantity ?? item.quantity ?? 0,
        }));
        setProducts(normalized);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Helper functions
  const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case 'active':
      case 'Stock OK': return 'success';
      case 'inactive':
      case 'Reorder': return 'warning';
      case 'Low Stock': return 'error';
      default: return 'default';
    }
  };

  const getBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': '#10b981',
      'Stock OK': '#10b981',
      'inactive': '#6b7280',
      'Reorder': '#f59e0b',
      'Low Stock': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactElement> = {
      'active': <CheckCircleIcon size={14} />,
      'Stock OK': <CheckCircleIcon size={14} />,
      'inactive': <XCircleIcon size={14} />,
      'Reorder': <AlertCircleIcon size={14} />,
      'Low Stock': <XCircleIcon size={14} />
    };
    return icons[status] || <PackageIcon size={14} />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const handleRequestSort = (property: keyof Product) => {
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

  // Bulk selection handlers
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = paginatedProducts.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectClick = (id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, productId: number) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedProductId(productId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProductId(null);
  };

  const handleEdit = () => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        setEditingProduct(product);
      }
    }
    handleMenuClose();
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? {
      ...updatedProduct,
      stock_quantity: updatedProduct.stock_quantity ?? 0,
      quantity: updatedProduct.stock_quantity ?? updatedProduct.quantity ?? 0,
    } : p));
    setEditingProduct(null);
  };

  const handleViewDetails = () => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        setViewingProduct(product);
      }
    }
    handleMenuClose();
  };

  const handleDuplicate = async () => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        const duplicatedProduct = {
          ...product,
          name: `${product.name} (Copy)`,
          id: undefined // Remove ID so API creates new one
        };
        
        try {
          const response = await fetch(getApiUrl('/api/admin/duplicateProduct'), {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(duplicatedProduct)
        });

          const result = await response.json();
          
          if (result.success) {
            // Add duplicated product with temporary ID
            const newProduct: Product = {
              ...duplicatedProduct,
              id: Date.now(),
            } as Product;
            
            setProducts(prev => [...prev, newProduct]);
            alert('Product duplicated successfully!');
          } else {
            throw new Error(result.message);
          }
        } catch (error) {
          console.error('Duplicate error:', error);
          alert('Failed to duplicate product');
        }
      }
    }
    handleMenuClose();
  };

  const handleDeleteClick = (id?: number) => {
    const idToDelete = id || selectedProductId;
    console.log('handleDeleteClick - idToDelete:', idToDelete, 'Type:', typeof idToDelete);
    if (idToDelete) {
      // Ensure it's a number
      const numericId = typeof idToDelete === 'number' ? idToDelete : parseInt(String(idToDelete), 10);
      console.log('Setting productToDelete to:', numericId);
      setProductToDelete(numericId);
      setDeleteDialogOpen(true);
      handleMenuClose();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    const deleteUrl = `${getApiUrl('/api/deleteproduct')}?id=${productToDelete}`;
    console.log('Deleting product with ID:', productToDelete, 'Type:', typeof productToDelete);
    console.log('Delete URL:', deleteUrl);
    
    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        credentials: 'include',
        headers: {}
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (result.success) {
        setProducts(prev => prev.filter(p => p.id !== productToDelete));
        setSelected(prev => prev.filter(id => id !== productToDelete));
      } else {
        alert('Failed to delete product: ' + result.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selected.length} product(s)?`)) return;
    
    try {
      const deletePromises = selected.map(id =>
        fetch(`${getApiUrl('/api/deleteproduct')}?id=${id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {}
        }).then(res => res.json())
      );
      
      await Promise.all(deletePromises);
      setProducts(prev => prev.filter(p => !selected.includes(p.id)));
      setSelected([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Failed to delete some products');
    }
  };

  // Feature toggle handler
  const handleFeatureToggle = async (productId: number, currentStatus: boolean) => {
    setFeatureLoading(productId);
    try {
      const response = await fetch(getApiUrl('/api/admin/updateProductStatus'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          status: !currentStatus
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setProducts(prev =>
          prev.map(p =>
            p.id === productId
              ? { ...p, is_featured: !currentStatus, featured_priority: !currentStatus ? 10 : 0 }
              : p
          )
        );
        alert(result.message);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Feature toggle error:', error);
      alert('Failed to update featured status');
    } finally {
      setFeatureLoading(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Description', 'Category', 'Status', 'Revenue', 'Price', 'Quantity', 'Rating'];
    const csvData = filteredProducts.map(p => [
      p.id,
      `"${p.name}"`,
      `"${p.description}"`,
      p.category,
      p.status,
      p.revenue,
      p.price,
      p.quantity,
      p.rating
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle new product addition from modal
  const handleProductAdded = async (newProduct: Omit<Product, 'id'>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/addProduct'), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(newProduct)
        });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Product creation failed');
      }

      // Create new product with temporary ID and default values
      const normalizedQuantity = Number((newProduct as any).stock_quantity ?? newProduct.quantity ?? 0);
      const addedProduct: Product = {
        id: Date.now(), // Temporary local ID
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        status: newProduct.status || 'Stock OK',
        revenue: Number(newProduct.revenue || 0),
        price: Number(newProduct.price || 0),
        quantity: normalizedQuantity,
        stock_quantity: normalizedQuantity,
        rating: Number(newProduct.rating || 0),
      };

      // Update state and close modal
      setProducts(prev => [...prev, addedProduct]);
      setTimeout(() => setIsModalOpen(false), 150);

    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique categories and statuses for filters
  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
  const uniqueStatuses = Array.from(new Set(products.map(p => p.status)));

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) return <LoadingSpinner fullScreen message="Loading products" />;
  if (error) return <AdminErrorState error={error} onRetry={() => window.location.reload()} />;

  return (
    <Box>
      <PageHeader
        title="Product Management"
        subtitle="Manage your product inventory, track stock levels, and monitor performance"
        icon={<InventoryIcon sx={{ fontSize: 32 }} />}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Products' },
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
          placeholder="Search product..."
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
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {uniqueCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {uniqueStatuses.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportCSV}
          sx={{ whiteSpace: "nowrap" }}
        >
          Export CSV
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          disabled={isSubmitting}
          sx={{ whiteSpace: "nowrap" }}
        >
          Add Product
        </Button>
      </Box>

      {/* Bulk Actions Toolbar */}
      {selected.length > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            mb: 2,
            bgcolor: "primary.light",
            borderRadius: 1,
          }}
        >
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {selected.length} selected
          </Typography>
          <Tooltip title="Delete selected">
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              size="small"
            >
              Delete Selected
            </Button>
          </Tooltip>
        </Toolbar>
      )}

      {/* Modals */}
      {isModalOpen && (
        <CreateProductModal 
          onClose={() => !isSubmitting && setIsModalOpen(false)}
          onProductAdded={handleProductAdded}
          isSubmitting={isSubmitting}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onProductUpdated={handleProductUpdated}
        />
      )}

      {viewingProduct && (
        <ViewProductModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}

      {/* Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < paginatedProducts.length}
                  checked={paginatedProducts.length > 0 && selected.length === paginatedProducts.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleRequestSort("name")}
                >
                  Product Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "category"}
                  direction={orderBy === "category" ? order : "asc"}
                  onClick={() => handleRequestSort("category")}
                >
                  Category
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => handleRequestSort("status")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "revenue"}
                  direction={orderBy === "revenue" ? order : "asc"}
                  onClick={() => handleRequestSort("revenue")}
                >
                  Revenue
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "price"}
                  direction={orderBy === "price" ? order : "asc"}
                  onClick={() => handleRequestSort("price")}
                >
                  Price
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "quantity"}
                  direction={orderBy === "quantity" ? order : "asc"}
                  onClick={() => handleRequestSort("quantity")}
                >
                  Quantity
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "rating"}
                  direction={orderBy === "rating" ? order : "asc"}
                  onClick={() => handleRequestSort("rating")}
                >
                  Rating
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Featured</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isSelected(product.id)}
                      onChange={() => handleSelectClick(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <PackageIcon size={16} style={{ color: '#666', marginTop: '2px' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.description ? (product.description.split(' ').length > 3 ? product.description.split(' ').slice(0, 3).join(' ') + '...' : product.description) : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
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
                        backgroundColor: `${getBadgeColor(product.status)}15`,
                        border: `1px solid ${getBadgeColor(product.status)}30`,
                        color: getBadgeColor(product.status),
                      }}
                    >
                      {getStatusIcon(product.status)}
                      {product.status}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {formatCurrency(product.revenue || 0)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(Number(product.price))}
                  </TableCell>
                  <TableCell align="right">{product.stock_quantity ?? product.quantity}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Rating
                        value={Number(product.rating)}
                        readOnly
                        size="small"
                        precision={0.1}
                      />
                      <Typography variant="caption" color="text.secondary">
                        ({Number(product.rating).toFixed(1)})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={product.is_featured ? "Remove from featured" : "Add to featured"}>
                      <button 
                        className={styles.iconBtn}
                        onClick={() => handleFeatureToggle(product.id, product.is_featured || false)}
                        disabled={featureLoading === product.id}
                      >
                        {product.is_featured ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                      </button>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <div className={styles.actionIcons}>
                      <Tooltip title="More Actions">
                        <button 
                          className={styles.iconBtn}
                          onClick={(e) => handleMenuOpen(e, product.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </button>
                      </Tooltip>
                    </div>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedProductId === product.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          setViewingProduct(product);
                          handleMenuClose();
                        }}
                      >
                        <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                        View Details
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setEditingProduct(product);
                          handleMenuClose();
                        }}
                      >
                        <EditIcon fontSize="small" sx={{ mr: 1 }} />
                        Edit
                      </MenuItem>
                      <MenuItem onClick={handleDuplicate}>
                        <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
                        Duplicate
                      </MenuItem>
                      <MenuItem onClick={() => handleDeleteClick(selectedProductId ?? undefined)} sx={{ color: 'error.main' }}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                        Delete
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;