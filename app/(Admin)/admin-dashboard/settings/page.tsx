"use client";

import { buildMediaUrl } from '@/utils/media';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Avatar,
  IconButton,
  Stack,
  Tabs,
  Tab,
  Snackbar,
  Alert,
} from '@mui/material';
import { getApiUrl } from '@/utils/apiUrl';
import {
  Save as SaveIcon,
  PhotoCamera as CameraIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Store as StoreIcon,
  Email as EmailIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { PageHeader } from '@/components/admin';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // UI State
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [settings, setSettings] = useState({
    // General
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    
    // Notifications
    emailNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
    reviewNotifications: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
    
    // Email
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    
    // Payment
    stripeEnabled: true,
    paypalEnabled: true,
    mpesaEnabled: false,
  });

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const url = getApiUrl('/api/admin/getSettings.php');
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();
        
        if (data.success && data.data) {
          const s = data.data;
          // Map backend keys (snake_case) to frontend keys (camelCase)
          setSettings(prev => ({
             ...prev,
             // General
             storeName: s.store_name?.value || prev.storeName,
             storeEmail: s.store_email?.value || prev.storeEmail,
             storePhone: s.store_phone?.value || prev.storePhone,
             storeAddress: s.store_address?.value || prev.storeAddress,
             currency: s.currency?.value || prev.currency,
             timezone: s.timezone?.value || prev.timezone,
             
             // Notifications
             emailNotifications: s.email_notifications?.value === 'true' || s.email_notifications?.value === true,
             orderNotifications: s.order_notifications?.value === 'true' || s.order_notifications?.value === true,
             lowStockAlerts: s.low_stock_alerts?.value === 'true' || s.low_stock_alerts?.value === true,
             reviewNotifications: s.review_notifications?.value === 'true' || s.review_notifications?.value === true,
             
             // Security
             twoFactorAuth: s.two_factor_auth?.value === 'true' || s.two_factor_auth?.value === true,
             sessionTimeout: parseInt(s.session_timeout?.value || '30'),
             
             // Email
             smtpHost: s.smtp_host?.value || prev.smtpHost,
             smtpPort: s.smtp_port?.value || prev.smtpPort,
             smtpUser: s.smtp_user?.value || prev.smtpUser,
             
             // Payment
             stripeEnabled: s.stripe_enabled?.value === 'true' || s.stripe_enabled?.value === true,
             paypalEnabled: s.paypal_enabled?.value === 'true' || s.paypal_enabled?.value === true,
             mpesaEnabled: s.mpesa_enabled?.value === 'true' || s.mpesa_enabled?.value === true,
          }));
        }
      } catch (err) {
        console.error('Failed to load settings', err);
        showSnackbar('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      const url = getApiUrl('/api/admin/updateSettings.php');
      
      // Map frontend keys back to backend keys
      const payload = {
        settings: {
           store_name: settings.storeName,
           store_email: settings.storeEmail,
           store_phone: settings.storePhone,
           store_address: settings.storeAddress,
           currency: settings.currency,
           timezone: settings.timezone,
           
           email_notifications: settings.emailNotifications,
           order_notifications: settings.orderNotifications,
           low_stock_alerts: settings.lowStockAlerts,
           review_notifications: settings.reviewNotifications,
           
           two_factor_auth: settings.twoFactorAuth,
           session_timeout: settings.sessionTimeout,
           
           smtp_host: settings.smtpHost,
           smtp_port: settings.smtpPort,
           smtp_user: settings.smtpUser,
           
           stripe_enabled: settings.stripeEnabled,
           paypal_enabled: settings.paypalEnabled,
           mpesa_enabled: settings.mpesaEnabled,
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        showSnackbar('Settings saved successfully!', 'success');
      } else {
        showSnackbar('Failed to save: ' + (data.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      console.error(err);
      showSnackbar('Error saving settings', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSnackbar('New passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
        showSnackbar('Password must be at least 8 characters long', 'error');
        return;
    }

    try {
      const url = getApiUrl('/api/change-password.php');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            current_password: passwordData.currentPassword,
            new_password: passwordData.newPassword,
            confirm_password: passwordData.confirmPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showSnackbar('Password changed successfully', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showSnackbar(data.message || 'Failed to change password', 'error');
      }
    } catch (err) {
        showSnackbar('An error occurred while changing password', 'error');
    }
  };

  if (loading) {
    return <Box p={3}><Typography>Loading settings...</Typography></Box>;
  }

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Manage your store settings and preferences"
        icon={<SettingsIcon sx={{ fontSize: 32 }} />}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Settings' },
        ]}
        action={{
          label: saveLoading ? 'Saving...' : 'Save Changes',
          icon: <SaveIcon />,
          onClick: handleSave,
          variant: 'contained',
          disabled: saveLoading
        }}
      />

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab icon={<StoreIcon />} label="General" iconPosition="start" />
            <Tab icon={<NotificationsIcon />} label="Notifications" iconPosition="start" />
            <Tab icon={<SecurityIcon />} label="Security" iconPosition="start" />
            <Tab icon={<EmailIcon />} label="Email" iconPosition="start" />
            <Tab icon={<PaymentIcon />} label="Payment" iconPosition="start" />
          </Tabs>
        </Box>

        {/* General Settings */}
        <TabPanel value={activeTab} index={0}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Store Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Update your store details and preferences
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Store Name"
                  value={settings.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Store Email"
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => handleChange('storeEmail', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={settings.storePhone}
                  onChange={(e) => handleChange('storePhone', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Currency"
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Store Address"
                  multiline
                  rows={2}
                  value={settings.storeAddress}
                  onChange={(e) => handleChange('storeAddress', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Timezone"
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Store Logo
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                sx={{ width: 80, height: 80 }}
                src={buildMediaUrl("logo.png")}
              />
              <Button
                variant="outlined"
                startIcon={<CameraIcon />}
                component="label"
              >
                Upload Logo
                <input type="file" hidden accept="image/*" />
              </Button>
            </Box>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saveLoading}
            >
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </TabPanel>

        {/* Notifications */}
        <TabPanel value={activeTab} index={1}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Notification Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose what notifications you want to receive
            </Typography>

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.orderNotifications}
                    onChange={(e) => handleChange('orderNotifications', e.target.checked)}
                  />
                }
                label="New Order Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.lowStockAlerts}
                    onChange={(e) => handleChange('lowStockAlerts', e.target.checked)}
                  />
                }
                label="Low Stock Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.reviewNotifications}
                    onChange={(e) => handleChange('reviewNotifications', e.target.checked)}
                  />
                }
                label="New Review Notifications"
              />
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </CardContent>
        </TabPanel>

        {/* Security */}
        <TabPanel value={activeTab} index={2}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Security Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Manage your account security preferences
            </Typography>

            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                  />
                }
                label="Enable Two-Factor Authentication"
              />

              <TextField
                label="Session Timeout (minutes)"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                sx={{ maxWidth: 300 }}
              />

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Change Password
                </Typography>
                <Stack spacing={2} sx={{ maxWidth: 400 }}>
                  <TextField
                    label="Current Password"
                    type="password"
                    fullWidth
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                  <Button variant="outlined" onClick={handleChangePassword}>
                    Update Password
                  </Button>
                </Stack>
              </Box>
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </CardContent>
        </TabPanel>

        {/* Email Settings */}
        <TabPanel value={activeTab} index={3}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Email Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure SMTP settings for sending emails
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  value={settings.smtpHost}
                  onChange={(e) => handleChange('smtpHost', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="SMTP Port"
                  value={settings.smtpPort}
                  onChange={(e) => handleChange('smtpPort', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="SMTP Username"
                  value={settings.smtpUser}
                  onChange={(e) => handleChange('smtpUser', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="SMTP Password"
                  type="password"
                  placeholder="••••••••"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button variant="outlined" sx={{ mr: 2 }}>
                Test Connection
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </CardContent>
        </TabPanel>

        {/* Payment Settings */}
        <TabPanel value={activeTab} index={4}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Payment Methods
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enable or disable payment methods for your store
            </Typography>

            <Stack spacing={3}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Stripe
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accept credit and debit cards
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.stripeEnabled}
                      onChange={(e) => handleChange('stripeEnabled', e.target.checked)}
                    />
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        PayPal
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accept PayPal payments
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.paypalEnabled}
                      onChange={(e) => handleChange('paypalEnabled', e.target.checked)}
                    />
                  </Box>
                </CardContent>
              </Card>

               <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        M-Pesa
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accept M-Pesa mobile payments
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.mpesaEnabled}
                      onChange={(e) => handleChange('mpesaEnabled', e.target.checked)}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </CardContent>
        </TabPanel>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
