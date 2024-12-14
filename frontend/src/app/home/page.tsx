'use client'
import { useEffect, useState } from 'react';
import { Container, TextField, Typography, Link, Box,Button } from '@mui/material';
import ContentCard from '@/components/ContentCard';
import axios from 'axios';
import { Post } from '@/components/ContentCard';
import { useForm } from "react-hook-form";

type FormData = {
    key_word: string;
  };
  
const HomePage = () => {

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const [contents, setContents] = useState<Post[]>([]);
  const [keyWord, setKeyWord] = useState<string>("");


  useEffect(() => {
      async function fetchData() {
          const response = await axios.get<Post[]>('http://localhost:8000/contents');
          setContents(response.data);
      }
      fetchData();
  }, []);
 
 
  async function searchPosts() {
    if (keyWord.trim() === "") {
      const response = await axios.get<Post[]>('http://localhost:8000/contents');
      setContents(response.data);
    } else {
      const response = await axios.get<Post[]>(`http://localhost:8000/contents/search/${keyWord}`);
      setContents(response.data);
    }
  }
  useEffect(() => {
    
    searchPosts();
  }, [keyWord]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyWord(event.target.value);
  };


  return (
      <div>
          <Container sx={{marginBottom: "75px"}}>
          <Box sx={{ display:"flex", justifyContent:"center", marginY: 3}} component="form" onSubmit={handleSubmit(searchPosts)} noValidate >
                <TextField sx={{maxWidth:"500px", margin: "auto"}}
                  fullWidth
                  id="key_word"
                  label="Search"
                  {...register("key_word", { required: true })}
                  margin="normal"
                  onChange={handleInputChange}
                />
                
              </Box>
              {contents.map(content => ( 
                  <Link key={content.id} href={`/home/${content.id}`}  underline="none">
                    <ContentCard content={content} doktor={false} onDelete={()=>{}}/>
                  </Link>
              ))}
          </Container>
      </div>
  );
}

export default HomePage