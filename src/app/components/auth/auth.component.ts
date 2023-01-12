import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit, OnDestroy {
  authForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  constructor(
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSubmit() {
    console.warn(this.authForm.value);

    const email: any = this.authForm.value.email;
    const password: any = this.authForm.value.password;

    this.authService.logIn(email, password).subscribe(
      (users: User[]) => {
        this.router.navigate(['/products']);
      },
      (error) => {
        this.openErrorSnackBar(error.message);
      }
    );
  }

  openErrorSnackBar(message: string) {
    this._snackBar.open(message, 'X');
  }

  ngOnDestroy(): void {}
}
