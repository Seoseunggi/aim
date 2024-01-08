import { React, useEffect } from "react";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getItemWithExpireTime } from "../Login/Auth";
import { persistor } from "../";

function Navybar(props) {
  const navigate = useNavigate();

  const userInfo = JSON.parse(getItemWithExpireTime("userinfo"));

  const signOut = async () => {
    const res = await axios.get("http://192.168.4.76:5001/logout", {
      withCredentials: true,
    });
    console.log(res.data.msg);

    if (res.data.msg === "login") {
      //navigate("/Mychk");
    } else if (res.data.msg === "logout") {
      //로컬스토리지 삭제
      localStorage.removeItem("userinfo");
      localStorage.removeItem("server_session");

      await persistor.purge(); // persistStore의 데이터 전부 날림

      navigate("/login"); //로그인으로 이동
    }
  };

  //로드시, 1번만 실행
  useEffect(() => {
    const server_session = JSON.parse(getItemWithExpireTime("server_session"));
    //axios방식
    axios
      .post(
        "http://192.168.4.76:5001/auth",
        {
          client_session: server_session,
        },
        { withCredentials: true }
      )
      .then(function (res) {
        console.log("navbar=>" + res.data.msg);
        if (res.data.msg === "auth_true") {
          //navigate("/Mychk");
        } else if (res.data.msg === "auth_false") {
          persistor.purge(); // persistStore의 데이터 전부 날림
          navigate("/login");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div>
      <Navbar bg="dark" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="/">{props.title}</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link
              style={
                props.loginbutton === "false" || userInfo?.name !== "서승기"
                  ? { display: "none" }
                  : { display: "block" }
              }
              href="/Mychk"
            >
              내근태확인
            </Nav.Link>
            <Nav.Link href="/Board_list">게시판</Nav.Link>
            {/* <Nav.Link href="/login">로그인화면</Nav.Link> */}

            <Nav.Link href="/board_toastui">개발테스트</Nav.Link>
            <Nav.Link
              style={
                props.loginbutton === "false"
                  ? { display: "none" }
                  : { display: "block" }
              }
              onClick={signOut}
              href="#"
            >
              {userInfo !== null ? userInfo.name : null}님 로그아웃
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
}

export default Navybar;
