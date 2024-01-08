import { React, useState, useEffect } from "react";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import axios from "axios";
//import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";

import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Input from "react-bootstrap/InputGroup";
import Navybar from "../components/Navybar";
import * as DOMPurify from "dompurify";

function Board_view() {
  const { id } = useParams();

  const navigate = useNavigate();
  //제목설정
  const title = "내용 보기";

  //userState
  //로딩체크
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  const [pass, setPass] = useState("");

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

  //게시판 내용 불러오기
  const onClickBoard = async () => {
    //axios방식
    axios
      .post("http://192.168.4.76:5001/board_view", {
        board_id: `${id}`,
      })
      .then(function (res) {
        console.log(res);
        setList(res.data.recordset);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //게시판 삭제 구문
  const handleInputPassword = (e) => {
    setPass(e.target.value); // react input 입력값 가져오기.
  };

  const onClickDelete = () => {
    if (pass === "") {
      alert("비밀번호를 입력하세요.");
      return;
    }

    //axios방식
    axios
      .post("http://192.168.4.76:5001/board_delete", {
        board_id: `${id}`,
        board_email: list[0]?.email,
        board_pass: pass,
      })
      .then(function (res) {
        //console.log(res);
        if (res.data.msg === "no") {
          alert("작성자의 패스워드가 잘못되었습니다.");
          setPass("");
        } else {
          navigate("/board_list"); //리스트로 이동
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const onClickModify = () => {
    if (pass === "") {
      alert("비밀번호를 입력하세요.");
      return;
    }

    //axios방식
    axios
      .post("http://192.168.4.76:5001/board_modify", {
        board_id: `${id}`,
        board_email: list[0]?.email,
        board_pass: pass,
      })
      .then(function (res) {
        //console.log(res);
        if (res.data.msg === "no") {
          alert("작성자의 패스워드가 잘못되었습니다.");
          setPass("");
        } else {
          navigate(`/board_modify/${id}`); //내용 수정으로 이동
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onClickList = () => {
    navigate("/board_list"); //리스트로 이동
  };

  useEffect(() => {
    //페이지 접속시, 기본 기간조회 동작 1번
    onClickBoard();
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
        <div>
          <div style={{ backgroundColor: "#f2f2f2", padding: 10 }}>
            <h1>제목: {list[0]?.title}</h1>
          </div>
          {list[0]?.udate === null ? (
            <div style={{ textAlign: "right", color: "#ccc" }}>
              작성일 : {new Date(list[0]?.wdate).toLocaleString()}
            </div>
          ) : (
            <div style={{ textAlign: "right", color: "#ccc" }}>
              수정일 : {new Date(list[0]?.udate).toLocaleString()}
            </div>
          )}
          <div className="ql-snow">
            <div
              style={{
                padding: 10,
                backgroundColor: "#f3f3f3",
                wordBreak: "break-word",
              }}
            >
              {list[0]?.contents && (
                <pre
                  className="ql-editor"
                  style={{
                    width: "100%",
                    whiteSpace: "normal",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(String(list[0]?.contents)),
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <div style={{ padding: 10, textAlign: "right" }}>
          <span style={{ color: "#ccc" }}>{list[0]?.email}</span>{" "}
          <input
            style={{ width: 120, display: "inline-block" }}
            type="password"
            id="password_delete"
            class="form-control"
            aria-describedby="passwordHelpBlock"
            value={pass}
            placeholder="비밀번호"
            onChange={handleInputPassword}
          />{" "}
          <Button variant="secondary" type="button" onClick={onClickDelete}>
            삭제하기
          </Button>{" "}
          <Button variant="secondary" type="button" onClick={onClickModify}>
            수정하기
          </Button>{" "}
          <Button variant="secondary" type="button" onClick={onClickList}>
            리스트로
          </Button>{" "}
        </div>
      </div>
    </div>
  );
}

export default Board_view;
