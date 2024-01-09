const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
//const Memorystore = require("memorystore")(session);
require("dotenv").config(); //.env 불러오기
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

//connection pool 이란?
//데이터베이스 요청이 필요할 때마다 매번 연결을 하게 되면 서버에 부하가 생기므로,
//db와 연결된 connection을 미리 만들어서 pool 속에 저장해두고있다가, 필요할때
//connection을 pool에서 사용하고 다시 pool에 반납한다.
//연결정보를 재사용하니, 비용, 리소스 줄이고, db연결에 걸리는 시간도 적어진다.
const { poolPromise } = require("./db");
const exp = require("constants");

// app 생성
const app = express();
// PORT 번호 기본값 5000으로 설정     npm run start
const PORT = process.env.PORT || 5001;

app.use(
  bodyParser.urlencoded({
    limit: "100mb",
    extended: false,
  })
);

const corsOptions = {
  origin: true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(
  bodyParser.json({
    limit: "100mb",
  })
);

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

//쿠키, 세션 초기설정
app.use(cookieParser(process.env.SESSION_SECRET));

let maxAge = 60 * 60 * 1000; // 맨앞 60이면 60분
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // 세션을 언제나 저장할지 설정함
    saveUninitialized: true, // 세션에 저장할 내역이 없더라도 처음부터 세션을 생성할지 설정
    //store: new Memorystore({ checkPeriod: maxAge }),
    cookie: {
      //세션 쿠키 설정 (세션 관리 시 클라이언트에 보내는 쿠키)
      httpOnly: true, // 자바스크립트를 통해 세션 쿠키를 사용할 수 없도록 함
      maxAge: maxAge,
      sameSite: process.env.NODE_ENV === "production" ? "none" : true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

//랜덤숫자 구하기 min <= number <= max ( max 값 포함) :  rand(100000000, 9999999999999999)
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// multer 설정
try {
  fs.readdirSync("public/uploads"); // 폴더 확인
} catch (err) {
  console.error("uploads 폴더가 없습니다. 폴더를 생성합니다.");
  fs.mkdirSync("public/uploads"); // 폴더 생성
}

const upload = multer({
  storage: multer.diskStorage({
    filename(req, file, done) {
      // 파일명을 어떤 이름으로 올릴지
      const ext = path.extname(file.originalname); // 파일의 확장자
      //done(null, path.basename(file.originalname, ext) + Date.now() + ext); // 파일이름 + 날짜 + 확장자 이름으로 저장
      done(null, Date.now() + ext);
    },
    // 저장한공간 정보 : 하드디스크에 저장
    destination(req, file, done) {
      // 저장 위치
      done(null, path.join(__dirname, "public/uploads/")); // uploads라는 폴더 안에 저장
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5메가로 용량 제한
});

//////////////////////
//API시작
//////////////////////

// 하나의 이미지 파일만 가져온다.
app.post("/img", upload.single("image"), (req, res) => {
  // 해당 라우터가 정상적으로 작동하면 public/uploads에 이미지가 업로드된다.
  // 업로드된 이미지의 URL 경로를 프론트엔드로 반환한다.
  let fname = "";

  // if (req.file.name !== undefined) {
  //   fname = req.file.name;
  // }

  if (req.file.filename !== undefined) {
    fname = req.file.filename;
  } else if (req.file.name !== undefined) {
    fname = req.file.name;
  }
  console.log("전달받은 파일", req.file);
  console.log("저장된 파일의 이름", fname);

  // 파일이 저장된 경로를 클라이언트에게 반환해준다.
  const IMG_URL = `http://192.168.4.76:5001/uploads/${fname}`;
  console.log(IMG_URL);
  res.json({ url: IMG_URL });
});

//로그인 체크
app.post("/login", async (req, res, next) => {
  const user_id = req.body.user_id;
  const user_pw = req.body.user_pw;
  console.log(user_id);

  const pool = await poolPromise;
  const result = await pool.request().query(
    `SELECT [no]
    ,[id_emp]
    ,[id]
    ,[name]
    ,[man]
    ,[worknum]
    ,[corp]
    ,[team_id]
    ,[team]
    ,[teamjang]
    ,[sawon]
    ,[jikchaek]
    ,[retired]
    ,[join_date]
    ,[memo]
    ,[permgroup]
    ,[set_intime]
    ,[set_outtime]
    ,[retire_date]
    ,[web_id]
    ,[emp_order] FROM login WHERE id = '${user_id}' and pw = '${user_pw}'`,
    function (err, value) {
      if (err) {
        console.log(err);
      } else {
        console.log("로그인 체크 접수");
        console.log(value.recordset.length);
        if (value.recordset.length === 0) {
          res.send({ msg: "fail" });
        } else {
          //세션 확인
          req.session.save(function () {
            //req.session.user_id = user_id;  //id로 하면 고정값이 나올수있으므로 난수로
            req.session.user_id = rand(100000000, 9999999999999999);
            console.log("session: " + req.session.user_id);
            res.send({
              msg: "true",
              server_session: req.session.user_id,
              value: value.recordset,
            });
          });
        }
      }
    }
  );
});

//로그인 인증 체크
app.post("/auth", async (req, res, next) => {
  if (req.body.client_session) {
    console.log("auth체크:" + req.body.client_session);
    res.send({ msg: "auth_true" });
  } else {
    console.log("auth체크:" + req.body.client_session);
    res.send({ msg: "auth_false" });
  }
});

//세션 인증 체크 - 서버 세션제대로 로컬에 등록을 못함. 로컬에서 수동으로 로컬스토리지등록
app.get("/session", async (req, res, next) => {
  console.log(req.session.user_id);
  res.send(req.session.user_id);
});

//로그아웃
app.get("/logout", async (req, res, next) => {
  res.send({ msg: "logout" });
});

//내 출석체크 확인
app.post("/mycheck", async (req, res, next) => {
  const userName = req.body.name;
  const startValue = req.body.start;
  const endValue = req.body.end;
  console.log("Mycheck:" + userName);

  const pool = await poolPromise;
  const result = await pool
    .request()
    .query(
      `SELECT * from time_check_dev where workdate >= '${startValue}' and workdate <= '${endValue}' and name = '${userName}'`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          console.log("근태조회 API 로드 완료.");
          res.send(value);
        }
      }
    );
});

//내 출석 업데이트
app.post("/mycheck_update", async (req, res, next) => {
  const userName = req.body.name;
  const workDate = req.body.workdate;
  const inTime = req.body.intime;
  const outTime = req.body.outtime;
  const prog = req.body.prog;
  console.log("Update:" + userName);

  const pool = await poolPromise;
  let result = await pool
    .request()
    .query(
      `UPDATE time_check_dev SET in_time = '${inTime}', out_time = '${outTime}', progress_study = '${prog}' WHERE name = '${userName}' AND workdate = '${workDate}'`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          // const send_data = value.recordset;
          console.log("근태조회 업데이트 완료 !!!!!");
          res.send({ msg: "업데이트 완료" });
        }
      }
    );
});

//게시판리스트 조회
app.post("/board_list", async (req, res, next) => {
  const client_keycode = req.body.keycode;

  const pool = await poolPromise;
  const result = await pool
    .request()
    .query(
      `SELECT * from board WHERE code = '${client_keycode}' ORDER BY no ASC`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          // const send_data = value.recordset;
          console.log("complete select board !!!!!");
          res.send(value);
        }
      }
    );
});

//게시판 글쓰기 입력
app.post("/board_write", async (req, res, next) => {
  const client_key = req.body.code_key;
  const client_email = req.body.email;
  const client_name = req.body.name;
  const client_title = req.body.title;
  const client_content = req.body.content;

  //moment.js 현지 로컬 시간으로 저장
  const m = moment().tz("Asia/Seoul");
  const client_wdate = m.format("YYYY-MM-DD HH:mm:ss");
  console.log(client_wdate);

  const pool = await poolPromise;
  const result = await pool
    .request()
    .query(
      `INSERT INTO board (code, name, title, contents, wdate, email) VALUES ('${client_key}', '${client_name}', '${client_title}', '${client_content}', convert(datetime, '${client_wdate}'), '${client_email}')`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          // const send_data = value.recordset;
          console.log("complete insert!!!!!");
          res.send({ result: "complete" });
        }
      }
    );
});

//게시판 글쓰기 입력
app.post("/board_update", async (req, res, next) => {
  const client_id = req.body.board_id;
  const client_name = req.body.name;
  const client_title = req.body.title;
  const client_content = req.body.content;

  //moment.js 현지 로컬 시간으로 저장
  const m = moment().tz("Asia/Seoul");
  const client_wdate = m.format("YYYY-MM-DD HH:mm:ss");
  console.log(client_wdate);

  const pool = await poolPromise;
  const result = await pool
    .request()
    .query(
      `UPDATE board SET title = '${client_title}', contents = '${client_content}', udate = convert(datetime, '${client_wdate}') WHERE no = ${client_id}`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          // const send_data = value.recordset;
          console.log("complete insert!!!!!");
          res.send({ result: "complete" });
        }
      }
    );
});
//게시판 내용 확인
app.post("/board_view", async (req, res, next) => {
  const client_id = req.body.board_id;
  console.log(client_id);
  const pool = await poolPromise;
  const result = await pool
    .request()
    .query(
      `SELECT * from board WHERE no = '${client_id}'`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          // const send_data = value.recordset;
          console.log("complete view board !!!!!");
          res.send(value);
        }
      }
    );
});

//게시판 내용 삭제
app.post("/board_delete", async (req, res, next) => {
  const client_id = req.body.board_id;
  const client_email = req.body.board_email;
  const client_pass = req.body.board_pass;

  console.log(client_id + ", " + client_email + ", " + client_pass);

  const pool = await poolPromise;

  const result2 = await pool
    .request()
    .query(
      `SELECT * FROM login WHERE id = '${client_email}' and pw = '${client_pass}'`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          // const send_data = value.recordset;
          console.log("게시판 삭제용 회원조회 !!!!!");

          if (value.recordset.length === 0) {
            console.log(value.recordset.length);
            res.send({ msg: "no" });
          } else {
            const result3 = pool
              .request()
              .query(
                `DELETE board WHERE no = ${client_id}`,
                function (err, value) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("complete delete board !!!!!");
                  }
                }
              );
            res.send({ msg: "yes" });
          }
        }
      }
    );
});

//게시판 내용 삭제
app.post("/board_modify", async (req, res, next) => {
  const client_id = req.body.board_id;
  const client_email = req.body.board_email;
  const client_pass = req.body.board_pass;

  console.log(client_id + ", " + client_email + ", " + client_pass);

  const pool = await poolPromise;

  const result2 = await pool
    .request()
    .query(
      `SELECT * FROM login WHERE id = '${client_email}' and pw = '${client_pass}'`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          // const send_data = value.recordset;
          console.log("게시판 삭제용 회원조회 !!!!!");

          if (value.recordset.length === 0) {
            console.log(value.recordset.length);
            res.send({ msg: "no" });
          } else {
            res.send({ msg: "yes" });
          }
        }
      }
    );
});

///
/// svelte ai project용
///
///

//project 추가
app.post("/add_ai_project", async (req, res, next) => {
  const client_project = req.body.project;

  //moment.js 현지 로컬 시간으로 저장
  const m = moment().tz("Asia/Seoul");
  const client_wdate = m.format("YYYY-MM-DD HH:mm:ss");
  console.log(client_wdate);

  const pool = await poolPromise;
  const result = await pool
    .request()
    .query(
      `INSERT INTO ai_project (project, created) VALUES ('${client_project}', convert(datetime, '${client_wdate}') )`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          console.log("complete insert!!!!!");
          res.send({ result: "complete" });
        }
      }
    );
});

//project 삭제
app.post("/delete_ai_project", async (req, res, next) => {
  const client_name = req.body.project_name;

  //console.log(client_name);

  const pool = await poolPromise;
  const result = await pool
    .request()
    .query(
      `DELETE FROM ai_project WHERE project = '${client_name}'`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          console.log("complete delete A DB!!!!!");
          //res.send({ result: "complete delete A DB!!!!!" });
        }
      }
    );

  const result2 = await pool
    .request()
    .query(
      `DELETE FROM ai_project_files WHERE project = '${client_name}'`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          console.log("complete delete B DB!!!!!");
          res.send({ result: "complete delete A, B DB!!!!!" });
        }
      }
    );
});

//PDF 파일추가 기록
app.post("/add_ai_project_files", async (req, res, next) => {
  const client_project = req.body.project;
  const client_filename = req.body.filename;

  //moment.js 현지 로컬 시간으로 저장
  const m = moment().tz("Asia/Seoul");
  const client_wdate = m.format("YYYY-MM-DD HH:mm:ss");
  console.log(client_wdate);

  const pool = await poolPromise;
  const result = await pool
    .request()
    .query(
      `INSERT INTO ai_project_files (project, filename, created) VALUES ('${client_project}', '${client_filename}', convert(datetime, '${client_wdate}') )`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          console.log("complete insert - MSSQL !!!!!");
          res.send({ result: "complete insert - MSSQL !!!!!" });
        }
      }
    );
});

//PDF 파일삭제 기록
app.post("/delete_ai_project_files", async (req, res, next) => {
  const client_project = req.body.project;
  const client_filename = req.body.filename;

  const pool = await poolPromise;
  const result = await pool
    .request()
    .query(
      `DELETE FROM ai_project_files WHERE filename = '${client_filename}'`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          console.log("complete delete - MSSQL !!!!!");
          res.send({ result: "complete delete - MSSQL !!!!!" });
        }
      }
    );
});

//프로젝트 리스트 확인
app.post("/view_ai_project", async (req, res, next) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .query(`SELECT * from ai_project`, function (err, value) {
      if (err) {
        console.log(err);
      } else {
        console.log("complete view DB list !!!!!");
        res.send(value);
      }
    });
});
//선택 프로젝트 파일 리스트 확인
app.post("/view_ai_project_files", async (req, res, next) => {
  const client_project = req.body.project;
  const pool = await poolPromise;
  const result = await pool
    .request()
    .query(
      `SELECT * from ai_project_files WHERE project = '${client_project}'`,
      function (err, value) {
        if (err) {
          console.log(err);
        } else {
          console.log("complete view DB list !!!!!");
          res.send(value);
        }
      }
    );
});

//파이썬에서 여기로 접속 테스트, req.body 로 받음
app.post("/py", async (req, res, next) => {
  console.log(req.body.param1);
  res.send({
    msg:
      "success~~~~~~~~~~~~~ value:" +
      req.body.param1 +
      " / " +
      req.body.param2 +
      " / " +
      req.body.param3,
  });
});

// 첫번째 인자로 PORT 번호 5001 5001 5001 5001 5001 5001
// 두번째 인자로 callback 함수를 통해 server 구축 성공시 console log
app.listen(PORT, () => console.log(`HRM API Server started on port ${PORT}`));
