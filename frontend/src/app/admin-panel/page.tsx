'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, User } from '@/services/getCurrentUser'; 
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import { Box, Container, Typography } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

const AdminPage = () => {

const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const userData = await getCurrentUser(token);
        if  (!userData || userData.role_id !== 3) {
          router.push('/home');
          return null;
        }
        
        setUser(userData);
        setLoading(false);

        const response = await axios.get('http://localhost:8000/users/inactive');
        setInactiveUsers(response.data); 
        
          
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false); // Set loading to false on error as well
      }
    };

    fetchUser();

  }, []);


  const validateUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      const response = await axios.post(`http://localhost:8000/auth/activate_user/${userId}/`)
      // Assuming API response indicates success, update UI as needed (optional)
      console.log(`User with ID ${userId} validated successfully`);
      // Optionally update UI or fetch updated list of inactive users
      const updatedUsers = inactiveUsers.filter(user => user.id !== userId);
      setInactiveUsers(updatedUsers);
    } catch (error) {
      // Handle error, show error message or retry logic
      console.error(`Error validating user with ID ${userId}:`, error);
    }
  };


  if (loading) {
    return <CircularProgress />; // Show loading indicator while fetching data
  }

  return (
    
    <>
        
        <Container sx={{marginBottom: "75px"}}>
            <Box sx={{padding:2,  maxWidth:"500px", margin: "auto"}}>
            {inactiveUsers.length ? (<Typography>Validiraj korisnike:</Typography>) :
            (<Typography>Nema korisnika za validaciju!</Typography>) } 
            </Box>

            {inactiveUsers.length > 0 &&  (
                inactiveUsers.map(user => (
                <Box key={user.id} sx={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", padding: 2, maxWidth: "500px", margin: "auto", marginY: 2, display: "flex", justifyContent: "space-between" }}>
                    <Typography>{user.email}</Typography>
                    <Box
                    sx={{ cursor: "pointer" }}
                    onClick={() => { validateUser(user.id) }}
                    >
                    <TaskAltIcon sx={{ color: "green" }} />
                    </Box>
                </Box>
                ))
        )}
        </Container>
    </>
    
  )
}

export default AdminPage