import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Importa FormsModule per il two-way data binding
import { NgIconsModule } from '@ng-icons/core';
import { AuthService } from '../../services/auth.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-login-form',
  imports: [CommonModule, FormsModule, NgIconsModule],  // Aggiungi FormsModule per il two-way data binding
  providers: [AuthService],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  username: string = '';
  password: string = '';
  error = signal<string | null>(null);  
  
  @Output() loginSuccess = new EventEmitter<boolean>();  // Evento per notificare il login avvenuto con successo
  @Output() closeForm = new EventEmitter<void>();  // Evento per chiudere il form
  @Output() switchToRegister = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.username || !this.password) return;
  
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        console.log('Login successfully:', res);
  
        // 🔥 Subito dopo login, aggiorna info utente per mostrare l'icona con iniziale
        this.authService.fetchUserInfoIfLoggedIn();
        this.loginSuccess.emit(); // Notifica al componente padre
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Error during registration');
      }
    });
  }
  
  

  closeLogin() {
    this.closeForm.emit();  // Evento per chiudere il form
  }

  switchToRegisterForm() {
    this.switchToRegister.emit();
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }
}

