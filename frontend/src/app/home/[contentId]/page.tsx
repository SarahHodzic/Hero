'use client'
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box , Avatar} from '@mui/material';
import { Post,Section,Media } from '@/components/ContentCard';

const PostPage = () => {
    const { contentId } = useParams()
    const [post, setPost] = useState<Post | null>(null);

    async function fetchPost() {
        const response = await axios.get<Post>(`http://localhost:8000/contents/${contentId}`);
        setPost(response.data);
    }
    console.log(post)
    
    useEffect(() => {
        if (contentId) {
            
            fetchPost();
        }
    }, [contentId]);

    if (!post) return <div>Loading...</div>;
    return (
        <Box sx={{ maxWidth:"800px", margin:"auto", padding:"16px", marginBottom: "70px"}}>
            
            <Box sx={{display:"flex", alignItems:"center", marginY: 2}}>
                <Avatar sx={{ width:40, height: 40, marginRight:2 }}/>
                <Box>
                    <Typography sx={{fontWeight:"bold"}}> {post.users.name} {post.users.lastname}</Typography>
                    <Typography sx={{fontSize: "14px", color:"GrayText"}}>Published: {new Date(post.created_at).toLocaleDateString()}</Typography>
                </Box>
            
            </Box>
            
            <Typography variant="h3" component="h1" sx={{marginBottom:4, fontWeight:"bold"}}>{post.title}</Typography>


            {post.sections.map((section: Section) => (
                <>
                    <Box key={section.id} sx={{ marginBottom: 4 }}>
                        <Typography variant="h4" component="h2" sx={{ marginBottom: 2 }}>{section.title}</Typography>
                        {section.paragraph && (
                            <Typography sx={{ marginBottom: 2, textAlign:"justify" }}>{section.paragraph}</Typography>
                        )}
                    </Box>
                    {section.media.length > 0 && (
                        
                       <Box>
                       {section.media.map((media: Media) => {
                        const isVideo = media.media_url.endsWith('.mp4') || media.media_url.endsWith('.webm');

                        return (
                            <Box
                                key={media.id}
                                sx={{
                                    width: "100%",
                                    marginY: 3
                                }}
                            >
                                {isVideo ? (
                                    <video
                                        controls
                                        style={{ width: "100%" }}
                                    >
                                        <source src={`/${media.media_url}`} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <img
                                        alt="None."
                                        src={`/${media.media_url}`}
                                        style={{ width: "100%" }}
                                    />
                                )}
                            </Box>
                        );
                    })}
                       </Box>
                       
                   )}

                </>  

            ))}


              
        

                
        </Box>
    );
}

export default PostPage;
     /*  
      <Typography sx={{ marginY: 3}} variant="h5" component="h3">{post.title}</Typography>
      <Typography sx={{textAlign:"justify", marginY: 3}} variant="body1" component="p">j skl jdsl fjds dslk fjdslk fjsdölak fjölsdk jflö sadkf jldsaökfj sdlk fjdslköf jdslkf jdslö kfjds lk fjdsklf jsdlkf jslkfj salökf jldsk fj lsakdf jlkds fjlkdsfjdslkfjsdlk fjsdlkf jasölfsdöl lkj lsajfslkjfsldkfjsldkfjdslkfjsdlfkjsdalkfjsdklfjsldkf jdslafjds</Typography>
      <Box
          component="img"
          sx={{
              width:"100%", marginY:3
          }}
          alt="The house from the offer."
          src="/default-cover.jpg"
          /> */