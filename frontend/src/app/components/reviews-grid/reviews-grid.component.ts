import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CocktailService } from '../../services/cocktails.service';
import { ReviewService, CocktailReviewMetadata, PlaceReviewMetadata } from '../../services/review.service';
import { LocationService } from '../../services/location.service';
import { PlaceService } from '../../services/place.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

interface CocktailReviewWithDetails extends CocktailReviewMetadata {
  strDrink?: string;
  strDrinkThumb?: string;
  loading?: boolean;
  error?: boolean;
}

interface PlaceWithDetails extends PlaceReviewMetadata {
  name?: string;
  address?: string;
  photoUrl?: SafeUrl;
  photoReference?: string;
  loading?: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-reviews-grid',
  imports: [ CommonModule ],
  templateUrl: './reviews-grid.component.html',
  styleUrl: './reviews-grid.component.scss'
})
export class ReviewsGridComponent implements OnChanges {
  @Input() cocktailId!: string;
  @Input() placeId!: string;
  @Input() placeName!: string;

  cocktailReviews: CocktailReviewWithDetails[] = [];
  placeReviews: PlaceWithDetails[] = [];
  reviewsLoading = false;
  locationError = '';

  constructor(
    private reviewService: ReviewService,
    private cocktailService: CocktailService,
    private locationService: LocationService,
    private placeService: PlaceService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['placeId'] && this.placeId) {
      this.loadCocktailReviews();
    }
    if (changes['cocktailId'] && this.cocktailId) {
      this.loadNearbyPlaces(this.cocktailId);
    }
  }

  openAddReview(placeName: string): void {
    this.reviewService.setPlaceName(placeName);
    this.reviewService.toggle();
  }

  loadCocktailReviews(): void {
    this.reviewsLoading = true;

    this.reviewService.getPlaceReviewMetadata(this.placeId).subscribe({
      next: (metadata) => {
        this.cocktailReviews = metadata.map(item => ({
          ...item,
          loading: true,
          error: false
        }));

        if (this.cocktailReviews.length > 0) {
          this.loadCocktailDetails();
        } else {
          this.reviewsLoading = false;
        }
      },
      error: () => {
        this.reviewsLoading = false;
      }
    });
  }

  loadCocktailDetails(): void {
    const cocktailRequests = this.cocktailReviews.map(review =>
      this.cocktailService.getCocktailById(review.cocktailId).pipe(
        map(drink => ({ review, drink })),
        catchError(() => of({ review, drink: null }))
      )
    );

    forkJoin(cocktailRequests).subscribe(results => {
      results.forEach(result => {
        const index = this.cocktailReviews.findIndex(r => r.cocktailId === result.review.cocktailId);
        if (index !== -1) {
          if (result.drink) {
            this.cocktailReviews[index] = {
              ...this.cocktailReviews[index],
              strDrink: result.drink.strDrink,
              strDrinkThumb: result.drink.strDrinkThumb,
              loading: false
            };
          } else {
            this.cocktailReviews[index] = {
              ...this.cocktailReviews[index],
              loading: false,
              error: true
            };
          }
        }
      });

      this.reviewsLoading = false;
    });
  }

  navigateToCocktail(cocktailId: string): void {
    // Get the index of the review in the array
    const index = this.cocktailReviews.findIndex(r => r.cocktailId === cocktailId);
    
    if (index !== -1) {
      const review = this.cocktailReviews[index];
      // Navigate to the reviews page for this cocktail at this place
      this.router.navigate(['/reviews', this.placeId, cocktailId]);
    } else {
      // Fallback to the cocktail page if the review is not found
      this.router.navigate(['/cocktail', cocktailId]);
    }
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
        console.log('Fetching places for cocktail ID:', cocktailId, 'with coordinates:', coords);
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
              this.loadPlacePhoto(index, photoReference);
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

  loadPlacePhoto(index: number, photoReference: string) {
    this.placeService.getPlacePhoto(photoReference, 400).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.placeReviews[index].photoUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        this.placeReviews[index].loading = false;
        if (!this.placeReviews.some(p => p.loading)) {
          this.reviewsLoading = false;
        }
      },
      error: () => {
        this.placeReviews[index].loading = false;
        this.placeReviews[index].error = true;
        if (!this.placeReviews.some(p => p.loading)) {
          this.reviewsLoading = false;
        }
      }
    });
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
}
