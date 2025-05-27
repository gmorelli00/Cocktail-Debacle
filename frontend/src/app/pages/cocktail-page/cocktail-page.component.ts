import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CocktailService } from '../../services/cocktails.service';
import { CommonModule } from '@angular/common';
import { ReviewService} from '../../services/review.service';
import { AuthModalService } from '../../services/auth-modal.service';
import { FavouritesService } from '../../services/favourites.service';
import { AuthService } from '../../services/auth.service';
import { NgIconsModule } from '@ng-icons/core';
import { RouterModule } from '@angular/router';
import { UserImageComponent } from '../../components/user-image/user-image.component';
import { ButtonComponent } from '../../components/button/button.component';
import { ReviewsGridComponent } from '../../components/reviews-grid/reviews-grid.component';

@Component({
  selector: 'app-cocktail-page',
  standalone: true,
  imports: [CommonModule, NgIconsModule, RouterModule, UserImageComponent, ButtonComponent, ReviewsGridComponent],
  templateUrl: './cocktail-page.component.html',
  styleUrls: ['./cocktail-page.component.scss'],
})
export class CocktailPageComponent implements OnInit {
  cocktail: any;
  loading = true;
  errorMessage = '';
  loggedIn = false;
  cocktailId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private cocktailService: CocktailService,
    private reviewService: ReviewService,
    private authModalService: AuthModalService,
    private favouritesService: FavouritesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check if the user is logged in
    this.authService.isLoggedIn().subscribe((loggedIn: boolean) => {
      this.loggedIn = loggedIn;
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cocktailService.getCocktailById(id).subscribe({
        next: (res) => {
          this.cocktail = res; // ✅ ora il backend restituisce direttamente l'oggetto cocktail
          this.loading = false;
          this.cocktailId = id;
        },
        error: (err) => {
          this.errorMessage = 'Errore nel caricare il cocktail.';
          this.loading = false;
        },
      });
    }
  }

  openAddReview(cocktailName: string): void {
    this.reviewService.setCocktailName(cocktailName);
    this.reviewService.toggle();
  }

  getIngredientDots(): number[] {
    const ingredientCount = 15;
    const availableIngredients = [];

    for (let i = 1; i <= ingredientCount; i++) {
      if (this.cocktail?.[`strIngredient${i}`]) {
        availableIngredients.push(i);
      }
    }

    return availableIngredients;
  }

  toggleFavorite(cocktail: any) {
    if (!this.loggedIn) {
      this.authModalService.open();
      return;
    }
    cocktail.isFavorite = !cocktail.isFavorite;
    if (cocktail.isFavorite) {
      this.favouritesService.addFavourite(cocktail.idDrink).subscribe(
        () => console.log('Cocktail added to favourites'),
        (error) => console.error('Error adding cocktail to favorites', error)
      );
    } else {
      this.favouritesService.removeFavourite(cocktail.idDrink).subscribe(
        () => console.log('Cocktail added to favorites'),
        (error) => console.error('Error adding cocktail to favorites', error)
      );
    }
  }
}