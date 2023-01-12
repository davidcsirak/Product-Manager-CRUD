import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { BehaviorSubject, tap } from 'rxjs';
import * as uuid from 'uuid';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiURL = 'http://localhost:3000';
  user = new BehaviorSubject<User | null>(null);
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  logIn(email: string, password: string) {
    // feltételezem hogy minden email cím egyedi
    return this.http.get<User[]>(this.apiURL + `/users?email=${email}`).pipe(
      tap((users) => {
        if (users.length === 0) {
          throw new Error('Nem létezik ilyen email cím!');
        } else if (users[0].password !== password) {
          throw new Error('Helytelen jelszó!');
        } else {
          const generatedToken = uuid.v4();
          const expirationDate = new Date(
            new Date().getTime() + environment.sessionExpDurationSecond * 1000
          );
          const authedUser = new User(
            users[0].id,
            users[0].email,
            users[0].name,
            users[0].password,
            users[0].permissions,
            generatedToken,
            expirationDate
          );

          this.user.next(authedUser);
          this.autoLogout(environment.sessionExpDurationSecond * 1000);
          localStorage.setItem(
            'currentUser',
            JSON.stringify({ ...authedUser, login_at: new Date().getTime() })
          );
        }
      })
    );
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/login']);
    localStorage.removeItem('currentUser');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  autoLogin() {
    const userJson = localStorage.getItem('currentUser');
    const userData: {
      id: number;
      email: string;
      name: string;
      password: string;
      permissions: string[];
      _token: string;
      _tokenExpirationDate: string;
    } = userJson !== null ? JSON.parse(userJson) : null;
    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.id,
      userData.email,
      userData.name,
      userData.password,
      userData.permissions,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDurationLeft =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDurationLeft);
    }
  }
}
