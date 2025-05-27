import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Assicurati che il percorso sia corretto
import { signal } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-register-form',
  imports: [CommonModule, NgIconsModule, FormsModule, ButtonComponent],
  providers: [AuthService],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  consentData = true;
  consentSuggestions = true;
  error = signal<string | null>(null);

  acceptedTerms = true;
  acceptedPrivacy = true;

  @Output() registerSuccess = new EventEmitter<boolean>();
  @Output() closeForm = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (this.acceptedTerms && this.acceptedPrivacy) {
      this.authService.register(
        this.username,
        this.email,
        this.password,
        this.confirmPassword,
        this.consentData,
        this.consentSuggestions
      ).subscribe({
        next: () => {
          this.authService.fetchUserInfoIfLoggedIn();
          this.registerSuccess.emit();
          this.closeForm.emit(); // Chiude il form
        },
        error: (err: any) => {
          this.error.set(err?.error?.message || 'Error during registration');
        }
      });
    }
  }  

  closeRegister() {
    this.closeForm.emit();
  }

  switchToLoginForm() {
    this.switchToLogin.emit();
  }
  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }
}
