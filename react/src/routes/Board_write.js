import { React, useState, useEffect, useRef, useMemo } from "react";
import { EditorState, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "./styles/quillstyle.css"; /*이 파일은
위에 폰트나 폰트크기를 설정한 css파일이다. */

import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

import axios from "axios";
//import styled from "styled-components";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Navybar from "../components/Navybar";
import { getItemWithExpireTime } from "../Login/Auth";
import { useNavigate } from "react-router-dom";

import ReactQuill from "react-quill";
import Quill from "quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "@looop/quill-image-resize-module-react"; //새로받은것
Quill.register("modules/ImageResize", ImageResize);

hljs.configure({
  languages: ["javascript", "ruby", "python", "java", "cpp", "kotlin", "sql"],
});

//quill 설정
const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "align",
  "blockquote",
  "code-block",
  //"code-custom",
  "list",
  "bullet",
  "indent",
  "background",
  "color",
  "link",
  "image",
  "video",
  "width",
];

// var BlockEmbed = Quill.import("blots/block/embed");
// const highlightCode = (text) => hljs.highlightAuto(text).value;

// class CustomCode extends BlockEmbed {
//   static create(value) {
//     let node = super.create(value);
//     const code = document.createElement("code");
//     code.innerHTML = highlightCode(value);
//     node.appendChild(code);
//     return node;
//   }

//   static value(node) {
//     console.log("Requesting a value: ", node.textContent);
//     return node.textContent;
//   }
// }

// CustomCode.blotName = "code-custom";
// CustomCode.tagName = "pre";
// CustomCode.className = "ql-syntax";

// Quill.register(CustomCode);

// add an array of values
const fontFamilyArr = [
  "Arial",
  "나눔고딕",
  "Roboto",
  "Times New Roman",
  "Calibri",
  "Calibri Light",
  "Sans-Serif",
];
let fonts = Quill.import("attributors/style/font");
fonts.whitelist = fontFamilyArr;
Quill.register(fonts, true);

const fontSizeArr = [
  "10px",
  "11px",
  "12px",
  "14px",
  "16px",
  "18px",
  "24px",
  "36px",
];
var Size = Quill.import("attributors/style/size");
Size.whitelist = fontSizeArr;
Quill.register(Size, true);

function Board_write() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(getItemWithExpireTime("userinfo"));

  //제목설정
  const title = "게시판 글쓰기";

  //userState
  const [title1, setTitle1] = useState("");
  const [content, setContent] = useState("");

  const quillRef = useRef(null); //에디터 접근을 위한 ref return

  const imageHandler = async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.addEventListener("change", async () => {
      //이미지를 담아 전송할 file을 만든다
      const file = input.files?.[0];
      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await axios.post("http://192.168.4.76:5001/img", formData);
        //이미지 업로드 후, 이미지 url 가져오기
        const url = res?.data?.url;
        console.log("server image: " + url);

        if (quillRef.current) {
          console.log("quillRef start");
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection();

          editor.insertEmbed(range.index, "image", `${url}`);
          editor.setSelection(range.index + 1);
        }
      } catch (error) {
        console.log(error);
      }
    });
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          ["code-custom"],
          [{ font: fontFamilyArr }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ size: fontSizeArr }],
          [{ align: [] }],
          ["bold", "italic", "underline", "strike"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["blockquote", "code-block", "image", "link"],
          //["blockquote", "code-custom", "image", "link"],

          [{ color: [] }, { background: [] }],
        ],
        handlers: {
          image: imageHandler,
        },
      },

      syntax: {
        highlight: (text) => hljs.highlightAuto(text).value,
      },

      /* 추가된 코드 */
      ImageResize: {
        modules: ["Resize"],
      },
    }),
    []
  );

  const htmlToDraftBlocks = (html) => {
    const blocksFromHtml = htmlToDraft(html);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(
      contentBlocks,
      entityMap
    );
    const editorState = EditorState.createWithContent(contentState);
    return editorState;
  };

  //기간조회 버튼 클릭
  const onClickSend = async () => {
    let dbContent = content.replace(/'/g, "''");
    //dbContent = htmlToDraftBlocks(dbContent);

    //axios방식
    axios
      .post("http://192.168.4.76:5001/board_write", {
        code_key: localStorage.getItem("board_Key"),
        email: userInfo.id,
        name: userInfo.name,
        title: title1,
        content: dbContent,
      })
      .then(function (res) {
        console.log(res.data.result);
        navigate("/board_list");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const onClickCancel = () => {
    navigate("/board_list"); //글쓰기로 이동
  };

  const handleInputTitle = (e) => {
    setTitle1(e.target.value); // react input 입력값 가져오기.
  };

  // const handleInputContent = (e) => {
  //   setContent(e.target.value);
  // };

  useEffect(() => {
    //페이지 접속시, 기본 동작 1번
  }, []);

  return (
    <div>
      <Navybar title={title} />
      <div style={{ padding: 30 }}>
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>제목</Form.Label>
            <Form.Control
              type="email"
              placeholder="제목을 입력해주세요."
              value={title1}
              onChange={handleInputTitle}
            />
          </Form.Group>
          {/* <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>내용</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={content}
              onChange={handleInputContent}
            />
          </Form.Group> */}
        </Form>
        <div>
          {"내용"}
          <ReactQuill
            ref={quillRef}
            modules={modules}
            formats={formats}
            //value={content}
            onChange={setContent}
            style={{ height: "460px" }}
            theme="snow"
            placeholder="내용을 입력해주세요."
          />
        </div>
        <div style={{ marginTop: "80px", textAlign: "right" }}>
          <Button variant="secondary" type="button" onClick={onClickCancel}>
            취소
          </Button>{" "}
          <Button variant="secondary" type="button" onClick={onClickSend}>
            작성완료
          </Button>{" "}
        </div>
      </div>
    </div>
  );
}

export default Board_write;
