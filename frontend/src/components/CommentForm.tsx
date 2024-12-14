import { Button } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { text } from "stream/consumers";

interface ReplyFormInputs {
    comment: string;
  }

interface PostInfo {
    post_id: number,
    user_id: number,
    getAllComments: any
    qna: boolean
}
    
export default function CommentForm({post_id, user_id, getAllComments, qna}: PostInfo) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
    setError,
  } = useForm<ReplyFormInputs>()

  const [textareaValue, setTextareaValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const onSubmit: SubmitHandler<ReplyFormInputs> = async (data) => {
    try {
       let url = "http://localhost:8000/comments/"
       if(qna){
        url = "http://localhost:8000/commentsqna/"
       }
        const response = await axios.post(url, {comment: data.comment, user_id: user_id, post_id: post_id})
        console.log(response.data)
        reset()
        getAllComments(post_id)
        setTextareaValue('');   
    }
    catch(error){
        setError("root", {
            message: "Form not submitted"
        })
    }
  }

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setTextareaValue(value);
    setValue("comment", value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scrollHeight
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scrollHeight
    }
  }, [textareaValue]);

  
  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
      <textarea {...register("comment", {required: true})}
        value={textareaValue}
        onChange={handleInput}
        placeholder="Add a reply..."
        rows={1} 
        ref={textareaRef}
        style={{ 
            minHeight: '3em', 
            resize: 'none', 
            overflowY: 'hidden', 
            margin: '10px',
            border: '1px solid black',
            borderRadius: '5px',
            padding: '10px'
         }}
      />
      {errors.comment && <span style={{color: "red", marginLeft: "10px"}}>*This field is required</span>}

      <Button variant= "outlined" type="submit" 
        sx={{
            bgcolor: "primary.main", 
            color: "white", 
            alignSelf: 'flex-end',
            m: 1,
            "&:hover": {
                color: 'primary.main'
              }
        }}
        >Reply</Button>
    </form>
  )
}