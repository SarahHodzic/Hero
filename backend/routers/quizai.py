from openai import OpenAI
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json, os
from pydantic import BaseModel


from database import get_db
import models, schemas

router = APIRouter(tags=['quiz'])

load_dotenv()

# Reading the API key from the environment variables
api_key = os.getenv("API_KEY")

# Initializing the OpenAI client with our API key
client = OpenAI(api_key=api_key)

def generate_quiz(title):
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

class QuizRequest(BaseModel):
    title: str

@router.post("/generate-quiz/{user_id}", response_model=schemas.Quiz)
async def generate_quiz_based_on_title(user_id: int, quiz_request: QuizRequest, db: Session = Depends(get_db)):
    try:
        # Generate quiz using AI
        questions = generate_quiz(quiz_request.title)
        
        # Create a Quiz object in the database
        new_quiz = models.Quiz(title=quiz_request.title, owner_id=user_id)
        db.add(new_quiz)
        db.commit()  # Commit the transaction to assign an id to new_quiz
        
        # Refresh new_quiz to get the id assigned by the database
        db.refresh(new_quiz)
        
        question_schemas = []
        
        # Create Question and Answer objects in the database
        for q in questions:
            new_question = models.Question(question=q['question'], quiz_id=new_quiz.quiz_id)
            db.add(new_question)
            db.commit()  # Commit each question after adding
            
            # Refresh new_question to get its id assigned by the database
            db.refresh(new_question)
            
            answer_schemas = []
            
            for answer in q['answers']:
                new_answer = models.Answer(answer=answer['answer'], status=answer['status'], question_id=new_question.question_id)
                db.add(new_answer)
                db.commit()  # Commit each answer after adding
                
                # Refresh new_answer to get its id assigned by the database
                db.refresh(new_answer)
                
                answer_schemas.append(schemas.Answer(
                    answer_id=new_answer.answer_id,
                    question_id=new_answer.question_id,
                    answer=new_answer.answer,
                    status=new_answer.status
                ))

            question_schemas.append(schemas.Question(
                question_id=new_question.question_id,
                quiz_id=new_question.quiz_id,
                question=new_question.question,
                answers=answer_schemas
            ))

        db.commit()  # Final commit after all questions and answers are added
        
        # Construct the response model
        quiz_response = schemas.Quiz(
            quiz_id=new_quiz.quiz_id,
            title=new_quiz.title,
            owner_id=new_quiz.owner_id,
            questions=question_schemas
        )
        
        return quiz_response
    
    except Exception as e:
        print(f"Error: {e}") 
        db.rollback()  # Rollback the transaction on error
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))