"use client"
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";
import { TrendingUp } from "@mui/icons-material";
import LoadingSpinner from '../../components/LoadingSpinner';

interface TopProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  status: string;
  revenue: number;
  price: number;
  quantity: number;
  rating: number;
  units_sold: number;
}

interface TopSellingProductsProps {
  limit?: number;
}

const TopSellingProducts = ({ limit = 5 }: TopSellingProductsProps) => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch(
          `/api/getTopSellingProducts.php?limit=${limit}`
        );
        const data = await response.json();

        if (!data.success) throw new Error(data.message);
        setProducts(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [limit]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  if (loading) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <LoadingSpinner message="Loading top selling products" />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography color="error">Error: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TrendingUp color="success" />
          <Typography variant="h6" fontWeight={600}>
            Top Selling Products
          </Typography>
        </Box>

        {products.length === 0 ? (
          <Typography color="text.secondary">No products found</Typography>
        ) : (
          <List sx={{ pt: 0 }}>
            {products.map((product, index) => (
              <Box key={product.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        fontWeight: 600,
                        width: 40,
                        height: 40,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" fontWeight={500}>
                          {product.name}
                        </Typography>
                        <Chip
                          label={formatCurrency(product.revenue)}
                          color="success"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box mt={0.5}>
                        <Typography variant="body2" color="text.secondary" component="span">
                          {product.category} • {product.units_sold} units sold
                        </Typography>
                        <Box display="flex" gap={1} mt={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Price: {formatCurrency(product.price)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • Rating: {product.rating.toFixed(1)}⭐
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < products.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default TopSellingProducts;
