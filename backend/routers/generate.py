from openai import OpenAI
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json, os
from pydantic import BaseModel


from database import get_db
import models, schemas

router = APIRouter(tags=['generate'])

load_dotenv()

# Reading the API key from the environment variables
api_key = os.getenv("API_KEY")

# Initializing the OpenAI client with our API key
client = OpenAI(api_key=api_key)

def generate_quiz(title):
    print(title)
    prompt = f"Generate a quiz with multiple-choice questions and answers, 4 for each, for the title: {title}. The format should be JSON with a 'questions' field containing the questions and their possible answers. Mark the correct answer with a 'status' field set to true, and incorrect answers with 'status' set to false."

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
        n=1,
        temperature=0.7,
    )
    # Extract content from the response
    quiz_content = response.choices[0].message.content.strip()
    parsed_content = json.loads(quiz_content)
    print("Response:", parsed_content)  # Log the entire response for debugging

    try:
        if 'questions' in parsed_content:
            return parsed_content['questions']
        else:
            raise ValueError("Expected 'questions' field not found in JSON response")
    
    except json.JSONDecodeError as e:
        raise ValueError(f"Error decoding JSON: {e}")
    
    except Exception as e:
        raise ValueError(f"Error generating quiz: {e}")


@router.post("/generate-chat/", response_model=schemas.Quiz)
async def generate_quiz_based_on_title(quiz_request: schemas.QuizRequest, db: Session = Depends(get_db)):
    try:
        # Generate quiz using AI
        questions = generate_quiz(quiz_request.title)
        
        # Create a Quiz object in the database
        new_quiz = models.Quiz(title=quiz_request.title)
        db.add(new_quiz)
        db.commit()  # Commit the transaction to assign an id to new_quiz
        
        # Refresh new_quiz to get the id assigned by the database
        db.refresh(new_quiz)
        
        # Create Question and Answer objects in the database
        for q in questions:
            print("QUESTIONNN:", q, new_quiz.quiz_id)
            new_question = models.Question(question=q['question'], quiz_id=new_quiz.quiz_id)
            db.add(new_question)
            db.commit()  # Commit each question after adding
            
            # Refresh new_question to get its id assigned by the database
            db.refresh(new_question)

            for answer in q['answers']:
                print("ANSWERR:", answer)
                new_answer = models.Answer(answer=answer['answer'], status=answer['status'], question_id=new_question.question_id)
                db.add(new_answer)
        
        db.commit()  # Final commit after all questions and answers are added
        
        # Construct the response model
        quiz_response = schemas.Quiz(id=new_quiz.quiz_id, title=new_quiz.title, questions=questions)
        
        return quiz_response
    
    except Exception as e:
        print(f"Error: {e}") 
        db.rollback()  # Rollback the transaction on error
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/generate-chat2/")
async def generate_quiz_based_on_title2(quiz_request: schemas.QuizRequest, db: Session = Depends(get_db)):
    try:
        questions = generate_quiz(quiz_request.title)
        
        # Create the quiz
        new_quiz = models.Quiz(title=quiz_request.title, owner_id=quiz_request.owner_id, category_id=quiz_request.category_id)
        db.add(new_quiz)
        db.commit()
        db.refresh(new_quiz)

          # Create questions and answers for the quiz
        for question_data in questions:
            print('Question data')
            print(question_data)
            new_question = models.Question(question=question_data["question"], quiz_id=new_quiz.quiz_id)
            db.add(new_question)
            db.commit()
            db.refresh(new_question)

            # Create answers for the question
            for answer_data in question_data["answers"]:
                new_answer = models.Answer(answer=answer_data["answer"], status=answer_data["status"], question_id=new_question.question_id)
                db.add(new_answer)
        
        db.commit()
        
        return new_quiz

    except Exception as e:
        print(f"Error: {e}") 
        db.rollback()  # Rollback the transaction on error
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    