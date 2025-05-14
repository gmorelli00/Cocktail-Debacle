import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CocktailService } from '../../services/cocktails.service';
import { ReviewService, CocktailReviewMetadata } from '../../services/review.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

interface CocktailReviewWithDetails extends CocktailReviewMetadata {
  strDrink?: string;
  strDrinkThumb?: string;
  loading?: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-reviews-place',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews-place.component.html',
  styleUrl: './reviews-place.component.css'
})
export class ReviewsPlaceComponent implements OnInit {
  @Input() placeId!: string;
  @Input() placeName!: string;

  reviewsLoading = false;
  cocktailReviews: CocktailReviewWithDetails[] = [];

  constructor(
    private reviewService: ReviewService,
    private cocktailService: CocktailService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCocktailReviews();
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

  getStarRating(score: number): string {
    return '★'.repeat(Math.round(score));
  }
}
