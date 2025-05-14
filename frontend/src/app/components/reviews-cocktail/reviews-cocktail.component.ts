import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService, PlaceReviewMetadata } from '../../services/review.service';
import { LocationService } from '../../services/location.service';
import { PlaceService } from '../../services/place.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface PlaceWithDetails extends PlaceReviewMetadata {
  name?: string;
  address?: string;
  photoUrl?: SafeUrl;
  photoReference?: string;
  loading?: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-reviews-cocktail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews-cocktail.component.html',
  styleUrls: ['./reviews-cocktail.component.css'],
})
export class ReviewsCocktailComponent implements OnChanges {
  @Input() cocktailId!: string;

  placeReviews: PlaceWithDetails[] = [];
  reviewsLoading = false;
  locationError = '';

  constructor(
    private reviewService: ReviewService,
    private locationService: LocationService,
    private placeService: PlaceService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cocktailId'] && this.cocktailId) {
      this.loadNearbyPlaces(this.cocktailId);
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
      }),
      catchError(error => {
        this.locationError = error.message || 'Impossibile ottenere la posizione.';
        this.reviewsLoading = false;
        return of([]);
      })
    ).subscribe({
      next: (placeMetadata) => {
        this.placeReviews = placeMetadata.map(place => ({
          ...place,
          loading: true,
          error: false
        }));

        if (this.placeReviews.length > 0) {
          this.loadPlaceDetails();
        } else {
          this.reviewsLoading = false;
        }
      },
      error: (error) => {
        this.reviewsLoading = false;
        this.locationError = 'Errore nel recupero dei luoghi: ' + (error.message || 'Errore sconosciuto');
      }
    });
  }

  loadPlaceDetails() {
    const placeRequests = this.placeReviews.map(place => {
      return this.placeService.getPlaceDetails(place.googlePlaceId).pipe(
        map(response => ({ place, details: response.result })),
        catchError(() => of({ place, details: null }))
      );
    });

    forkJoin(placeRequests).subscribe(results => {
      results.forEach(result => {
        const index = this.placeReviews.findIndex(p => p.googlePlaceId === result.place.googlePlaceId);
        if (index !== -1) {
          if (result.details) {
            const photoReference = result.details.photos?.[0]?.photo_reference ?? null;

            this.placeReviews[index] = {
              ...this.placeReviews[index],
              name: result.details.name,
              address: result.details.formatted_address,
              photoReference,
              loading: !!photoReference,
              error: false,
            };

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
    this.router.navigate(['/reviews', placeId, this.cocktailId]);
  }

  getStarRating(score: number): string {
    return '★'.repeat(Math.round(score));
  }
}
