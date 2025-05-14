import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailsGridComponent } from './cocktails-grid.component';

describe('CocktailsGridComponent', () => {
  let component: CocktailsGridComponent;
  let fixture: ComponentFixture<CocktailsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocktailsGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CocktailsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
