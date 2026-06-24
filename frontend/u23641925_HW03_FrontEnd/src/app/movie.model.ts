//attributes for eavh movie fetched
export interface Movie {
  Title: string;
  Year: string;
  Runtime: string;
  Genre: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  imdbVotes: string;
  Metascore: string;
  Response: string;
  imdbID: string;
  Type: string;
  timesWatched?: number;
  Id?: number;
}

//api response
export interface OMDbSearchResponse {
  Search: Movie[];
  totalResults: string;
  Response: string;
}