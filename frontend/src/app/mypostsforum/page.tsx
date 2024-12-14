"use client"
//npm install date-fns
//npm install react-toastify
//npm install --save react-spinners

import ForumCard from "@/components/ForumCard/ForumCard";
import { Box, Button, Container, Grid, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme, TextField, FormHelperText, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton } from "@mui/material"
import axios from "axios";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import Link from "next/link";
import AddIcon from '@mui/icons-material/Add';
import { getCurrentUser, User } from '@/services/getCurrentUser';
import LoginDialogForum from "@/components/LoginDialogForum";
import { usePathname, useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NumbersOutlined } from "@mui/icons-material";
import { ClipLoader } from "react-spinners";
import SearchIcon from '@mui/icons-material/Search';

interface CurrentUser {
    name: string,
    lastname: string,
    email: string,
    role_id: number,
    id: number,
}

const formatDate = (dateString: string | number | Date) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

const MyPostsForum = () => {

    const [posts, setPosts]: any = useState([]);
    const [userData, setUserData]= useState<User | null>(null);
    const [open, setOpen] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [contentError, setContentError] = useState("");
    const [titleError, setTitleError] = useState("");
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [post_id, setPostID] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const router = useRouter();

    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    const theme = useTheme(); 

 
    
    useEffect(() => {
        const fetchUser = async () => {
          try {
            const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
            if (!token) {
                router.push('/login'); // Preusmjerava na stranicu za prijavu ako korisnik nije prijavljen
                return;
            }
            const userData = await getCurrentUser(token);
            if(!userData){
               
                router.push('/login');
            }
            setUserData(userData);
          } catch (error) {
           
            console.error('Error fetching current user lalal:', error);
            router.push('/login');
          }
        };
    
        fetchUser();
      }, []);


      const getAllPosts = async (user_id: number | null | undefined, searchTerm?: string) => {
        try{
            setLoading(true)
            let url = `http://localhost:8000/posts/user/${user_id}`;
            if(searchTerm){
                url = `http://localhost:8000/posts/user/${user_id}/${searchTerm}`
            }
            const response = await axios.get(url)
            setPosts(response.data);
           
        }catch(error){
            console.error('Error fetching posts:', error);
        }finally
        {
            setLoading(false)
        }
      }

    //search input field onChange logic
    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    //submiting search input values
    const handleSearchSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault(); // Prevents the default form submission
        const keywords = searchTerm.split(" ");
       
        getAllPosts(userData?.id, keywords.join(","));
    };

    const handleClickOpen = (post: any) => {
        setSelectedPost(post);
        setNewPostTitle(post.title);
        setNewPostContent(post.post);
       setOpen(true)
    };

    const handleDeletePostOpenDialog = (post_id1: number) => {
        setPostID(post_id1);
        setOpenDialog(true)
    };
    
    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        getAllPosts(userData?.id);
    }, [userData]);

    const handleEditedPostSubmit = async () => {
        if (!newPostTitle) {
            setTitleError("Title is required");
            return;
          }
          if (!newPostContent) {
            setContentError("Content is required");
            return;
          }
        try {
            const response = await axios.put("http://localhost:8000/posts/", { post: newPostContent, title: newPostTitle, id: selectedPost.id });
            console.log("Response", response.data);
            toast.success("Post successfully Edited!");
            getAllPosts(userData?.id);
            handleClose();
            //setNewPostContent("");
            //setNewPostTitle("");
            //setTitleError("");
            //setContentError("");
        } catch (error) {
            toast.error("Failed to edit post.");
            console.error('Error creating new post:', error);
        }
    };

    const handleDeletePost = async (post_id: number) => {
        try {
            const response = await axios.delete(`http://localhost:8000/posts/${post_id}`);
            console.log("Response", response.data);
            toast.success("Post successfully Deleted!");
            getAllPosts(userData?.id);
            handleCloseDialog();
            //setNewPostContent("");
            //setNewPostTitle("");
            //setTitleError("");
            //setContentError("");
        } catch (error) {
            toast.error("Failed to delete post.");
            console.error('Error creating new post:', error);
        }
    };



    return(
        <>
        
            <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
        {loading? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <ClipLoader
                color={"primary.main"}
                loading={loading}
                size={30}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </Box>
        ):(
            <Container sx={{ height: "90vh", mt: 5}}>
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}
                        sx={{flexWrap: "wrap"}}>
                        {/* search start */}
                    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                                <InputLabel id="search-input">Search posts</InputLabel>
                                <OutlinedInput
                                    id="search-input"
                                    type="text"
                                    label="Search posts"
                                    value={searchTerm}
                                    onChange={handleSearchInputChange}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton aria-label="search" onClick={handleSearchSubmit}>
                                                <SearchIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    style={{ width: '300px' }}
                                />
                            </FormControl>
                    </Box>
                    {!posts || posts.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#f0f0f0', maxWidth: '80%' }}>
                                <p>No posts found.</p>
                            </Box>
                        </Box>):(
                                posts.map((post: any) => (
                                    <ForumCard 
                                      key={post.id} 
                                      user_name={post.users.name} 
                                      user_last_name={post.users.lastname} 
                                      post_content={post.post} 
                                      post_title={post.title} 
                                      likes={post.likes} 
                                      created_at={formatDate(post.created_at)} 
                                      post_id={post.id} 
                                      user_id={post.user_id} 
                                      current_user={userData} 
                                      my_post= {true}
                                      onOpenEdit = {() => {handleClickOpen(post)}}
                                      onCloseDelete = {() => {handleDeletePostOpenDialog(post.id)}}
                                      qna={false}
                                      doctorcomment={false}
                                       />
                                   ))
                        )}
                 
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                </Container> 
            )}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{color: "primary.main"}}>Edit Post</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="title"
                    label="Post Title"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    required
                    error={!!titleError}
                />
                {titleError && (
                    <FormHelperText error>{titleError}</FormHelperText>
                    )}
                <TextField
                    margin="dense"
                    id="content"
                    label="Post Content"
                    type="text"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    required
                    error={!!contentError}
                />
                {contentError && (
                    <FormHelperText error>{contentError}</FormHelperText>
                    )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleEditedPostSubmit} color="primary">
                    Submit
                </Button>
            </DialogActions>
        </Dialog>

        <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
                Are you sure you want to delete this post?
            </DialogTitle>
            <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
                <Button onClick={() => {handleDeletePost(post_id)}}>Delete</Button>
            </DialogActions>
        </Dialog>
     
</>
    );
}


export default MyPostsForum;