import Home from "./Home.svelte";
import Write from "./Write.svelte";
import View from "./View.svelte";
import Board_write from "./Board_write.svelte";
import Gpt from "./Gpt.svelte";

import "bootstrap/dist/css/bootstrap.min.css";

export default {
  "/": Home,
  "/write": Write,
  "/View/:id": View,
  "/board_write": Board_write,
  "/gpt": Gpt,
};
