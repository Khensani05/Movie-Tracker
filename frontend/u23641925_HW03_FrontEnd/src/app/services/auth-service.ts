import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService{
    
    private authUrl = 'https://localhost:7149/api/auth';

    //contructor will pass httpclient so we can send httprequets =>import http
    constructor(
        private http: HttpClient,
        private storageService: StorageService 
    ){}


    //add registred user : POST /api/auth/register
    registerUser(user: any): Observable<any> {
        return this.http.post(`${this.authUrl}/register`, user);
    }

    //add login user : POST /api/auth/login - store access token automatically in local storage
    loginUser(user: any): Observable<any> {
        return this.http.post(`${this.authUrl}/login`, user).pipe(
            tap( async (response: any) => {
                await this.storageService.set('accessToken', response.accessToken);
                await this.storageService.set('userID', response.user_ID.toString());

            })
        );
    }

    //logout - clear the user session
    async logout(): Promise<void>{
        await this.storageService.remove('accessToken');
        await this.storageService.remove('userId');
    }

    //check if user logged in
    async isLoggedIn(): Promise<boolean>{
        const token = await this.storageService.get<string>('accessToken');
        return !!token;
    }

    // get token to attach to requests
    async getToken(): Promise<string | null> {
        return await this.storageService.get<string>('accessToken');
    }

    // get stored userId
    async getUserId(): Promise<number> {
        const id = await this.storageService.get<string>('userId');
        return parseInt(id || '0');
    }
}
