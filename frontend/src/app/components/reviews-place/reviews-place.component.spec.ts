import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewsPlaceComponent } from './reviews-place.component';

describe('ReviewsPlaceComponent', () => {
  let component: ReviewsPlaceComponent;
  let fixture: ComponentFixture<ReviewsPlaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsPlaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewsPlaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
