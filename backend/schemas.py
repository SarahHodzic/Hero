from datetime import datetime
from fastapi import UploadFile
from pydantic import BaseModel, Field


#Muhamed Aletic
#Needed for late bainding
from typing import ForwardRef, Optional

class Role(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name : str
    lastname : str
    email : str
    role_id : int 


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    active: bool

    class Config:
        from_attributes = True


#----------content start


class MediaBase(BaseModel):
    name: str
    media_url: str
    section_id: int

class MediaCreate(MediaBase):
    pass

class Media(MediaBase):
    id: int

    class Config:
        orm_mode = True

class SectionBase(BaseModel):
    title: str = None
    paragraph: str = None
    content_id: int

class SectionCreate(SectionBase):
    pass

class Section(SectionBase):
    id: int
    media: list[Media]

    class Config:
        orm_mode = True

class ContentBase(BaseModel):
    title: str
    user_id: int

class ContentCreate(ContentBase):
    pass

class Content(ContentBase):
    id: int
    created_at: datetime
    sections: list[Section] = []
    users: User
    media_url: str | None = None
    class Config:
        orm_mode = True



#------content end----------------




#Muhamed Aletic
#Schemas for creating and reading quizzes, including questions and answers.
#Quiz
class QuizBase(BaseModel):
    title: str

class QuizCreate(QuizBase):
    owner_id: int
    category_id: int


question_ref = ForwardRef("Question")
class Quiz(QuizBase):
    quiz_id: int
    owner_id: int
    questions: list[question_ref] = []

    class Config:
        from_attributes = True

#QuizCategory
class QuizCategoryBase(BaseModel):
    category_title: str

class QuizCategoryCreate(QuizCategoryBase):
    pass

class QuizCategory(QuizCategoryBase):
    category_id: int
    category_title: str
    class Config:
        from_attributes = True

# Chat.gpt schemas for question and answer needed for update.
class AnswerBase(BaseModel):
    answer: str

class AnswerCreate(AnswerBase):
    status: bool
    question_id: int = None

class QuestionBase(BaseModel):
    question: str

class QuestionCreate(QuestionBase):
    quiz_id: int

class Question(QuestionBase):
    question_id: int
    quiz_id: int
    answers: list[AnswerBase] = []

    class Config:
        from_attributes = True

class Answer(AnswerBase):
    answer_id: int
    question_id: int
    status: bool

    class Config:
        from_attributes = True

# Update schema for question and answers
class AnswerUpdate(BaseModel):
    answer_id: int
    answer: str
    status: bool

class QuestionUpdate(BaseModel):
    question_id: int
    question: str
    answers: list[AnswerUpdate]

#Question and answer create together.
class QuestionAndAnswerCreate(QuestionBase):
    quiz_id: int
    question: str
    answers: list[AnswerCreate]

#Create quiz, questions and answers together.
class QuestionCreateAll(BaseModel):
    question: str
    answers: list[AnswerCreate]

class QuizCreateAll(BaseModel):
    owner_id: int
    category_id: int
    title: str
    questions: list[QuestionCreateAll]

#Quiz results
class QuizResultBase(BaseModel):
    user_id: int
    quiz_id: int
    title: str
    date: datetime
    correct_answers: int
    number_of_questions: int

class QuizResultCreate(QuizResultBase):
    pass

class QuizResult(QuizResultBase):
    result_id: int

    class Config:
        from_attributes = True

class QuizRequest(BaseModel):
    title: str
    owner_id: int
    category_id: int

#Sarah Hodzic
#Schemas for creating and returning posts and comments on said posts

class PostBase(BaseModel):
    post:str
    title: str

class Post(PostBase):
    id: int
    user_id: int
    likes: int
    created_at: datetime
    users: Optional[UserBase]
    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    user_id: int
    title: str = Field(..., description="Post title", min_length= 1)
    post: str = Field(..., description="Post content", min_length= 1)

class PostEdit(PostBase):
    id: int

#Likes

class Like(BaseModel):
    user_id: int
    post_id: int
    

#Comments

class CommentBase(BaseModel):
    comment: str

class Comment(CommentBase):
    id: int
    post_id: int
    user_id: int
    likes: int
    created_at: datetime
    users: Optional[UserBase]
    class Config:
        from_attribues = True

class CommentCreate(BaseModel):
    comment: str = Field(..., description="Comment ", min_length= 1)
    user_id: int
    post_id: int


#Schemas for creating and returning posts and comments on said posts for QnA

class PostBaseQnA(BaseModel):
    post:str
    title: str

class PostQnA(PostBaseQnA):
    id: int
    user_id: int
    likes: int
    created_at: datetime
    users: Optional[UserBase]
    class Config:
        from_attributes = True

class PostCreateQnA(BaseModel):
    user_id: int
    title: str = Field(..., description="Post title", min_length= 1)
    post: str = Field(..., description="Post content", min_length= 1)

class PostEditQnA(PostBaseQnA):
    id: int

#Likes QnA

class LikeQnA(BaseModel):
    user_id: int
    post_id: int
    

#Comments QnA

class CommentBaseQnA(BaseModel):
    comment: str

class CommentEditQnA(CommentBaseQnA):
    id: int

class CommentQnA(CommentBaseQnA):
    id: int
    post_id: int
    user_id: int
    likes: int
    created_at: datetime
    users: Optional[UserBase]
    class Config:
        from_attributes = True  

class CommentCreateQnA(BaseModel):
    comment: str = Field(..., description="Comment ", min_length= 1)
    user_id: int
    post_id: int