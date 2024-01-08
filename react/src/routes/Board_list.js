import { React, useState, useEffect } from "react";
import axios from "axios";
//import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Navybar from "../components/Navybar";
import Pagination from "./Pagination";

function Board_list() {
  const navigate = useNavigate();
  //제목설정
  const title = "게시판 리스트";

  const selectList = [
    { value: "dev", name: "개발" },
    { value: "prompt", name: "프롬프트엔지니어링" },
    { value: "svelte", name: "Svelte" },
    { value: "react", name: "React" },
    { value: "python", name: "Python" },
  ];
  const [selected, setSelected] = useState("dev");

  //userState
  //로딩체크
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  //페이지나누기
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10); //10개 게시물 마다 나누기
  /* 새로 추가한 부분 */
  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  //list 받아서 수치만큼 배열 자르기
  const currentPosts = (posts) => {
    let currentPosts = 0;
    currentPosts = posts.slice(indexOfFirst, indexOfLast);
    return currentPosts;
  };
  /* 페이지 나누기 끝 */

  //styled 컴포넌트
  // const SDatePicker = styled(Calendar)`
  //   background-color: colors.$BG_COLOR;
  //   margin-top: 1.5rem;
  //   width: 300px;
  //   height: 42px;
  //   box-sizing: border-box;
  //   padding: 8px 20px;
  //   border-radius: 4px;
  //   border: 1px solid #ccc;
  //   font-size: 12px;
  // `;

  //기간조회 버튼 클릭
  const onClickBoard = async (sel) => {
    //axios방식
    axios
      .post("http://192.168.4.76:5001/board_list", {
        keycode: sel,
      })
      .then(function (res) {
        console.log(res);
        setList(res.data.recordset.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const viewContent = (item) => {
    navigate(`/board_view/${item.no}`); //뷰로 이동
  };

  const onClickWrite = () => {
    if (localStorage.getItem("userinfo")) {
      navigate("/board_write"); //글쓰기로 이동
    } else {
      navigate("/login");
    }
    //localStorage.getItem("userinfo");
  };

  const handleSelect = (e) => {
    setSelected(e.target.value);

    localStorage.setItem("board_Key", e.target.value); //현재 선택 한 종류 저장
    //console.log("변경:" + e.target.value);
    onClickBoard(e.target.value);
  };

  useEffect(() => {
    //초기 불러올때, 선택한 키가 있다면 저장하여 불러오기
    if (localStorage.getItem("board_Key") !== null) {
      const save_key = localStorage.getItem("board_Key");
      setSelected(save_key);
      onClickBoard(save_key);
    } else {
      localStorage.setItem("board_Key", selected); //최초 스토리지 키가 없다면,  접속 기본 선택 종류 저장
      //페이지 접속시, 기본 기간조회 동작 1번
      onClickBoard(selected);
    }
  }, []);

  return (
    <div>
      <Navybar title={title} />

      <div style={{ padding: 30 }}>
        {loading ? (
          <Button variant="primary" disabled>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            <span className="visually-hidden">Loading...</span>
          </Button>
        ) : null}

        <h1>개발일지</h1>
        <div style={{ marginTop: "20px" }}>
          <select onChange={handleSelect} value={selected}>
            {selectList.map((item) => (
              <option value={item.value} key={item.value}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <Table hover>
          <thead class="table-light">
            <tr>
              <th scope="col">번호</th>
              <th scope="col">글쓴이</th>
              <th scope="col">제목</th>
              <th scope="col">등록일</th>
              <th scope="col">추천</th>
              <th scope="col">조회</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            {/* {list.map((item) => ( */}
            {currentPosts(list).map((item) => (
              <tr
                onClick={() => viewContent(item)}
                style={{ cursor: "pointer" }}
              >
                <th scope="row">{item.no}</th>
                <td>{item.name}</td>
                <td>{item.title}</td>
                <td>
                  {/* let Today = "20210101"
                Today.substr(0, 4) + '-' + Today.substr(4, 2) + '-' + Today.substr(6, 2); */}
                  {/* {item.wdate.replace(/(\d{4})(\d{2})(\d{2})/g, "$1-$2-$3")} */}
                  {new Date(item.wdate).toLocaleString()}
                </td>
                <td>{item.up}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination
          postsPerPage={postsPerPage}
          totalPosts={list.length}
          paginate={setCurrentPage}
        ></Pagination>
        <div style={{ float: "right", display: "inline-block" }}>
          <Button variant="secondary" type="button" onClick={onClickWrite}>
            글쓰기
          </Button>{" "}
        </div>
      </div>
    </div>
  );
}

export default Board_list;
