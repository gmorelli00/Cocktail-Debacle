import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  private _loginModal$ = new BehaviorSubject<boolean>(false);
  /** observable a cui i componenti si possono collegare (async pipe) */
  loginModal$ = this._loginModal$.asObservable();

  open()  { this._loginModal$.next(true); }
  close() { this._loginModal$.next(false); }
  toggle() { this._loginModal$.next(!this._loginModal$.value); }
}
