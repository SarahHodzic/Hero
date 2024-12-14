"use client"
//npm install date-fns
//npm install react-paginate
//npm install react-helmet
//npm install --save-dev @types/react-helmet

import ForumCard from "@/components/ForumCard/ForumCard";
import { Box, Button, Container, Grid, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme, TextField, FormHelperText, Select, MenuItem, FormControl, InputLabel, IconButton, OutlinedInput, InputAdornment, SelectChangeEvent } from "@mui/material"
import axios from "axios";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import { Helmet } from 'react-helmet';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import LoginDialogForum from "@/components/LoginDialogForum";
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useRouter } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";
import SearchIcon from '@mui/icons-material/Search';
import ReactPaginate from "react-paginate";
import './style.css';
import QnaWelcomeDialog from "@/components/QnaWelcomeDialog";


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

const Forum = () => {

    const [posts, setPosts]: any = useState([]);
    const [userData, setUserData]= useState<CurrentUser | null>(null);
    const [open, setOpen] = useState(false); //for opening new post
    //insert info for new post dialog form
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [contentError, setContentError] = useState("");
    const [titleError, setTitleError] = useState("");
    const [openDialog, setOpenDialog] = useState(false); //dialog for when users are not logged in
    const [action, setAction] = useState(""); //message for login dialog
    const [loading, setLoading] = useState(true);
    //search and filter features
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("");
    //pagination
    const [currentItems, setCurrentItems] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [itemOffset, setItemOffset] = useState(0); //index of the first item in the current page
    const itemsPerPage = 5;

    const router = useRouter();

    //pagination
    useEffect(() => {
        const endOffset = itemOffset + itemsPerPage; //index of the last item in the current page
        setCurrentItems(posts.slice(itemOffset, endOffset));
        setPageCount(Math.ceil(posts.length / itemsPerPage));
    }, [itemOffset, itemsPerPage, posts])

    const handlePageClick = (event: any) => {
        const newOffset = (event.selected * itemsPerPage) % posts.length;
        setItemOffset(newOffset)
    }


    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    //fetching a current logged in user
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const response = await axios.get('http://localhost:8000/auth/users/me/', {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
                setUserData(response.data);
              } catch (error) {
                console.error('Error fetching user data:', error);
              }
        };
        fetchData()     
    }, [])
    
    //fetching all posts with criterias and also route for searching items if needed
    const getAllPosts = async (sortValue: number = 1, searchTerm?: string) => {
        try {
            let url = `http://localhost:8000/postsqna/criterion/${sortValue}`;
        if (searchTerm) {
            url = `http://localhost:8000/postsqna/search/${searchTerm}`;
        }
            const response = await axios.get(url);
            setPosts(response.data);
            
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllPosts();
    }, []);
    
    //new post dialog opening
    const handleClickOpen = () => {
        if (!userData)
            {
                setOpenDialog(true)
                setAction("create new posts")
            }
        else {
            setOpen(true);
        }
    };

    //if user is not logged in login dialog submit button function
    const handleLogin = () => {
        handleCloseDialog()
        router.push('/login');
    }

    //new post dialog closing
    const handleClose = () => {
        setOpen(false);
    };

    //my posts button logic
    const handleOpenMyPosts = () => {
        if (!userData){
            setOpenDialog(true)
            setAction("view your posts")
        }
        else{
            router.push('/mypostsqna');
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
       
        getAllPosts(1, keywords.join(","));
    };

    const handleOpenMyComments = () => {
        router.push('/mycommentsdoctor');
    }

    //sort onChange logic
    const handleSortChange = (event: SelectChangeEvent) => {
        const selectedValue = event.target.value;
        setSortBy(selectedValue); 

        if(selectedValue === "latest") {
            getAllPosts(1);
        } else if(selectedValue === "oldest") {
            getAllPosts(2);
        } else if(selectedValue === "likes") {
            getAllPosts(3);
        } else if(selectedValue === "dislikes") {
            getAllPosts(4);
        }
    };

    //new post submit dialog button logic
    const handleNewPostSubmit = async () => {
        if (!newPostTitle) {
            setTitleError("Title is required");
            return;
          }
          if (!newPostContent) {
            setContentError("Content is required");
            return;
          }
        try {
            const response = await axios.post("http://localhost:8000/postsqna/", { title: newPostTitle, post: newPostContent, user_id: userData?.id });
            getAllPosts();
            handleClose();
            setNewPostContent("");
            setNewPostTitle("");
            setTitleError("");
            setContentError("");
        } catch (error) {
            console.error('Error creating new post:', error);
        }
    };
   
    return(
        <>
        <Helmet>
            <title>QnA</title>
        </Helmet>
        <Grid container spacing={2}>
            {isSmallScreen ? (
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start', ml: 2, mt: 2, gap: 1, top: "10%" }}>
                        <Button variant="contained" startIcon={<AddIcon />} sx={{bgcolor: "green" }} onClick={handleClickOpen}>
                            New Post
                        </Button>
                            
                        <Button variant="outlined" startIcon={<AssignmentIndIcon/>} onClick={handleOpenMyPosts}>
                            My Posts
                        </Button> 
                        {userData?.role_id == 2 &&
                        (
                            <Button variant="outlined"  onClick={handleOpenMyComments}>
                                My Comments
                            </Button>
                        )}
                    </Box>
                    
                </Grid>
            ) : (
                <Grid item xs={2} md={1}>
                     
                        <Box sx={{ position: "fixed", display: 'flex', flexDirection: 'column', alignItems: 'start', top: '10%', gap: 1 ,m:1}}>
                            <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: "green" }} onClick={handleClickOpen}>
                                New Post
                            </Button> 

                            <Button variant="outlined" startIcon={<AssignmentIndIcon/>} onClick={handleOpenMyPosts}>
                                My Posts
                            </Button>   
                            {userData?.role_id == 2 &&
                            (
                            <Button variant="outlined"  onClick={handleOpenMyComments}>
                                My Comments
                            </Button>
                            )}
                        </Box>   
                </Grid>
            )}
            <Grid item xs={isSmallScreen ? 12 : 10} sx={isSmallScreen ? { mt: 1 } : { ml: 'auto' }} md={11}>
                <Container sx={{ height: "90vh", mt: 3}}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}
                        sx={{flexWrap: "wrap"}}>
                        {/* search and filter start */}
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
                        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                            <InputLabel id="sort">Sort by</InputLabel>
                            <Select
                                labelId="sort"
                                value={sortBy}
                                variant="outlined"
                                label="Sort by"
                                onChange={handleSortChange}
                                style={{ width: '200px' }}
                            >
                                <MenuItem value="latest">Latest posts</MenuItem>
                                <MenuItem value="oldest">Oldest posts</MenuItem>
                                <MenuItem value="likes">Most liked posts</MenuItem>
                                <MenuItem value="dislikes">Least liked posts</MenuItem>
                            </Select>
                        </FormControl>
                        {/* search and filter end*/}
                    </Box>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <ClipLoader
                                color={"primary.main"}
                                loading={loading}
                                size={30}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </Box>
                    ) : !posts || posts.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#f0f0f0', maxWidth: '80%' }}>
                                <p>No posts found.</p>
                            </Box>
                        </Box>
                    ) : (
                        <>
                            {currentItems.map((post: any) => (
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
                                    my_post={false}
                                    qna={true}
                                    doctorcomment={false}
                                />
                            ))}
                           
                                    <ReactPaginate
                                        breakLabel = "..."
                                        nextLabel = " > "
                                        onPageChange={handlePageClick}
                                        pageRangeDisplayed={3}
                                        pageCount={pageCount}
                                        previousLabel = " < "
                                        renderOnZeroPageCount={null}
                                        containerClassName="pagination"
                                        pageLinkClassName="page-num"
                                        previousLinkClassName="page-num"
                                        nextLinkClassName="page-num"
                                        activeLinkClassName="active"
                                    />    
                        </>
                    )}
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                </Container>
            </Grid>
        </Grid>
    
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{color: "primary.main"}}>New Post</DialogTitle>
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
            <Button onClick={handleNewPostSubmit} color="primary">
                Submit
            </Button>
        </DialogActions>
        </Dialog>
        <QnaWelcomeDialog />
        <LoginDialogForum action={action} open={openDialog} handleClose={handleCloseDialog} handleLogin={handleLogin}></LoginDialogForum>
        
</>
    );
}


export default Forum;