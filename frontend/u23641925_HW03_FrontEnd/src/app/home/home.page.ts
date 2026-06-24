  import { Component } from '@angular/core';
  import { Router } from '@angular/router';
  import { User } from '../user.model';
  import { AuthService } from '../services/auth-service';

  @Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: false,
  })
  export class HomePage {

    //initialise empty user to add new users 
    user: User = {
      user_Id: 0,
      userEmail: '',
      userPassword: '',
      userConfirmPassword: ''
    };

    constructor(
      private router: Router,
      private authService: AuthService
    ) {}

    //REGISTER METHOD
    async onSubmit(): Promise<void> {
      try {
        const userEmail = this.user.userEmail?.trim();
        const password = this.user.userPassword?.trim();
        const confirmPassword = this.user.userConfirmPassword?.trim();

        //validate if all are filled
        if (!userEmail || !password || !confirmPassword) {
          alert('Please fill in all fields');
          return;
        } //passwords match
        else if (password !== confirmPassword) { 
          alert('Passwords do not match');
          return;
        } 

        //only send one password to backend - use RegisterRequestModel
        const payload = {
          user_Email: userEmail,
          password_Hash: password
        };

        console.log('Sending payload:', payload); //


        //use register method in api to store user
        this.authService.registerUser(payload).subscribe({
          next: (response) => {
            console.log('User saved');
            console.log('Register response:', response); //
            alert('Registration successful!');
            this.router.navigate(['/login-page']);
          }, error: (err) => {
              console.error(err);
              console.log('Full error:', err); 

              
              if (err.status === 400) {
                alert('User already exists.');
              } else {
                alert('Registration failed.');
              }
          }
        })
      } catch (error) {
        console.error('Register error:', error);
        alert('Something went wrong. Please try again later.')
      }
    }
}
