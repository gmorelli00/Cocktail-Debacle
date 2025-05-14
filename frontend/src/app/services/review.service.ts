import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';


export interface CocktailReviewMetadata {
  cocktailId: string;
  name: string | null;
  averageScore: number;
  reviewCount: number;
}

export interface PlaceReviewMetadata {
  placeId: number;
  googlePlaceId: string;
  averageScore: number;
  reviewCount: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userId: string;
  userName: string;
  placeId: string;
  googlePlaceId: string;
  name: string;
  cocktailId: string;
  strDrink: string;
}

export interface ReviewCreateDto {
  rating: number;
  comment: string;
  cocktailId: string;
  googlePlaceId: string;
  placeName?: string;
  latitude?: number;
  longitude?: number;
}

export interface ReviewUpdateDto {
  rating?: number;
  comment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = '/api/reviews/metadata';
  private reviewsUrl = '/api/reviews';
  private _reviewModal$ = new BehaviorSubject<boolean>(false);

  private cocktailName = new BehaviorSubject<string>('');
  private placeName = new BehaviorSubject<string>('');
  
  reviewModal$ = this._reviewModal$.asObservable();
  cocktailName$ = this.cocktailName.asObservable();
  placeName$ = this.placeName.asObservable();

  constructor(private http: HttpClient) { }

  getPlaceReviewMetadata(placeId: string): Observable<CocktailReviewMetadata[]> {
    return this.http.get<CocktailReviewMetadata[]>(`${this.apiUrl}/place/${placeId}`,
      {
        withCredentials: true
      }
    );
  }

  getCocktailReviewMetadata(cocktailId: string, lat: number, lng: number): Observable<PlaceReviewMetadata[]> {
    return this.http.get<PlaceReviewMetadata[]>(
      `${this.apiUrl}/cocktail/${cocktailId}?lat=${lat}&lng=${lng}`,
      {
        withCredentials: true
      }
    );
  }

  getCocktailReviewsAtPlace(placeId: string, cocktailId: string): Observable<Review[]> {
    return this.http.get<Review[]>(
      `${this.reviewsUrl}/place/${placeId}/cocktail/${cocktailId}`,
      {
        withCredentials: true
      }
    );
  }

  getUserReviews(username?: string): Observable<Review[]> {
    if (username) {
      // Se username è passato, chiamiamo /api/user/reviews/{username}
      return this.http.get<Review[]>(`/api/user/reviews/${username}`);
    } else {
      // Se username NON è passato, chiamiamo /api/user/reviews (autenticato)
      return this.http.get<Review[]>(`/api/user/reviews`, {
        withCredentials: true
      }
      );
    }
  }

  createReview(review: ReviewCreateDto): Observable<any> {
    return this.http.post(this.reviewsUrl, review, {
      withCredentials: true
    });
  }

  // New methods for updating and deleting reviews
  updateReview(reviewId: number, updateData: ReviewUpdateDto): Observable<any> {
    return this.http.patch(`${this.reviewsUrl}/${reviewId}`, updateData, {
      withCredentials: true
    });
  }

  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.reviewsUrl}/${reviewId}`, {
      withCredentials: true
    });
  }

  getReview(reviewId: number): Observable<any> {
    return this.http.get(`${this.reviewsUrl}/${reviewId}`, {
      withCredentials: true
    });
  }
  
  open()  { this._reviewModal$.next(true); }
  close() { this._reviewModal$.next(false); }
  toggle() { this._reviewModal$.next(!this._reviewModal$.value); }

  setCocktailName(name: string): void {
    this.cocktailName.next(name);
  }
 
  getCocktailName(): string {
    return this.cocktailName.value;
  }

  setPlaceName(name: string): void {
    this.placeName.next(name);
  }

  getPlaceName(): string {
    return this.placeName.value;
  }
}
