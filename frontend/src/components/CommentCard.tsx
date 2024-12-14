'use client'

import { Avatar, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, FormHelperText, IconButton, IconButtonProps, TextField, Typography } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from './ForumCard/ForumCard.module.css'
import LoginDialogForum from "./LoginDialogForum";
import { useRouter } from "next/navigation";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ForumCard from "./ForumCard/ForumCard";
import { format } from "date-fns";

interface CurrentUser {
  name: string,
  lastname: string,
  email: string,
  role_id: number,
  id: number,
}

interface CardInfo {
    comment_id: number,
    user_name: string,
    user_last_name: string,
    comment_content: string,
    likes: number,
    created_at: string,
    post_id: number,
    user_id: number,
    current_user: CurrentUser | null,
    qnacomment: boolean,
    qnadoctorcomment: boolean,
    onOpenEdit?: (post: any) => void
    onCloseDelete?: () => void
}


function CommentCard({user_name, user_last_name, comment_content, likes, created_at, post_id, user_id, comment_id, current_user, qnacomment,onOpenEdit, onCloseDelete, qnadoctorcomment} : CardInfo){
    const [liked, setLiked] = useState(false);
    const [likes_count, setLikes] = useState(likes)
    const [read_more, setReadMore] = useState(false);
    const [show_read_more, setShowReadMore] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [action, setAction] = useState("");
      
    const router = useRouter();
    const contentRef = useRef<HTMLParagraphElement>(null);
    
    //cheching if logged in user already liked a comment
    function isItAlreadyLiked(current_userID: number, comment_id: number) {
      const checkIfLiked = async () => {
        try {
          let response;
          if (qnacomment) {
            response = await axios.get(`http://localhost:8000/commentsqna/${current_userID}/${comment_id}/`);
          } else {
            response = await axios.get(`http://localhost:8000/comments/${current_userID}/${comment_id}/`)
          }
          if(response.data)
            setLiked(true)
          else setLiked(false)
        } catch (error) {
          console.error("Error checking if liked:", error);
        }
      };
      checkIfLiked();
    }

  
    //increasing a like for a comment
    const increaseLike = async (commentId: number , userId: number | undefined | null) => {
      try {
        let response;
        if(qnacomment){
          response = await axios.put("http://localhost:8000/commentsqna/likes/increase/", { user_id: userId, post_id: commentId });
        }
        else{
          response = await axios.put("http://localhost:8000/comments/likes/increase/", { user_id: userId, post_id: commentId });
        }
        console.log('Response:', response.data);
      } catch (error) {
        console.error('Error increasing like:', error);
      }
    };

    //decrease a like for a comment
    const decreaseLike = async (commentId: number, userId: number | undefined | null) => {
      try {
        let response;
        if(qnacomment){
          response = await axios.put(`http://localhost:8000/comments/likes/decrease/`, {user_id: userId , post_id: commentId });
        }
        else{
          response = await axios.put(`http://localhost:8000/commentsqna/likes/decrease/`, {user_id: userId , post_id: commentId });
        }
        console.log('Response:', response.data);
      } catch (error) {
        console.error('Error decreasing like:', error);
      }
    };

    //documenting a new comment like
    const newLike = async (commentId: number, userId: number | null | undefined) => {
      try {
        let response;
        if(qnacomment){
          response = await axios.post("http://localhost:8000/commentsqna/like/", {user_id : userId, post_id: commentId});
        }
        else{
          response = await axios.post("http://localhost:8000/comments/like/", {user_id : userId, post_id: commentId});
        }
        console.log('Response: ', response.data);
      } catch(error) {
        console.error('Error documenting a like: ', error);
      }
    };

    //deleting a comment like
    const deleteLike = async (commentId: number, userId: number | null | undefined) => {
      try {
        let response;
        if(qnacomment){
          response = await axios.delete(`http://localhost:8000/commentsqna/like/${commentId}/${userId}/`);
        }
        else{
          response = await axios.delete(`http://localhost:8000/comments/like/${commentId}/${userId}/`);
        }
        console.log('Response: ', response.data);
      } catch(error) {
        console.error('Error deleting a like: ', error);
      }
    };
    
    //comment content read more button
    const handleReadMore = () => {
      setReadMore(!read_more);
    }

    //if user is not logged in dialog closing logic
    const handleCloseDialog = () => {
      setOpenDialog(false);
    }

    //login dialog submit button logic
    const handleLogin = () => {
      handleCloseDialog()
      router.push('/login');
    }
    
    //liking a comment logic
    const handleLikesClick = () => {
        if (!current_user){
          setOpenDialog(true)
          setAction("like a comment")
        }
        else{
          if (!liked) {
            increaseLike(comment_id, current_user?.id)
            newLike(comment_id, current_user?.id)
            setLikes(likes_count + 1)
          }
          else {
            decreaseLike(comment_id, current_user?.id)
            deleteLike(comment_id, current_user?.id)
            setLikes(likes_count - 1)
          }
          setLiked(!liked)
        }

    }

    useEffect(() => {
      if(current_user)
        isItAlreadyLiked(current_user.id ,comment_id)
    }, [])

    useEffect(() => {
      function handleResize() {
        if (contentRef.current) {
          const maxHeight = parseFloat(getComputedStyle(contentRef.current).lineHeight) * 5;
          if (contentRef.current.scrollHeight > maxHeight) {
            setShowReadMore(true);
          } else {
            setShowReadMore(false);
          }
        }
      }
    
      handleResize(); // Running the function on first render
  
      window.addEventListener('resize', handleResize); // Adding an event listener for screen resizing
  
      return () => {
        window.removeEventListener('resize', handleResize); // Removing the event listener when unmounting the component
      };
    }, [comment_content])


    return(
      <>
        <Card sx={{ width: "100%" , mt: 1}}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: "secondary.main" }} aria-label="recipe">
                {user_name.charAt(0)}
              </Avatar>
            }
            action={
              qnadoctorcomment && ( 
                <div>
                  <IconButton aria-label="edit" onClick={onOpenEdit}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={onCloseDelete}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              )
            }
            title= {`${user_name} ${user_last_name}`}
            subheader= {created_at}
            sx={{ 
              "& .MuiCardHeader-title": {
                fontSize: "1.2rem", 
              }}}
          />
          <CardContent>
            <Typography ref={contentRef} variant="subtitle1" color="text.secondary" className={`${styles.content} ${read_more ? styles.expanded : 'collapsed'}`}>
              {comment_content}
            </Typography>
            {show_read_more && (
              <Button onClick={handleReadMore} className={styles.readMoreButton}>
                {read_more ? 'Read less': 'Read more'}
              </Button>
            )}
          </CardContent>
          <CardActions disableSpacing>
            <IconButton aria-label="add to favorites" onClick={handleLikesClick}>
              {liked ? <FavoriteIcon color="primary"/> : <FavoriteBorderOutlinedIcon />}
            </IconButton>
            <Typography>{likes_count}</Typography>  
          </CardActions>
        </Card>
        <LoginDialogForum action={action} open={openDialog} handleClose={handleCloseDialog} handleLogin={handleLogin}></LoginDialogForum>
      </>
    );
}

export default CommentCard
