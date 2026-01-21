"use client";

import { Box, Typography, Button, Paper } from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  Logout as LogoutIcon, 
  ErrorOutline as ErrorIcon 
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

interface AdminErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export default function AdminErrorState({ error, onRetry }: AdminErrorStateProps) {
  const { logout } = useAuth();

  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const isAuthError = error.toLowerCase().includes('token') || 
                      error.toLowerCase().includes('auth') || 
                      error.toLowerCase().includes('login') ||
                      error.toLowerCase().includes('session');

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px', 
        p: 3 
      }}
    >
      <Paper 
        elevation={0}
        sx={{ 
          p: 6, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          maxWidth: 500,
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center'
        }}
      >
        <Box 
          sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            bgcolor: 'error.lighter', 
            color: 'error.main',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 3
          }}
        >
          <ErrorIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography variant="h5" gutterBottom fontWeight="bold">
          {isAuthError ? "Session Expired or Invalid" : "Something went wrong"}
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
          {isAuthError 
            ? "Your session may have expired. Please try refreshing the page or sign in again to continue."
            : `We encountered an error while loading this data: ${error}`
          }
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Try Again
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<LogoutIcon />}
            onClick={() => logout()}
          >
            Sign Out
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
