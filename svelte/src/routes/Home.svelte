<script>  
  import {content} from "../storable"
  import axios from 'axios'
  import { onMount } from "svelte";
  
  let files; //첨부파일 리스트
  let pdf_text; //파일 업로드 response
  let add_db; //프로젝트 추가 키 입력값
  let value_project; //프로젝트 추가 input 초기화
  let select_value; //select option 선택값
  let project_list_db = []; //프로젝트 select DB리스트
  let project_file_list_db = []; //프로젝트 select 파일 DB리스트
  let uploading; //업로드중
  let deleting; //삭제중
  let delete_list; //프로젝트 삭제 보여주기
  let updated_instruction; //인스트럭션 업데이트 완료
  let view_instruction; //인스트럭션 초기 프로젝트 선택시 불러오기

  let project_starters_list_db = []; //사용자 시작 지시문

  let Icon = 'static/uploading.gif'

  //DOM생성 후, DB리스트 불러오기 동작
  onMount(async() => {
    // const res = await axios.post("http://192.168.4.76:5001/view_ai_project").then(response => {
    // project_list_db = response.data.recordsets[0];
    // console.log(project_list_db);    
    //})
    db_select_project();
  })

  ///
  ///
  //파일 업로드 API
  const upload = async () => {
    if(select_value === 'Select project' || !select_value) {
      alert('프로젝트를 먼저 선택 해 주세요.')
      return;
    }    
    if(!files) {
      alert('전송 할 파일을 선택 해 주세요.')
      return;
    }

    const formData = new FormData();
    for(const fi of files) {
      formData.append("file", fi); 
    }
    formData.append("project", select_value); //프로젝트 정보도 함께 보냄
    console.log("client message: 보낼준비");
    uploading = '업로드중'
    
    //python uploadapi 파일 저장
    const res = await axios.post("http://192.168.4.76:5000/fileupload", formData).then(response => {
      console.log(response.data);
      pdf_text = response.data;
      uploading = '' //업로드중 끝
    })

    //MSSQL 리스트 저장
    for(const fi of files) {
      const res2 = await axios.post("http://192.168.4.76:5001/add_ai_project_files", {
      project: select_value,
      filename: fi.name
      }).then(response => {
        console.log(response.data);
        pdf_text = response.data;        
      })      
    }

    //파일 타입의 input 초기화방법..
    files = '';
    const sp = document.getElementById('file'); 
    sp.type = 'radio';
    sp.type = 'file';

    db_select_project_files(); //파일 리스트 갱신    
  }  
  ///upload 끝
  /////////////

  ///
  ///
  ///인스트럭션 추가
  const upload_inst = async () => {
    
    if(!select_value) {
      alert("프로젝트 선택을 먼저 진행 하세요.");
      return;
    }
    
    const textarea_value = document.getElementById('exampleFormControlTextarea1').value;

    const res = await axios.post("http://192.168.4.76:5001/add_ai_instruction", {
      project: select_value, 
      inst: textarea_value,
    }).then(response => {
      console.log(response.data);
      updated_instruction = response.data;

      //업데이트 완료 2초가 보여주고 사라지게 하기
      const notification = document.getElementById('alert_updated')
      notification.classList.add('show')
      setTimeout(() => {
        notification.classList.remove('show')
      }, 2000)
    })
   }

  ///
  ///
  //파일 삭제 API
  const delete_file = async (e) => {

    if (confirm('현재 파일을 삭제하시겠습니까?')) {
      // Save it!
      console.log('파일 삭제 진행.');
    } else {
      // Do nothing!
      console.log('파일 삭제 취소.');
      return;
    }

  const formData = new FormData();
  formData.append("project", select_value); //프로젝트 정보도 함께 보냄
  formData.append("file", e.target.id); //현재 파일 이름   
  console.log("client message: 보낼준비");
  deleting = '삭제중'

  //python uploadapi 파일 삭제
  const res = await axios.post("http://192.168.4.76:5000/filedelete", formData).then(response => {
    console.log(response.data);
    //pdf_text = response.data;
    deleting = '' //삭제중 끝
  })

  //MSSQL 리스트 삭제  
  const res2 = await axios.post("http://192.168.4.76:5001/delete_ai_project_files", {
    project: select_value,
    filename: e.target.id
    }).then(response => {
      console.log(response.data);
      //pdf_text = response.data;        
    })

  db_select_project_files(); //파일 리스트 갱신    
  }  
  ///파일 삭제 끝
  /////////////



  
  //키입력값 저장
  function fn_add_db(e) {
    add_db = e.target.value;
  }

  //프로젝트 선택할 경우
  function fn_selected_value(e) {
    const sp = document.getElementById('sp');    
    select_value = sp.options[sp.selectedIndex].innerText;
    console.log(select_value)

    db_select_project_files(); //파일리스트 불러오기
    db_select_project_instruction(); //지시문 불러오기
  }
  
  //DB 프로젝트 저장
  const db_insert_project = async () => {
      const res = await axios.post("http://192.168.4.76:5001/add_ai_project", {
        project: add_db,
      }).then(response => {
        console.log(response.data);   
        
        value_project = ''; //프로젝트 추가 input 초기화
        db_select_project(); //프로젝트 리스트 다시 불러오기
      })
  }  
  
  //DB 프로젝트 삭제하기
  const db_delete_project = async (name) => {
      const res = await axios.post("http://192.168.4.76:5001/delete_ai_project", {
        project_name: name,
      }).then(response => {
        console.log(response.data);           
        db_select_project(); //프로젝트 리스트 다시 불러오기
      })
      //chromaDB도 프로젝트 컬렉션 통째로 삭제하기
      const res2 = await axios.get(`http://192.168.4.76:3000/chromadc/${name}`).then(response => {
        console.log(response.data);                   
      })

      //업로드 프로젝트 폴더 통째로 삭제하기      
      const formData = new FormData();
      formData.append("project_name", name); //프로젝트 정보도 함께 보냄
      const res3 = await axios.post("http://192.168.4.76:5000/delete_folder", formData).then(response => {
        console.log(response.data);
      })
  }  

  //DB 프로젝트 리스트 부르기
  const db_select_project = async () => {
      const res = await axios.post("http://192.168.4.76:5001/view_ai_project").then(response => {
        project_list_db = response.data.recordsets[0];
        console.log(project_list_db);
      })
  }  
  
  //DB 선택한 프로젝트 파일 리스트 부르기
  const db_select_project_files = async () => {
      const res = await axios.post("http://192.168.4.76:5001/view_ai_project_files", {
        project: select_value,
      }).then(response => {
        project_file_list_db = response.data.recordsets[0];
        console.log(project_file_list_db);
      })
  }  
  //DB 선택한 프로젝트 인스트럭션 부르기
  const db_select_project_instruction = async () => {
      const res = await axios.post("http://192.168.4.76:5001/view_ai_instruction", {
        project: select_value,
      }).then(response => {
        view_instruction = response.data.recordsets[0][0].instruction;
        console.log(view_instruction);
      })
  }  
  
  //프로젝트 삭제하기 버튼 누르기 동작
  function delete_project_view(e) {
    if(e.target.innerText === "닫기") {
      delete_list = ""
      e.target.innerText = "삭제하기";
    }
    else {      
      delete_list = "view"
      e.target.innerText = "닫기";

      //프로젝트 리스트
    }
  }
  //프로젝트 리스트에서 삭제하기 동작
  function delete_project(e) {
    let name = e.target.id;

    console.log(name);

    if (confirm('현재 프로젝트를 삭제하시겠습니까?')) {
      // Save it!
      console.log('Thing was saved to the database.');
      db_delete_project(name); //삭제하기 api 동작

    } else {
      // Do nothing!
      console.log('Thing was not saved to the database.');
    }

    
  }

</script>


<div class="container-fluid" style="padding: 20px 20px 20px 20px"> 

  <!-- <h1>홈</h1>
  <p>{$content}</p> -->

  <div>
    <h3 style="display:inline-block">프로젝트 선택</h3>
    <div style="display:inline-block; float:right"> 
      <button class="btn btn-outline-secondary" type="button" id="button-addon2" on:click={delete_project_view}>삭제하기</button>
    </div>
    <p></p>        
    <ul class="list-group">  
      {#if !delete_list}
        <span></span>
      {:else}

      {#each project_list_db as list (list.no)}
        <li class="list-group-item">{list.project} 
          <button id={list.project} type="button" class="btn btn-outline-danger" style="float: right;" on:click={delete_project}>삭제하기</button>
        </li>
      {:else}
        <li class="list-group-item">항목이 없습니다.</li>
      {/each}        
        <p></p>  
      {/if}    
    </ul>
    <select id="sp" class="form-select form-select-lg mb-3" aria-label="Large select example" on:change={fn_selected_value}>
      <option selected>Select project</option>
      
      {#each project_list_db as list (list.no)}
        <option value={list.no}>{list.project}</option>
      {:else}
        <option value="0">리스트 내용이 없습니다.</option>
      {/each}
      
    </select>
    <div class="input-group mb-3">
      <input type="text" class="form-control" placeholder="프로젝트 추가" aria-label="프로젝트 추가" aria-describedby="button-addon2" bind:value={value_project} on:keyup={fn_add_db}>     
      
      {#if add_db}
        <button class="btn btn-outline-secondary" type="button" id="button-addon2" on:click={db_insert_project}>추가</button>
      {:else}
        <button class="btn btn-outline-secondary" type="button" id="button-addon2" disabled>추가</button>
      {/if}
    </div>
  </div>
  
  
  <div style="margin-top: 40px">
    <h3>PDF 문서, 매뉴얼 업로드 [파일선택 / 드래그앤드랍]</h3>    
    <p></p>

    <input name="file" id="file" type="file" multiple bind:files>

    {#if files}
        <button on:click={upload} class="btn btn-outline-dark">서버전송</button>
        <!-- {files[0].name} -->
    {:else}
        <button on:click={upload} disabled class="btn btn-outline-dark">서버전송</button>
    {/if}
    <p></p>
    <p>
      {#if uploading}
        <p style="color: red;">업로드 중입니다. 잠시만 기다려주세요. <img src={Icon} alt="loading.." /></p>
      {:else}
        <span></span>
      {/if}
    </p>
    <ul class="list-group">
      
      {#each project_file_list_db as list (list.no)}
        <li class="list-group-item">
          <span style="vertical-align: middle;">{list.filename}</span>&nbsp;&nbsp;
          <button class="btn btn-outline-secondary" style="text-align:right" type="button"  id={list.filename} on:click={delete_file}>X</button>
        </li>
      {:else}
        <li class="list-group-item">업로드 파일이 없습니다.</li>
      {/each}
    </ul>    
    <!-- <div class="w-25 p-3" style="background-color: #ccc; margin:5px 0px 5px 0px; font-size:12px;">Width 25%</div>
    <div class="w-50 p-3" style="background-color: #ccc; margin:5px 0px 5px 0px; font-size:12px;">Width 50%</div>
    <div class="w-75 p-3" style="background-color: #ccc; margin:5px 0px 5px 0px; font-size:12px;">Width 75%</div>
    <div class="w-100 p-3" style="background-color: #ccc; margin:5px 0px 5px 0px; font-size:12px;">Width 100%</div> -->

  </div>

  <div style="margin-top: 40px">
    <h2>Instructions (개발 진행중)</h2>
    <div class="mb-3">
      <label for="exampleFormControlTextarea1" class="form-label">지시문을 입력하세요.</label>
      <textarea class="form-control" id="exampleFormControlTextarea1" rows="5" bind:value={view_instruction}></textarea>
    </div>
    <div style="text-align:right;">
      <span id="alert_updated">업데이트 완료 !! &nbsp;&nbsp;</span>
      <button on:click={upload_inst} class="btn btn-outline-dark">업데이트</button>
    </div>

  </div>

  <div style="margin-top: 40px">

    <h2>Conversation starters (개발 진행중)</h2>

    <!-- 사용자 시작 스타터 리스트 -->
    {#each project_starters_list_db as list (list.no)}
      <div>
        <div class="form-floating mb-3">
          <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
          <label for="floatingInput">사용자에게 보여 줄 제목을 적으세요.</label>
        </div>
        <div class="form-floating">
          <input type="password" class="form-control" id="floatingPassword" placeholder="Password">
          <label for="floatingPassword">지시문을 여기에 적으세요.</label>
        </div>
      </div>
    {:else}
      <div style="background-color: #f2f2f2; padding: 2px;">
        <div class="form-floating mb-3">
          <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
          <label for="floatingInput">사용자에게 보여 줄 제목을 적으세요.</label>
        </div>
        <div class="form-floating">
          <input type="password" class="form-control" id="floatingPassword" placeholder="Password">
          <label for="floatingPassword">지시문을 여기에 적으세요.</label>
        </div>
      </div>
    {/each}

    

  </div>
  

</div>

<style>
  #alert_updated {
    background: rgba(255, 165, 30, 0.3);
    border-radius: 10px;
    padding: 5px 10px;
    display: none;
  }
  :global(#alert_updated.show) {    
    display: inline-block;
  }
</style>