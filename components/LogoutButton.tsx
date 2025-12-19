"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const LogoutButton = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
