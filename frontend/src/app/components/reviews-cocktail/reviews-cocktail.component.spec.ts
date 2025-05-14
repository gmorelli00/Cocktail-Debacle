import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewsCocktailComponent } from './reviews-cocktail.component';

describe('ReviewsCocktailComponent', () => {
  let component: ReviewsCocktailComponent;
  let fixture: ComponentFixture<ReviewsCocktailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsCocktailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewsCocktailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
