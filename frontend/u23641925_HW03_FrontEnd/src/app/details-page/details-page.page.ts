import { Component, OnInit } from '@angular/core';
import { MovieDataService } from '../services/movie-data.services'; 
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.page.html',
  styleUrls: ['./details-page.page.scss'],
  standalone: false
})

export class DetailsPagePage implements OnInit {
  movie: any = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  isLoggedIn: boolean = false; 

  constructor(
    private movieService: MovieDataService,
    private authService: AuthService
  ) {}

  // initialize the component and load movie details
  async ngOnInit() {
    this.isLoggedIn = await this.authService.isLoggedIn(); 

    const state = history.state as { movie: any };
    if (state?.movie?.imdbID) {
      this.movieService.getMovieById(state.movie.imdbID).subscribe({
        next: (response) => {
          this.movie = response;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load movie details';
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'No movie data available';
      this.isLoading = false;
    }
  }

  goBack() { window.history.back(); }

  // method to add movie to Watched List
  async addToWatchlist() {
    if (!this.movie) return;

    if (!this.isLoggedIn) {
      alert('Please log in to save movies');
      return;
    }

    const userId = await this.authService.getUserId(); 

    const payload = {
      userId: userId,
      movieId: this.movie.imdbID
    };

    this.movieService.addWatchByUserId(payload).subscribe({
      next: () => {
        alert(`✓ "${this.movie.Title}" added to Watchlist!`);
      },
      error: (err) => {
        if (err.status === 400) {
          alert('Movie already in your Watchlist');
        } else {
          alert('Failed to add to Watchlist. Please try again later');
        }
      }
    });
  }

  // method to add movie to Watched List
  async addToWatchedlist() {
    if (!this.movie) return;

    if (!this.isLoggedIn) {
      alert('Please log in to save movies');
      return;
    }

    const userId = await this.authService.getUserId(); 

    const payload = {
      userId: userId,
      movieId: this.movie.imdbID
    };

    this.movieService.addWatchedByUserId(payload).subscribe({
      next: () => {
        alert(`✓ "${this.movie.Title}" added to Watched List!`);
      },
      error: (err) => {
        if (err.status === 400) {
          alert('Movie already in your Watched List');
        } else {
          alert('Failed to add to Watched List');
        }
      }
    });
  }
}