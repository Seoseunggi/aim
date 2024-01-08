import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import RangeSlider from "react-bootstrap/FormRange";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";

//import "@picocss/pico/css/pico.css";

function MyModal(props) {
  const [intime, setIntime] = useState("");
  const [outtime, setOuttime] = useState("");
  const [prog, setProg] = useState(0);

  console.log("start");

  //console.log(props.mydata.in_time);
  //console.log("MyModal:" +props.mydata);

  const handleIntime = (e) => {
    setIntime(e.target.value); // react input 입력값 가져오기.
  };
  const handleOuttime = (e) => {
    setOuttime(e.target.value); // react input 입력값 가져오기.
  };
  // const handleDefault = (e) => {
  //   setProg(e.target.value); // react input 입력값 가져오기.
  // };

  const update_db = async () => {
    const dbIntime =
      props.mydata.workdate.substr(0, 8) + intime.replace(":", "") + "00";
    const dbOuttime =
      props.mydata.workdate.substr(0, 8) + outtime.replace(":", "") + "00";
    //axios방식
    axios
      .post("http://192.168.4.76:5001/mycheck_update", {
        name: props.mydata.name,
        workdate: props.mydata.workdate,
        intime: dbIntime,
        outtime: dbOuttime,
        prog: prog,
      })
      .then(function (res) {
        console.log(res.msg);
        props.onHide();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    //페이지 접속시, 기본 기간조회 동작 1번
    const init = () => {
      console.log("init");
      setIntime(
        props.mydata.in_time.replace(/(\d{8})(\d{2})(\d{2})(\d{2})/g, "$2:$3")
      );

      setOuttime(
        props.mydata.out_time.replace(/(\d{8})(\d{2})(\d{2})(\d{2})/g, "$2:$3")
      );

      setProg(
        props.mydata.progress_study === null ? 0 : props.mydata.progress_study
      );
    };

    init();
    // console.log(props.mydata.progress_study);
    // if (props.mydata.progress_study !== null) {
    //   setProg(props.mydata.progress_study);
    // } else {
    //   setProg(0);
    // }
  }, []);

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">정보 수정</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>항목</h4>
        <p>
          {props.mydata.workdate.replace(
            /(\d{4})(\d{2})(\d{2})/g,
            "선택일자 : $1-$2-$3"
          )}
        </p>
        <p>
          {props.mydata.in_time.replace(
            /(\d{8})(\d{2})(\d{2})(\d{2})/g,
            "출근시간 : $2:$3"
          )}
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">수정</InputGroup.Text>
            <Form.Control
              name="input_intime"
              defaultValue={intime}
              onChange={handleIntime}
              placeholder="08:30 의 형태로 입력"
              aria-label="In time"
              aria-describedby="basic-addon1"
            />
          </InputGroup>{" "}
        </p>
        <p>
          {props.mydata.out_time.replace(
            /(\d{8})(\d{2})(\d{2})(\d{2})/g,
            "퇴근시간 : $2:$3"
          )}
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">수정</InputGroup.Text>
            <Form.Control
              name="input_outtime"
              defaultValue={outtime}
              onChange={handleOuttime}
              placeholder="17:30 의 형태로 입력"
              aria-label="Out time"
              aria-describedby="basic-addon1"
            />
          </InputGroup>{" "}
        </p>
        <hr />
        <p>
          <span>업무진도 ({prog}%) </span>
        </p>

        <input
          type="range"
          min={0}
          max={100}
          value={prog}
          onChange={(e) => setProg(e.target.value)}
          id="range"
          name="range"
        ></input>
        {/* <Form>
          <Form.Group as={Row}>
            <Col xs="12">
              <RangeSlider
                //defaultValue={parseInt(prog)}
                value={prog}
                onChange={(e) => setProg(e.target.value)}
                tooltipPlacement="top"
                tooltip="on"
                min={0}
                max={100}
                size="lg"
                variant="light"
              />
            </Col>
          </Form.Group>
        </Form> */}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={update_db}>수정하기</Button>
        <Button onClick={props.onHide}>나가기</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default MyModal;
