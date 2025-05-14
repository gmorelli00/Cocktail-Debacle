import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReviewService, ReviewCreateDto } from '../../services/review.service';
import { PlaceService, PlaceResult, PlaceSearchResponse } from '../../services/place.service';
import { CocktailService } from '../../services/cocktails.service';
import { SearchService } from '../../services/search.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-add-review',
  imports: [CommonModule, FormsModule, NgIcon],
  templateUrl: './add-review.component.html',
  styleUrls: ['./add-review.component.scss']
})
export class AddReviewComponent implements OnInit {
  // Search functionality
  placeSearchQuery: string = '';
  placeSearchResults: PlaceResult[] = [];
  placeSearching: boolean = false;
  placeSearchError: boolean = false;
  private placeSearchQuerySubject = new Subject<string>();

  // Nearby places with pagination
  nearbyPlaces: PlaceResult[] = [];
  displayedNearbyPlaces: PlaceResult[] = [];
  nearbyPlacesCurrentIndex: number = 0;
  nearbyPlacesPageSize: number = 4;

  cocktailSearchQuery: string = '';
  allCocktails: any[] = [];
  cocktailSearchResults: any[] = [];
  displayedCocktailResults: any[] = [];
  cocktailSearching: boolean = false;
  cocktailSearchError: boolean = false;
  cocktailCurrentIndex: number = 0;
  cocktailPageSize: number = 8; // Display fewer cocktails initially

  // Selected items
  selectedPlace: PlaceResult | null = null;
  selectedCocktail: any | null = null;
  placePhotoUrl: SafeUrl | null = null;

  cocktailName: string = '';
  placeName: string = '';

  @Output() oneviewSuccess = new EventEmitter<boolean>();
  @Output() closeForm = new EventEmitter<void>();  // Evento per chiudere il form

  // Review form
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
  reviewSuccess: boolean = false;
  reviewError: string = '';

  // Rating options for the selector
  ratingOptions = [1, 2, 3, 4, 5];

  constructor(
    private router: Router,
    private reviewService: ReviewService,
    private placeService: PlaceService,
    private cocktailService: CocktailService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    // Set up debounced place search
    this.placeName = this.reviewService.getPlaceName();
    this.cocktailName = this.reviewService.getCocktailName();
    this.placeSearchQuerySubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchPlaces(query);
    });

    // Initial nearby places search
    this.searchNearbyPlaces();
    
    // Load all cocktails
    this.loadAllCocktails();
  }

  // Place search methods
  onPlaceSearchInput(): void {
    this.placeSearchQuerySubject.next(this.placeSearchQuery);
  }

  searchPlaces(query: string): void {
    if (!query.trim()) {
      this.searchNearbyPlaces();
      return;
    }

    this.placeSearching = true;
    this.placeSearchError = false;
    this.placeSearchResults = [];

    this.placeService.searchPlaces(query).subscribe({
      next: (response: PlaceSearchResponse) => {
        this.placeSearchResults = response.results;
        this.placeSearching = false;
      },
      error: (error) => {
        console.error('Error searching places:', error);
        this.placeSearchError = true;
        this.placeSearching = false;
      }
    });
  }

  searchNearbyPlaces(): void {
    this.placeSearching = true;
    this.placeSearchError = false;
    this.nearbyPlaces = [];
    this.displayedNearbyPlaces = [];
    this.nearbyPlacesCurrentIndex = 0;

    // Use browser geolocation to get current coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Call the API with the current coordinates
          this.placeService.searchNearbyPlaces(lat, lng).subscribe({
            next: (response: PlaceSearchResponse) => {
              this.nearbyPlaces = response.results;
              this.displayNextNearbyPlaces();
              this.placeSearching = false;
            },
            error: (error) => {
              console.error('Error searching nearby places:', error);
              this.placeSearchError = true;
              this.placeSearching = false;
            }
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.placeSearchError = true;
          this.placeSearching = false;
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      this.placeSearchError = true;
      this.placeSearching = false;
    }
  }

  displayNextNearbyPlaces(): void {
    const nextPlaces = this.nearbyPlaces.slice(
      this.nearbyPlacesCurrentIndex,
      this.nearbyPlacesCurrentIndex + this.nearbyPlacesPageSize
    );
    this.displayedNearbyPlaces = [...this.displayedNearbyPlaces, ...nextPlaces];
    this.nearbyPlacesCurrentIndex += this.nearbyPlacesPageSize;
  }

  // Format address for places that might not have formatted_address field
  getFormattedAddress(place: PlaceResult): string {
    // If formatted_address exists, return it
    if (place.formatted_address) {
      return place.formatted_address;
    }
    
    // Otherwise, try to construct an address from vicinity or other fields
    if (place.vicinity) {
      return place.vicinity;
    }
    
    // If no address info is available, return a generic message
    return 'Address not available';
  }

  selectPlace(place: PlaceResult): void {
    this.selectedPlace = place;
    this.newReview.googlePlaceId = place.place_id;
    this.newReview.placeName = place.name;
    
    // Assegna il nome del locale all'input
    this.placeSearchQuery = place.name;
    
    if (place.geometry && place.geometry.location) {
      this.newReview.latitude = place.geometry.location.lat;
      this.newReview.longitude = place.geometry.location.lng;
    }
  
    this.placeSearchResults = [];
  }
  

  loadPlacePhoto(place: PlaceResult): void {
    if (place.photos && place.photos.length > 0) {
      const photoRef = place.photos[0].photo_reference;
      
      this.placeService.getPlacePhoto(photoRef, 400).subscribe({
        next: (blob) => {
          const objectURL = URL.createObjectURL(blob);
          this.placePhotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        },
        error: (error) => {
          console.error('Error loading place photo:', error);
          this.placePhotoUrl = null;
        }
      });
    } else {
      this.placePhotoUrl = null;
    }
  }

  // Cocktail search methods
  loadAllCocktails(): void {
    this.cocktailSearching = true;
    this.cocktailService.getAllCocktails().subscribe({
      next: (cocktails) => {
        this.allCocktails = cocktails;
        this.cocktailSearching = false;
      },
      error: (error) => {
        console.error('Error loading cocktails:', error);
        this.cocktailSearchError = true;
        this.cocktailSearching = false;
      }
    });
  }

  onCocktailSearchInput(): void {
    this.searchCocktails(this.cocktailSearchQuery);
  }

  searchCocktails(query: string): void {
    if (!query.trim()) {
      this.cocktailSearchResults = [];
      this.displayedCocktailResults = [];
      this.cocktailCurrentIndex = 0;
      return;
    }

    this.cocktailSearching = true;
    this.cocktailSearchError = false;
    
    // Filter cocktails locally using the same logic as in the cocktails component
    const searchTerm = query.toLowerCase().trim();
    this.cocktailSearchResults = this.allCocktails.filter(cocktail => 
      cocktail.strDrink.toLowerCase().includes(searchTerm)
    ).slice(0, 40); // Limit total results but keep more for pagination
    
    // Reset pagination
    this.cocktailCurrentIndex = 0;
    this.displayedCocktailResults = [];
    this.displayNextCocktails();
    
    this.cocktailSearching = false;
  }

  displayNextCocktails(): void {
    const nextCocktails = this.cocktailSearchResults.slice(
      this.cocktailCurrentIndex,
      this.cocktailCurrentIndex + this.cocktailPageSize
    );
    this.displayedCocktailResults = [...this.displayedCocktailResults, ...nextCocktails];
    this.cocktailCurrentIndex += this.cocktailPageSize;
  }

  selectCocktail(cocktail: any): void {
    this.selectedCocktail = cocktail;
    this.newReview.cocktailId = cocktail.idDrink;
  
    // Assegna il nome del cocktail all'input
    this.cocktailSearchQuery = cocktail.strDrink;
  
    this.cocktailSearchResults = [];
  }

  // Review submission
  submitReview(): void {
    if (!this.selectedPlace || !this.selectedCocktail) {
      this.reviewError = 'Please select both a place and a cocktail';
      return;
    }

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

        // Navigate to the review page after successful submission
        setTimeout(() => {
          this.reviewService.close();
          this.router.navigate(['/reviews', this.selectedPlace?.place_id, this.selectedCocktail?.idDrink]);
        }, 2000);
      },
      error: (error) => {
        this.submittingReview = false;
        this.reviewError = error.error?.message || 'Failed to submit review. Please try again.';
        console.error('Error submitting review:', error);
      }
    });
  }

  // Rating methods
  setRating(rating: number): void {
    this.newReview.rating = rating;
  }

  isSelectedRating(rating: number): boolean {
    return this.newReview.rating === rating;
  }

  closeAddReview() {
    this.closeForm.emit();
    this.reviewService.close();
  }
} 