import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Movie, OMDbSearchResponse } from "../movie.model";

@Injectable({
    providedIn: 'root',
})

export class MovieDataService{

    //declare variable to store url of API
    private movieUrl = 'https://localhost:7149/api/movie';
    private listUrl = 'https://localhost:7149/api/list';

    //contructor will pass httpclient so we can send httprequets
    constructor(private http:HttpClient){}

    //------------------------OMDB---------------------------------------------//
    //search movies : GET /api/movies/search?t={Title}
    searchMovies(title: string): Observable<OMDbSearchResponse> {
        return this.http.get<OMDbSearchResponse>(`${this.movieUrl}/search?title=${title}`);
    }

    //get movie by id : GET /api/movies/id
    getMovieById(id:string):Observable<Movie>{
        return this.http.get<Movie>(`${this.movieUrl}/${id}?plot=full`); 
    }


    //--------------------WATCHLIST-----------------------------------//    
    //get by user id : GET /api/watchlist  no id parameter bcs api uses string id
    getWatchlist(): Observable<any>{
        return this.http.get(`${this.listUrl}/watchlist`);
    }

    //add to watch : POST /api/watchlist
    addWatchByUserId(watchlist: any): Observable<any> {
        return this.http.post(`${this.listUrl}/watchlist`, watchlist);
    }

    //delete movie from watched : DELETE /api/watchlist/title
    deleteWatch(id: number): Observable<any> {
        return this.http.delete(`${this.listUrl}/watch/${id}`);
    }


    //---------------------WATCHED LIST----------------------------------//
    //get by user id : GET /api/watched no id parameter bcs api uses string id
    getWatchedList(): Observable<any>{
        return this.http.get(`${this.listUrl}/watchedlist`);
    }

    //add to watched : POST /api/watched
    addWatchedByUserId(watchedlist: any): Observable<any> {
        return this.http.post(`${this.listUrl}/watched`, watchedlist);
    }

    //reset times watched : POST /api/watched/reset/ID
    resetTimesWatched(id: number): Observable<any> {
    return this.http.post(
        `${this.listUrl}/reset/${id}`,
        {},
        { responseType: 'text' as 'json' });
    }

    //increment times watched : PUT /api/watched/ID
    incrementTimesWatched(id: number): Observable<any> {
        return this.http.put(`${this.listUrl}/watched/${id}`, {});
    }

    //decrement times watched : PUT /api/watchedadd/ID
    decrementTimesWatched(id: number): Observable<any> {
        return this.http.put(`${this.listUrl}/watchedremove/${id}`, {});
    }

    //delete movie from watched : DELETE /api/watched/ID 
    deleteWatched(id: number): Observable<any> {
        return this.http.delete(`${this.listUrl}/watched/${id}`);
    }

    // search by genre for recommendations
    searchByGenre(genre: string): Observable<any> {
        return this.http.get(`${this.movieUrl}/search?title=${genre}`);
    }
}