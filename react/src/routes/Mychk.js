import { React, useState, useEffect } from "react";
import axios from "axios";
//import styled from "styled-components";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // css import
//import selectArrow from "../assets/select-arrow.svg";
import moment from "moment";

import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import MyModal from "../components/MyModal";
import Navybar from "../components/Navybar";
import { getItemWithExpireTime } from "../Login/Auth";

function Mychk() {
  //제목설정
  const title = "근태확인";

  //userState
  //로딩체크
  const [loading, setLoading] = useState(true);
  const [checkes, setCheckes] = useState([]);
  //달력
  const [startDate, setStartDate] = useState(new Date("2023/12/1"));
  const [endDate, setEndDate] = useState(new Date("2023/12/21"));
  //모달 설정값
  const [modalShow, setModalShow] = useState(false);
  const [temp, setTemp] = useState({
    workdate: "20231221",
    in_time: "20231221083000",
    out_time: "20231221173000",
  });

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

  //const [nowDate, setNowDate] = useState(new Date());
  //const [isOpen, setIsOpen] = useState(false);

  // const handleToggleCalendar = () => {
  //   setIsOpen(!isOpen);
  // };

  // const handleDateChange = (selectedDate) => {
  //   setNowDate(selectedDate);
  //   setIsOpen(false);
  //   setNowDate(moment(selectedDate).format("YYYY년 MM월 DD일"));
  // };

  //parse는 json 형태를 가져와 읽을 수 있도록 해주기
  const userInfo = JSON.parse(getItemWithExpireTime("userinfo"));
  let userName = "이름";
  if (userInfo) {
    userName = userInfo.name;
  } else {
    userName = "없음";
  }

  const saveMsg = (item) => {
    setModalShow(true); //모달 보이기
    setTemp(item); //모달로 전달값 저장
    console.log(item);
  };

  //DB시간 형태로 변경,  시작, 종료 기간 20231212
  const startValue =
    startDate.getFullYear() +
    (startDate.getMonth() + 1).toString().padStart(2, "0") +
    startDate.getDate().toString().padStart(2, "0");
  const endValue =
    endDate.getFullYear() +
    (endDate.getMonth() + 1).toString().padStart(2, "0") +
    endDate.getDate().toString().padStart(2, "0");

  //기간조회 버튼 클릭
  const onClickSearch = async () => {
    //axios방식
    axios
      .post("http://192.168.4.76:5001/mycheck", {
        name: userName,
        start: startValue,
        end: endValue,
      })
      .then(function (res) {
        //console.log(res);
        setCheckes(res.data.recordset);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    //페이지 접속시, 기본 기간조회 동작 1번
    onClickSearch();
  }, []);

  return (
    <div>
      <Navybar title={title} />

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

      {/* Styled 컴포넌트 적용 - 달력 SDatePicker */}
      {/* <div> */}
      <div style={{ width: "100%", textAlign: "center" }}>
        <div style={{ width: "300px", display: "inline-block" }}>
          <Calendar onChange={setStartDate} value={startDate} />
          {moment(startDate).format("YYYY년 MM월 DD일")}
        </div>
        <div style={{ width: "300px", display: "inline-block" }}>
          <Calendar onChange={setEndDate} value={endDate} />
          {moment(endDate).format("YYYY년 MM월 DD일")}
        </div>
      </div>
      {/* <SDatePicker
        locale={ko}
        dateFormat="yyyy.MM.dd"
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
      />
      <SDatePicker
        locale={ko}
        dateFormat="yyyy.MM.dd"
        selected={endDate}
        onChange={(date) => setEndDate(date)}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
      /> */}
      <div style={{ textAlign: "right", paddingRight: "40px" }}>
        <Button variant="secondary" type="button" onClick={onClickSearch}>
          기간조회
        </Button>
      </div>
      {/* </div> */}

      <Table hover>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">DATE</th>
            <th scope="col">NAME</th>
            <th scope="col">출근</th>
            <th scope="col">퇴근</th>
            <th scope="col">진행률</th>
          </tr>
        </thead>
        <tbody>
          {checkes.map((item) => (
            <tr onClick={() => saveMsg(item)}>
              <th scope="row">{item.no}</th>
              <td>
                {/* let Today = "20210101"
              Today.substr(0, 4) + '-' + Today.substr(4, 2) + '-' + Today.substr(6, 2); */}
                {item.workdate.replace(/(\d{4})(\d{2})(\d{2})/g, "$1-$2-$3")}
              </td>
              <td>{item.name}</td>
              <td>
                {item.in_time.replace(/(\d{8})(\d{2})(\d{2})(\d{2})/g, "$2:$3")}
              </td>
              <td>
                {item.out_time.replace(
                  /(\d{8})(\d{2})(\d{2})(\d{2})/g,
                  "$2:$3"
                )}
              </td>
              <td>
                {item.progress_study === null ? "0" : item.progress_study}%
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {modalShow === true ? (
        <MyModal
          show={modalShow}
          onHide={() => {
            //모달이 닫혔을때 동작.... 자식이 부모에게 전달
            setModalShow(false);
            onClickSearch();
          }}
          mydata={temp}
        />
      ) : null}
    </div>
  );
}

export default Mychk;
