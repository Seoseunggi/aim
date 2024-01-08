import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import Detail from "./routes/Detail";
import Mychk from "./routes/Mychk";
import Board_list from "./routes/Board_list";
import Board_write from "./routes/Board_write";
import Board_view from "./routes/Board_view";
import Board_modify from "./routes/Board_modify";
import Board_toastui from "./routes/Board_toastui";

import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Login/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<Detail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mychk/" element={<Mychk />} />
        <Route path="/board_list/" element={<Board_list />} />
        <Route path="/board_write/" element={<Board_write />} />
        <Route path="/board_modify/:id" element={<Board_modify />} />
        <Route path="/board_view/:id" element={<Board_view />} />
        <Route path="/board_toastui" element={<Board_toastui />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
