import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Cocktail {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  popularity: number;
  reviewsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
  private apiUrl = '/api/favorites'; // Modifica con il tuo URL di base

  constructor(private http: HttpClient) {}

  // Ottieni i preferiti dell'utente
  getFavourites(username: string): Observable<Cocktail[]> {
    const url = `${this.apiUrl}/${username}`;
    return this.http.get<Cocktail[]>(url);
  }

  // Aggiungi un cocktail ai preferiti
  addFavourite(idDrink: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idDrink}`, {});
  }

  // Rimuovi un cocktail dai preferiti
  removeFavourite(idDrink: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idDrink}`);
  }
}
