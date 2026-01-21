"use client";

import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return <button onClick={handleLogout} className={className}>Logout</button>;
};

export default LogoutButton;
