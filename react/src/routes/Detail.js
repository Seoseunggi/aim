import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function Detail() {
  const [movies, setMovies] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const getMovie = async () => {
      const response = await fetch(
        `https://yts.mx/api/v2/movie_details.json?movie_id=${id}`
      );
      const json = await response.json();
      console.log(json);
      setMovies(json.data.movie);
      console.log("movies:" + movies.title);
    };

    getMovie();
  }, [id, movies.title]);

  return (
    <div>
      <Link to={"/"}>Home</Link>&nbsp;
      <div>
        <img src={movies.medium_cover_image} alt={movies.title} />
        <h2>{movies.title}</h2>
        <p>{movies.summary}</p>
        <ul>
          {movies.genres?.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Detail;
