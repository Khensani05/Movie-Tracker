import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Movie } from '../movie.model';
import { MovieDataService } from '../services/movie-data.services';
import { Router } from '@angular/router';
import { StorageService } from '../storage.service';
import { AuthService } from '../services/auth-service';
import { ViewWillEnter } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false
})
export class TabsPage implements OnInit, ViewWillEnter {

  //initialised to start with empty lists
  searchResult: Movie[] = [];
  searchWord: string = '';
  isLoading: boolean = false;
  watchlistMovies: Movie[] = [];
  watchedListMovies: any[] = [];
  isLoadingWatchlist: boolean = false;
  isLoadingWatched: boolean = false;

  //for statics dashboard
  movieDetails: any[] = [];
  isLoadingStats: boolean = false;
  statsLoaded: boolean = false;
  topGenres: string[] = [];
  recommendationTable: any[] = [];

  //changed to use authservice to check if user is logged in
  userId: number = 0;
  isLoggedIn: boolean = false;

  constructor(
    private router: Router,
    private movieService: MovieDataService,
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  //load API default movies available
  async ngOnInit() {
    this.loadDefaultMovies();
  }

  //for the tabs to refresh based on which user is logged in - use isLoggedIn method in authservice
  async ionViewWillEnter() {
    this.isLoggedIn = await this.authService.isLoggedIn();
    this.userId = await this.authService.getUserId();

    if (this.isLoggedIn) {
      // Load both lists properly with full movie details
      await this.loadWatchlist();
      await this.loadWatchedList();  // Make sure this loads full details
      await this.loadStatsData();
    } else {
      this.watchlistMovies = [];
      this.watchedListMovies = [];
    }
  }

  //get user watch list in storage
  loadWatchlist(): Promise<void> {
    if (!this.isLoggedIn) return Promise.resolve();
    this.isLoadingWatchlist = true;

    return new Promise((resolve) => {
      this.movieService.getWatchlist().subscribe({
        next: async (list) => {
          try {
            const details = await Promise.all(
              list.map(async (item: any) => {
                try {
                  const movie = await this.movieService.getMovieById(item.movieId).toPromise();
                  return { ...movie, id: item.id, movieId: item.movieId };
                } catch (err) {
                  console.error(`Failed to fetch movie ${item.movieId}:`, err);
                  return null;
                }
              })
            );
            this.watchlistMovies = details.filter((d: any) => d && d.Response === 'True');
            console.log('Watchlist loaded:', this.watchlistMovies); // Debug log
          } catch (error) {
            console.error('Error loading watchlist details:', error);
          }
          this.isLoadingWatchlist = false;
          resolve();
        },
        error: (error) => {
          console.error('Error fetching watchlist:', error);
          this.isLoadingWatchlist = false;
          resolve();
        }
      });
    });
  }

  //get user watched list in storage
  loadWatchedList(): Promise<void> {
    if (!this.isLoggedIn) return Promise.resolve();
    this.isLoadingWatched = true;

    return new Promise((resolve) => {
      this.movieService.getWatchedList().subscribe({
        next: async (list) => {
          try {
            const details = await Promise.all(
              list.map(async (item: any) => {
                try {
                  const movie = await this.movieService.getMovieById(item.movieId).toPromise();
                  return { ...movie, id: item.id, movieId: item.movieId, timesWatched: item.timesWatched };
                } catch (err) {
                  console.error(`Failed to fetch watched movie ${item.movieId}:`, err);
                  return null;
                }
              })
            );
            this.watchedListMovies = details.filter((d: any) => d && d.Response === 'True');
            console.log('Watched list loaded:', this.watchedListMovies); // Debug log
          } catch (error) {
            console.error('Error loading watched list details:', error);
          }
          this.isLoadingWatched = false;
          resolve();
        },
        error: (error) => {
          console.error('Error fetching watched list:', error);
          this.isLoadingWatched = false;
          resolve();
        }
      });
    });
  }

  //when there is no poster
  getPosterUrl(poster: string): string {
    if (!poster || poster === 'N/A' || poster === '') {
      return 'assets/default-poster.png';
    }
    return poster;
  }

  //load API default movies
  loadDefaultMovies() {
    this.isLoading = true;

    this.movieService.searchMovies('movie').subscribe({
      next: (response) => {
        this.searchResult = response.Search || []; //get array from insdie search
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  //search bar metho
  onSearch() {

    //look at word in search bar
    if (!this.searchWord?.trim()) { this.loadDefaultMovies(); return; }
    this.isLoading = true;

    //if movie esists fetch matching results
    this.movieService.searchMovies(this.searchWord.trim()).subscribe({
      next: (response) => { 
        this.searchResult = response.Search; 
        this.isLoading = false; 
      },
      error: () => { this.searchResult = []; this.isLoading = false; }
    });
  }

  //when click on movie card take movie from search tab to details
  getMovieDetails(movie: any) {
    this.router.navigate(['/details-page'], { state: { movie } });
  }

  //------------------WATCHED LIST----------------------------//
  saveToWatchedList(event: Event, movie: any) {
    event.stopPropagation();

    if (!this.isLoggedIn) { 
      alert('Please log in to save movies'); 
      return; 
    }

    console.log('Moving to watched list, movie details:', movie);

    const loading = document.createElement('ion-loading');
    loading.message = 'Moving to Watched List...';
    document.body.appendChild(loading);
    loading.present();

    const payload = {
      userId: this.userId,
      movieId: movie.imdbID
    };

    // Step 1: Add to watched list
    this.movieService.addWatchedByUserId(payload).subscribe({
      next: (response) => {
        console.log('Added to watched list successfully', response);
        
        // Step 2: If movie has an id (from watchlist), remove it from watchlist
        if (movie.id) {
          console.log('Removing from watchlist, id:', movie.id);
          this.movieService.deleteWatch(movie.id).subscribe({
            next: () => {
              console.log('Removed from watchlist successfully');
              this.isLoadingWatchlist = true;
              this.isLoadingWatched = true;
              
              // Reload both lists and wait for completion
              this.movieService.getWatchlist().subscribe({
                next: async (list) => {
                  try {
                    const details = await Promise.all(
                      list.map(async (item: any) => {
                        try {
                          const m = await this.movieService.getMovieById(item.movieId).toPromise();
                          return { ...m, id: item.id, movieId: item.movieId };
                        } catch (err) {
                          console.error(`Failed to fetch movie ${item.movieId}:`, err);
                          return null;
                        }
                      })
                    );
                    this.watchlistMovies = details.filter((d: any) => d && d.Response === 'True');
                  } catch (error) {
                    console.error('Error loading watchlist details:', error);
                  }
                  this.isLoadingWatchlist = false;
                }
              });

              this.movieService.getWatchedList().subscribe({
                next: async (list) => {
                  try {
                    const details = await Promise.all(
                      list.map(async (item: any) => {
                        try {
                          const m = await this.movieService.getMovieById(item.movieId).toPromise();
                          return { ...m, id: item.id, movieId: item.movieId, timesWatched: item.timesWatched };
                        } catch (err) {
                          console.error(`Failed to fetch watched movie ${item.movieId}:`, err);
                          return null;
                        }
                      })
                    );
                    this.watchedListMovies = details.filter((d: any) => d && d.Response === 'True');
                    loading.dismiss();
                    alert(`✓ "${movie.Title}" moved to Watched List!`);
                  } catch (error) {
                    console.error('Error loading watched list details:', error);
                    loading.dismiss();
                    alert('Error refreshing lists');
                  }
                  this.isLoadingWatched = false;
                },

                error: (error) => {
                  console.error('Error fetching watched list:', error);
                  this.isLoadingWatched = false;
                  loading.dismiss();
                  alert('Error refreshing lists');
                }
              });
            },
            error: (err) => {
              console.error('Error removing from watchlist:', err);
              this.isLoadingWatched = true;
              this.movieService.getWatchedList().subscribe({
                next: async (list) => {
                  try {
                    const details = await Promise.all(
                      list.map(async (item: any) => {
                        try {
                          const m = await this.movieService.getMovieById(item.movieId).toPromise();
                          return { ...m, id: item.id, movieId: item.movieId, timesWatched: item.timesWatched };
                        } catch (err) {
                          console.error(`Failed to fetch watched movie ${item.movieId}:`, err);
                          return null;
                        }
                      })
                    );
                    this.watchedListMovies = details.filter((d: any) => d && d.Response === 'True');
                  } catch (error) {
                    console.error('Error loading watched list details:', error);
                  }
                  this.isLoadingWatched = false;
                  loading.dismiss();
                  alert(`⚠️ "${movie.Title}" added to Watched List but could not be removed from Watchlist. Please manually remove it.`);
                },

                error: (error) => {
                  console.error('Error fetching watched list:', error);
                  this.isLoadingWatched = false;
                  loading.dismiss();
                  alert('Error refreshing lists');
                }
              });
            }
          });
        } else {
          // Movie came from search tab, just load watched list
          this.isLoadingWatched = true;
          this.movieService.getWatchedList().subscribe({
            next: async (list) => {
              try {
                const details = await Promise.all(
                  list.map(async (item: any) => {
                    try {
                      const m = await this.movieService.getMovieById(item.movieId).toPromise();
                      return { ...m, id: item.id, movieId: item.movieId, timesWatched: item.timesWatched };
                    } catch (err) {
                      console.error(`Failed to fetch watched movie ${item.movieId}:`, err);
                      return null;
                    }
                  })
                );
                this.watchedListMovies = details.filter((d: any) => d && d.Response === 'True');
                loading.dismiss();
                alert(`✓ "${movie.Title}" added to Watched List!`);
              } catch (error) {
                console.error('Error loading watched list details:', error);
                loading.dismiss();
                alert('Error refreshing lists');
              }
              this.isLoadingWatched = false;
            },

            error: (error) => {
              console.error('Error fetching watched list:', error);
              this.isLoadingWatched = false;
              loading.dismiss();
              alert('Error refreshing lists');
            }
          });
        }
      },
      error: (err) => {
        loading.dismiss();
        if (err.status === 400) { 
          alert('Movie already in your Watched List'); 
        } else {
          console.error('Error adding to watched list:', err);
          alert('Error adding movie to Watched List');
        }
      }
    });
  }

  //------------------WATCHLIST----------------------------//

  saveToWatchlist(event: Event, movie: any) {
    event.stopPropagation();

    //check if user is logged in before allowing to save to watchlist
    if (!this.isLoggedIn) { 
      alert('Please log in to save movies'); 
      return; 
    }

    console.log('Moving to watchlist, movie details:', movie);

    const loading = document.createElement('ion-loading');
    loading.message = 'Moving to Watchlist...';
    document.body.appendChild(loading);
    loading.present();

    //payload to send to backend when adding to watchlist
    const payload = {
      userId: this.userId,
      movieId: movie.imdbID
    };

    // add to watchlist
    this.movieService.addWatchByUserId(payload).subscribe({
      next: () => {
        console.log('Successfully added to watchlist');
        
        // If this movie came from watched list (has an id), remove it
        if (movie.id) {
          console.log('Attempting to remove from watched list, id:', movie.id);
          
          // Remove from watched list
          this.movieService.deleteWatched(movie.id).subscribe({
            next: () => {
              console.log('Successfully removed from watched list');
              this.isLoadingWatchlist = true;
              this.isLoadingWatched = true;
              
              // Reload both lists and wait for completion
              this.movieService.getWatchlist().subscribe({
                next: async (list) => {
                  try {
                    const details = await Promise.all(
                      list.map(async (item: any) => {
                        try {
                          const m = await this.movieService.getMovieById(item.movieId).toPromise();
                          return { ...m, id: item.id, movieId: item.movieId };
                        } catch (err) {
                          console.error(`Failed to fetch movie ${item.movieId}:`, err);
                          return null;
                        }
                      })
                    );
                    this.watchlistMovies = details.filter((d: any) => d && d.Response === 'True');
                  } catch (error) {
                    console.error('Error loading watchlist details:', error);
                  }
                  this.isLoadingWatchlist = false;
                }
              });

              // Reload watched list to refresh
              this.movieService.getWatchedList().subscribe({
                next: async (list) => {
                  try {
                    const details = await Promise.all(
                      list.map(async (item: any) => {
                        try {
                          const m = await this.movieService.getMovieById(item.movieId).toPromise();
                          return { ...m, id: item.id, movieId: item.movieId, timesWatched: item.timesWatched };
                        } catch (err) {
                          console.error(`Failed to fetch watched movie ${item.movieId}:`, err);
                          return null;
                        }
                      })
                    );
                    this.watchedListMovies = details.filter((d: any) => d && d.Response === 'True');
                    loading.dismiss();
                    alert(`✓ "${movie.Title}" moved to Watchlist!`);
                  } catch (error) {
                    console.error('Error loading watched list details:', error);
                    loading.dismiss();
                    alert('Error refreshing lists');
                  }
                  this.isLoadingWatched = false;
                },

                error: (error) => {
                  console.error('Error fetching watched list:', error);
                  this.isLoadingWatched = false;
                  loading.dismiss();
                  alert('Error refreshing lists');
                }
              });
            },
            error: (err) => {
              console.error('Error removing from watched list:', err);
              this.isLoadingWatchlist = true;
              this.movieService.getWatchlist().subscribe({
                next: async (list) => {
                  try {
                    const details = await Promise.all(
                      list.map(async (item: any) => {
                        try {
                          const m = await this.movieService.getMovieById(item.movieId).toPromise();
                          return { ...m, id: item.id, movieId: item.movieId };
                        } catch (err) {
                          console.error(`Failed to fetch movie ${item.movieId}:`, err);
                          return null;
                        }
                      })
                    );
                    this.watchlistMovies = details.filter((d: any) => d && d.Response === 'True');
                  } catch (error) {
                    console.error('Error loading watchlist details:', error);
                  }
                  this.isLoadingWatchlist = false;
                  loading.dismiss();
                  alert(`⚠️ "${movie.Title}" added to Watchlist but could not be removed from Watched List. Please manually remove it.`);
                },
                error: (error) => {
                  console.error('Error fetching watchlist:', error);
                  this.isLoadingWatchlist = false;
                  loading.dismiss();
                  alert('Error refreshing lists');
                }
              });
            }
          });
        } else {
          // Movie came from search tab - load watchlist
          this.isLoadingWatchlist = true;

          // Reload watchlist to refresh
          this.movieService.getWatchlist().subscribe({
            next: async (list) => {
              try {
                const details = await Promise.all(
                  list.map(async (item: any) => {
                    try {

                      const m = await this.movieService.getMovieById(item.movieId).toPromise();
                      return { ...m, id: item.id, movieId: item.movieId };
                    } catch (err) {
                      console.error(`Failed to fetch movie ${item.movieId}:`, err);
                      return null;
                    }
                  })
                );
                // Update watchlist with new details
                this.watchlistMovies = details.filter((d: any) => d && d.Response === 'True');
                loading.dismiss();
                alert(`✓ "${movie.Title}" added to Watchlist!`);
              } catch (error) {
                console.error('Error loading watchlist details:', error);
                loading.dismiss();
                alert('Error refreshing lists');
              }
              this.isLoadingWatchlist = false;
            },
            error: (error) => {
              console.error('Error fetching watchlist:', error);
              this.isLoadingWatchlist = false;
              loading.dismiss();
              alert('Error refreshing lists');
            }
          });
        }
      },
      error: (err) => {
        console.error('Error adding to watchlist:', err);
        loading.dismiss();
        if (err.status === 400) {
          alert('Movie already in your Watchlist');
        } else {
          alert('Error adding movie to Watchlist');
        }
      }
    });
  }

  //resert times watched to 1
  resetTimesWatched(event: Event, movie: any) {
    event.stopPropagation();
    if (!this.isLoggedIn) return;

    this.movieService.resetTimesWatched(movie.id).subscribe({
      next: () => this.loadWatchedList()
    });
  }

  // Increment times watched
  incrementTimesWatched(event: Event, movie: any) {
    event.stopPropagation();

    if (!this.isLoggedIn) return;

    this.movieService.incrementTimesWatched(movie.id).subscribe({
      next: () => this.loadWatchedList()
    });
  }

  // Decrement times watched but prevent going below 0
  decrementTimesWatched(event: Event, movie: any) {
    event.stopPropagation();
    if (!this.isLoggedIn) return;

    this.movieService.decrementTimesWatched(movie.id).subscribe({
      next: () => this.loadWatchedList()
    });
  }

  //allow 3 movies in a row
  getMoviesInRow(startIndex: number): Movie[] {
    return Array.from({ length: 3 }, (_, i) => this.searchResult[startIndex + i]).filter(Boolean);
  }

  //user log out set list to empty
  async logOut() {
    await this.authService.logout();
    this.isLoggedIn = false;
    this.watchlistMovies = [];
    this.watchedListMovies = [];
    alert('You have been logged out');
    this.router.navigate(['/login-page']); //navigate to blogin
  }

  //user wants to login redirect to login page
  logIn() {
    this.router.navigate(['/login-page']);
  }

  //delete movie from watch list and refresh
  removeFromWatchlist(event: Event, movie: any) {
    event.stopPropagation();
    if (!this.isLoggedIn) return;

    const loading = document.createElement('ion-loading');
    loading.message = 'Removing from Watchlist...';
    document.body.appendChild(loading);
    loading.present();

    this.movieService.deleteWatch(movie.id).subscribe({
      next: () => {
        this.isLoadingWatchlist = true;
        this.movieService.getWatchlist().subscribe({
          next: async (list) => {
            try {
              const details = await Promise.all(
                list.map(async (item: any) => {
                  try {
                    const movie = await this.movieService.getMovieById(item.movieId).toPromise();
                    return movie;
                  } catch (err) {
                    console.error(`Failed to fetch movie ${item.movieId}:`, err);
                    return null;
                  }
                })
              );
              this.watchlistMovies = details.filter((d: any) => d && d.Response === 'True');
              loading.dismiss();
              alert(`✓ "${movie.Title}" removed from Watchlist`);
            } catch (error) {
              console.error('Error loading watchlist details:', error);
              loading.dismiss();
              alert('Error refreshing watchlist');
            }
            this.isLoadingWatchlist = false;
          },
          error: (error) => {
            console.error('Error fetching watchlist:', error);
            this.isLoadingWatchlist = false;
            loading.dismiss();
            alert('Error refreshing watchlist');
          }
        });
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error removing from watchlist:', error);
        alert('Error removing movie from Watchlist');
      }
    });
  }

  //delete movie from watched list and refresh
  removeFromWatchedList(event: Event, movie: any) {
    event.stopPropagation();

    if (!this.isLoggedIn) return;

    const loading = document.createElement('ion-loading');

    loading.message = 'Removing from Watched List...';
    document.body.appendChild(loading);
    loading.present();

    this.movieService.deleteWatched(movie.id).subscribe({
      next: () => {
        this.isLoadingWatched = true;
        this.movieService.getWatchedList().subscribe({

          next: async (list) => {
            try {

              const details = await Promise.all(
                list.map(async (item: any) => {
                  try {
                    const movie = await this.movieService.getMovieById(item.movieId).toPromise();
                    return { ...movie, id: item.id, movieId: item.movieId, timesWatched: item.timesWatched };
                  } catch (err) {
                    console.error(`Failed to fetch watched movie ${item.movieId}:`, err);
                    return null;
                  }
                })
              );

              this.watchedListMovies = details.filter((d: any) => d && d.Response === 'True');
              loading.dismiss();
              alert(`✓ "${movie.Title}" removed from Watched List`);
            } catch (error) {
              console.error('Error loading watched list details:', error);
              loading.dismiss();
              alert('Error refreshing watched list');
            }
            this.isLoadingWatched = false;
          },
          error: (error) => {
            console.error('Error fetching watched list:', error);
            this.isLoadingWatched = false;
            loading.dismiss();
            alert('Error refreshing watched list');
          }
        });
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error removing from watched list:', error);
        alert('Error removing movie from Watched List');
      }
    });
  }


  //------------------------------------------CHARTS-------------------------------------

  async loadStatsData() {

    if (!this.isLoggedIn || this.watchedListMovies.length === 0) return;
    this.isLoadingStats = true;
    this.statsLoaded = false;

    try {
      // wait then fetch full details for each watched movie from OMDb
      const details = await Promise.all(
        this.watchedListMovies.map(w =>
          this.movieService.getMovieById(w.movieId).toPromise()
        )
      );

      this.movieDetails = details.filter(d => d && d.Response === 'True');
      console.log('Movie details loaded:', this.movieDetails.length);

      if (this.movieDetails.length === 0) {
        console.error('No valid movie details found');
        this.isLoadingStats = false;
        return;
      }

      //prevent early rendering of charts before data is ready
      this.statsLoaded = true;
      this.isLoadingStats = false;

      // wait for HTML to render
      setTimeout(async () => {
        await this.buildPieChart();
        await this.buildBarChart();
        await this.buildRecommendationTable();
      }, 100);

      console.log('Stats loaded successfully');
    } catch (error) {
      console.error('Error loading stats:', error);
      this.isLoadingStats = false;
      this.statsLoaded = false;
    }
  }

  buildPieChart() {
    // count genres across all watched movies
    const genreCount: { [key: string]: number } = {};

    this.movieDetails.forEach(movie => {
      if (!movie.Genre) return;
      movie.Genre.split(',').forEach((g: string) => {
        const genre = g.trim();
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    });

    // sort and take top 6
    const sorted = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    this.topGenres = sorted.map(([genre]) => genre);

    const labels = sorted.map(([genre]) => genre);
    const data   = sorted.map(([, count]) => count);
    const colors = ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'];

    setTimeout(() => {
      const canvas = document.getElementById('pieGenres') as HTMLCanvasElement;
      if (!canvas) {
        console.error('Pie chart canvas not found');
        return;
      }

      // destroy existing chart if any
      const existing = Chart.getChart(canvas);
      if (existing) existing.destroy();

      new Chart(canvas, {
        type: 'pie',
        data: { labels, datasets: [{ data, backgroundColor: colors }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'Top 6 Genres from Watched List' },
            legend: { position: 'bottom' }
          }
        }
      });
      console.log('Pie chart rendered');
    }, 200);
  }

  async buildBarChart() {
    if (this.topGenres.length === 0) return;

    const topGenre = this.topGenres[0];

    // get movies from watched list that match top genre, sorted by imdbVotes
    const genreMovies = this.movieDetails
      .filter(m => m.Genre && m.Genre.includes(topGenre))
      .map(m => ({
        title:  m.Title,
        votes:  parseInt((m.imdbVotes || '0').replace(/,/g, ''))
      }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10);

    setTimeout(() => {
      const canvas = document.getElementById('barVotes') as HTMLCanvasElement;
      if (!canvas) {
        console.error('Bar chart canvas not found');
        return;
      }

      const existing = Chart.getChart(canvas);
      if (existing) existing.destroy();

      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: genreMovies.map(m => m.title),
          datasets: [{
            label: `Most Voted in "${topGenre}"`,
            data:  genreMovies.map(m => m.votes),
            backgroundColor: '#36A2EB'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            title: { display: true, text: `Top 10 Most Voted: ${topGenre}` }
          },
          scales: {
            x: { ticks: { callback: (v: any) => v.toLocaleString() } }
          }
        }
      });
      console.log('Bar chart rendered');
    }, 200);
  }

  async buildRecommendationTable() {
    if (this.topGenres.length === 0) return;
    this.recommendationTable = [];

    // Fetch all recommendations in parallel instead of sequentially
    const recommendations = await Promise.all(
      this.topGenres.map(async (genre) => {
        try {
          const watched = this.movieDetails.find(m =>
            m.Genre && m.Genre.includes(genre)
          );

          const searchResult: any = await this.movieService
            .searchMovies(genre).toPromise();

          const recs = (searchResult?.Search || [])
            .filter((r: any) => r.imdbID !== watched?.imdbID)
            .slice(0, 5)
            .map((r: any) => r.Title);

          return {
            genre,
            watchedMovie: watched?.Title || 'N/A',
            recommendations: recs
          };
        } catch (error) {
          console.error(`Error fetching recommendations for ${genre}:`, error);
          return {
            genre,
            watchedMovie: 'N/A',
            recommendations: []
          };
        }
      })
    );

    this.recommendationTable = recommendations;
  }

  onTabChange(event: any) {
    if (event.tab === 'stats' && this.isLoggedIn && !this.statsLoaded && !this.isLoadingStats) {
      this.loadStatsData();
    }
  }
}