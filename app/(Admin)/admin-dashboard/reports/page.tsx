"use client";

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Assessment as ReportIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as RevenueIcon,
  Inventory as ProductsIcon,
} from '@mui/icons-material';
import { PageHeader, DateRangePicker, DateRange, MetricCard } from '@/components/admin';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    label: 'Last 30 days'
  });
  const [reportType, setReportType] = useState('sales');

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$127,450',
      change: '+23%',
      trend: 'up' as const,
      period: dateRange.label,
      sparklineData: [95000, 98000, 102000, 105000, 110000, 115000, 120000, 123000, 125000, 127450],
      color: '#10b981'
    },
    {
      title: 'Total Orders',
      value: '892',
      change: '+18%',
      trend: 'up' as const,
      period: dateRange.label,
      sparklineData: [720, 740, 760, 780, 800, 820, 840, 860, 875, 892],
      color: '#3b82f6'
    },
    {
      title: 'Products Sold',
      value: '1,456',
      change: '+15%',
      trend: 'up' as const,
      period: dateRange.label,
      sparklineData: [1200, 1240, 1280, 1320, 1360, 1380, 1400, 1420, 1440, 1456],
      color: '#f59e0b'
    },
    {
      title: 'Avg. Order Value',
      value: '$142.88',
      change: '+8%',
      trend: 'up' as const,
      period: dateRange.label,
      sparklineData: [128, 130, 132, 135, 137, 139, 140, 141, 142, 142.88],
      color: '#8b5cf6'
    },
  ];

  const salesData = [
    { month: 'Jan', revenue: 85000, orders: 650 },
    { month: 'Feb', revenue: 92000, orders: 700 },
    { month: 'Mar', revenue: 88000, orders: 680 },
    { month: 'Apr', revenue: 105000, orders: 780 },
    { month: 'May', revenue: 98000, orders: 750 },
    { month: 'Jun', revenue: 112000, orders: 820 },
  ];

  const categoryData = [
    { name: 'Solar Panels', value: 45, color: '#f59e0b' },
    { name: 'Batteries', value: 30, color: '#10b981' },
    { name: 'Inverters', value: 15, color: '#3b82f6' },
    { name: 'Accessories', value: 10, color: '#8b5cf6' },
  ];

  const reportTypes = [
    { value: 'sales', label: 'Sales Report', icon: <RevenueIcon /> },
    { value: 'orders', label: 'Orders Report', icon: <OrdersIcon /> },
    { value: 'products', label: 'Products Report', icon: <ProductsIcon /> },
    { value: 'customers', label: 'Customers Report', icon: <TrendingUpIcon /> },
  ];

  const handleExport = (format: string) => {
    console.log(`Exporting ${reportType} report as ${format}`);
  };

  return (
    <Box>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate and export detailed business reports"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Reports' },
        ]}
      />

      {/* Controls */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type.icon}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DateRangePicker value={dateRange} onChange={setDateRange} />

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Trend */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Revenue & Orders Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
                  <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Sales by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {categoryData.map((cat, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cat.color }} />
                      <Typography variant="body2">{cat.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {cat.value}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Reports */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Reports
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {reportTypes.map((type) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={type.value}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={type.icon}
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  onClick={() => setReportType(type.value)}
                >
                  {type.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
