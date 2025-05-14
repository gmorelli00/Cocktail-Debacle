import { Component, OnInit } from '@angular/core';
import { CocktailSorterComponent } from '../../components/cocktail-sorter/cocktail-sorter.component';
import { CocktailsGridComponent } from '../../components/cocktails-grid/cocktails-grid.component';
import { CommonModule } from '@angular/common';
import { AuthService } from "../../services/auth.service";
import { CocktailService } from "../../services/cocktails.service";
import { UserService } from '../../services/user.service';



@Component({
  selector: 'app-cocktails',
  standalone: true,
  imports: [CommonModule, CocktailSorterComponent, CocktailsGridComponent],
  templateUrl: 'cocktails.component.html',
  styleUrls: ['cocktails.component.scss'],
})
export class CocktailsComponent implements OnInit {
  currentSort = 'name';
  loggedIn = false;
  showRecommended = true;
  consentSuggestions = false;
  recommendedCocktails: any[] = [];
  recommendedReady: boolean = false;
  username: string = '';

  constructor(
    private cocktailService: CocktailService,
    private authService: AuthService,
    private userService: UserService
  ) {}
  

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe((loggedIn: boolean) => {
      this.loggedIn = loggedIn; 
      if (loggedIn) {
        this.userService.getProfile().subscribe((profile) => {
          this.username = profile.userName;
          this.consentSuggestions = profile.consentSuggestions
          if (this.consentSuggestions) {
            this.cocktailService.getRecommendedCocktails().subscribe({
              next: (data) => {
                this.recommendedCocktails = data.map(c => ({ ...c, isRecommended: true }));
                this.recommendedReady = true;
              },
              error: () => {
                this.recommendedCocktails = [];
                this.recommendedReady = true;
              }
            });
          } else {
            this.recommendedReady = true;
          }
        });
      } else {
        this.recommendedReady = true;
      }
    });
  }

  toggleRecommended(): void {
    this.showRecommended = !this.showRecommended;
  }

  onSortChange(sortType: string) {
    this.currentSort = sortType;
  }
}
