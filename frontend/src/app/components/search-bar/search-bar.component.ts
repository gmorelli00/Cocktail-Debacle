// src/app/components/search-bar/search-bar.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CocktailService } from '../../services/cocktails.service';
import { SearchService } from '../../services/search.service';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaceService } from '../../services/place.service';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, CommonModule,  NgIconsModule, RouterModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {
  isOnDiscoverSection: boolean = false;
  isCollapsed: boolean = true; // I filtri sono nascosti di default
  searchQuery = '';
  selectedCategory = '';
  selectedIngredient = '';
  selectedGlass = '';
  selectedMode: 'cocktails' | 'places' = 'cocktails'; // Modalità di ricerca
  isScrolled = false;
  isHome = false;

  categories: string[] = [];
  ingredients: string[] = [];
  glasses: string[] = [];

  constructor(
    private cocktailService: CocktailService,
    private searchService: SearchService,
    private router: Router,
    private placeService: PlaceService
  ) {}

  ngOnInit() {
    this.checkIfHome();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkIfHome();
        this.updateModeBasedOnRoute();
      }
    });
    this.loadCategories();
    this.loadIngredients();
    this.loadGlasses();
  }

  private updateModeBasedOnRoute(): void {
    // Aggiorna la modalità in base alla rotta corrente
    if (this.router.url.startsWith('/places')) {
      this.selectedMode = 'places';
      this.isCollapsed = true; // Nascondi i filtri in modalità places
    } else if (this.router.url.startsWith('/cocktails')) {
      this.selectedMode = 'cocktails';
      this.isCollapsed = true; // I filtri rimangono chiusi anche in modalità cocktails
    }
  }

  private checkIfHome(): void {
    this.isHome = this.router.url === '/';
    this.isScrolled = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const offset = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = offset > 10;
    const discoverSection = document.querySelector('.discover-section') as HTMLElement;
    const searchContainer = document.querySelector('.search-container') as HTMLElement;

    if (discoverSection && searchContainer) {
      const discoverSectionTop = discoverSection.getBoundingClientRect().top;
      const searchHeight = searchContainer.offsetHeight;

      // Verifica se la search bar si trova sopra la discover-section
      this.isOnDiscoverSection = discoverSectionTop <= searchHeight;
    }
  }

  loadCategories() {
    this.cocktailService.getCategories().subscribe(
      (data) => {
        this.categories = [...data]; // Aggiungiamo 'places' come categoria
      },
      (error) => {
        console.error('Errore nel caricare le categorie', error);
      }
    );
  }

  loadIngredients() {
    this.cocktailService.getIngredients().subscribe(
      (data) => {
        this.ingredients = data; // ✅ ora è un array di stringhe
      },
      (error) => {
        console.error('Errore nel caricare gli ingredienti', error);
      }
    );
  }

  loadGlasses() {
    this.cocktailService.getGlasses().subscribe(
      (data) => {
        this.glasses = data; // ✅ ora è un array di stringhe
      },
      (error) => {
        console.error('Errore nel caricare i bicchieri', error);
      }
    );
  }

  onSearch() {
    this.isScrolled = true;

    if (this.selectedMode === 'places') {
      // Aggiorniamo il servizio di ricerca con il nuovo valore
      this.searchService.setSearchQuery(this.searchQuery.trim());

      // Navigazione alla pagina dei luoghi solo se non siamo già su di essa
      if (this.router.url !== '/places') {
        this.router.navigate(['/places'], {
          queryParams: { q: this.searchQuery.trim() }
        });
      } else {
        // Emettiamo manualmente l'evento per aggiornare i risultati
        this.searchService.triggerUpdate();
      }
    } else {
      this.searchService.setSearchQuery(this.searchQuery.trim());
      this.searchService.setCategory(this.selectedCategory);
      this.searchService.setIngredient(this.selectedIngredient);
      this.searchService.setGlass(this.selectedGlass);

      this.router.navigate(['/cocktails'], {
        queryParams: {
          q: this.searchQuery.trim(),
          category: this.selectedCategory,
          ingredient: this.selectedIngredient,
          glass: this.selectedGlass,
        },
      });
    }
  }

  onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  // Cambia modalità senza eseguire subito la ricerca
  toggleMode(): void {
    // Impediamo di aprire i filtri quando si cambia da 'places' a 'cocktails'
    if (this.selectedMode === 'cocktails') {
      this.isCollapsed = true; // I filtri sono nascosti
    }
    this.selectedMode = this.selectedMode === 'cocktails' ? 'places' : 'cocktails';
  }

  // Toggle dei filtri: aperto o chiuso manualmente dall'utente
  toggleFilters() {
    this.isCollapsed = !this.isCollapsed;
  }
}
