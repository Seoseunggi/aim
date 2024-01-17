<script>  
  import { onMount } from "svelte";
  import axios from 'axios'
  const jq = window.$;
  //import LoadingIcon from "$lib/assets/loading1.png"
  
  let question_val; //input 질문
  let question_bind;
  let project_instruction; //DB로부터 받아온, 해당 프로젝트의 인스트럭션
  let project_name; //프로젝트 이름
  let url;
  let random_image = Math.floor(Math.random() * 6); //이미지 랜덤 숫자 변수  0~3

  let project_starters_list_db = []; //스타터 리스트


  window.addEventListener('DOMContentLoaded', () => {
      
  }); //DOM Ready



  //DOM생성 후, DB리스트 불러오기 동작
  onMount(async() => {

    var introEle = jq("#intro");
    jq("body").click(function() {
      introEle.fadeOut();
    });

    //alert(window.location.href)
    url = window.location.href.split('/');
    url = url[url.length - 1];
    console.log(url)

    project_name = jq("#project").val(); //프로젝트 이름
    
    //DB 선택한 프로젝트 인스트럭션 부르기
    const db_select_project_instruction = async () => {
        const res = await axios.post("http://192.168.4.76:5001/view_ai_instruction", {
          project: project_name,
        }).then(response => {
          project_instruction = response.data.recordsets[0][0].instruction;
          project_instruction = project_instruction.replace(/\"/gi, "`");
          console.log(project_instruction);
        })
    }
    db_select_project_instruction(); //인스트럭션 부르기 실행

    //DB 선택한 프로젝트 스타터 문구 부르기
    const db_select_project_starter = async () => {
        const res = await axios.post("http://192.168.4.76:5001/view_ai_starter", {
          project: project_name,
        }).then(response => {
          project_starters_list_db = response.data.recordsets[0];
          console.log(project_starters_list_db);
        })
    }  
    db_select_project_starter(); //스타터 부르기 실행

    //채팅초기화버튼 클릭 => 로컬스토리지키삭제, 쓰레드 신규 생성하도록 함. 새로운 인사메시지 출력
    const reset = document.getElementById("btn-check-outlined-reset");
    reset.addEventListener("click", Reset_chat);

    function Reset_chat(e) {
      localStorage.removeItem("openai_thread");
      localStorage.removeItem("reply_history");
      addToDiscussion2(
        "올리비아",
        "안녕하세요.\n갤럭시 웨어러블 가이드를 맡게 된 올리비아 입니다. 새로운 대화를 시작 해 볼까요?"
      );
      console.log(localStorage.length);
    }

    jq("#msg").on("keyup", function(key) {

      question_val = key.target.value;
      //alert(question_val)

      if(key.keyCode == 13) {
        //alert(jq("#msg").val)
        if(question_val != "") {
          addToDiscussion("질문자", question_val);
          send(question_val, project);

          jq("#msg").val("");
          jq("#msg").focus();
        }
      }
    })


    jq("#model button").on("click", function (e) {
      const msg = jq(this).html() + " 모델에 대해 질문 있어요.";      
      addToDiscussion("질문자", msg);
      send(msg, project_name);
    });

    jq("#sendBtn").on("click", function (event) {
      var msg = jq("#msg").val();

      if (msg != "") {
        addToDiscussion("질문자", msg);
        send(msg, project_name);

        jq("#msg").val("");
        jq("#msg").focus();
      }
    });

          
    function scrollTop(num) {
      jq(function () {
        jq("#box").scrollTop(jq("#box")[0].scrollHeight);
      });
    }
    
    function addGif() {
      var contents =
        "<li id='thinkAni' class = 'chat_bot'>" +
        "<div class='message chat_ib'>" +
        `<img src="images/loading1.gif">` +
        "</div></li>";
      jq(".discussion").append(contents);
      
      setTimeout(() => scrollTop(600), 500);
    }


    function addToDiscussion2(writer, msg) {
      var today = new Date();
      var year = today.getFullYear();
      var month = ("0" + (today.getMonth() + 1)).slice(-2);
      var day = ("0" + today.getDate()).slice(-2);
      var hours = ("0" + today.getHours()).slice(-2);
      var minutes = ("0" + today.getMinutes()).slice(-2);
      var seconds = ("0" + today.getSeconds()).slice(-2);
      var timeString = year + month + day + hours + minutes + seconds;
      var timeString2 =
        year +
        "년 " +
        month +
        "월 " +
        day +
        "일 " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds;

      var contents =
        "<li class='" +
        writer +
        " chat_bot'>" +
        "<div class='message chat_ib'>" +
        //+ "<p>" + writer + ": <span id='id_" + timeString + "'></span></p>"
        "<p><img src='images/iu.png' width='30' height='30'>: <span id='id_" +
        timeString +
        "'></span></p>" +
        "</div>" +
        "<div class='chat_time'><p><span id='id_time_" +
        timeString +
        "'></span></p></div>" +
        "</li>";
      jq(".discussion").append(contents);

      //const $text = document.querySelector("#id_" + timeString + "");
      const speed = 30;
      let index = 0;
      var typingBool = false;

      const text = document.querySelector("#id_" + timeString);

      if (typingBool == false) {
        // 타이핑이 진행되지 않았다면
        typingBool = true;
        var tyInt = setInterval(typing, speed); // 반복동작
      }

      // 타이핑 효과
      function typing() {
        //console.log(typeof (msg[index]));
        if (msg[index] == "\n") {
          //alert("엔터발견");
          if (msg[index - 1] != null) {
            if (msg[index - 1] != "\n") text.innerHTML += "<br>";
            scrollTop(100);
          }
          index++;
        } else if (msg[index] == null) {
          index++;
        } else {
          text.innerHTML += msg[index++];
          scrollTop(100);
        }

        if (index > msg.length) {
          //끝나면 반복종료
          clearInterval(tyInt);
          index = 0;

          //사진 주소인 경우
          if (msg.indexOf("http") != -1 && msg.indexOf(".png") != -1) {
            var userPatterns = {
              email:
                /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g,
              url: /(http(s)?:\/\/|www.)([a-z0-9\w]+\.*)+[a-z0-9]{2,4}([\/a-z0-9-%#?&=\w])+(\.[a-z0-9]{2,4}(\?[\/a-z0-9-%#?&=\w]+)*)*/gi,
            };

            var userReplaceFunctions = {
              url: function (_url) {
                return '<br><img style="max-width:99%" src="' + _url + '"><br>';
              },
            };
            text.innerHTML = text.innerHTML.replace(
              userPatterns["url"],
              userReplaceFunctions["url"]
            );
          }

          //웹 주소인 경우, png, youtube 없으면
          if (
            msg.indexOf("http") != -1 &&
            msg.indexOf(".png") == -1 &&
            msg.indexOf("youtube.com") == -1
          ) {
            var userPatterns = {
              email:
                /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g,
              url: /(http(s)?:\/\/|www.)([a-z0-9\w]+\.*)+[a-z0-9]{2,4}([\/a-z0-9-%#?&=\w])+(\.[a-z0-9]{2,4}(\?[\/a-z0-9-%#?&=\w]+)*)*/gi,
            };

            var userReplaceFunctions = {
              email: function (_email) {
                return '<a href="mailto:' + _email + '">' + _email + "</a>";
              },
              url: function (_url) {
                return '<a href="' + _url + '" target = "_blank">' + _url + "</a>";
              },
            };
            //text.innerHTML = msg.replace("\n", "<br>");
            text.innerHTML = text.innerHTML.replace(
              userPatterns["url"],
              userReplaceFunctions["url"]
            );
          }

          //동영상 유튜브 웹주소인 경우,  https, youtube 있으면
          if (msg.indexOf("https") != -1 && msg.indexOf("youtube.com") != -1) {
            var userPatterns = {
              url: /\.\.https\:\/\/www.youtube.com.+\.\./gi,
            };

            var userReplaceFunctions = {
              url: function (_url) {
                return (
                  '<br><iframe width="95%" height="50%" src="' +
                  _url.replace(/\.\./g, "") +
                  '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><br>'
                );
              },
            };
            //text.innerHTML = msg.replace("\n", "<br>");
            text.innerHTML = text.innerHTML.replace(
              userPatterns["url"],
              userReplaceFunctions["url"]
            );
          }
        }
      }
    }

    async function send(msg, project) {
      try {
        //alert(project);
        //return;
        //localstorage, 로컬스토리지 키, 밸류 생성
        let user_thread_id = "";
        let user_history = [];
        let set_topp = jq("#set_topp").val();
        let set_temperature = jq("#set_temperature").val();

        if (!localStorage.getItem("openai_thread")) {
          let rand = Math.random().toString(16);          
          localStorage.setItem("openai_thread", rand);
          user_thread_id = rand;
          console.log("new:" + rand);

          //답변 저장
          let reply = [{"role": "assistant", "content":"첫번째메시지"}];
          localStorage.setItem("reply_history", JSON.stringify(reply));

        } else {
          user_thread_id = localStorage.getItem("openai_thread");
          console.log("exist:" + user_thread_id);

          user_history = JSON.parse(localStorage.getItem("reply_history"));
          //user_history = localStorage.getItem("reply_history");
        }

        addGif(); //생각중 아이콘 로딩
        
        //json 형태로 보냄
        const params = {"project_name": project_name, "promt":msg, "id":user_thread_id, "history":user_history, "topp":set_topp, "temperature": set_temperature, "user_instruction": project_instruction, "user_url": url}

        const response = await axios.post("http://192.168.4.76:5888/ask", params).then(response => {          
          const prediction = response;

          //텍스트, 음성까지 모둘 불러온 후, 동작
          jq("#thinkAni").remove();
          //setTimeout(() => jq("#thinkAni").remove(), 100);
          //jq("#thinkAni").addClass('remove');
          
          //텍스트표현
          console.log(response.data.message);
          addToDiscussion2("올리비아", response.data.message);

          //히스토리에 저장 {} => object [] => array   array가 맨 바깥, object는 array 내부로 들어감.
          // [] 에 push 로 {} 를 넣음.
          user_history.push({"role": "assistant", "content":response.data.message});
          localStorage.setItem("reply_history", JSON.stringify(user_history));

          setTimeout(() => scrollTop(600), 500);
        })
        
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("오류가 발생하였습니다. :" + error);
      } finally {
      }
    }

      
    // jq(".row button").on("click", function (e) {  
    //   alert("aa");
    //   return;
    //   const msg = jq(this).html();

    //   addToDiscussion("질문자", msg);
    //   send(msg, project_name);
    // });

        
    function addToDiscussion(writer, msg) {      
      var contents =
        "<li class='" +
        writer +
        " chat_me'>" +
        "<div class='message chat_ib'>" +
        "<p>" +
        writer +
        ": " +
        msg +
        "</p>" +
        "</div></li>";
      jq(".discussion").append(contents);
      scrollTop(100);
    }

    
  // jq(".card").on("click", function(e) {
  //   alert("aa")
  //   const msg = jq(this).innerHTML();
  //   alert(msg);
  // }); 

  }) //onMount 끝

  

    //starter 문구 클릭    
    let btn_starter = (e) => {
        var button = e.target;        
        const msg = button.id;
        //setTimeout(() => alert(msg), 300);
        question_bind = msg;

        setTimeout(() => document.getElementById("sendBtn").click(), 300);
        
        jq("#msg").val("");
        jq("#msg").focus();
    }  



</script>



<div id="container">
  <div id="intro"><img src='images/watch{random_image}.png' style="max-width: 100%; max-height:100%;" ></div>
  <!-- <h2 class="title1">Python RAG 테스트</h2> -->
  <div class="top_group">
    <div style="float: right">
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-boxes" viewBox="0 0 16 16">&nbsp;
        <path d="M7.752.066a.5.5 0 0 1 .496 0l3.75 2.143a.5.5 0 0 1 .252.434v3.995l3.498 2A.5.5 0 0 1 16 9.07v4.286a.5.5 0 0 1-.252.434l-3.75 2.143a.5.5 0 0 1-.496 0l-3.502-2-3.502 2.001a.5.5 0 0 1-.496 0l-3.75-2.143A.5.5 0 0 1 0 13.357V9.071a.5.5 0 0 1 .252-.434L3.75 6.638V2.643a.5.5 0 0 1 .252-.434zM4.25 7.504 1.508 9.071l2.742 1.567 2.742-1.567zM7.5 9.933l-2.75 1.571v3.134l2.75-1.571zm1 3.134 2.75 1.571v-3.134L8.5 9.933zm.508-3.996 2.742 1.567 2.742-1.567-2.742-1.567zm2.242-2.433V3.504L8.5 5.076V8.21zM7.5 8.21V5.076L4.75 3.504v3.134zM5.258 2.643 8 4.21l2.742-1.567L8 1.076zM15 9.933l-2.75 1.571v3.134L15 13.067zM3.75 14.638v-3.134L1 9.933v3.134z"/>
      </svg>
      <input id="project" type="text" value="watch"  />
    </div>

    <div id="model" class="model_view">
      <button class="btn btn-outline-secondary" type="button">SM-R940</button>
      <button class="btn btn-outline-secondary" type="button">SM-R84X</button>
      <button class="btn btn-outline-secondary" type="button">SM-R800</button>
    </div>
  </div>
  <div class="ul" id="result">
    <div id="box">
      <ul class="discussion"></ul>
    </div>
  </div>


  <div class="bottom_group">
    <div class="row">
      <!-- 사용자 시작 스타터 리스트 -->
      <!-- {#each project_starters_list_db as list (list.no)} -->
      {#each project_starters_list_db as list, i}  
      <!-- <div class="card" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">{list.title}</h5>
          <p class="card-text">{list.instruction}</p>
          <button class="btn_starter" id={list.instruction} on:click={btn_starter}>질문하기</button>
        </div>
      </div>   -->
      <button class="btn_starter" id={list.instruction} on:click={btn_starter}>#{list.title}</button>
      {:else}
        <span></span>
      {/each}
    </div>

    <div id="box2">
      <div style="display: inline-block">        
        <button
          type="button"
          class="btn btn-outline-primary"
          id="btn-check-outlined-reset"
        >
          새로운 채팅
        </button>
      </div>
      <div style="display: inline-block; float:inline-end;">
        top_p (0.1~1.0)        
        <input id="set_topp" type="text" value="0.4" style="width: 70px; text-align:right;" />
        &nbsp;
        temperature (0.1~1.0)
        <input id="set_temperature" type="text" value="0.4" style="width: 70px; text-align:right;" />
      </div>
    </div>

    <div id="input_q" class="input-group mb-3">
      <input
        id="msg"
        type="text"
        class="form-control"
        placeholder="질문을 입력하세요"
        aria-label="Recipient's username"
        aria-describedby="button-addon2"
        bind:value={question_bind}
      />
      <button class="btn btn-outline-secondary" type="button" id="sendBtn">
        전송
      </button>
    </div>
  </div>

</div>






<style>
  #intro {
    /* background-color: #ccc; */
    position:absolute;
    width: 100%;
    height: 60%;
    top: 130px;
    left: 50%;
    transform: translate(-50%, 0%);
    z-index: 3;
    text-align: center;
  }

  #container {
  width: 100%;
  min-height: 100%;
  margin: 0 auto -65px;
  /*border: #dbdada 1px solid;*/
}

.top_group {
  position: relative;  
  left: 0;
  right: 0;
  width:100%;
  height: 40px;
  padding: 0 10px 0 10px;
}

.title1 {
  font-size: 18px;
  margin: 6px 0 0 0px;
  text-align: left;
}

#model {
  font-size: 14px;
  width: 100%;
  height: 50px;
  text-align: left;
}

#result {
  position: absolute;
  align-content: center;
  /*border: #dbdada 1px solid;*/
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  /*overflow-y: scroll;*/
  margin: 110px 36px 245px 16px;
  padding:  0 30px 0 0;
  /* z-index: -5; */
}

#result #box {
  align-content: center;
  border: #dbdada 0px solid;
  background-color: #fff;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

#box2 {
  align-content: center;
  /*border: #dbdada 1px solid;*/
  background-color: #f2f2f2;
  width: 100%;
  height: 50px;
  margin: 10px 0 0 0;
  padding: 6px 0 0 6px;
}

#input_q {
  bottom: 10px;
  width: 100%;
  height: 55px;
  margin: 20px 0px 0px 0px;
}

.bottom_group {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  padding: 0 16px 0 16px;
  z-index: 4;
}

.row {
  font-size: 12px;
  text-align: center;
  margin: 0;
}

.btn_starter {
  border: #d6d6d6 1px solid;
  border-radius: 10px;
  background-color: #fff;
  width: auto;
  margin: 2px;
}

.card {
  height: 120px;
}

ul {
  list-style: none;
}

:global(.chat_me) {
  float: right;
  margin: 10px 16px 10px 0;
  width: 60%;
}

:global(.chat_me .chat_ib p) {
  background: #ebebeb none repeat scroll 0 0;
  border-radius: 10px;
  border: #cccccc 0px solid;
  font-size: 14px;
  color: #646464;
  margin: 0;
  padding: 8px 10px 8px 12px;
  width: 100%;
  word-break: break-all;
}

:global(.chat_bot) {
  float: left;
  margin: 10px 0 10px 0;
  width: 80%;
}

:global(.chat_bot .chat_ib p) {
  background: #05728f none repeat scroll 0 0;
  border-radius: 6px;
  font-size: 14px;
  color: #fff;
  margin: 0;
  padding: 5px 10px 5px 12px;
  width: 100%;
  word-break: break-all;
}

:global(.chat_bot .chat_ib p a) {
  text-decoration: underline;
  color: white;
}

:global(.chat_time) {
  font-size: 12px;
  color: #ccc;
}

:global(#myAudio) {
  visibility: hidden;
}

/*타이핑*/

:global(#thinkAni) {
  float: left;
  width: 80%;
}

:global(#thinkAni img) {
  width: 80px;
}

:global(.remove) {
  visibility: hidden;
}

:global(.typing-indicator) {
  background-color: #e6e7ed;
  will-change: transform;
  width: 100px;
  border-radius: 50px;
  padding: 20px;
  /*margin: 0 auto;*/
  position: relative;
  animation: 2s bulge infinite ease-out;
}

:global(.typing-indicator::before,
.typing-indicator::after) {
  content: "";
  position: absolute;
  bottom: -2px;
  left: -2px;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background-color: #e6e7ed;
}

:global(.typing-indicator::after) {
  height: 10px;
  width: 10px;
  left: -10px;
  bottom: -10px;
}

:global(.typing-indicator span) {
  height: 10px;
  width: 10px;
  float: left;
  margin: 0 1px;
  background-color: #9e9ea1;
  display: block;
  border-radius: 50%;
  opacity: 0.4;
}

:global(.typing-indicator span:nth-of-type(1)) {
  animation: 1s blink infinite 0.3333s;
}

:global(.typing-indicator span:nth-of-type(2)) {
  animation: 1s blink infinite 0.6666s;
}

:global(.typing-indicator span:nth-of-type(3)) {
  animation: 1s blink infinite 0.9999s;
}

@keyframes blink {
  50% {
    opacity: 1;
  }
}

@keyframes bulge {
  50% {
    transform: scale(1.05);
  }
}
</style>