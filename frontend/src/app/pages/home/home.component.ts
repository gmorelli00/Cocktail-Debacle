import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from "../../components/carousel/carousel.component";
import { HostListener } from '@angular/core';
import { PlaceService, PlaceResult } from "../../services/place.service";
import { Router, RouterModule } from '@angular/router';
import { AuthModalService } from "../../services/auth-modal.service";
import { AuthService } from '../../services/auth.service';
 
@Component({
  selector: 'app-home',
  imports: [CommonModule, CarouselComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  scrolled = false;
  showArrow = true;
  places: PlaceResult[] = [];
  fallbackImage = '/assets/images/notFound2.png';
  showRegisterForm = false;
  showLoginForm = false;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.scrolled = scrollY > window.innerHeight * 0.8;
  }

  constructor(private placeService: PlaceService, private router: Router, public authModalService: AuthModalService) {}

  ngOnInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          this.placeService.searchNearbyPlaces(lat, lng).subscribe(response => {
            this.places = response.results.map(place => {
              if (place.photos && place.photos.length > 0) {
                const photoRef = place.photos[0].photo_reference;
                place.photoUrl = `/api/places/photo?photoReference=${photoRef}&maxWidth=600`;
              } else {
                place.photoUrl = this.fallbackImage;
              }
              return place;
            });
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to a default location or handle the error as needed
          this.placeService.searchNearbyPlaces().subscribe(response => {
            this.places = response.results.map(place => {
              if (place.photos && place.photos.length > 0) {
                const photoRef = place.photos[0].photo_reference;
                place.photoUrl = `/api/places/photo?photoReference=${photoRef}&maxWidth=600`;
              } else {
                place.photoUrl = this.fallbackImage;
              }
              return place;
            });
          });
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      // Fallback to a default location or handle the error as needed
      this.placeService.searchNearbyPlaces().subscribe(response => {
        this.places = response.results.map(place => {
          if (place.photos && place.photos.length > 0) {
            const photoRef = place.photos[0].photo_reference;
            place.photoUrl = `/api/places/photo?photoReference=${photoRef}&maxWidth=600`;
          } else {
            place.photoUrl = this.fallbackImage;
          }
          return place;
        });
      });
    }
  }
  goToPlace(placeId: string): void {
    console.log('Navigating to place with ID:', placeId);
    this.router.navigate(['/place', placeId]);
  }
  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }
  
  toggleLoginForm() {
    this.authModalService.toggle()
    this.showLoginForm = !this.showLoginForm;
    this.showRegisterForm = false;
  }

  onLoginSuccess() {
    this.showLoginForm = false;
    this.authModalService.close();
  }
}
