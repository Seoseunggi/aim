import os
import openai
from dotenv import load_dotenv
import requests #post 사용
from flask import Flask, request, Response, redirect, jsonify
from flask_cors import CORS, cross_origin
import requests
import json

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
def question2():  
  params = request.get_json()
  p_name = params['project_name']
  qes = params['promt']
  thread_id = params['id']
  thread_history = params['history']
  s_topp = float(params['topp'])
  s_temperature = float(params['temperature'])
  p_instruction = params['user_instruction'] #DB 프로젝트 인스트럭션
  url = params['user_url'] #사용자 url,   gpt or gptonly
  
  #############################################
  #####chroma DB 로부터 검색 자료 가져오기
  #############################################    
  dict_string = ""
  
  if url == "rag" :
    params = {
    "project": p_name, #프로젝트 네임
    "question": qes, #질문
    }
    res = requests.post("http://192.168.4.76:3000/chromaq", (params))
    
    dict_list = json.loads(res.text) # text => json
        
    for data in dict_list["documents"][0]:
      dict_string += str(data) + " / "
  
  #dict_string = str(dict_list["documents"][0][0])
  
  #print(dict_string["documents"][0][0])
  #return ""
  
  #print("###### ChromaDB 조회중 !! ########\r\n" + res.text)
  #############################################
  
  system = [{"role": "system",
            "content": p_instruction}]
  
  if url == "rag" :
    # ChromaDB RAG 사용
    user = [{"role": "assistant", "content": dict_string}, {"role": "user", "content": qes}]
    #chat = []
    #print("top_p:" + params['topp'] + ",  temperature:" + params['temperature'])
    #print(system + thread_history[-10:] + user)
    
  elif url == "gptonly" :
    # GPT만 사용
    user = [{"role": "user", "content": qes}] 
  
  print("url:" + url + " / " + "지시문: " + p_instruction)
  print(system + thread_history[-10:] + user)
  #print(dict_string)
    
  response = openai.chat.completions.create(
        messages = system + thread_history[-10:] + user, #일반 GPT만 사용        
        model="gpt-3.5-turbo-1106", 
        #model="gpt-4-1106-preview",
        top_p= s_topp, 
        temperature = s_temperature, 
        max_tokens=800, 
        frequency_penalty=0.0, 
        presence_penalty=0.0, 
        stream=True)
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