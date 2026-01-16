'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/utils/apiUrl';
import { PageHeader, DataTable, MetricCard } from '@/components/admin';
import type { Column } from '@/components/admin';
import {
  Box,
  Button,
  Chip,
  Typography,
  Grid,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

type NotificationType = 'order' | 'inventory' | 'system' | 'user' | 'other';

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  timeAgo: string;
  type?: NotificationType;
  read?: boolean;
  created_at?: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCountApi, setUnreadCountApi] = useState<number>(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = getApiUrl('/api/admin/notifications');
      const res = await fetch(url, { credentials: 'include' });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to load notifications');
      }

      setUnreadCountApi(Number(data.unread_count || 0));

      const notifications = Array.isArray(data.notifications) ? data.notifications : [];
      setItems(
        notifications.map((n: any, index: number) => ({
          id: Number(n.id ?? index),
          title: String(n.title ?? 'Notification'),
          message: String(n.message ?? ''),
          timeAgo: String(n.timeAgo ?? ''),
          type: (n.type ?? 'other') as NotificationType,
          read: Boolean(n.read ?? false),
          created_at: n.created_at ? String(n.created_at) : undefined,
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = useMemo(() => {
    return Number.isFinite(unreadCountApi) ? unreadCountApi : items.filter((n) => !n.read).length;
  }, [items, unreadCountApi]);
  const totalCount = items.length;

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of items) {
      const key = n.type || 'other';
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [items]);

  const typeChip = (type?: string) => {
    const t = type || 'other';
    const map: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' }> = {
      order: { label: 'Order', color: 'primary' },
      inventory: { label: 'Inventory', color: 'warning' },
      system: { label: 'System', color: 'info' },
      user: { label: 'User', color: 'success' },
      other: { label: 'Other', color: 'default' },
    };

    const meta = map[t] || map.other;
    return <Chip size="small" label={meta.label} color={meta.color} variant={meta.color === 'default' ? 'outlined' : 'filled'} />;
  };

  const columns = useMemo(
    (): Column[] => [
      {
        id: 'title',
        label: 'Title',
        minWidth: 180,
        format: (value: any, row: NotificationItem) => (
          <Box>
            <Typography variant="body2" fontWeight={row.read ? 500 : 700}>
              {row.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.message}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'type',
        label: 'Type',
        minWidth: 110,
        format: (_: any, row: NotificationItem) => typeChip(row.type),
      },
      {
        id: 'timeAgo',
        label: 'When',
        minWidth: 120,
        format: (value: any) => (
          <Typography variant="body2" color="text.secondary">
            {String(value || '')}
          </Typography>
        ),
      },
      {
        id: 'read',
        label: 'Status',
        minWidth: 110,
        format: (value: any) => (
          <Chip
            size="small"
            label={value ? 'Read' : 'Unread'}
            color={value ? 'default' : 'success'}
            variant={value ? 'outlined' : 'filled'}
          />
        ),
      },
    ],
    [items]
  );

  const markAllRead = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = getApiUrl('/api/admin/notifications');
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || `HTTP ${res.status}`);
      }

      await fetchNotifications();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(
    () =>
      items.map((n) => ({
        id: n.id,
        title: n.title,
        type: n.type,
        timeAgo: n.timeAgo,
        read: n.read,
        message: n.message,
      })),
    [items]
  );

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with important activity across the admin panel"
        icon={<NotificationsIcon sx={{ fontSize: 32 }} />}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Notifications' },
        ]}
        action={{
          label: 'Refresh',
          onClick: fetchNotifications,
          icon: <RefreshIcon fontSize="small" />,
          variant: 'outlined',
        }}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="All"
            value={totalCount.toLocaleString()}
            change="Total notifications"
            trend="neutral"
            period="Current"
            sparklineData={Array(10).fill(totalCount)}
            color="#3b82f6"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Unread"
            value={unreadCount.toLocaleString()}
            change={unreadCount ? 'Needs attention' : 'All caught up'}
            trend={unreadCount ? 'up' : 'neutral'}
            period="Current"
            sparklineData={Array(10).fill(unreadCount)}
            color="#10b981"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Inventory"
            value={String(typeCounts.inventory || 0)}
            change="Stock related"
            trend="neutral"
            period="Current"
            sparklineData={Array(10).fill(typeCounts.inventory || 0)}
            color="#f59e0b"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Orders"
            value={String(typeCounts.order || 0)}
            change="Order updates"
            trend="neutral"
            period="Current"
            sparklineData={Array(10).fill(typeCounts.order || 0)}
            color="#ef4444"
            loading={loading}
          />
        </Grid>
      </Grid>

      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<MarkEmailReadIcon />}
          disabled={items.length === 0 || unreadCount === 0}
          onClick={markAllRead}
        >
          Mark all as read
        </Button>

        <Button
          variant="text"
          onClick={() => router.push('/admin-dashboard')}
        >
          Back to dashboard
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
      />
    </Box>
  );
}
