import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Paper, Divider, alpha } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'contained' | 'outlined' | 'text';
  };
  icon?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumbs, action, icon }: PageHeaderProps) {
  const router = useRouter();

  return (
    <Paper 
      elevation={0}
      sx={{ 
        mt: { xs: 2, sm: 3 },
        mb: 4,
        p: { xs: 2, sm: 3 },
        background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ 
            mb: 2,
            '& .MuiBreadcrumbs-separator': {
              color: 'text.disabled'
            }
          }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return isLast || !crumb.href ? (
              <Typography 
                key={index} 
                color="text.primary" 
                variant="body2"
                fontWeight={isLast ? 600 : 400}
              >
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={index}
                color="inherit"
                href={crumb.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(crumb.href!);
                }}
                sx={{ 
                  cursor: 'pointer', 
                  textDecoration: 'none',
                  color: 'text.secondary',
                  transition: 'color 0.2s',
                  '&:hover': { 
                    color: 'primary.main',
                    textDecoration: 'none'
                  } 
                }}
              >
                <Typography variant="body2">{crumb.label}</Typography>
              </Link>
            );
          })}
        </Breadcrumbs>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          {icon && (
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                flexShrink: 0
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h4" 
              fontWeight={700}
              sx={{ 
                mb: 0.5,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontWeight: 400,
                  lineHeight: 1.5
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        {action && (
          <Button
            variant={action.variant || 'contained'}
            startIcon={action.icon}
            onClick={action.onClick}
            size="large"
            sx={{ 
              flexShrink: 0,
              px: 3,
              py: 1.25,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: (theme) => action.variant === 'contained' 
                ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                : 'none',
              '&:hover': {
                boxShadow: (theme) => action.variant === 'contained'
                  ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                  : 'none',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s'
            }}
          >
            {action.label}
          </Button>
        )}
      </Box>
    </Paper>
  );
}
