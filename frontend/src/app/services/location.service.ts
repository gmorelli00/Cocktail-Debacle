import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly defaultPosition: Coordinates = {
    // Default to Florence, Italy as a fallback
    latitude: 43.7696,
    longitude: 11.2558
  };

  constructor() { }

  /**
   * Gets the user's current geographic position
   * @returns An Observable with the user's coordinates
   */
  getCurrentPosition(): Observable<Coordinates> {
    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return throwError(() => new Error('Geolocation is not supported by this browser'));
    }

    return from(
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      })
    ).pipe(
      map(position => ({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      })),
      catchError(error => {
        console.error('Error getting location:', error);
        if (error.code === 1) {
          // Permission denied
          return throwError(() => new Error('Location permission denied. Please enable location services to use this feature.'));
        } else if (error.code === 2) {
          // Position unavailable
          return throwError(() => new Error('Unable to determine your location. Please try again later.'));
        } else if (error.code === 3) {
          // Timeout
          return throwError(() => new Error('Location request timed out. Please try again.'));
        }
        return throwError(() => new Error('An error occurred while getting your location.'));
      })
    );
  }

  /**
   * Gets the user's position or returns a default location if unavailable
   * @returns An Observable with either the user's coordinates or default coordinates
   */
  getPositionOrDefault(): Observable<Coordinates> {
    return this.getCurrentPosition().pipe(
      catchError(() => {
        console.warn('Using default location');
        return from([this.defaultPosition]);
      })
    );
  }
}