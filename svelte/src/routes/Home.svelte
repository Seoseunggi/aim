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
  let updated_starter; //스타터 업데이트 완료
  let view_starter_t;
  let view_starter_c;

  let project_starters_list_db = []; //사용자 시작 지시문

  let Icon = 'static/uploading.gif'

  //DOM생성 후, DB리스트 불러오기 동작
  onMount(async() => {

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

    //MSSQL 프로젝트별 파일 리스트 저장
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
    
    let textarea_value = document.getElementById('exampleFormControlTextarea1').value;
    textarea_value = textarea_value.replace(/▪/gi, "-");
    textarea_value = textarea_value.replace(/'/gi, "`");
    textarea_value = textarea_value.replace(/"/gi, "`");
    
    //alert(textarea_value)

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
  ///대화 시작문  추가
  const upload_starter = async () => {
    
    if(!select_value) {
      alert("프로젝트 선택을 먼저 진행 하세요.");
      return;
    }
    
    const s_title = document.getElementById('starter_title');
    const s_content = document.getElementById('starter_content');

    const res = await axios.post("http://192.168.4.76:5001/add_ai_starter", {
      project: select_value, 
      title: s_title.value,
      content: s_content.value,
    }).then(response => {
      console.log(response.data);
      updated_starter = response.data; //업데이트 스타터 추가 완료 확인 문구
      
      db_select_project_starter(); //스타터 불러오기

      //업데이트 완료 2초가 보여주고 사라지게 하기
      const notification = document.getElementById('starter_updated')
      notification.classList.add('show')
      setTimeout(() => {
        notification.classList.remove('show');
        s_title.value = null;
        s_content.value = null; //입력창 초기화        
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

  ///
  ///
  //스타터 삭제 API
  const delete_starter = async (e) => {

if (confirm('콘텐츠를 삭제하시겠습니까?')) {
  // Save it!
  console.log('삭제 진행.');
} else {
  // Do nothing!
  console.log('삭제 취소.');
  return;
}

//python uploadapi 파일 삭제
const res = await axios.post("http://192.168.4.76:5001/delete_ai_starter", {
  user_no : e.target.id
}).then(response => {
  console.log(response.data);
})

db_select_project_starter(); //스타터 불러오기  
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
    db_select_project_starter(); //스타터 불러오기
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
  //DB 선택한 프로젝트 스타터 문구 부르기
  const db_select_project_starter = async () => {
      const res = await axios.post("http://192.168.4.76:5001/view_ai_starter", {
        project: select_value,
      }).then(response => {
        project_starters_list_db = response.data.recordsets[0];
        console.log(project_starters_list_db);
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
    <svg style="display:inline-block; margin-bottom:8px;" xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-card-checklist" viewBox="0 0 16 16">
      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z"/>
      <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0M7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0"/>
    </svg>
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
    <svg style="display:inline-block; margin-bottom:8px;" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-cloud-arrow-up" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708z"/>
      <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
    </svg>
    <h3 style="display:inline-block">PDF 문서, 매뉴얼 업로드 [파일선택 / 드래그앤드랍]</h3>    
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
  </div>

  <div style="margin-top: 40px">
    <svg style="display:inline-block; margin-bottom:8px;" xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-magic" viewBox="0 0 16 16">
      <path d="M9.5 2.672a.5.5 0 1 0 1 0V.843a.5.5 0 0 0-1 0zm4.5.035A.5.5 0 0 0 13.293 2L12 3.293a.5.5 0 1 0 .707.707zM7.293 4A.5.5 0 1 0 8 3.293L6.707 2A.5.5 0 0 0 6 2.707zm-.621 2.5a.5.5 0 1 0 0-1H4.843a.5.5 0 1 0 0 1zm8.485 0a.5.5 0 1 0 0-1h-1.829a.5.5 0 0 0 0 1zM13.293 10A.5.5 0 1 0 14 9.293L12.707 8a.5.5 0 1 0-.707.707zM9.5 11.157a.5.5 0 0 0 1 0V9.328a.5.5 0 0 0-1 0zm1.854-5.097a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L8.646 5.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0l1.293-1.293Zm-3 3a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L.646 13.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0z"/>
    </svg>
    <h2 style="display:inline-block">Instructions</h2>
    <div class="mb-3">
      <label for="exampleFormControlTextarea1" class="form-label">지시문을 입력하세요.</label>
      <textarea class="form-control" id="exampleFormControlTextarea1" rows="5" bind:value={view_instruction}></textarea>
    </div>
    <div style="text-align:right;">
      <span id="alert_updated">업데이트 완료 !! &nbsp;&nbsp;</span>
      <button on:click={upload_inst} class="btn btn-outline-dark">업데이트</button>
    </div>
  </div>

  <div style="margin-top: 4px">

    <svg style="display:inline-block; margin-bottom:8px;" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-chat-heart" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M2.965 12.695a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6-3.004 6-7 6a8 8 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a11 11 0 0 0 .398-2m-.8 3.108.02-.004c1.83-.363 2.948-.842 3.468-1.105A9 9 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.4 10.4 0 0 1-.524 2.318l-.003.011a11 11 0 0 1-.244.637c-.079.186.074.394.273.362a22 22 0 0 0 .693-.125M8 5.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132"/>
    </svg>
    <h2 style="display:inline-block">Conversation starters</h2>

    
    <label style="display: block;" for="exampleFormControlTextarea1" class="form-label">시작 문구 리스트</label>
    <ul class="list-group">
      <!-- 사용자 시작 스타터 리스트 -->
      {#each project_starters_list_db as list (list.no)}
      <li class="list-group-item">
        <span style="vertical-align: middle;">{list.title} - {list.instruction}</span>&nbsp;&nbsp;
        <button class="btn btn-outline-secondary" style="text-align:right" type="button"  id={list.no} on:click={delete_starter}>X</button>
      </li>
      {:else}
        <li class="list-group-item">텅...</li>
      {/each}
    </ul>

    <p></p>
    <label for="exampleFormControlTextarea1" class="form-label">시작 문구 추가</label>
    <div style="background-color: #f2f2f2; padding: 2px;">
      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="starter_title" placeholder="name@example.com">
        <label for="floatingInput">사용자에게 보여 줄 제목을 적으세요.</label>
      </div>
      <div class="form-floating">
        <input type="text" class="form-control" id="starter_content" placeholder="Password">
        <label for="floatingPassword">대화문을 여기에 적으세요.</label>
      </div>
    </div>
    <p></p>    
    <div style="text-align:right;">
      <span id="starter_updated">추가 완료 !! &nbsp;&nbsp;</span>
      <button on:click={upload_starter} class="btn btn-outline-dark">추가하기</button>
    </div>

    

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
  #starter_updated {
    background: rgba(255, 165, 30, 0.3);
    border-radius: 10px;
    padding: 5px 10px;
    display: none;
  }
  :global(#starter_updated.show) {    
    display: inline-block;
  }
</style>