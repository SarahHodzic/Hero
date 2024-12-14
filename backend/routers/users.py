from fastapi import APIRouter,Depends,  HTTPException, status
#from database import SessionLocal
import schemas 
from sqlalchemy.orm import Session
from database import get_db
import models


router = APIRouter(tags =['users'])



@router.get("/users/inactive", )
def read_post(db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.active == False).all()
    return users