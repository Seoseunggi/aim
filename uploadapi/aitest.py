import os
import openai
from dotenv import load_dotenv
import requests #post 사용
from flask import Flask, request, Response, redirect, jsonify
from flask_cors import CORS, cross_origin
import requests

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY2")

app = Flask(__name__)
app.secret_key = "secret key"
app.config['MAX_CONTENT_LENGTH'] = 160 * 1024 * 1024


@app.route('/')
def home():
  return 'This is Home!'

# 프로젝트 폴더 통째로 삭제
@app.route('/ask', methods=['GET', 'POST'])
@cross_origin(supports_credentials=True) #CORS 동작 되는 코드
def question():  
  params = request.get_json()
  qes = params['promt']
  thread_id = params['id']
  thread_history = params['history']
  s_topp = float(params['topp'])
  s_temperature = float(params['temperature'])
  p_instruction = params['user_instruction'] #DB 프로젝트 인스트럭션

  system = [{"role": "system",
            "content": p_instruction}]
  user = [{"role": "user", "content": qes}]
  #chat = []
  print("top_p:" + params['topp'] + ",  temperature:" + params['temperature'])
  print(system + thread_history[-10:] + user)
  
  response = openai.chat.completions.create(
        messages = system + thread_history[-10:] + user,
        model="gpt-3.5-turbo", top_p= s_topp, temperature = s_temperature, max_tokens=800, frequency_penalty=0.0, presence_penalty=0.0, stream=True)
  reply = ""
  for delta in response:
      if not delta.choices[0].finish_reason:
          word = delta.choices[0].delta.content or ""
          reply += word
          #print(word, end ="")
  #chat += user + [{"role": "assistant", "content": reply}]
  
  return jsonify({'message': reply})   
  #print(word)
  
  #return word


  # system = [{"role": "system",
  #           "content": """You are a chatbot, giving expert answers."""}]
  # user = [{"role": "user", "content": "brief introduction?"}]
  # chat = []
  # while not user[0]['content'] == "exit":
  #     response = openai.chat.completions.create(
  #         messages = system + chat[-10:] + user,
  #         model="gpt-3.5-turbo", top_p=0.9, temperature=0, max_tokens=100, frequency_penalty=0.0, presence_penalty=0.0, stream=True)
  #     reply = ""
  #     for delta in response:
  #         if not delta.choices[0].finish_reason:
  #             word = delta.choices[0].delta.content or ""
  #             reply += word
  #             print(word, end ="")
  #     chat += user + [{"role": "assistant", "content": reply}]
  #     user = [{"role": "user", "content": input("\nPrompt: ")}]

    
    
if __name__ == '__main__':  
  app.run('0.0.0.0',port=5888,debug=True)