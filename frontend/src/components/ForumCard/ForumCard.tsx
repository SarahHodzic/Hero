'use client'

import { Avatar, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Collapse, IconButton, IconButtonProps, Tooltip, Typography } from "@mui/material";

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from './ForumCard.module.css'
import CommentCard from "../CommentCard";
import { format } from "date-fns";
import CommentForm from "../CommentForm";
import { useRouter } from "next/navigation";
import LoginDialogForum from "../LoginDialogForum";



interface CurrentUser {
  name: string,
  lastname: string,
  email: string,
  role_id: number,
  id: number,
}

interface CardInfo {
    user_name: string,
    user_last_name: string,
    post_title: string,
    post_content: string,
    likes: number,
    created_at: string,
    post_id: number,
    user_id: number,
    current_user: CurrentUser | null,
    my_post?: Boolean
    onOpenEdit?: (post: any) => void
    onCloseDelete?: () => void
    qna: boolean
    doctorcomment: boolean
}
interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

//comment expand button logic
const ExpandMoreContainer = styled('div')<ExpandMoreProps>(({ theme, ...props }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const RotatingIcon = styled(IconButton)<ExpandMoreProps>(({ theme, ...props }) => ({
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  "&:hover": {
    backgroundColor: 'transparent',
  },
  transform: props.expand ? 'rotate(180deg)' : 'rotate(0deg)',
}));



  const formatDate = (dateString: string | number | Date) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };
  
function ForumCard({user_name, user_last_name, post_title, post_content, likes, created_at, post_id, user_id, current_user,my_post, onOpenEdit, onCloseDelete, qna, doctorcomment} : CardInfo){
    const [expanded, setExpanded] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likes_count, setLikes] = useState(likes)
    const [read_more, setReadMore] = useState(false);
    const [show_read_more, setShowReadMore] = useState(false);
    const [comments, setComment]: any = useState([]);
    const [reply, setReply] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [action, setAction] = useState("");
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const contentRef = useRef<HTMLParagraphElement>(null);
  
    //fetching all comments for each post
    function getAllComments(post_id: number) {
      const fetchData = async () => {
        try {
          let response;
          if (qna) {
            response = await axios.get(`http://localhost:8000/commentsqna/${post_id}`);
          } else {
            response = await axios.get(`http://localhost:8000/comments/${post_id}`);
          }
          setComment(response.data);
          console.log(response.data);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      };
  
      fetchData();
    }

    useEffect(() => {
      getAllComments(post_id);
    }, []);

    //checking if user already liked a post
    function isItAlreadyLiked(current_userID: number, post_id: number) {
      const checkIfLiked = async () => {
        try {
          let response;
          if (qna) {
            response = await axios.get(`http://localhost:8000/postsqna/like/${current_userID}/${post_id}/`);
          } else {
            response = await axios.get(`http://localhost:8000/posts/like/${current_userID}/${post_id}/`);
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

    //increasing a like for a post
    const increaseLike = async (postId: number , userId: number | undefined | null) => {
      try {
        let response;
        if(qna){
          response = await axios.put("http://localhost:8000/postsqna/likes/increase", { user_id: userId, post_id: postId });
        }
        else{
          response = await axios.put("http://localhost:8000/posts/likes/increase", { user_id: userId, post_id: postId });
        }
        console.log('Response:', response.data);
      } catch (error) {
        console.error('Error increasing like:', error);
      }
    };

    //decrease a like for a post
    const decreaseLike = async (postId: number, userId: number | undefined | null) => {
      try {
        let response;
        if(qna){
          response = await axios.put(`http://localhost:8000/postsqna/likes/decrease/`, {user_id: userId , post_id: postId });
        }
        else{
          response = await axios.put(`http://localhost:8000/posts/likes/decrease/`, {user_id: userId , post_id: postId });
        } 
        console.log('Response:', response.data);
      } catch (error) {
        console.error('Error decreasing like:', error);
      }
    };

    //documenting a new like
    const newLike = async (postId: number, userId: number | null | undefined) => {
      try {
        let response;
        if(qna){
          response = await axios.post("http://localhost:8000/postsqna/like/", {user_id : userId, post_id: postId});
        }
        else{
          response = await axios.post("http://localhost:8000/posts/like/", {user_id : userId, post_id: postId});
        } 
        console.log('Response: ', response.data);
      } catch(error) {
        console.error('Error documenting a like: ', error);
      }
    };

    //deleting a like
    const deleteLike = async (postId: number, userId: number | null | undefined) => {
      try {
        let response;
        if(qna){
          response = await axios.delete(`http://localhost:8000/postsqna/like/${postId}/${userId}/`);
        }
        else{
          response = await axios.delete(`http://localhost:8000/posts/like/${postId}/${userId}/`);
        }
        console.log('Response: ', response.data);
      } catch(error) {
        console.error('Error deleting a like: ', error);
      }
    };

    //when user is not logged in dialog closing
    const handleCloseDialog = () => {
      setOpenDialog(false);
    }

    //login dialog submit button logic
    const handleLogin = () => {
      handleCloseDialog()
      router.push('/login');
    }

    //comment expand button click
    const handleExpandClick = () => {
      setExpanded(!expanded);
    }

    //read more of post content button
    const handleReadMore = () => {
      setReadMore(!read_more);
    }

    //reply button for making comments button logic
    const handleReply = () => {
      if (!current_user){
        setOpenDialog(true)
        setAction("comment on a post")
      }
      else{
        setReply(!reply)
      } 
    }
    
    //like iconbutton click logic
    const handleLikesClick = () => {
        if (!current_user){
          setOpenDialog(true)
          setAction("like a post")
        }
      else{
          if (!liked) {
            increaseLike(post_id, current_user?.id)
            newLike(post_id, current_user?.id)
            setLikes(likes_count + 1)
          }
          else {
            decreaseLike(post_id, current_user?.id)
            deleteLike(post_id, current_user?.id)
            setLikes(likes_count - 1)
          }
          setLiked(!liked)
      }
    }

    useEffect(() => {
      if(current_user)
        isItAlreadyLiked(current_user.id ,post_id)
    }, [])

    //checking screen size for adding read more button for post content
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
    }, [post_content])

    
    return(
      <>
        <Card sx={{ width: "100%" , mt: 1}}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: "primary.main" }} aria-label="recipe">
                {user_name.charAt(0)}
              </Avatar>
            }
            action={
              my_post && !doctorcomment && ( 
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
            <Typography variant="h5" sx={{mb: 2}} className={styles.title}>
                {post_title}
            </Typography>
            <Typography ref={contentRef} variant="subtitle1" color="text.secondary" className={`${styles.content} ${read_more ? styles.expanded1 : 'collapsed'}`}>
              {post_content}
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
            <Typography>
              {likes_count}
            </Typography>
            {qna ? (
               <Tooltip title="Only doctors can reply on posts" enterDelay={500} arrow>
               <span>
                 <Button onClick={handleReply} sx={{ m: 1 }} disabled={!qna || (qna && current_user?.role_id !== 2)}>
                   {reply ? 'Cancel' : 'Reply'}
                 </Button>
               </span>
             </Tooltip>
            ):(
              <Button onClick={handleReply} sx={{ m: 1 }}>
                   {reply ? 'Cancel' : 'Reply'}
                 </Button>
            )} 
            <ExpandMoreContainer expand={expanded} onClick={handleExpandClick}>
              <RotatingIcon expand={expanded}>
                <ExpandMoreIcon />
              </RotatingIcon>
              <Typography>
                Comments
              </Typography>
            </ExpandMoreContainer> 
          </CardActions>
          {reply && current_user && (
              <>
                <CommentForm user_id={current_user?.id} post_id={post_id} getAllComments = {getAllComments} qna={qna}></CommentForm>
              </>
              )}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            {comments.map((comment: any) => ( 
                <CommentCard 
                  key={comment.id}
                  user_name={comment.users.name}
                  user_last_name={comment.users.lastname}
                  comment_content={comment.comment}
                  likes={comment.likes}
                  created_at={formatDate(comment.created_at)}
                  post_id={comment.post_id}
                  user_id={comment.user_id}
                  current_user={current_user} 
                  comment_id={comment.id}
                  qnacomment={qna}
                  qnadoctorcomment={doctorcomment}
                  >
                </CommentCard>
                ))
            }
          </CardContent>
          </Collapse>
        </Card>
        <LoginDialogForum action={action} open={openDialog} handleClose={handleCloseDialog} handleLogin={handleLogin}></LoginDialogForum>
      </>
    );
}

export default ForumCard
