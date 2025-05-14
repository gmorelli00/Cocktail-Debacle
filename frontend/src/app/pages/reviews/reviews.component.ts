import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService, Review, ReviewCreateDto, ReviewUpdateDto } from '../../services/review.service';
import { PlaceService, PlaceResult } from '../../services/place.service';
import { CocktailService } from '../../services/cocktails.service';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { catchError, forkJoin, of } from 'rxjs';
import { ReviewCardComponent } from '../../components/review-card/review-card.component';
import { RouterModule } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { AuthModalService } from '../../services/auth-modal.service';


@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewCardComponent, RouterModule, NgIconsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  placeId: string = '';
  cocktailId: string = '';
  reviews: Review[] = [];
  
  // Current user info
  currentUser: any = null;

  photoLoading: boolean = true;
  loading: boolean = true;
  errorMessage: string = '';
  
  // Place details
  place: PlaceResult | null = null;
  placeError: boolean = false;
  placePhotoUrl: SafeUrl | null = null;
  
  // Cocktail details
  cocktail: any = null;
  cocktailError: boolean = false;
  
  // Review form
  showReviewForm: boolean = false;
  newReview: ReviewCreateDto = {
    rating: 5,
    comment: '',
    cocktailId: '',
    googlePlaceId: '',
    placeName: undefined,
    latitude: undefined,
    longitude: undefined
  };
  submittingReview: boolean = false;
  reviewsLoading: boolean = false;
  reviewSuccess: boolean = false;
  reviewError: string = '';
  

  // Rating options for the selector
  ratingOptions = [1, 2, 3, 4, 5];

  // Scroll position
  savedScrollY: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService,
    private placeService: PlaceService,
    private cocktailService: CocktailService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private authModalService: AuthModalService
  ) {}

  ngOnInit(): void {
    // Get current user info
    this.authService.userInfo$.subscribe(user => {
      this.currentUser = user;
    });
  
    this.route.paramMap.subscribe(params => {
      const placeId = params.get('placeId');
      const cocktailId = params.get('cocktailId');
  
      if (!placeId || !cocktailId) {
        this.errorMessage = 'Invalid parameters';
        this.loading = false;
        return;
      }
  
      this.placeId = placeId;
      this.cocktailId = cocktailId;
  
      // Initialize the new review with the IDs
      this.newReview.googlePlaceId = this.placeId;
      this.newReview.cocktailId = this.cocktailId;
  
      // Load initial data
      this.loadPlaceCocktail();
      this.loadReviews();
    });
  }


    loadPlaceCocktail(): void {

      this.loading = true;
    
      const placeRequest = this.placeService.getPlaceDetails(this.placeId).pipe(
        catchError(error => {
          console.error('Error loading place details:', error);
          this.placeError = true;
          return of(null);
        })
      );
    
      const cocktailRequest = this.cocktailService.getCocktailById(this.cocktailId).pipe(
        catchError(error => {
          console.error('Error loading cocktail details:', error);
          this.cocktailError = true;
          return of(null);
        })
      );
    
      forkJoin([placeRequest, cocktailRequest]).subscribe(([placeResponse, cocktail]) => {
        if (placeResponse?.result) {
          this.place = placeResponse.result;
          this.newReview.placeName = this.place?.name;
          const location = this.place?.geometry.location;
          if (location) {
            this.newReview.latitude = location.lat;
            this.newReview.longitude = location.lng;
          }
          this.loadPlacePhoto();
        }
    
        this.cocktail = cocktail;
    
        this.loading = false; // solo qui viene settato a false
      });
    }
    

  loadReviews(): void {
    this.savedScrollY = window.scrollY;
    this.reviewsLoading = true;
    this.reviewService.getCocktailReviewsAtPlace(this.placeId, this.cocktailId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.reviewsLoading = false;
        setTimeout(() => window.scrollTo(0, this.savedScrollY), 0); // ripristina la posizione
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.errorMessage = 'Failed to load reviews.';
        this.reviewsLoading = false;
      }
    });
  }

  // load google photo
  loadPlacePhoto(): void {
    if (this.place?.photos && this.place.photos.length > 0) {
      const photoRef = this.place.photos[0].photo_reference;

      this.photoLoading = true;

      this.placeService.getPlacePhoto(photoRef, 400).subscribe({
        next: (blob) => {
          const objectURL = URL.createObjectURL(blob);
          this.placePhotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.photoLoading = false;
        },
        error: () => {
          this.placeError = true;
          this.photoLoading = false;
        }
      });
    }
  }
  
  toggleReviewForm(): void {
    // Check if user is logged in
    if (!this.currentUser) {
      this.authModalService.open();
      return;
    }
    
    this.showReviewForm = !this.showReviewForm;
    
    // Reset form state when toggling
    if (this.showReviewForm) {
      this.reviewSuccess = false;
      this.reviewError = '';
    }
  }
  
  submitReview(): void {
    if (!this.newReview.comment.trim()) {
      this.reviewError = 'Please enter a comment';
      return;
    }
    
    this.submittingReview = true;
    this.reviewError = '';
    
    this.reviewService.createReview(this.newReview).subscribe({
      next: (response) => {
        this.submittingReview = false;
        this.reviewSuccess = true;
        // Reset form
        this.newReview.rating = 5;
        this.newReview.comment = '';
        // Reload reviews
        setTimeout(() => {
          this.loadReviews();
          this.showReviewForm = false;
          this.reviewSuccess = false;
        }, 2000);
      },
      error: (error) => {
        this.submittingReview = false;
        this.reviewError = error.error?.message || 'Failed to submit review. Please try again.';
        console.error('Error submitting review:', error);
      }
    });
  }
  
  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
  
  getStarRating(score: number): string {
    return '★'.repeat(Math.round(score));
  }
  
  navigateToPlace(): void {
    this.router.navigate(['/place', this.placeId]);
  }
  
  navigateToCocktail(): void {
    this.router.navigate(['/cocktail', this.cocktailId]);
  }

  // Method to set rating in review form
  setRating(rating: number): void {
    this.newReview.rating = rating;
  }

  // Check if a rating is the currently selected one
  isSelectedRating(rating: number): boolean {
    return this.newReview.rating === rating;
  }

  // Get empty stars (for display)
  getEmptyStars(score: number): string {
    return '☆'.repeat(5 - Math.round(score));
  }

  // Add this method to navigate to a user's profile
  navigateToUserProfile(username: string): void {
    if (username && username !== 'Anonymous') {
      this.router.navigate(['/profile', username]);
    }
  }
} 