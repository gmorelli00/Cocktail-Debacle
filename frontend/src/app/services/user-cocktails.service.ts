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
export class UserCocktailsService {
  private apiUrl = '/api/user-cocktails'; // Modifica con il tuo URL di base

  constructor(private http: HttpClient) {}

  getUserCocktails(username: string): Observable<Cocktail[]> {
    const url = `${this.apiUrl}/${username}`;
    return this.http.get<Cocktail[]>(url);
  }

}


