import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface UpdateProfileDto {
  username?: string;
  email?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  consentData?: boolean;
  consentSuggestions?: boolean;
}

export interface DeleteProfileDto {
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = '/api/user';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/profile`, {
      withCredentials: true
    });
  }

  updateProfile(data: UpdateProfileDto): Observable<any> {
    return this.http.patch(`${this.baseUrl}/profile`, data, {
      withCredentials: true
    });
  }

  deleteAccount(data: DeleteProfileDto): Observable<any> {
    return this.http.delete(`${this.baseUrl}/profile`, {
      body: data,
      withCredentials: true
    });
  }

}

