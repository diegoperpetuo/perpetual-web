import { useEffect } from "react";

function HeroBanner() {

    const fetchMovieTime = (movieId: number) => {
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=12923231fddd461a9280cdc286a6bee5&language=pt-BR`)
        .then((response) => response.json())
        .then((movieTime) => {
            console.log(`Duração do filme: ${movieTime.runtime} minutos`);
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

            top5.forEach((movie: { id: number; title: string; genre_ids: number; overview: string; release_date: string; vote_average: number }) => {
                console.log(`Título: ${movie.title}, 
                            Id dos gêneros: ${movie.genre_ids},
                            Descrição: ${movie.overview}, 
                            Lançamento: ${movie.release_date},
                            Notas: ${movie.vote_average}`);
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
        </>
    );
};

export default HeroBanner;