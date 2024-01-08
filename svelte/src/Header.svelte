<script>
  // 깔끔한 해시 모드 경로 변경
  import { link } from "svelte-spa-router";
  import active from "svelte-spa-router/active"

  import {content} from "./storable"
  
  let value = 'world'
</script>

<ul class="nav nav-underline">
  <li class="nav-item">
    <a class="nav-link active" aria-current="page" use:link href="/" >Home</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" use:link href="/view/35" >TEST1</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" use:link href="/board_write">TEST2</a>
  </li>
</ul>

<!-- <input bind:value={$content}>
<button>Set Data</button>
<h2>Data: {$content}</h2> -->