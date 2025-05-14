import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CocktailService } from '../../services/cocktails.service';
import { CommonModule } from '@angular/common';
import { ReviewService, PlaceReviewMetadata } from '../../services/review.service';
import { LocationService } from '../../services/location.service';
import { PlaceService } from '../../services/place.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthModalService } from '../../services/auth-modal.service';
import { FavouritesService } from '../../services/favourites.service';
import { AuthService } from '../../services/auth.service';
import { NgIconsModule } from '@ng-icons/core';
import { RouterModule } from '@angular/router';
import { UserImageComponent } from '../../components/user-image/user-image.component';

interface PlaceWithDetails extends PlaceReviewMetadata {
  name?: string;
  address?: string;
  photoUrl?: SafeUrl;
  photoReference?: string | null;
  loading?: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-cocktail-page',
  standalone: true,
  imports: [CommonModule, NgIconsModule, RouterModule, UserImageComponent],
  templateUrl: './cocktail-page.component.html',
  styleUrls: ['./cocktail-page.component.scss'],
})
export class CocktailPageComponent implements OnInit {
  cocktail: any;
  loading = true;
  errorMessage = '';
  loggedIn = false;
  
  // Place reviews related properties
  placeReviews: PlaceWithDetails[] = [];
  reviewsLoading = false;
  locationError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cocktailService: CocktailService,
    private reviewService: ReviewService,
    private locationService: LocationService,
    private placeService: PlaceService,
    private sanitizer: DomSanitizer,
    private authModalService: AuthModalService,
    private favouritesService: FavouritesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check if the user is logged in
    this.authService.isLoggedIn().subscribe((loggedIn: boolean) => {
      this.loggedIn = loggedIn;
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cocktailService.getCocktailById(id).subscribe({
        next: (res) => {
          this.cocktail = res; // ✅ ora il backend restituisce direttamente l'oggetto cocktail
          this.loading = false;
          
          // After loading cocktail details, load places with this cocktail
          if (this.cocktail) {
            this.loadNearbyPlaces(id);
          }
        },
        error: (err) => {
          this.errorMessage = 'Errore nel caricare il cocktail.';
          this.loading = false;
        },
      });
    }
  }

  openAddReview(cocktailName: string): void {
    this.reviewService.setCocktailName(cocktailName);
    this.reviewService.toggle();
  }

  loadNearbyPlaces(cocktailId: string) {
    this.reviewsLoading = true;
    
    this.locationService.getPositionOrDefault().pipe(
      switchMap(coords => {
        return this.reviewService.getCocktailReviewMetadata(
          cocktailId, 
          coords.latitude, 
          coords.longitude
        );
      }),
      catchError(error => {
        this.locationError = error.message || 'Failed to get your location.';
        this.reviewsLoading = false;
        return of([]);
      })
    ).subscribe({
      next: (placeMetadata) => {
        // Initialize place reviews with loading state
        this.placeReviews = placeMetadata.map(place => ({
          ...place,
          loading: true,
          error: false
        }));
        
        // Load details for each place
        if (this.placeReviews.length > 0) {
          this.loadPlaceDetails();
        } else {
          this.reviewsLoading = false;
        }
      },
      error: (error) => {
        this.reviewsLoading = false;
        this.locationError = 'Failed to fetch places: ' + (error.message || 'Unknown error');
      }
    });
  }

  loadPlaceDetails() {
    // Create observables for each place
    const placeRequests = this.placeReviews.map(place => {
      return this.placeService.getPlaceDetails(place.googlePlaceId).pipe(
        map(response => {
          const placeDetails = response.result;
          return {
            place,
            details: placeDetails
          };
        }),
        catchError(() => {
          // Handle error for this specific place
          return of({ place, details: null });
        })
      );
    });
    
    // Execute all requests in parallel
    forkJoin(placeRequests).subscribe(results => {
      // Update each place with details
      results.forEach(result => {
        const index = this.placeReviews.findIndex(p => p.googlePlaceId === result.place.googlePlaceId);
        if (index !== -1) {
          if (result.details) {
            // Store the photo reference for later use
            const photoReference = result.details.photos && result.details.photos.length > 0 
              ? result.details.photos[0].photo_reference 
              : null;
              
            this.placeReviews[index] = {
              ...this.placeReviews[index],
              name: result.details.name,
              address: result.details.formatted_address,
              photoReference: photoReference,
              loading: photoReference ? true : false, // Keep loading true if we have a photo to load
              error: false
            };
            
            // Load photos for places with photo references
            if (photoReference) {
              this.getPlacePhoto(photoReference, index);
            }
          } else {
            this.placeReviews[index] = {
              ...this.placeReviews[index],
              loading: false,
              error: true
            };
          }
        }
      });
      
      // If no places have photos to load, mark loading as complete
      if (!this.placeReviews.some(p => p.loading)) {
        this.reviewsLoading = false;
      }
    });
  }

  getPlacePhoto(photoReference: string, placeIndex: number): Observable<Blob> {
    return this.placeService.getPlacePhoto(photoReference, 400).pipe(
      map((response: any) => {
        if (response instanceof Blob) {
          const objectURL = URL.createObjectURL(response);
          this.placeReviews[placeIndex].photoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.placeReviews[placeIndex].loading = false;

          // Check if all places are done loading
          if (!this.placeReviews.some(p => p.loading)) {
            this.reviewsLoading = false;
          }
          return response;
        } else {
          throw new Error('Unexpected response type');
        }
      }),
      catchError(() => {
        this.placeReviews[placeIndex].loading = false;
        this.placeReviews[placeIndex].error = true;

        // Check if all places are done loading
        if (!this.placeReviews.some(p => p.loading)) {
          this.reviewsLoading = false;
        }
        return of(null as unknown as Blob); // Return a fallback value
      })
    );
  }

  navigateToPlace(placeId: string) {
    const cocktailId = this.route.snapshot.paramMap.get('id');
    if (cocktailId) {
      // Navigate to the reviews page for this cocktail at this place
      this.router.navigate(['/reviews', placeId, cocktailId]);
    } else {
      // Fallback to the place page if the cocktail ID is not available
      this.router.navigate(['/place', placeId]);
    }
  }

  getStarRating(score: number): string {
    return '★'.repeat(Math.round(score));
  }

  getIngredientDots(): number[] {
    const ingredientCount = 15;
    const availableIngredients = [];

    for (let i = 1; i <= ingredientCount; i++) {
      if (this.cocktail?.[`strIngredient${i}`]) {
        availableIngredients.push(i);
      }
    }

    return availableIngredients;
  }

  toggleFavorite(cocktail: any) {
    if (!this.loggedIn) {
      this.authModalService.open();
      return;
    }
    cocktail.isFavorite = !cocktail.isFavorite;
    if (cocktail.isFavorite) {
      this.favouritesService.addFavourite(cocktail.idDrink).subscribe(
        () => console.log('Cocktail added to favourites'),
        (error) => console.error('Error adding cocktail to favorites', error)
      );
    } else {
      this.favouritesService.removeFavourite(cocktail.idDrink).subscribe(
        () => console.log('Cocktail added to favorites'),
        (error) => console.error('Error adding cocktail to favorites', error)
      );
    }
  }
}