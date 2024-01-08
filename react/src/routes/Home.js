import { useState, useEffect } from "react";
import Movie from "../components/Movie";
import Navybar from "../components/Navybar";

import { useAppSelector } from "../store/store";

function Home({ User }) {
  const state = useAppSelector((state) => state.member); //store => combine reducer 이름명 그룹
  //const dispatch = useAppDispatch();

  console.log("===== Home.js =======");
  console.log(state);
  console.log("===== Home.js =======");

  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const title = "메인화면";

  const getMovies = async () => {
    const response = await fetch(
      `https://yts.mx/api/v2/list_movies.json?minimum_rating=8.5&sort_by=year`
    );
    const json = await response.json();
    //console.log(json);
    setMovies(json.data.movies);
    setLoading(false);
  };
  useEffect(() => {
    getMovies();
  }, []);

  return (
    <div>
      <Navybar title={title} />
      {/* <h1>{state[state.length - 1].user}</h1> */}

      <div style={{ padding: 30 }}>
        <h1>인기 영화 ({movies.length})</h1>
        {loading ? (
          <strong>Loading...</strong>
        ) : (
          <ul>
            {movies.map((item) => (
              <Movie
                key={item.id}
                id={item.id}
                medium_cover_image={item.medium_cover_image}
                title={item.title}
                summary={item.summary}
                genres={item.genres}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
export default Home;
