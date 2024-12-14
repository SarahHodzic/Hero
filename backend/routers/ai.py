from openai import OpenAI
from dotenv import load_dotenv
import os, requests, base64
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from pydantic import BaseModel

# NADAM  se da je ovo dovoljno komentara Esmaaa 
router = APIRouter(tags =['ai'])

# Loading environment variables from .env file
load_dotenv()

# Reading the API key from the environment variables
api_key = os.getenv("API_KEY")

# Initializing the OpenAI client with our API key
client = OpenAI(api_key=api_key)

class SearchQuery(BaseModel):
    query: str



@router.post("/analyze-image/")
async def analyze_image(file: UploadFile = File(...), query: str = Form(...)):
    contents = await file.read()
    base64_image = base64.b64encode(contents).decode('utf-8')

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": query
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 200
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        raise HTTPException(status_code=response.status_code, detail="Image analysis failed")



chat_log = [] 

# Sending a request to the OpenAI API 
def get_openai_response(query: str) -> str:

    global chat_log
    chat_log.append({"role": "user", "content": query})
    
    response = client.chat.completions.create(
        model="gpt-4o", # Can specify the ID of the model we use
        messages=chat_log, # List of messages, keeping track of the convo so far
        temperature=0, # Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
        max_tokens=200, # The maximum number of tokens that can be generated (we are being cheap hehehehe).
    )

    assistant_response = response.choices[0].message.content
    chat_log.append({"role": "assistant", "content": assistant_response})
    return assistant_response


# Route for the above request
@router.post("/first-aid/search")
async def search_first_aid(query: SearchQuery):
    openai_response = get_openai_response(query.query)
    return {"query": query.query, "response": openai_response}
