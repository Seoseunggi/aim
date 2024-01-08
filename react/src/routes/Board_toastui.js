import React, { useEffect, useRef } from "react";
import Navybar from "../components/Navybar";

// Toast 에디터
import "@toast-ui/editor/dist/toastui-editor-viewer.css";
import { Editor, Viewer } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";

// Toast ColorSyntax 플러그인
import "tui-color-picker/dist/tui-color-picker.css";
import "@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css";
import colorSyntax from "@toast-ui/editor-plugin-color-syntax";

import axios from "axios";

export default function ToastEditor() {
  //제목설정
  const title = "게시판 글쓰기";
  // Editor DOM 선택용
  const editorRef = useRef();

  // 등록 버튼 핸들러
  const handleRegisterButton = () => {
    // 입력창에 입력한 내용을 HTML 태그 형태로 취득
    console.log(editorRef.current?.getInstance().getHTML());
    // 입력창에 입력한 내용을 MarkDown 형태로 취득
    console.log(editorRef.current?.getInstance().getMarkdown());
  };

  // Toast-UI Editor 에 HTML 표시
  useEffect(() => {
    // 1. DB에서 가져온 HTML이라고 가정
    const htmlString = "";

    // 2. Editor DOM 내용에 HTML 주입
    editorRef.current?.getInstance().setHTML(htmlString);
  }, []);

  // HTML: span태그 글자색을 파란색으로 설정
  const html =
    '<iframe width="1267" height="722" src="https://www.youtube.com/embed/PgsV4Bl99s0" title="[리무진 서비스 클립] 뉴진스 하니 | NewJeans HANNI | 와르르 ♥" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';

  return (
    <div>
      <Navybar title={title} />
      <h3>### Editor Toast</h3>
      <Editor
        ref={editorRef} // DOM 선택용 useRef
        //placeholder="내용을 입력해주세요."
        previewStyle="tab" // 미리보기 스타일 지정
        height="600px" // 에디터 창 높이
        initialEditType="wysiwyg" //
        theme={"dark"} //'' or 'dark'
        toolbarItems={[
          // 툴바 옵션 설정
          ["heading", "bold", "italic", "strike"],
          ["hr", "quote"],
          ["ul", "ol", "task", "indent", "outdent"],
          ["table", "image", "link"],
          ["code", "codeblock"],
        ]}
        // 유튜브 삽입 및 미리보기 를 위한 설정(iframe)
        customHTMLRenderer={{
          htmlBlock: {
            iframe(node) {
              return [
                {
                  type: "openTag",
                  tagName: "iframe",
                  outerNewLine: true,
                  attributes: node.attrs,
                },
                { type: "html", content: node.childrenHTML },
                { type: "closeTag", tagName: "iframe", outerNewLine: true },
              ];
            },
          },
        }}
        useCommandShortcut={false} // 키보드 입력 컨트롤 방지
        // colorSyntax 플러그인 적용
        plugins={[
          [
            colorSyntax,
            // 기본 색상 preset 적용
            {
              preset: ["#1F2E3D", "#4c5864", "#ED7675"],
            },
          ],
        ]}
        // hooks 에서 addImageBlobHook 를 주물러 주면 된다.
        hooks={{
          addImageBlobHook: async (blob, callback) => {
            console.log(blob); // File {name: '카레유.png', ... }

            const formData = new FormData();
            formData.append("image", blob);

            const res = await axios.post(
              "http://192.168.4.76:5001/img",
              formData
            );
            //이미지 업로드 후, 이미지 url 가져오기
            const url = res?.data?.url;
            console.log("server image: " + url);

            // 1. 첨부된 이미지 파일을 서버로 전송후, 이미지 경로 url을 받아온다.
            // const imgUrl = await .... 서버 전송 / 경로 수신 코드 ...

            // 2. 첨부된 이미지를 화면에 표시(경로는 임의로 넣었다.)
            callback(`${url}`, "서버이미지");
          },
        }}
      ></Editor>

      <button onClick={handleRegisterButton}>등록</button>

      <br />
      <br />
      <br />
      <h2>뷰어</h2>
      <Viewer
        initialValue={html} // 유튜브 삽입 및 미리보기 를 위한 설정(iframe)
        customHTMLRenderer={{
          htmlBlock: {
            iframe(node) {
              return [
                {
                  type: "openTag",
                  tagName: "iframe",
                  outerNewLine: true,
                  attributes: node.attrs,
                },
                { type: "html", content: node.childrenHTML },
                {
                  type: "closeTag",
                  tagName: "iframe",
                  outerNewLine: false,
                },
              ];
            },
          },
        }}
      />
    </div>
  );
}
