'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, User } from '@/services/getCurrentUser'; // Adjust path as per your project structure
import CircularProgress from '@mui/material/CircularProgress';
import { Post } from '@/components/ContentCard';
import axios from 'axios';
import DoctorContentCard from '@/components/DoctorContentCard';
import { Box, Typography,Button, TextField,  Link, Fab,Dialog ,DialogActions, DialogContent, DialogContentText, DialogTitle, dividerClasses } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentForm from '@/components/ContentForm';


const DoctorPanelPage = () => {
  
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const userData = await getCurrentUser(token);
        if  (!userData || userData.role_id !== 2) {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        
          const response = await axios.get<Post[]>(`http://localhost:8000/contents/me/${user?.id}`);
          setContents(response.data);
        
      } catch (error) {
        //console.error('Error fetching content data:', error);
        // Handle error (e.g., show error message to user)
      }
    };

  
      fetchData();
    
    
  }, [user]); // Include user in dependency array to refetch content when user changes

  if (loading) {
    return <CircularProgress />; // Show loading indicator while fetching data
  }



  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/contents/${id}`);
      setContents(prevContents => prevContents.filter(content => content.id !== id));
    } catch (error) {
      console.error("Error deleting content", error);
    }
  };

  const handleContentAdded = (newContent: Post) => {
    handleClose();
    setContents(prevContents => [...prevContents, newContent]);
    
  };


  /* dialog */
 

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  return (
    <Box sx={{marginBottom:"75px"  }}>
      <Box sx={{margin:"auto",display:"flex", justifyContent:"center",  }}>
        <Typography sx={{marginY:2  }}>Your content:</Typography>
        </Box>

      {contents.map(content => ( 
              <DoctorContentCard key={content.id} content={content}  onDelete={handleDelete}/>
              
      ))}
      <Fab 
        color="secondary" 
        aria-label="add" 
        onClick={handleClickOpen}
        sx={{ 
          position: 'fixed', 
          bottom: 80, 
          right: 16 
        }}
      >
        <AddIcon />
      </Fab>






      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>Create a new post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a content post. After entering the title, you will be able to add more sections to your post.
          </DialogContentText>
            <ContentForm user_id={user?.id} onContentAdded={handleContentAdded}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
    </Box>
  );
}

export default DoctorPanelPage;
  
