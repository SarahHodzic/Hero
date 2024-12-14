// components/ContentList.tsx
import { Box, Card,CardContent, Avatar, CardMedia,Typography, Button,IconButton  } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useEffect } from 'react';
export interface User {
    id: number;
    name: string;
    email: string;
    lastname:string;
  }

  export interface Media {
    id: number;
    media_url: string;
  }

  export interface Section {
    id: number;
    paragraph: string;
    title: string;
    media: Media[];
  }
  
  export interface Post {
    id: number;
    title: string;
    users: User;
    created_at: string;
    media_url: string;
    
    sections: Section[];
  }
  
interface Props {
  content: Post;
  doktor: Boolean;
  onDelete: (id: number) => void;
}

const ContentCard: React.FC<Props> = ({content, doktor, onDelete}) => {

  
  return (
          <>
   
          <Card sx={{  
            border: "none", borderRadius:"none", boxShadow: "none" , borderTop:"1px solid #bcbcbc",
            display: 'flex', 
            justifyContent:"space-between", 
            maxWidth:"630px", 
            marginX:"auto", 
            marginY: "15px"}}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: '1 0 auto' }}>
                <Box sx={{ display: 'flex',alignItems:"center", marginBottom:1 }}>
                    <Avatar sx={{ width: 24, height: 24, marginRight:1 }}/>
                    <Typography variant="subtitle1" color="text.secondary" component="div">
                    {content.users.name} {content.users.lastname} 
                </Typography>
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
              
            </CardContent>
            {doktor && 
               (<Box
               sx={{cursor:"pointer"}}
                onClick={()=>{onDelete(content.id)}}>
                  <DeleteIcon sx={{color:"red"}}/>
                </Box>)
            }
           
          </Box>
          <CardMedia
            component="img"
            sx={{ width: 151, padding: 2 }}
            /* image={content.media_url} */
            image={content.media_url}
            alt="Live from space album cover"
          />
        </Card>

          
          </>






  );
}

export default ContentCard;
