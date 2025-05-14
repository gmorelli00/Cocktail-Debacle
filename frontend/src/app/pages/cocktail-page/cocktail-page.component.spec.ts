import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailPageComponent } from './cocktail-page.component';

describe('CocktailPageComponent', () => {
  let component: CocktailPageComponent;
  let fixture: ComponentFixture<CocktailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocktailPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CocktailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
