// src/app/(admin)/layout.tsx
"use client";
import { ReactNode, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import AdminShell from '@/components/admin/AdminShell';
import AdminProviders from '@/components/admin/AdminProviders';
import LoadingSpinner from '@/components/LoadingSpinner';

// ---------------------------
// Admin layout content
// ---------------------------
function AdminLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { userRole, isLoading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Still loading, wait
    if (isLoading) {
      return;
    }

    // Check if user is admin
    if (userRole === "admin") {
      setAuthorized(true);
    } else {
      // Not admin, redirect to login
      router.replace("/login");
    }
  }, [userRole, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifying access..." />;
  }

  if (!authorized) {
    // Return a subtle box or nothing while redirecting, instead of a full-screen spinner
    // This prevents the "stuck on loading" feeling during logout
    return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }} />;
  }

  return (
    <AdminProviders>
      <AdminShell title="Admin Dashboard">{children}</AdminShell>
    </AdminProviders>
  );
}

// ---------------------------
// Admin layout wrapper
// ---------------------------
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutContent>{children}</AdminLayoutContent>
  );
}
