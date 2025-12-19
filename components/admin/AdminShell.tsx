"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuIcon from "@mui/icons-material/Menu";
import { alpha } from "@mui/material/styles";
import Sidebar from "../Admin_sideBar";
import Profile from '../MinorComponents/Admin_topbar';

const drawerWidth = 280;

export default function AdminShell({ title = "Admin Dashboard", children }: { title?: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const mdUp = useMediaQuery("(min-width:1024px)");

  const toggle = () => setOpen((v) => !v);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        color="primary"
        elevation={1}
        sx={{ 
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          {!mdUp && (
            <IconButton 
              edge="start" 
              color="inherit"
              aria-label="menu" 
              onClick={toggle} 
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "white"
            }}
          >
            {title}
          </Typography>
          <Profile />
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      {mdUp ? (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": { 
              width: drawerWidth, 
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper"
            },
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }} />
          <Box sx={{ p: 2, overflowY: "auto" }}>
            <Sidebar />
          </Box>
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={open}
          onClose={toggle}
          ModalProps={{ keepMounted: true }}
          sx={{ 
            "& .MuiDrawer-paper": { 
              width: drawerWidth, 
              boxSizing: "border-box",
              bgcolor: "background.paper"
            } 
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }} />
          <Box sx={{ p: 2 }}>
            <Sidebar />
          </Box>
        </Drawer>
      )}

      {/* Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          width: { xs: "100%", lg: `calc(100% - ${drawerWidth}px)` },
          maxWidth: { xs: "100%", xl: "1600px" },
          mx: "auto",
          p: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 10, sm: 11 },
          ...(mdUp ? { ml: 0 } : {})
        }}
      >
        <Box sx={{ 
          maxWidth: "100%",
          mx: "auto"
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
