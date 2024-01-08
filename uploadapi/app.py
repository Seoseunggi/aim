import os
import requests #post 사용
from flask import Flask, request, Response, redirect, jsonify
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import threading
import fitz #PDF 추출
from time import sleep
import textwrap
import re
import multiprocessing
import shutil #폴더와파일내부 통째로 삭제  shutil.rmtree("폴더명")

UPLOAD_FOLDER = 'C:/chatbot/python/uploadapi/uploads'

app = Flask(__name__)
app.secret_key = "secret key"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 160 * 1024 * 1024

ALLOWED_EXTENSIONS = set(['pdf', 'pdf'])

def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
  return 'This is Home!'

#멀티프로세싱 처리
def heavy_work(arg):
  params = {
  "param1": arg[0],
  "param2": arg[1], 
  "param3": arg[2], #원하는 수치만큼 모은 데이터
  "param4": arg[3], #해당 처리 숫자
  }
  res = requests.post("http://192.168.4.76:3000/chromai", (params))  
  print("###### 조각 업로드 중 !! ######## [" + str(arg[3]) + "]")
  
  
  
# 프로젝트 폴더 통째로 삭제
@app.route('/delete_folder', methods=['GET', 'POST'])
@cross_origin(supports_credentials=True) #CORS 동작 되는 코드
def delete():
  
  p = request.form.get('project_name')
  new_dir = "C:/chatbot/python/uploadapi/uploads/" + p
  
  if os.path.isdir(new_dir):
    shutil.rmtree(new_dir)
    print('deleted folder')
  else:
    raise ValueError("해당 경로를 확인해주세요")
  
  return jsonify({'message': '업로드 폴더 삭제 완료'})   



# 파일 업로드
@app.route('/fileupload', methods=['GET', 'POST'])
@cross_origin(supports_credentials=True) #CORS 동작 되는 코드
def hello():  

    response = jsonify({'message': "upload 디렉토리 -> 파일 업로드 성공!"})
    PDF_FILE_PATH = ''    
    #f = request.files['file']
    f = request.files.getlist("file")
    #print(f)
    
    for fi in f:
      filename = secure_filename(fi.filename)      
      print(filename)      
      chunk = 0
            
      # return  
      if allowed_file(filename):
        
        p = request.form.get('project') #프로젝트명
        #print(p)
        
        new_dir = "C:/chatbot/python/uploadapi/uploads/" + p
        if(os.path.isdir(new_dir) == False) :
          os.makedirs(new_dir)
                  
        PDF_FILE_PATH  = os.path.join(new_dir, filename)   
        fi.save(PDF_FILE_PATH) #pdf 파일 저장

        #PDF추출
        text = ''
        doc = fitz.open(PDF_FILE_PATH)          
        for page in doc:
          text += page.get_text()    
        with open(PDF_FILE_PATH + ".txt", "w", encoding='UTF-8') as fo:
          fo.write(text)
        
        ############################################
        #Flask => bot1 chromadb node (5001)로 전송
        ############################################  
        
                
        #문자열 1줄씩 읽기
        #content = open(PDF_FILE_PATH + ".txt", "r", encoding='UTF-8')
        content = re.sub(r"\n", " ", text)
        bv = textwrap.wrap(content, 1500)
        
        #멀티프로세싱 동작 테스트
        procs = []        
        print(len(bv))
        cnt = 1
                
        for pr in bv:                    
          params = [p, filename, pr, cnt]
          #heavy_work 멀티프로세싱 함수동작
          pc = multiprocessing.Process(target=heavy_work, args=(params,)) 
          pc.start()
          procs.append(pc)          
          cnt += 1
          
        for pp in procs:
          pp.join() #프로세스가 모두 종료 될 때까지 대기
          
        print("파일 처리 완료")        
        
        #return jsonify({'message': PDF_FILE_PATH})
      else:
        #return jsonify({'message': '잘못된 파일'})
        print('잘못된 파일')
      
    return jsonify({'message': '전송 완료'})    
    

if __name__ == '__main__':  
  app.run('0.0.0.0',port=5000,debug=True)