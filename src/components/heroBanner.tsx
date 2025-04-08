import { div } from "framer-motion/client";
import { Star, Clock, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

function HeroBanner() {

    const [movies, setMovies] = useState<{id: number; runtime?:number; title: string; genre_ids: number; overview: string; release_date: string; vote_average: number; poster_path: string}[]>([]);
    const [runtime, setRunTime] = useState<{id: number; runtime:number}[]>([]);

    const fetchMovieTime = (movieId: number) => {
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=12923231fddd461a9280cdc286a6bee5&language=pt-BR`)
            .then((response) => response.json())
            .then((movieTime) => {
                setMovies((prevMovies) =>
                    prevMovies.map((movie) =>
                        movie.id === movieId ? { ...movie, runtime: movieTime.runtime } : movie
                    )
                );
            })
            .catch((error) => {
                console.error("Error fetching movie time:", error);
            });
    };
    

    const fetchData = () => {
        fetch(
            `https://api.themoviedb.org/3/trending/movie/day?language=pt-BR&page=1&api_key=12923231fddd461a9280cdc286a6bee5`
        )
        .then((response) => response.json())
        .then((data) => {
            const today = new Date(); 
            const top5 = data['results']
                .filter((movie: { release_date: string }) => {
                    const releaseDate = new Date(movie.release_date);
                    return releaseDate <= today; 
                })
                .slice(0, 5); 
            setMovies(top5);
            top5.forEach((movie: { id: number; title: string; genre_ids: number; overview: string; release_date: string; vote_average: number; poster_path: string }) => {
                console.log(`Título: ${movie.title}, 
                            Id dos gêneros: ${movie.genre_ids},
                            Descrição: ${movie.overview}, 
                            Lançamento: ${movie.release_date},
                            Notas: ${movie.vote_average},
                            Link do poster: https://image.tmdb.org/t/p/w500${movie.poster_path}`);
                fetchMovieTime(movie.id);
            });
            console.log(top5);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
        {movies.map((movie) => (
            <div className="relative w-full h-screen mt-4">
                <img
                    className="absolute top-0 left-0 w-full h-full object-cover" 
                    src={`https://image.tmdb.org/t/p/original${movie.poster_path}`} 
                    alt={movie.title}
                />
                <div className="relative z-10 flex flex-col items-start justify-center h-full px-8 text-white bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                    
                    
                    <div>
                        <div>
                            <h1 className="text-4xl font-bol d">{movie.title}</h1>
                        </div>
                        <div>
                            <div></div>
                            <div>
                                <div>
                                    <span>{new Date(movie.release_date).getFullYear()}</span>
                                    <Calendar color="#fff"/>    
                                </div>
                                <div>
                                    <span>{movie.runtime} min</span>
                                    <Clock color="#fff"/>  
                                </div>
                                <div>
                                    <span>{movie.vote_average.toFixed(1)}</span>
                                    <Star color="#fff"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                       <p className="mt-4 text-lg">{movie.overview}</p> 
                    </div>
                </div>
            </div>
        ))}
        </>
    );
};

export default HeroBanner;