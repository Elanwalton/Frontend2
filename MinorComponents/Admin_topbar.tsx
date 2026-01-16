"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/utils/apiUrl";
import {
  Box,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Help as HelpIcon,
} from "@mui/icons-material";

const Profile: React.FC = () => {
  const { user: currentUser, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    message: string;
    timeAgo: string;
    read?: boolean;
  }>>([]);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(null);
    router.push('/admin-dashboard/notifications');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifClose = () => {
    setNotifAnchor(null);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const url = getApiUrl('/api/admin/notifications');
        const response = await fetch(url, {
          credentials: 'include',
        });
        if (!response.ok) return;

        const data = await response.json();
        const items = Array.isArray(data.notifications)
          ? data.notifications
          : [];

        setUnreadCount(Number(data.unread_count ?? data.unreadCount ?? 0));

        setNotifications(
          items.map((n: any, index: number) => ({
            id: Number(n.id ?? index),
            title: String(n.title ?? "Notification"),
            message: String(n.message ?? ""),
            timeAgo: String(n.timeAgo ?? ""),
            read: Boolean(n.read ?? false),
          }))
        );
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();
  }, []);

  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  const handleSettings = () => {
    handleClose();
    router.push("/admin-dashboard/settings");
  };

  const handleProfile = () => {
    handleClose();
    router.push("/admin-dashboard/profile");
  };

  if (!currentUser) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="inherit">
          Loading...
        </Typography>
      </Box>
    );
  }

  const userName = currentUser.first_name || "Admin";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {/* Search */}
      <TextField
        placeholder="Search..."
        size="small"
        sx={{
          display: { xs: "none", md: "block" },
          width: 250,
          "& .MuiOutlinedInput-root": {
            color: "white",
            "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
            "&.Mui-focused fieldset": { borderColor: "white" },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(255,255,255,0.7)",
            opacity: 1,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Notifications */}
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleNotifClick}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Help */}
      <Tooltip title="Help">
        <IconButton color="inherit">
          <HelpIcon />
        </IconButton>
      </Tooltip>

      {/* Profile */}
      <Tooltip title="Account">
        <IconButton onClick={handleProfileClick} sx={{ p: 0, ml: 1 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "secondary.main",
              fontWeight: 600,
            }}
          >
            {userInitials}
          </Avatar>
        </IconButton>
      </Tooltip>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {userName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentUser.email || "admin@sunleaf.com"}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={async (e) => {
          e.preventDefault();
          await handleLogout();
        }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>
            <Typography color="error">Logout</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={handleNotifClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5, width: 320, maxHeight: 400 },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem onClick={handleNotifClose}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((n) => (
            <MenuItem key={n.id} onClick={handleNotifClose}>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {n.title}
                </Typography>
                {n.message && (
                  <Typography variant="caption" color="text.secondary">
                    {n.message}
                  </Typography>
                )}
                {n.timeAgo && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {n.timeAgo}
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))
        )}
        <Divider />
        <MenuItem
          onClick={handleNotifClose}
          sx={{ justifyContent: "center", color: "primary.main" }}
        >
          <Typography variant="body2" fontWeight={600}>
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Profile;
