"use client"
import * as React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  Typography,
  Container,
  Button,
  Tooltip,
  MenuItem, 
  Link
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalHospitalTwoToneIcon from '@mui/icons-material/LocalHospitalTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import { usePathname } from 'next/navigation'
import MyButton2 from './MyButton2';
import ChatDiolog from './ChatDialog';
import { useEffect, useState } from 'react';
import { getCurrentUser, User } from '@/services/getCurrentUser';
import LogoutButton from './LogoutButton';

export default function NavBar() {

  const pathname = usePathname()
  const canRender = pathname !=='/login' && pathname !=='/register' && pathname !=='/' ? true : false

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

 


  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };



  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
    {canRender &&
    <AppBar position="static" >
    <Container maxWidth="xl"   >
      <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <LocalHospitalTwoToneIcon sx={{ display: {  md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HERO
          </Typography>
        </Box>
  
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ChatDiolog/>
            {/* <Button
              key="quick-search"
              sx={{ my: 2, color: 'white', display: 'flex', marginRight: '10px', backgroundColor: 'secondary.main' }}
            >
              Pretraga
              <SearchIcon sx={{ ml: 1, fontSize: 18}} />
            </Button> */}
          
  
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <AccountCircleIcon  sx={{ fontSize: 45, color:'white' }} />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            
              
              
              {user ? (
                    [
                      <MenuItem key="profile" onClick={handleCloseUserMenu}>
                        <Typography textAlign="center"><Link href="/profile">Profile</Link></Typography>
                      </MenuItem>,
                      <MenuItem key="logout" onClick={handleCloseUserMenu}>
                        <Typography textAlign="center"><LogoutButton /></Typography>
                      </MenuItem>
                    ]
                    
                  ) : [
                    <MenuItem key="login" onClick={handleCloseUserMenu}>
                      <Typography textAlign="center"><Link href="/login">Login</Link></Typography>
                    </MenuItem>,
                    <MenuItem key="register" onClick={handleCloseUserMenu}>
                      <Typography textAlign="center"><Link href="/register">Register</Link></Typography>
                    </MenuItem>
                  ]}

              

              
            
          </Menu>
        </Box>
      </Toolbar>
    </Container>
  </AppBar>
    }
    </>


  );
}
