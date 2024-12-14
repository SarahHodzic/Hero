
from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text, func

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
#obrisi content_type 

class Media(Base):
    __tablename__ = "media"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    section_id = Column(Integer, ForeignKey('sections.id'))
    media_url = Column(String)
    sections = relationship('Section', back_populates='media')


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    paragraph = Column(Text)
    content_id = Column(Integer, ForeignKey('contents.id'))
    media = relationship('Media', back_populates='sections')
    contents = relationship('Content', back_populates='sections')

class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    users = relationship('User', back_populates='contents')
    sections = relationship('Section', back_populates='contents', cascade="all, delete-orphan")

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    lastname = Column(String, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String, nullable=False)
    active = Column(Boolean, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    contents = relationship('Content', back_populates='users')


    posts = relationship("Post", back_populates="users")
    comments = relationship("Comment", back_populates="users")
    posts_qna = relationship("PostQnA", back_populates="users")
    comments_qna = relationship("CommentQnA", back_populates="users")

    # Muhamed Aletic
    quiz_results = relationship('QuizResult', back_populates='user')

#Muhamed Aletic
#Table needed for quiz realisation
class Quiz(Base):
    __tablename__ = "quizes"

    quiz_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("category.category_id", ondelete="CASCADE"), nullable=False) 
    
    questions = relationship("Question", back_populates="quiz")
    category = relationship("Category", back_populates="quizzes")
    quiz_results = relationship('QuizResult', back_populates='quiz')

class Category(Base):
    __tablename__ = "category"

    category_id = Column(Integer, primary_key=True, index=True)
    category_title = Column(Text, nullable=False )

    quizzes = relationship("Quiz", back_populates="category")

class Question(Base):
    __tablename__ = "questions"

    question_id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizes.quiz_id", ondelete="CASCADE"), nullable=False)

    quiz = relationship("Quiz", back_populates="questions")
    answers = relationship("Answer", back_populates="question")

class Answer(Base):
    __tablename__ = "answers"

    answer_id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.question_id", ondelete="CASCADE"), nullable=False)
    answer = Column(Text, nullable=False)
    status = Column(Boolean, nullable=False)

    question = relationship('Question', back_populates="answers")
 

class QuizResult(Base):
    __tablename__ = 'quiz_results'
    result_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    quiz_id = Column(Integer, ForeignKey('quizes.quiz_id', ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    number_of_questions = Column(Integer, nullable=False)

    user = relationship('User', back_populates='quiz_results')
    quiz = relationship('Quiz', back_populates='quiz_results')

 #Sarah Hodzic
 #Tables for Forum

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    likes = Column(Integer, nullable=False, default=0)
    post = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())

    users = relationship("User", back_populates="posts")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    comment = Column(Text, nullable=False)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())

    users = relationship("User", back_populates="comments")

class PostLike(Base):
    __tablename__ = "post_likes"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)

class CommentLike(Base):
    __tablename__ = "comment_likes"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    comment_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), primary_key=True)


#Tables for QnA

class PostQnA(Base):
    __tablename__ = "posts_qna"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    likes = Column(Integer, nullable=False, default=0)
    post = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())

    users = relationship("User", back_populates="posts_qna")

class CommentQnA(Base):
    __tablename__ = "comments_qna"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts_qna.id", ondelete="CASCADE"), nullable=False)
    comment = Column(Text, nullable=False)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())

    users = relationship("User", back_populates="comments_qna")

class PostLikeQnA(Base):
    __tablename__ = "post_likes_qna"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    post_id = Column(Integer, ForeignKey("posts_qna.id", ondelete="CASCADE"), primary_key=True)

class CommentLikeQnA(Base):
    __tablename__ = "comment_likes_qna"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    comment_id = Column(Integer, ForeignKey("comments_qna.id", ondelete="CASCADE"), primary_key=True)