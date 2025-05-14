import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService, PlaceResult } from '../../services/place.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

// importa il nuovo componente
import { ReviewsPlaceComponent } from '../../components/reviews-place/reviews-place.component';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-place-page',
  imports: [CommonModule, ReviewsPlaceComponent, NgIconsModule],
  templateUrl: './place-page.component.html',
  styleUrl: './place-page.component.scss'
})
export class PlacePageComponent implements OnInit {
  place: PlaceResult | null = null;
  placeId: string = '';
  loading: boolean = true;
  error: boolean = false;
  photoUrl: SafeUrl | null = null;
  photoLoading: boolean = false;
  fallbackImage: string = '/assets/images/notFoundB.png';
  placeName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private placeService: PlaceService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.navigateToPlaces();
        return;
      }
  
      this.placeId = id;
  
      this.placeService.getPlaceDetails(id).subscribe({
        next: (response) => {
          if (response.status === 'OK') {
            this.place = response.result;
            this.placeName = this.place?.name || '';
            this.loading = false;
            this.loadPlacePhoto();
          } else {
            this.error = true;
            this.loading = false;
          }
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
    });
  }
  

  loadPlacePhoto(): void {
    if (this.place?.photos && this.place.photos.length > 0) {
      const photoRef = this.place.photos[0].photo_reference;
      this.photoLoading = true;

      this.placeService.getPlacePhoto(photoRef, 800).subscribe({
        next: (photoBlob: Blob) => {
          const photoUrl = URL.createObjectURL(photoBlob);
          this.photoUrl = this.sanitizer.bypassSecurityTrustUrl(photoUrl);
          this.photoLoading = false;
        },
        error: () => {
          this.photoLoading = false;
        }
      });
    }
  }

  navigateToPlaces(): void {
    this.router.navigate(['/places']);
  }
}
