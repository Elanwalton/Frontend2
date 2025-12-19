// src/app/(admin)/layout.tsx
"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AdminShell from '@/components/admin/AdminShell';
import AdminProviders from '@/components/admin/AdminProviders';

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

  if (isLoading || !authorized) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
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
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
