<script>
  // 깔끔한 해시 모드 경로 변경
  import { link } from "svelte-spa-router";
  import active from "svelte-spa-router/active"

  import {content} from "./storable"
  
  let value = 'world'
</script>


<ul class="nav nav-underline">
  <li class="nav-item">
    <a class="nav-link" use:link href="/" >프로젝트설정</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" use:link href="/rag">RAG 테스트</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" use:link href="/gptonly">GPT 테스트</a>
  </li>
</ul>

<!-- <li class="nav-item">
  <a class="nav-link" use:link href="/view/35" >TEST1</a>
</li>
<li class="nav-item">
  <a class="nav-link" use:link href="/board_write">TEST2</a>
</li> -->
<!-- <input bind:value={$content}>
<button>Set Data</button>
<h2>Data: {$content}</h2> -->

<style>
  .nav {
    margin-bottom: 10px;
    border-bottom: #ccc 1px solid;
  }
</style>
