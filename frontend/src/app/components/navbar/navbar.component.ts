import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from '../login-form/login-form.component';
import { RegisterFormComponent } from '../register-form/register-form.component';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { AuthService } from '../../services/auth.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { UserImageComponent } from '../user-image/user-image.component'; // Aggiungi il percorso corretto
import { filter } from 'rxjs/operators';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AuthModalService } from "../../services/auth-modal.service";
import { AddReviewComponent } from '../add-review/add-review.component';
import { ReviewService } from '../../services/review.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoginFormComponent,
    NgIconsModule, // ✅ solo questo
    RegisterFormComponent,
    NgbDropdownModule,
    UserImageComponent, // Aggiungi il componente UserImage
    NgbTooltip,
    AddReviewComponent
],
  providers: [AuthService],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @ViewChild('tooltip', { static: false }) tooltip!: NgbTooltip;
  isAuthenticated = false;
  showDropdown = false;
  showLoginForm = false;
  showRegisterForm = false;
  currentUsername = '';
  isHome = false;
  isCocktails = false;
  isPlaces = false;
  isAddReview = false;
  isAddCocktail = false;
  showAddReview = false;

  constructor(private authService: AuthService, private router: Router, public authModalService: AuthModalService, public reviewService: ReviewService) {}

  ngOnInit() {
    this.updateIcons(this.router.url);
    this.authService.userInfo$.subscribe((userInfo) => {
      this.isAuthenticated = !!userInfo;
      if (userInfo) {
        this.currentUsername = userInfo.username;
      }
    });
    
    // Nel caso in cui entri nella pagina già loggato
    this.authService.fetchUserInfoIfLoggedIn();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateIcons(event.url);
    });
  }


  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  updateIcons(url: string): void {
    this.isHome = url === '/';
    this.isCocktails = url.startsWith('/cocktails');
    this.isPlaces = url.startsWith('/places');
    this.isAddCocktail = url.startsWith('/add-cocktail');
  }

  hideTooltipAndNavigate(tooltip: NgbTooltip, route: string): void {
    this.hideTooltip(tooltip);
    this.router.navigate([route]);
  }

  hideTooltip(tooltip: NgbTooltip): void {
    if (tooltip.isOpen()) {
      tooltip.close();
    }
  }

  navigateToProfile() {
    if (this.currentUsername) {
      this.router.navigate(['/profile', this.currentUsername]);
      this.showDropdown = false;
    }
  }

  toggleLoginForm() {
    this.authModalService.toggle()
    this.showLoginForm = !this.showLoginForm;
    this.showRegisterForm = false;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  toggleAddReview(): void {
    if (!this.isAuthenticated) {
      this.toggleLoginForm();
      return;
    }
    this.reviewService.toggle(); // Mostra il modal
    this.isAddReview = !this.isAddReview;
    this.showAddReview = false;
  }

  onReviewSuccess() {
    this.isAddReview = !this.isAddReview;
    this.showAddReview = false;
    this.reviewService.close();
  }

  onLoginSuccess() {
    this.isAuthenticated = true;
    this.authService.fetchUserInfoIfLoggedIn(); // 👈 forza la fetch anche qui
    this.showLoginForm = false;
    this.authModalService.close();
  }

  onRegisterSuccess() {
    this.isAuthenticated = true;
    this.authService.fetchUserInfoIfLoggedIn(); // 👈 forza la fetc
    this.showRegisterForm = false;
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.isAuthenticated = false;  // Imposta lo stato di autenticazione su falso
        this.showDropdown = false;    // Nasconde il dropdown
        this.router.navigateByUrl('/').then(() => {
          window.location.reload();
        });
        console.log('Logout riuscito');
      },
      error: () => {
        console.error('Errore durante il logout');
      }
    });
  }
}
