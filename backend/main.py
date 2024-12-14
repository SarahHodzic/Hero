#pip install fastapi
#pip install "uvicorn[standard]"
#pip install pydantic
#pip install sqlalchemy
#pip install "python-jose[cryptography]"
#pip install "passlib[bcrypt]"

#pip install openai
#pip install python-dotenv

# Muhamed Aletic
# Shortcut for installing all required packages in FastAPI project -> pip install pydantic sqlalchemy "python-jose[cryptography]" "passlib[bcrypt]" openai python-dotenv psycopg2 requests

from fastapi import FastAPI
from routers import contents, auth, ai, quiz, forum, maps, quizai,users, generate,qna
import models
from database import engine 
from fastapi.middleware.cors import CORSMiddleware

#creates the tables
models.Base.metadata.create_all(bind=engine)




app = FastAPI()


# Allow requests from frontend application's domain
origins = [
    "http://localhost",
    "http://localhost:3000",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contents.router)
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(quiz.router)
app.include_router(quizai.router)
app.include_router(forum.router)
app.include_router(maps.router)
app.include_router(qna.router)
app.include_router(generate.router)
app.include_router(users.router)


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!"}

