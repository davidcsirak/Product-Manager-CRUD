import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isUserAdmin = false;

  private userSub: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe((user: User | null) => {
      if (user !== null) {
        this.isAuthenticated = true;
        this.isUserAdmin = user.permissions.some((p) => p === 'ADMIN');
      } else {
        this.isAuthenticated = false;
      }
    });
  }

  onLogOut() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.isUserAdmin = false;
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
