<script>  
  import {content} from "../storable"
  import * as DOMPurify from "dompurify";
  import axios from 'axios'
  export let params = {}
  let db_contents = ""

  let db = {}

  //기간조회 버튼 클릭
  const onClickBoard = async () => {
    //axios방식
    axios
      .post("http://192.168.4.76:5001/board_view", {
        board_id: params.id,
      })
      .then(function (res) {
        console.log(res);
        db = res.data.recordset[0];        
      })
      .catch((err) => {
        console.log(err);
      });
  };

</script>

<h1>View</h1>
<h2>{params.id}</h2>
<p>
  <button on:click={onClickBoard} type="button" class="btn btn-primary" data-bs-toggle="button">데이터 가져오기</button>
</p>
{#if db.name != null }
<p>{db.name}</p>
<div>{@html db.contents}</div>
{/if}

<table class="table table-hover">
  <thead class="table-light">
    <tr>
      <th scope="col">#</th>
      <th scope="col">First</th>
      <th scope="col">Last</th>
      <th scope="col">Handle</th>
    </tr>
  </thead>
  <tbody class="table-group-divider">
    <tr>
      <th scope="row">1</th>
      <td>Mark</td>
      <td>Otto</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Jacob</td>
      <td>Thornton</td>
      <td>@fat</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td colspan="2">Larry the Bird</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</table>
<div class="grid text-center">
  <div class="g-col-6 g-col-md-4">.g-col-6 .g-col-md-4</div>
  <div class="g-col-6 g-col-md-4">.g-col-6 .g-col-md-4</div>
  <div class="g-col-6 g-col-md-4">.g-col-6 .g-col-md-4</div>
</div>

<p>{$content}</p>