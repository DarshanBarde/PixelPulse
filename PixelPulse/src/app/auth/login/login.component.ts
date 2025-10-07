import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
    errorMessage: string = '';

    constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
      this.loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });
    }

    onSubmit() {
      if (this.loginForm.valid) {
        this.http.post('http://localhost:8000/api/login/', this.loginForm.value)
          .subscribe({
            next: (response: any) => {
              // Assuming the backend returns a token or user data
              localStorage.setItem('token', response.token); // Adjust based on your backend response
              this.router.navigate(['/dashboard']);
            },
            error: (err) => {
              this.errorMessage = 'Login failed. Please check your credentials.';
            }
          });
      }
    }
}
