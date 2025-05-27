import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewsGridComponent } from './reviews-grid.component';

describe('ReviewsGridComponent', () => {
  let component: ReviewsGridComponent;
  let fixture: ComponentFixture<ReviewsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
