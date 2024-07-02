import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from './login.model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { Account } from 'src/app/models/account.model';
import { AuthServerProvider } from 'src/app/services/auth-jwt.service';

@Injectable({ providedIn: 'root' })
export class LoginService {

  private baseUrl = environment.apiUrl + '';

  constructor(private http:HttpClient,
    private authServerProvider: AuthServerProvider,

    ) {}

  login(credentials: Login): Observable<Account | null | void> {
    return this.authServerProvider.login(credentials);
  }

  logout(): void {

  }

  ResendEmail(email: string) {
   return this.authServerProvider.resendEmail(email);
  }

  LoginSuccess(jwtToken: string,rememberMe: boolean){
    this.authServerProvider.authenticateSuccess(jwtToken,rememberMe);
  }

}
