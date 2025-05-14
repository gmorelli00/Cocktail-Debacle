import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CocktailService } from '../../services/cocktails.service';
import { RouterModule, Router } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-carousel',
  imports: [CommonModule, RouterModule, NgIconsModule, NgbCarouselModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent {
  sliderItems: { title: string, image: string, isDiscover: boolean, id?: string }[] = [];
  idDrink: string = '';

  constructor(private cocktailService: CocktailService, private router: Router) {}

  ngOnInit() {
    this.cocktailService.getPopularCocktails().subscribe({
      next: (cocktails) => {
        this.sliderItems = cocktails
          .filter(c => c.strDrinkThumb && c.strDrink)
          .slice(0, 9)  // Limita i cocktail a 9 per il carosello
          .map(c => ({
            title: c.strDrink,
            image: c.strDrinkThumb,
            isDiscover: false,
            id: c.idDrink,
          }));
      },
      error: () => {
        console.error('Errore nel caricamento dei cocktail per il carousel.');
      }
    });
  }

  scrollLeft(carousel: HTMLElement) {
    carousel.scrollBy({ left: -220, behavior: 'smooth' });
  }

  scrollRight(carousel: HTMLElement) {
    carousel.scrollBy({ left: 220, behavior: 'smooth' });
  }

  navigateToCocktail(id?: string): void {
    if (id) {
      this.router.navigate(['/cocktail', id]);
    } else {
      console.error('ID non valido per il cocktail.');
    }
  }


}



  // nextSlide() {
  //   if (this.currentIndex < this.sliderItems.length - this.visibleSlides) {
  //     this.currentIndex++;
  //   }
  // }

  // prevSlide() {
  //   if (this.currentIndex > 0) {
  //     this.currentIndex--;
  //   }
  // }

  // setHoveredIndex(index: number) {
  //   this.hoveredIndex = index;
  // }

  // getScale(index: number): string {
  //   if (this.hoveredIndex === null) return 'scale(0.8)';
  //   const distance = Math.abs(index - this.hoveredIndex);
  //   const scale = Math.max(1 - distance * 0.10, 0.6);
  //   return `scale(${scale})`;
  // }

  // getZIndex(index: number): number {
  //   if (this.hoveredIndex === null) return 1;
  //   return 100 - Math.abs(index - this.hoveredIndex);
  // }