#routers fajl
from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session
import models, schemas
from sqlalchemy.orm import joinedload

from database import get_db


# Import this module for transaction error. 
from sqlalchemy.exc import SQLAlchemyError


router = APIRouter(tags =['quiz'])


#Muhamed Aletic
#My work after internship

# Get all quizzes from database
@router.get("/quiz/quizzes/{user_id}")
async def get_quizzes(user_id: int, db: Session = Depends(get_db)):
     # 1. Pronaći sve kvizove koje korisnik nije kreirao
    quizzes_not_owned = db.query(models.Quiz).filter(models.Quiz.owner_id != user_id).all()

     # 2. Pronaći sve kvizove koje korisnik nije položio
    passed_quizzes = db.query(models.QuizResult).filter(models.QuizResult.user_id == user_id).all()
    passed_quiz_ids = [pq.quiz_id for pq in passed_quizzes]

     # 3. Filtrirati kvizove koje korisnik nije položio
    available_quizzes = [quiz for quiz in quizzes_not_owned if quiz.quiz_id not in passed_quiz_ids and len(quiz.questions) > 0]
    return available_quizzes
    # quizzes = db.query(models.Quiz).all()
    # return quizzes


# Find quiz by id   
@router.get("/quiz/find-quiz/{quiz_id}")
async def find_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.quiz_id == quiz_id).options(joinedload(models.Quiz.questions)).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    for question in quiz.questions:
        db.refresh(question)
        question.answers = db.query(models.Answer).filter(models.Answer.question_id == question.question_id).all()
    return quiz


# Route for creating a category
@router.post("/quiz/create-category")
async def create_category(category: schemas.QuizCategoryCreate, db: Session = Depends(get_db)):
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# Get all quizzes category from database
@router.get("/quiz/categories")
async def get_quiz_categories(db: Session = Depends(get_db)):
    
    db_quiz_catgeories = db.query(models.Category).all()
    return db_quiz_catgeories

# Delete question from database and all question's answers
@router.delete("/quiz/delete-question/{question_id}")
async def delete_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(models.Question).filter(models.Question.question_id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    try:
        # Start a transaction
        # db.begin()

        # Delete the question, CASCADE should handle related answers
        # CASCADE have a mistake. I will find why. --> TO-DO
        db.query(models.Answer).filter(models.Answer.question_id == question_id).delete()
        db.delete(question)

        # Commit the transaction
        db.commit()
        return {"message" : "Question and related asnwers deleted successfully from database"}
    except SQLAlchemyError as e:

        # Rollback the transaction in case of error
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Update question and answers. 
@router.put("/quiz/update-question/{question_id}")
async def update_question_and_answers(question_id: int, question_update: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    # Find question
    question = db.query(models.Question).filter(models.Question.question_id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    
    # Find answers
    answers = db.query(models.Answer).filter(models.Answer.question_id == question_id).all()
    #answer_ids = [answer.answer_id for answer in answers]
    answer_ids = []
    for answer in answers:
        answer_ids.append(answer.answer_id)
    print(answer_ids)

    if not all(answer.answer_id in answer_ids for answer in question_update.answers):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more answers do not belong to the question")
    try:
        # Update the question
        db.query(models.Question).filter(models.Question.question_id == question_id).update({models.Question.question: question_update.question})

        # Update the answers
        for answer in question_update.answers:
            db.query(models.Answer).filter(models.Answer.answer_id == answer.answer_id).update({
                models.Answer.answer: answer.answer,
                models.Answer.status: answer.status
            })

        # Commit transaction
        db.commit()
        return {"message": "Question and answers updated successfully"}

    except Exception as e:
        # Rollback transaction on error
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Create question and answers for question.
@router.post("/quiz/create-question-and-answers/{quiz_id}")
async def create_question_and_answers(quiz_id: int, question_data: schemas.QuestionAndAnswerCreate, db: Session = Depends(get_db)):
    try:
        new_question = models.Question(question=question_data.question, quiz_id=question_data.quiz_id)
        db.add(new_question)
        db.commit()
        db.refresh(new_question)

        # Kreirajte odgovore za to pitanje
        for answer_data in question_data.answers:
            new_answer = models.Answer(answer=answer_data.answer, status=answer_data.status, question_id=new_question.question_id)
            db.add(new_answer)
        
        db.commit()
          # Dobavite sve odgovore za pitanje
        answers = db.query(models.Answer).filter(models.Answer.question_id == new_question.question_id).all()
        new_question.answers = answers
        
        return new_question
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Create quiz, questions, and answers
@router.post("/quiz/create-quiz-questions-answers")
async def create_quiz_questions_answers(quiz_data: schemas.QuizCreateAll, db: Session = Depends(get_db)):
    try:
        # Create the quiz
        new_quiz = models.Quiz(title=quiz_data.title, owner_id=quiz_data.owner_id, category_id=quiz_data.category_id)
        db.add(new_quiz)
        db.commit()
        db.refresh(new_quiz)

        # Create questions and answers for the quiz
        for question_data in quiz_data.questions:
            new_question = models.Question(question=question_data.question, quiz_id=new_quiz.quiz_id)
            db.add(new_question)
            db.commit()
            db.refresh(new_question)

            # Create answers for the question
            for answer_data in question_data.answers:
                new_answer = models.Answer(answer=answer_data.answer, status=answer_data.status, question_id=new_question.question_id)
                db.add(new_answer)
        
        db.commit()
        
        return new_quiz

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
@router.delete("/quiz/quiz-delete/{quiz_id}")
async def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.quiz_id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    try:
        # Start a transaction
        # db.begin()

        # Find all questions related to the quiz
        questions = db.query(models.Question).filter(models.Question.quiz_id == quiz_id).all()
        for question in questions:
            # Delete answers related to the question
            db.query(models.Answer).filter(models.Answer.question_id == question.question_id).delete()
            # Delete the question
            db.delete(question)

        db.query(models.QuizResult).filter(models.QuizResult.quiz_id == quiz_id).delete()
        
        # Delete the quiz
        db.delete(quiz)

        # Commit the transaction
        db.commit()
        return {"message": "Quiz, questions, and related answers deleted successfully from database"}
    except SQLAlchemyError as e:
        # Rollback the transaction in case of error
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
@router.post("/quiz/quiz-result/", response_model=schemas.QuizResultCreate)
async def create_quiz_result(quiz_result: schemas.QuizResultCreate, db: Session = Depends(get_db)):
    try:
        # Provera da li već postoji rezultat sa istim user_id i quiz_id
        existing_quiz_result = db.query(models.QuizResult).filter(
            models.QuizResult.user_id == quiz_result.user_id,
            models.QuizResult.quiz_id == quiz_result.quiz_id
        ).first()
        
        if existing_quiz_result:
            raise HTTPException(status_code=400, detail="Result for this quiz already exists for this user.")
        
        # Kreiranje novog zapisa u bazi podataka
        db_quiz_result = models.QuizResult(
            quiz_id=quiz_result.quiz_id,
            title=quiz_result.title,
            user_id=quiz_result.user_id,
            number_of_questions=quiz_result.number_of_questions,
            correct_answers=quiz_result.correct_answers,
            date=quiz_result.date
        )
        db.add(db_quiz_result)
        db.commit()
        db.refresh(db_quiz_result)
        return db_quiz_result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/quiz/passed/{user_id}")
async def get_completed_quizzes(user_id: int, db: Session = Depends(get_db)):
    completed_quizzes = db.query(models.QuizResult).filter(models.QuizResult.user_id == user_id).all()
    return completed_quizzes


# Get all doctors quizzes from database
@router.get("/quiz/doctors-quizzes/{user_id}")
async def get_quizzes(user_id: int, db: Session = Depends(get_db)):
    doctors_quizzes = db.query(models.Quiz).filter(models.Quiz.owner_id == user_id).all()
    return doctors_quizzes
