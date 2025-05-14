import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaceService, PlaceResult } from '../../services/place.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [CommonModule, FormsModule, InfiniteScrollDirective],
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.scss']
})
export class PlacesComponent implements OnInit, OnDestroy {
  searchTerm = '';
  isLoading = false;
  hasError = false;
  errorMessage = '';
  
  searchResults: PlaceResult[] = [];
  nearbyPlaces: PlaceResult[] = [];
  displayedNearbyPlaces: PlaceResult[] = [];
  displayedSearchPlaces: PlaceResult[] = [];
  searchPlacesCurrentIndex = 0;
  searchPlacesPageSize = 10;
  nearbyPlacesCurrentIndex = 0;
  nearbyPlacesPageSize = 10;
  isLoadingNearby = false;
  nearbyError = false;
  scrollDistance = 1;
  scrollUpDistance = 2;
  fallbackImage = '/assets/images/notFoundB.png';
  
  private searchTerms = new Subject<string>();

  constructor(
    private placeService: PlaceService,
    private router: Router,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.searchService.searchQuery$.subscribe(query => {
      this.searchTerm = query;
      this.searchPlaces();
    });

    this.searchNearbyPlaces();
  }

  ngOnDestroy(): void {
    this.cleanupBlobUrls(this.nearbyPlaces);
    this.cleanupBlobUrls(this.searchResults);
  }

  getFormattedAddress(place: PlaceResult): string {
    if (place.formatted_address) return place.formatted_address;
    if (place.vicinity) return place.vicinity;
    return 'Address not available';
  }

  private cleanupBlobUrls(places: PlaceResult[]): void {
    places.forEach(place => {
      if (place['photoUrl']?.startsWith('blob:')) {
        URL.revokeObjectURL(place['photoUrl']);
      }
    });
  }

  searchPlaces(): void {
    this.isLoading = true;
    this.hasError = false;

    if (!this.searchTerm.trim()) {
      this.searchResults = [];
      this.displayedSearchPlaces = [];
      this.isLoading = false;
      return;
    }

    this.placeService.searchPlaces(this.searchTerm).pipe(
      catchError(error => {
        this.handleError('Errore durante la ricerca. Riprova.');
        return of({ results: [], status: 'ERROR' });
      })
    ).subscribe(response => {
      this.searchResults = response.results;
      this.loadPlacePhotos(this.searchResults, () => {
        this.resetDisplayedSearchPlaces();
        this.isLoading = false;
        this.displayNextSearchPlaces();
      });
    });
  }

  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
  }

  private loadPlacePhotos(places: PlaceResult[], callback: () => void): void {
    const blobRequests = places.map(place => {
      const photoRef = place.photos?.[0]?.photo_reference || null;
      return this.loadPlacePhoto(photoRef, place);
    });

    forkJoin(blobRequests).subscribe(callback);
  }

  private loadPlacePhoto(photoRef: string | null, place: PlaceResult) {
    if (!photoRef) {
      place['photoUrl'] = this.fallbackImage;
      return of(null);
    }

    return this.placeService.getPlacePhoto(photoRef).pipe(
      catchError(() => of(null)),
      switchMap(blob => {
        place['photoUrl'] = blob ? URL.createObjectURL(blob) : this.fallbackImage;
        return of(null);
      })
    );
  }

  private resetDisplayedSearchPlaces(): void {
    this.displayedSearchPlaces = [];
    this.searchPlacesCurrentIndex = 0;
  }

  searchNearbyPlaces(): void {
    this.isLoadingNearby = true;
    this.nearbyError = false;

    this.getUserLocation((lat, lng) => {
      this.placeService.searchNearbyPlaces(lat, lng).subscribe({
        next: response => {
          this.nearbyPlaces = response.results;
          this.loadPlacePhotos(this.nearbyPlaces, () => {
            this.displayNextNearbyPlaces();
            this.isLoadingNearby = false;
          });
        },
        error: () => this.handleNearbyError('Errore durante la ricerca di luoghi vicini.')
      });
    });
  }

  private getUserLocation(successCallback: (lat: number, lng: number) => void): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => successCallback(pos.coords.latitude, pos.coords.longitude),
        () => this.handleNearbyError('Errore di geolocalizzazione.')
      );
    } else {
      this.handleNearbyError('Geolocalizzazione non supportata dal browser.');
    }
  }

  private handleNearbyError(message: string): void {
    this.nearbyError = true;
    this.isLoadingNearby = false;
    this.errorMessage = message;
  }

  displayNextSearchPlaces(): void {
    const nextPlaces = this.getNextPlaces(this.searchResults, this.searchPlacesCurrentIndex, this.searchPlacesPageSize);
    this.displayedSearchPlaces = [...this.displayedSearchPlaces, ...nextPlaces];
    this.searchPlacesCurrentIndex += this.searchPlacesPageSize;
  }

  displayNextNearbyPlaces(): void {
    const nextPlaces = this.getNextPlaces(this.nearbyPlaces, this.nearbyPlacesCurrentIndex, this.nearbyPlacesPageSize);
    this.displayedNearbyPlaces = [...this.displayedNearbyPlaces, ...nextPlaces];
    this.nearbyPlacesCurrentIndex += this.nearbyPlacesPageSize;
  }

  private getNextPlaces(places: PlaceResult[], currentIndex: number, pageSize: number): PlaceResult[] {
    return places.slice(currentIndex, currentIndex + pageSize);
  }

  goToPlaceDetails(place: PlaceResult): void {
    this.router.navigate(['/place', place.place_id], { state: { place } });
  }
}
