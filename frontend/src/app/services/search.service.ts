import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // Usare BehaviorSubject per poter usare getValue
  private searchQuerySubject = new BehaviorSubject<string>('');
  private categorySubject = new BehaviorSubject<string>('');
  private ingredientSubject = new BehaviorSubject<string>('');
  private glassSubject = new BehaviorSubject<string>('');

  // Creare gli Observable per ogni Subject
  searchQuery$ = this.searchQuerySubject.asObservable();
  category$ = this.categorySubject.asObservable();
  ingredient$ = this.ingredientSubject.asObservable();
  glass$ = this.glassSubject.asObservable();

  resetFilters() {
    this.setSearchQuery('');
    this.setCategory('');
    this.setIngredient('');
    this.setGlass('');
  }

  // Metodi per aggiornare i valori
  setSearchQuery(query: string) {
    this.searchQuerySubject.next(query);
  }

  setCategory(category: string) {
    this.categorySubject.next(category);
  }

  setIngredient(ingredient: string) {
    this.ingredientSubject.next(ingredient);
  }

  setGlass(glass: string) {
    this.glassSubject.next(glass);
  }

  // Metodo per ottenere il valore corrente direttamente
  get searchQueryValue(): string {
    return this.searchQuerySubject.getValue();
  }

  get categoryValue(): string {
    return this.categorySubject.getValue();
  }

  get ingredientValue(): string {
    return this.ingredientSubject.getValue();
  }

  get glassValue(): string {
    return this.glassSubject.getValue();
  }

  private updateTrigger = new BehaviorSubject<void>(undefined);
  updateTrigger$ = this.updateTrigger.asObservable();


  triggerUpdate() {
    this.updateTrigger.next();
  }
}


