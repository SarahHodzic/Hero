"use client"
import * as React from 'react';
import { useState,useEffect } from 'react';
import {Paper, Dialog, DialogContent } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import ForumIcon from '@mui/icons-material/Forum';
import QuizIcon from '@mui/icons-material/Quiz';
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { usePathname } from 'next/navigation'
import MapIcon from '@mui/icons-material/Map';
import MapContainer from '../components/Map';
import { getCurrentUser, User } from '@/services/getCurrentUser';

export default function NavBar() {
  const [value, setValue] = useState('home');
  const pathname = usePathname()
  const canRender = pathname !=='/login' && pathname !=='/register' && pathname !=='/' ? true : false
  const [openMap, setOpenMap] = useState(false);

  const handleMapClick = () => {
    setOpenMap(true);
  };

  const handleCloseMap = () => {
    setOpenMap(false);
  };
 



  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const userData = await getCurrentUser(token);
        setUser(userData);
      } catch (error) {
        
      }
    };

    fetchUser();
  }, [pathname]);

  return (
    <>
      {canRender && (
        <>
          <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <BottomNavigation
              showLabels
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
              }}
            >

              <BottomNavigationAction href='/home' label="Home" value="home" icon={<HomeIcon />} />
              <BottomNavigationAction href ='/qna' label="Q&A" value="Q&A" icon={<HelpOutlineIcon />} />
              <BottomNavigationAction href='/quiz' label="Quiz" value="quiz" icon={<QuizIcon />} />
              <BottomNavigationAction href='/forum' label="Forum" value="forum" icon={<ForumIcon />} />
              <BottomNavigationAction label="Map" value="Map" icon={<MapIcon />} onClick={handleMapClick} />
   
              {user?.role_id == 3  && (
                <BottomNavigationAction href='/admin-panel' label="Admin" value="admin" icon={<AdminPanelSettingsIcon />} />
              )}
              {user?.role_id == 2  && (
                <BottomNavigationAction href='/doctor-panel' label="Doctor" value="doctor" icon={<AdminPanelSettingsIcon />} />
              )}
            </BottomNavigation>
          </Paper>
          <Dialog open={openMap} onClose={handleCloseMap}>
            <DialogContent>
              <MapContainer />
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
    

}
