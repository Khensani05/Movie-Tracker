import { Component, OnInit } from '@angular/core';
import { User } from '../user.model';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.page.html',
  styleUrls: ['./login-page.page.scss'],
  standalone: false,
})

export class LoginPagePage {

  //create a user object that will be able to call to the user model defined
  user: User = {
      user_Id: 0,
      userEmail: '',
      userPassword: ''
    };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

    //wait for operations and return nothing to avoid ansync throwing errors
    onSubmit(): void {

    const userEmail = this.user.userEmail?.trim() || '';
    const password = this.user.userPassword?.trim() || '';

    try {

      //validate fields
      if (!userEmail || !password) {
        alert('Please fill in all fields');
        return;
      }

      //request - use LoginRequestModel
        const payload = {
          user_Email: userEmail,
          password_Hash: password
        };

      //send login request to backend
      this.authService.loginUser(payload).subscribe({
        next: (response) => {

          console.log('Login successful', response);

          //no need to save it ourselves as tap() in AuthService already does it
          // localStorage.setItem('token', response.token);

          //navigate to tabs page
          this.router.navigate(['/tabs']);
        },

        error: (error) => {
          //user is not registered
          console.error('Login failed', error);
          alert('Invalid credentials');
        }
      });

    } catch (error) {

      console.error('Unexpected error:', error);
      alert('Something went wrong. Please try again later.');
    }
  }
}