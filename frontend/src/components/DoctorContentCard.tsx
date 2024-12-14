// components/ContentList.tsx
import { Box, Card,CardContent, Avatar, CardMedia,Typography, Button,IconButton  } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useEffect } from 'react';
import { User, Media, Section, Post } from './ContentCard';
import SectionForm from '@/components/SectionForm'

  
interface Props {
  content: Post;
  onDelete: (id: number) => void;
}

const ContentCard: React.FC<Props> = ({content, onDelete}) => {
  console.log(content)
  
  return (
          <>
          <Box sx={{  
            border: "none", borderRadius:"none", boxShadow: "none" , borderTop:"1px solid #bcbcbc", 
            maxWidth:"630px", 
            marginX:"auto", 
            marginY: "15px"}}>
               <Box sx={{display:"flex", alignItems:"center", marginY: 2}}>
                <Avatar sx={{ width:30, height: 30, marginRight:2 }}/>
                <Box>
                    <Typography sx={{fontWeight:"bold",fontSize: "14px",}}>{content.users.name} {content.users.lastname}</Typography>
                    <Typography sx={{fontSize: "12px", color:"GrayText"}}>Published: {new Date(content.created_at).toLocaleDateString()}</Typography>
                </Box>
            
            </Box>
              <Typography
              sx={{
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                fontWeight: 'bold'
            }}
              component="div" variant="h5">
                {content.title}
              </Typography>

              <Box sx={{display:"flex",width:"100%", justifyContent:"space-between", marginY:2}}>

              <SectionForm content_id={content.id}/>
              <Box
                sx={{cursor:"pointer"}}
                onClick={()=>{onDelete(content.id)}}>
                    <DeleteIcon sx={{color:"red"}}/>
              </Box>
             
            </Box>

          </Box>
   
       
          
          </>






  );
}

export default ContentCard;
