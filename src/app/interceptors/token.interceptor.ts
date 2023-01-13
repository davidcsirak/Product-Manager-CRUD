import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { exhaustMap, Observable, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return this.authService.user.pipe(
      // a take elvesz egy erteket es lezarja a feliratkozast ezert az exhaust mappel megadunk neki masik observablet amit vissza tudjon adni
      take(1),
      exhaustMap((user) => {
        if (!user || !user.token) {
          return next.handle(request);
        }
        const modifiedReq = request.clone({
          headers: request.headers.append('userToken', user.token),
        });
        return next.handle(modifiedReq);
      })
    );
  }
}
