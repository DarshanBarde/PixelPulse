import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service'; // Changed to regular import

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isDarkMode = false;
  showUserMenu = false;
  showSettings = false;

  constructor(private themeService: ThemeService, private router: Router) {}

  ngOnInit(): void {
    this.themeService.darkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.showSettings = false;
    }
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  closeMenus(): void {
    this.showUserMenu = false;
  }

  logout(): void {
    localStorage.removeItem('token'); // Clear the token
    this.router.navigate(['/login']); // Redirect to login
    console.log('Logged out');
  }
}