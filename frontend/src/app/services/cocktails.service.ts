import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CocktailService {
  private apiUrl = '/api/cocktails'; // Assumendo che NGINX o Angular proxy reindirizzi correttamente

  constructor(private http: HttpClient) {}

  // Ottiene tutti i cocktail dal backend
  getAllCocktails(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Ottiene un singolo cocktail per ID (es. "15346")
  getCocktailById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

 // Estrae le categorie uniche
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  // Estrae tutti gli ingredienti unici
  getIngredients(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/ingredients`);
  }

  // Estrae tutti i tipi di bicchiere
  getGlasses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/glasses`);
  }


  // Ottiene i cocktail ordinati per popolarità
  getPopularCocktails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/popular`);
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload-image`, formData);
  }

  createCocktail(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, dto);
  }  

  getRecommendedCocktails(): Observable<any[]> {
    return this.http.get<any[]>('/api/recommendations');
  }
  
}
