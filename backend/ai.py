from openai import OpenAI
from dotenv import load_dotenv
import os
# import json

# Loading environment variables from .env file
load_dotenv()

# Reading the API key from the environment variables
api_key = os.getenv("API_KEY")

# Initializing the OpenAI client with our API key
client = OpenAI(api_key=api_key)

"""
response = client.chat.completions.create(
  model="gpt-3.5-turbo",
  messages=[
         {"role": "user", "content": "List top 1 anime of all time"}
    ]
)

response_dict = response.to_dict()
response_json = json.dumps(response_dict, indent=4)

"""

chat_log = []

while True:
    user_message = input()
    if user_message.lower() == "quit":
        break
    else:
        chat_log.append({"role": "user", "content": user_message})
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=chat_log
        )

    assistant_response = response.choices[0].message.content
    print("AI: ", assistant_response)
    chat_log.append({"role": "assistant", "content": assistant_response})

