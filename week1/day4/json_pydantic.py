import os 
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
my_api_key=os.getenv("GROQ_API_KEY")

if not my_api_key:
    raise ValueError("API key not found")

client = Groq(api_key=my_api_key)
model="llama-3.3-70b-versatile"
role="user"


#Structured output using pydantic
from pydantic import BaseModel
class Ticket(BaseModel):
    name: str
    issue: str
    email: str
    contact_number: str
schema=Ticket.model_json_schema()
response_format={
    "type":"json_object"
}
system_prompt=f"""Extract the personal info from the ticket strictly based on this schema and give a json output.: 
{schema}"""

message_system={
    "role": "system",
    "content": system_prompt
}


text="Hello My name is Pratyush. I have an iphone which is not working at all . My address is Delhi.My email is abcgmail.com.My contact number is 83215."
prompt=f"""This is Customer ticket. Please extract the personal information from this: {text}"""
message={
    "role": role,
    "content": prompt
}
messages=[message_system, message]
response = client.chat.completions.create(model=model, messages=messages, response_format=response_format)
#print(response)
#print("************************")

answers = response.choices[0].message.content
print(answers)

import json
raw_json=answers
data_file=json.loads(raw_json)
ticket = Ticket(**data_file)
print(ticket.name)
print(ticket.email)
print(ticket.issue)

