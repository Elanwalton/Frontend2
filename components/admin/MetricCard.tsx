import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Skeleton } from '@mui/material';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  period: string;
  sparklineData: number[];
  color: string;
  loading?: boolean;
  onClick?: () => void;
}

export default function MetricCard({
  title,
  value,
  change,
  trend,
  period,
  sparklineData,
  color,
  loading = false,
  onClick
}: MetricCardProps) {
  if (loading) {
    return (
      <Card sx={{ 
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <CardContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
          </Box>
          <Skeleton variant="text" width={120} height={40} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width={80} height={16} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={60} />
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...sparklineData);
  const minValue = Math.min(...sparklineData);
  const range = maxValue - minValue;
  const isFlat = range === 0;
  const safeRange = range === 0 ? 1 : range;

  const computeY = (value: number) => {
    if (isFlat) {
      return 40; // center the flat line for visibility
    }
    const normalized = (value - minValue) / safeRange;
    return 80 - normalized * 70;
  };

  return (
    <Card 
      onClick={onClick}
      sx={{ 
        transition: 'all 0.3s', 
        '&:hover': { 
          boxShadow: 4, 
          transform: 'translateY(-2px)',
          cursor: onClick ? 'pointer' : 'default'
        },
        border: '1px solid',
        borderColor: 'divider',
        borderTop: `3px solid ${color}` ,
        bgcolor: 'background.paper',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <Chip 
            label={change} 
            size="small" 
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: trend === 'up' ? '#dcfce7' : trend === 'down' ? '#fee2e2' : '#e5e7eb',
              color: trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#374151',
              border: 'none'
            }}
          />
        </Box>
        
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
          {value}
        </Typography>
        
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          {period}
        </Typography>

        {/* Sparkline - Made longer with more height */}
        <Box sx={{ height: 80, mt: 2, position: 'relative' }}>
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 80">
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s/g, '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Area fill */}
            <path
              d={`
                M 0 80
                ${sparklineData.map((value, i) => {
                  const x = (i / (sparklineData.length - 1 || 1)) * 100;
                  const y = computeY(value);
                  return `L ${x} ${y}`;
                }).join(' ')}
                L 100 80
                Z
              `}
              fill={`url(#gradient-${title.replace(/\s/g, '-')})`}
            />
            
            {/* Line */}
            <path
              d={`
                ${sparklineData.map((value, i) => {
                  const x = (i / (sparklineData.length - 1 || 1)) * 100;
                  const y = computeY(value);
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
              `}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>
      </CardContent>
    </Card>
  );
}
