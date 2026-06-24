import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  //get stored token and attach to request headers

  //run for every http request
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    //get token from auth service
    return from(this.authService.getToken()).pipe( 
      switchMap(token => {
        if (token) {
          const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`) //send request with token in header
          });
          return next.handle(authReq); //send modified request with token
        }
        return next.handle(req); //send original request if no token
      })
    );
  }
}