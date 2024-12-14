'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, User } from '@/services/getCurrentUser'; 
import { Button, Paper, Divider, Grid } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import { Box, Container, Typography } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

const ProfilePage = () => {


    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter()

    const getRoleText = (id:Number) => {
        if(id === 1){
            return "regular user"
        }else if(id == 2){
            return "professional"
        }else return "admin"
        }
        
      useEffect(() => {
        const fetchUser = async () => {
          try {
            const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
            const userData = await getCurrentUser(token);
            if  (!userData ) {
              router.push('/home');
              return null;
            }
            
            setUser(userData);
            setLoading(false);
    
            
            
          } catch (error) {
            console.error('Error fetching user data:', error);
            setLoading(false); // Set loading to false on error as well
          }
        };
    
        fetchUser();
    
      }, []);
      



  return (
    
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 5 }}>
        <Typography variant="h4" gutterBottom>
          Account Information
        </Typography>
        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2, marginTop:5 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle1">First Name:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight="bold">{user?.name}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ marginY: 1 }} />
        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle1">Last Name:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight="bold">{user?.lastname}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ marginY: 1 }} />
        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle1">Email:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight="bold">{user?.email}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ marginY: 2 }} />
        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle1">Status:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight="bold">{getRoleText(user?.role_id)}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ marginY: 2 }} />
      </Paper>
    </Container>
  )
}

export default ProfilePage