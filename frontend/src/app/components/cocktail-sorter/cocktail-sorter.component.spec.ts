import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailSorterComponent } from './cocktail-sorter.component';

describe('CocktailSorterComponent', () => {
  let component: CocktailSorterComponent;
  let fixture: ComponentFixture<CocktailSorterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocktailSorterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CocktailSorterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
