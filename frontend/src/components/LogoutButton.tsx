"use client"
import { useRouter } from 'next/navigation';
import { Link } from '@mui/material';


const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login'); // Redirect to login page
  };

  return (
    <Link onClick={handleLogout} >
      Logout
    </Link>
  );
};

export default LogoutButton;
