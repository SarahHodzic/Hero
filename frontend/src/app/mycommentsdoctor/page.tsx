"use client"
//npm install date-fns
//npm install react-toastify
//npm install --save react-spinners

import ForumCard from "@/components/ForumCard/ForumCard";
import { Box, Button, Container, Grid, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme, TextField, FormHelperText } from "@mui/material"
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
import CommentCard from "@/components/CommentCard";

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

const MyPostsQnA = () => {

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
    const router = useRouter();

    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    const theme = useTheme(); 

  
    
    useEffect(() => {
        const fetchUser = async () => {
          try {
            const token = localStorage.getItem('token');
           
            if (!token) {
               
                router.push('/login');
                return;
            }
            const userData = await getCurrentUser(token);
            if(!userData){
            
                router.push('/login');
            }
            setUserData(userData);
            setLoading(false);
          } catch (error) {
            router.push('/login');
            console.error('Error fetching current user:', error);
        
            
          }
        };
    
        fetchUser();
      }, []);

      const getAllComments = async (user_id: number | null | undefined) => {
        try {
            setLoading(true)
            const response = await axios.get(`http://localhost:8000/commentsqna/user/${user_id}`)
            setPosts(response.data);
        }catch(error){
            console.error('Error fetching posts:', error);
        }finally
        {
            setLoading(false)
        }
      } 

    const handleClickOpen = (post: any) => {
        setSelectedPost(post);
        setNewPostContent(post.comment);
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
        getAllComments(userData?.id);
    }, [userData]);

    const handleEditedPostSubmit = async () => {
          if (!newPostContent) {
            setContentError("Content is required");
            return;
          }
        try {
            const response = await axios.put("http://localhost:8000/commentqna/", { comment: newPostContent, id: selectedPost.id });
            console.log("Response", response.data);
            toast.success("Comment successfully Edited!");
            getAllComments(userData?.id);
            handleClose();
            //setNewPostContent("");
            //setNewPostTitle("");
            //setTitleError("");
            //setContentError("");
        } catch (error) {
            toast.error("Failed to edit comment.");
            console.error('Error creating new post:', error);
        }
    };

    const handleDeletePost = async (post_id: number) => {
        try {
            const response = await axios.delete(`http://localhost:8000/commentqna/${post_id}`);
            console.log("Response", response.data);
            toast.success("Comment successfully Deleted!");
            getAllComments(userData?.id);
            handleCloseDialog();
            //setNewPostContent("");
            //setNewPostTitle("");
            //setTitleError("");
            //setContentError("");
        } catch (error) {
            toast.error("Failed to delete comment.");
            console.error('Error deleting a comment:', error);
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
                 {posts.map((post: any) => (
                     <CommentCard 
                       key={post.id} 
                       comment_id={post.id}
                       user_name={post.users.name} 
                       user_last_name={post.users.lastname} 
                       comment_content={post.comment} 
                       likes={post.likes} 
                       created_at={formatDate(post.created_at)} 
                       post_id={post.post_id} 
                       user_id={post.user_id} 
                       current_user={userData} 
                       onOpenEdit = {() => {handleClickOpen(post)}}
                       onCloseDelete = {() => {handleDeletePostOpenDialog(post.id)}}
                       qnacomment={true}
                       qnadoctorcomment={true}
                        />
                    ))}
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                </Container> 
            )}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{color: "primary.main"}}>Edit Comment</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    id="content"
                    label="Comment Content"
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
                Are you sure you want to delete this comment?
            </DialogTitle>
            <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
                <Button onClick={() => {handleDeletePost(post_id)}}>Delete</Button>
            </DialogActions>
        </Dialog>
     
</>
    );
}


export default MyPostsQnA;