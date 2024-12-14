import os
from fastapi import APIRouter,Depends, File, HTTPException, UploadFile
#from database import SessionLocal
import schemas 
from sqlalchemy.orm import Session, joinedload
from database import get_db
import models
from routers.auth import get_current_user
import crud.contents as crud
from uuid import uuid4
from sqlalchemy import or_, and_
router = APIRouter(tags =['contents'])


UPLOAD_DIR = os.path.join("..", "frontend", "public")

os.makedirs(UPLOAD_DIR, exist_ok=True)


""" 
1. from routers.auth import get_current_user
2. proslijediti funkciji current_user: schemas.User = Depends(get_current_user) 
ako prodje funkcija znaci da je user logovan i mozete pristupit njegovom podacima putem current_user
ako nije logovan dobit cete odgovarajuci error response
pogledaj dummy rutu
"""

DEFAULT_MEDIA_URL = "default-cover.jpg"  


""" 
def get_first_media_url(content_id: int, db: Session):
    # Query to get the first media URL for the given content ID
    media = db.query(models.Media).join(models.Section).filter(models.Section.content_id == content_id).first()
    return media.media_url if media else DEFAULT_MEDIA_URL """

def get_first_media_url(content_id: int, db: Session):
    # Query to get the first media URL that is a picture (not a video) for the given content ID
    media = (
        db.query(models.Media)
        .join(models.Section)
        .filter(
            and_(
                models.Section.content_id == content_id,
                ~models.Media.media_url.like('%.mp4'),
                ~models.Media.media_url.like('%.webm'),
                ~models.Media.media_url.like('%.avi'),
                ~models.Media.media_url.like('%.mov')
            )
        )
        .first()
    )
    return media.media_url if media else DEFAULT_MEDIA_URL




@router.get("/contents/{content_id}", response_model=schemas.Content)
def read_post(content_id: int, db: Session = Depends(get_db)):
    content = db.query(models.Content).options(
        joinedload(models.Content.users),        
        joinedload(models.Content.sections).joinedload(models.Section.media)
    ).filter(models.Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content



@router.get("/contents/")
def read_posts(db: Session = Depends(get_db)):
    posts = db.query(models.Content).options(
        joinedload(models.Content.users),        
        joinedload(models.Content.sections)     
    ).all()
    for post in posts:
        post.media_url = get_first_media_url(post.id,db)
    return posts


""" @router.get("/contents/search/{key_word}")
def read_posts(key_word:str, db: Session = Depends(get_db)):
    posts = db.query(models.Content).options(
        joinedload(models.Content.users),        
        joinedload(models.Content.sections)     
    ).filter(models.Content.title.ilike(f"%{key_word}%")).all()
    for post in posts:
        post.media_url = get_first_media_url(post.id,db)
    return posts
 """


@router.get("/contents/search/{key_word}")
def read_posts(key_word: str, db: Session = Depends(get_db)):
    # Split the keyword into individual words
    search_words = key_word.split()

    # Construct the OR condition
    or_conditions = [models.Content.title.ilike(f"%{word}%") for word in search_words]

    # Query the database with the OR condition
    posts = db.query(models.Content).options(
        joinedload(models.Content.users),
        joinedload(models.Content.sections)
    ).filter(or_(*or_conditions)).all()

    # Add media_url to the posts
    for post in posts:
        post.media_url = get_first_media_url(post.id, db)
    
    return posts


@router.get("/contents/me/{user_id}")
def read_contents(user_id:int, db: Session = Depends(get_db)):
    posts = db.query(models.Content).options(
        joinedload(models.Content.users),        
        joinedload(models.Content.sections)     
    ).filter(models.Content.user_id == user_id).all()
    for post in posts:
        post.media_url = get_first_media_url(post.id,db)
    return posts 




@router.post("/contents/", response_model=schemas.Content)
def create_post(post: schemas.ContentCreate, db: Session = Depends(get_db)):
    return crud.create_post(db=db, post=post)


@router.post("/contents/section/", response_model=schemas.Section)
def create_section(section: schemas.SectionCreate, db: Session = Depends(get_db)):
    return crud.create_section(db=db, section=section)



@router.post("/contents/media/{section_id}", response_model=schemas.Media)
async def upload_file(section_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    media_url = f"{file_name}"


    # Save the file to the file system
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        # Attempt to create the media entry in the database
        media = crud.create_media(db=db, section_id=section_id, media_url=media_url, name="none")
    except Exception as e:
        # If there is an error, delete the saved file and raise an HTTP exception
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"An error occurred while saving the media to the database: {str(e)}")
    return media






@router.delete("/contents/{content_id}", response_model=dict)
def delete_content(content_id: int, db: Session = Depends(get_db)):
    # Fetch the content from the database
    content = db.query(models.Content).filter(models.Content.id == content_id).first()

    # Check if the content exists
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    # Delete the content, sections, and media
    db.delete(content)
    db.commit()

    return {"message": "Content deleted successfully"}
















"""  
@router.get("/{content_id}", response_model=schemas.Content)
def get_content_by_id(content_id: int, db: Session = Depends(get_db)):
    content = db.query(models.Content).filter(models.Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@router.get("/{content_id}/media", response_model=list[schemas.Media])
def get_media_by_content_id(content_id: int, db: Session = Depends(get_db)):
   content = db.query(models.Content).filter(models.Content.id == content_id).first()
   return content.media


@router.get("/{content_id}", response_model=schemas.Content)
def get_content_by_id(content_id: int, db: Session = Depends(get_db)):
    content = db.query(models.Content).filter(models.Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content




@router.post("/create", response_model = schemas.Content)
def create_content(content: schemas.ContentCreate, db: Session = Depends(get_db),current_user: schemas.User = Depends(get_current_user)):
    if current_user.role_id != 2:
        raise HTTPException(status_code=403, detail="Permission denied")
    db_content = models.Content(**content.model_dump(), user_id=current_user.id)
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content


@router.post("/{content_id}/media/", response_model=schemas.Media)
def add_media_to_content(media_name:str, content_id: int, type: str,media: UploadFile = File(...), db: Session = Depends(get_db),current_user: schemas.User = Depends(get_current_user)):
    if current_user.role_id != 2:
        raise HTTPException(status_code=403, detail="Permission denied")
    # Check if the post exists
    db_content = db.query(models.Content).filter(models.Content.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    upload_folder = os.path.join(os.getcwd(), "resources")
    os.makedirs(upload_folder, exist_ok=True)
    
    # Define the path for the uploaded file
    file_path = os.path.join(upload_folder, media.filename)
    
    # Save the uploaded file to the specified directory
    with open(file_path, "wb") as f:
        contents = media.file.read()
        f.write(contents)
    
    # Create a new Media instance and associate it with the post
    db_media = models.Media(name=media_name, media_type=type, media_url=media.filename, content_id=content_id)
    
    # Add the new media instance to the session and commit changes to the database
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    
    return db_media

"""