import logging
from typing import Optional
from sqlalchemy import or_
from fastapi import APIRouter,Depends, HTTPException, Query
import schemas 
from sqlalchemy.orm import Session, joinedload
from database import get_db
import models


router = APIRouter(tags =['forum'])

#get all posts
@router.get("/posts/", response_model=list[schemas.Post])
async def get_all_posts(db: Session = Depends(get_db)):
 posts = db.query(models.Post).options(joinedload(models.Post.users)).order_by(models.Post.created_at.desc()).all()
 if not posts:
        raise HTTPException(status_code=404, detail="There are no posts created")
 return posts

#get all posts with criteria
@router.get("/posts/criterion/{criterion}", response_model=list[schemas.Post])
async def get_all_posts(criterion: int, db: Session = Depends(get_db)):
 if(criterion == 1):
    print("Sorting by latest")
    posts = db.query(models.Post).options(joinedload(models.Post.users)).order_by(models.Post.created_at.desc()).all()
 elif(criterion == 2):
    print("Sorting by oldest")
    posts = db.query(models.Post).options(joinedload(models.Post.users)).order_by(models.Post.created_at.asc()).all()
 elif(criterion == 3):
    print("Sorting by most likes")
    posts = db.query(models.Post).options(joinedload(models.Post.users)).order_by(models.Post.likes.desc()).all()
 elif(criterion == 4):
    print("Sorting by least likes")
    posts = db.query(models.Post).options(joinedload(models.Post.users)).order_by(models.Post.likes.asc()).all()
 if not posts:
        raise HTTPException(status_code=404, detail="There are no posts created")
 return posts

#post search query 
@router.get("/posts/search/{search_terms}", response_model=list[schemas.Post])
async def search_posts(search_terms: str, db: Session = Depends(get_db)):
    search_keywords = search_terms.split(",")  # Razdvajanje ključnih riječi
    print("uslo ovjde")
    query = db.query(models.Post).options(joinedload(models.Post.users))
    # Kreiranje dinamičkog filtera za svaku ključnu riječ
    filters = []
    for keyword in search_keywords:
        search_query = f"%{keyword}%"
        print(search_query)
        filters.append(
            (models.Post.title.ilike(search_query)) | (models.Post.post.ilike(search_query))
        )
    
    # Kombinovanje svih filtera koristeći OR operator
    posts = query.filter(or_(*filters)).all()

    #if not posts:
     #   raise HTTPException(status_code=404, detail="No posts found matching the search criteria")
    return posts

#get post by id
# Dohvat pojedinačnog posta
@router.get("/posts/{post_id}", response_model=schemas.Post)
async def get_post_by_id(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

#get posts by user_id
@router.get("/posts/user/{user_id}", response_model=list[schemas.Post])
async def get_post_by_user_id(user_id: int, db: Session = Depends(get_db)):
    print(f"Fetching posts for user_id: {user_id}")
    post = db.query(models.Post).options(joinedload(models.Post.users)).filter(models.Post.user_id == user_id).all()
    if not post:
        print(f"No posts found for user_id: {user_id}")
        raise HTTPException(status_code=404, detail="Post not found ne znam zasto who knows bruh")
    print(f"Found posts: {post}")
    return post

# Post search query by user_id and search terms
@router.get("/posts/user/{user_id}/{search_terms}", response_model=list[schemas.Post])
async def search_posts_by_user(user_id: int, search_terms: str, db: Session = Depends(get_db)):
    search_keywords = search_terms.split(",")  # Split the search terms by comma
    print(f"Fetching posts for user_id: {user_id} with search terms: {search_terms}")
    query = db.query(models.Post).options(joinedload(models.Post.users)).filter(models.Post.user_id == user_id)
    
    # Create dynamic filters for each keyword
    filters = []
    for keyword in search_keywords:
        search_query = f"%{keyword}%"
        print(f"Search query: {search_query}")
        filters.append(
            (models.Post.title.ilike(search_query)) | (models.Post.post.ilike(search_query))
        )
    
    # Combine all filters using OR operator
    posts = query.filter(or_(*filters)).all()
    
    #if not posts:
       # print(f"No posts found for user_id: {user_id} with search terms: {search_terms}")
       # raise HTTPException(status_code=404, detail="No posts found matching the search criteria")
    
    print(f"Found posts: {posts}")
    return posts

#creating a new post
@router.post("/posts/")
async def create_post(post: schemas.PostCreate, db: Session = Depends(get_db)):
 new_post = models.Post(title = post.title, post = post.post, user_id = post.user_id)
 if not new_post:
        raise HTTPException(status_code=404, detail="Post not inserted")
 db.add(new_post)
 db.commit()
 db.refresh(new_post)
 return new_post

 #deleting a post
@router.delete("/posts/{post_id}")
async def post_delete(post_id : int, db: Session = Depends(get_db)):
 post_to_delete = db.query(models.Post).filter(models.Post.id == post_id).first()
 if not post_to_delete:
    raise HTTPException(status_code=404, detail="Post not found")
 db.delete(post_to_delete)
 db.commit()
 return {"detail": "Post deleted successfully"}

#editing a post
@router.put("/posts/")
async def post_edit(post_info: schemas.PostEdit, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_info.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.title = post_info.title
    post.post = post_info.post
    db.commit()
    db.refresh(post)
    return post


#like increase of a post
@router.put("/posts/likes/increase/")
async def like_increase_post(post_info: schemas.Like, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_info.post_id).first()
    #already_liked = db.query(models.PostLike).filter(models.PostLike.user_id == post_info.user_id, models.PostLike.post_id == post_info.post_id).first()
    #if already_liked:
    #    raise HTTPException(status_code=400, detail="User already liked this post")
    post.likes = post.likes + 1
    db.commit()
    db.refresh(post)
    return post

#documenting a new like of a post
@router.post("/posts/like/")
async def new_like_post(like: schemas.Like,  db: Session = Depends(get_db)):
    if db.query(models.PostLike).filter(models.PostLike.user_id == like.user_id, models.PostLike.post_id == like.post_id).first():
        raise HTTPException(status_code=400, detail="This user has already liked this post")
    new_like = models.PostLike(user_id = like.user_id, post_id = like.post_id)
    if not new_like:
        raise HTTPException(status_code=404, detail="Like not inserted")
    db.add(new_like)
    db.commit()
    db.refresh(new_like)
    return new_like


#creating new comment on a post
@router.post("/comments/")
async def new_comment(comment_content: schemas.CommentCreate, db: Session = Depends(get_db)):
    new_comment = models.Comment(comment = comment_content.comment, post_id = comment_content.post_id, user_id = comment_content.user_id)
    if not new_comment:
        raise HTTPException(status_code=404, detail="Comment not inserted")
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

#getting all comments for a specific post
@router.get("/comments/{post_id}")
async def get_all_comments_for_a_post(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(models.Comment).options(joinedload(models.Comment.users)).filter(models.Comment.post_id == post_id).order_by(models.Comment.likes.desc()).all()
    if not comments:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comments

#documenting a new like of a comment
@router.post("/comments/like/")
async def new_like_comment(like: schemas.Like,  db: Session = Depends(get_db)):
    if db.query(models.CommentLike).filter(models.CommentLike.user_id == like.user_id, models.CommentLike.comment_id == like.post_id).first():
        raise HTTPException(status_code=400, detail="This user has already liked this post")
    new_like = models.CommentLike(user_id = like.user_id, comment_id = like.post_id)
    if not new_like:
        raise HTTPException(status_code=404, detail="Like not inserted")
    db.add(new_like)
    db.commit()
    db.refresh(new_like)
    return new_like

#like increase of a comment
@router.put("/comments/likes/increase/")
async def like_increase_comment(comment_info: schemas.Like, db: Session = Depends(get_db)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_info.post_id).first()
    #already_liked = db.query(models.CommentLike).filter(models.CommentLike.user_id == comment_info.user_id, models.CommentLike.comment_id == comment_info.post_id).first()
    #if already_liked:
    #   raise HTTPException(status_code=400, detail="User already liked this post")
    comment.likes = comment.likes + 1
    db.commit()
    db.refresh(comment)
    return comment

#like decrease of a comment
@router.put("/comments/likes/decrease/")
async def like_decrease_comment(comment_info: schemas.Like, db: Session = Depends(get_db)):
    comemnt = db.query(models.Comment).filter(models.Comment.id == comment_info.post_id).first()
    #already_liked = db.query(models.PostLike).filter(models.PostLike.user_id == post_info.user_id, models.PostLike.post_id == post_info.post_id).first()
    #if not already_liked:
    #    raise HTTPException(status_code=400, detail="User didnt like this")
    comemnt.likes = comemnt.likes - 1
    db.commit()
    db.refresh(comemnt)
    return comemnt

#checking if user already liked a comment
@router.get("/comments/{user_id}/{comment_id}")
async def get_a_like_for_comment(user_id: int,comment_id: int, db: Session = Depends(get_db)):
    row = db.query(models.CommentLike).filter(models.CommentLike.user_id == user_id, models.CommentLike.comment_id == comment_id).first()
    if not row:
        return None
    return row

#deleting a like from a comment
@router.delete("/comments/like/{comment_id}/{user_id}")
async def delete_like_comment(comment_id: int, user_id: int,  db: Session = Depends(get_db)):
    like_to_delete = db.query(models.CommentLike).filter(models.CommentLike.user_id == user_id, models.CommentLike.comment_id == comment_id).first()
    if not like_to_delete:
        raise HTTPException(status_code=404, detail="Like not found")
    db.delete(like_to_delete)
    db.commit()
    return {"detail": "Like deleted successfully"}

#checking if user already liked a post
@router.get("/posts/like/{user_id}/{post_id}",response_model=Optional[schemas.Like])
async def get_a_like(user_id: int, post_id: int, db: Session = Depends(get_db)):
    row = db.query(models.PostLike).filter(models.PostLike.user_id == user_id, models.PostLike.post_id == post_id).first()
    logging.debug(f"Returning item: {row}")
    if not row:
        return None
    return row

#like decrease of a post
@router.put("/posts/likes/decrease")
async def like_decrease_post(post_info: schemas.Like, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_info.post_id).first()
    #already_liked = db.query(models.PostLike).filter(models.PostLike.user_id == post_info.user_id, models.PostLike.post_id == post_info.post_id).first()
    #if not already_liked:
    #    raise HTTPException(status_code=400, detail="User didnt like this")
    post.likes = post.likes - 1
    db.commit()
    db.refresh(post)
    return post

#deleting a like from a post
@router.delete("/posts/like/{post_id}/{user_id}")
async def delete_like(post_id: int, user_id: int,  db: Session = Depends(get_db)):
    like_to_delete = db.query(models.PostLike).filter(models.PostLike.user_id == user_id, models.PostLike.post_id == post_id).first()
    if not like_to_delete:
        raise HTTPException(status_code=404, detail="Like not found")
    db.delete(like_to_delete)
    db.commit()
    return {"detail": "Like deleted successfully"}
