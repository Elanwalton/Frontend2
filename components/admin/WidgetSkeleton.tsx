import React from 'react';
import { Card, CardContent, Box, Skeleton, Stack } from '@mui/material';

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Skeleton variant="text" width={150} height={28} />
            <Skeleton variant="text" width={200} height={20} />
          </Box>
          <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height={height} sx={{ borderRadius: 1 }} />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
        <Stack spacing={2}>
          {Array.from({ length: rows }).map((_, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="text" width={150} height={28} />
          <Skeleton variant="text" width={60} height={24} />
        </Box>
        <Stack spacing={2}>
          {Array.from({ length: items }).map((_, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="20%" height={20} />
              </Box>
              <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1 }} />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton variant="text" width={120} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={80} height={16} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={60} />
      </CardContent>
    </Card>
  );
}
