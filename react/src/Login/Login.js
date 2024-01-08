import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import Navybar from "../components/Navybar";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { setItemWithExpireTime } from "./Auth";

//import { connect } from "react-redux";
import { useAppDispatch, useAppSelector } from "../store/store";
import { addUser } from "../store/userSlice";

function Login() {
  const testState = useAppSelector((state) => state.member);
  const dispatch = useAppDispatch();

  console.log(testState);

  const [inputId, setInputId] = useState("");
  const [inputPw, setInputPw] = useState("");
  const navigate = useNavigate();

  const title = "인증확인";

  const handleInputId = (e) => {
    setInputId(e.target.value); // react input 입력값 가져오기.
  };

  const handleInputPw = (e) => {
    setInputPw(e.target.value);
  };
  const enter_key = (e) => {
    if (e.keyCode == 13) {
    }
    onClickLogin();
  };

  const onClickLogin = async () => {
    if (inputId === "" || inputPw === "") {
      return;
    }

    const res = await axios.post(
      "http://192.168.4.76:5001/login",
      {
        user_id: inputId,
        user_pw: inputPw,
      },
      { withCredentials: true } //쿠키값으로 서버로 보내주려면 get, post 시 반드시 포함해야 전송 됨.
    );

    if (res.data.msg === "true") {
      console.log("===== Login.js =======");
      console.log(res.data.msg);
      console.log(res.data.value[0].name); //mssql 쿼리값은 row로 되어있고, value[0] 값으로 불러와야함.
      console.log("===== Login.js =======");
      //로컬스토리지 정보 저장
      //localStorage.setItem("userinfo", JSON.stringify(res.data.value[0])); //stringify는 json형태로만들기
      setItemWithExpireTime(
        "userinfo",
        JSON.stringify(res.data.value[0]),
        180 * 60 * 1000
      ); //180분
      setItemWithExpireTime(
        "server_session",
        JSON.stringify(res.data.server_session),
        180 * 60 * 1000
      ); //180분
      //setNavName = res.data.value[0].name;

      //REDUX 사용
      dispatch(addUser(res.data.value[0].id));

      navigate("/"); //홈화면으로
    } else {
      console.log("로그인 정보가 잘못되었습니다.");
    }
  };

  return (
    <div>
      <Navybar title={title} loginbutton="false" />

      <div
        style={{
          width: "50%",
          height: "50%",
          padding: "20px 0 0 20px",
          position: "relative",
        }}
      >
        <h2>Login</h2>
        <div>
          {/* <label htmlFor="input_id">ID : </label>
          <input
            type="text"
            name="input_id"
            value={inputId}
            onChange={handleInputId}
          /> */}
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
            <Form.Control
              name="input_id"
              value={inputId}
              onChange={handleInputId}
              placeholder="User email"
              aria-label="User email"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
        </div>
        <div>
          {/* <label htmlFor="input_pw">PW : </label>
          <input
            type="password"
            name="input_pw"
            value={inputPw}
            onChange={handleInputPw}
          /> */}
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">PW</InputGroup.Text>
            <Form.Control
              name="input_pw"
              value={inputPw}
              onChange={handleInputPw}
              type="password"
              placeholder=""
              aria-label="User email"
              aria-describedby="basic-addon1"
              onKeyDown={enter_key}
            />
          </InputGroup>
        </div>

        <div>
          <Button variant="secondary" type="button" onClick={onClickLogin}>
            Login
          </Button>{" "}
        </div>
      </div>
    </div>
  );
}

// function mapStateToProps(state) {
//   return { toDos: state };
// }

// function mapDispatchToProps(dispatch, ownProps) {
//   return {
//     addToDo: (text) => dispatch(addUser(text)),
//   };
// }

//export default connect(mapStateToProps, mapDispatchToProps)(Login);
export default Login;
