import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      full_name: [''] // Optional, no Validators.required
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.http.post('http://localhost:8000/api/signup/', this.signupForm.value)
        .subscribe({
          next: (response: any) => {
            alert('Signup successful! Please log in.');
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.errorMessage = err.error.error || 'Signup failed. Please try again.';
          }
        });
    }
  }
}