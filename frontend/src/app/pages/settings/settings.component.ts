import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService, UpdateProfileDto, DeleteProfileDto } from '../../services/user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';


@Component({
  selector: 'app-settings',
  imports: [ CommonModule, FormsModule, NgIf, ReactiveFormsModule, RouterModule, NgIconsModule ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  username = '';
  email = '';
  oldPassword = '';
  newPassword = '';
  consentData = false;
  consentSuggestions = false;
  editMode = false;
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  profileForm!: FormGroup;
  deletePassword = '';
  confirmDelete = false;
  currentUsername = '';

  isOwnProfile = false;
  profileUsername = '';
  loggedInUsername = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadOwnProfileDetails();

    // Get current username for profile navigation
    this.authService.userInfo$.subscribe(userInfo => {
      if (userInfo) {
        this.currentUsername = userInfo.username;
      }
    });
  }

  enableEdit() {
    // Only allow editing own profile
    if (this.isOwnProfile) {
      this.editMode = true;
    }
  }

  loadOwnProfileDetails() {
    this.userService.getProfile().subscribe({
      next: (res) => {
        this.username = res.userName;
        this.email = res.email;
        this.consentData = res.consentData ?? false;
        this.consentSuggestions = res.consentSuggestions ?? false;

        this.profileForm = this.fb.group({
          username: [this.username, [Validators.required]],
          email: [this.email, [Validators.required, Validators.email]],
          oldPassword: [''],
          newPassword: [''],
          confirmPassword: [''],
          consentData: this.consentData,
          consentSuggestions: this.consentSuggestions,
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error loading profile data');
      },
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;
    const data: UpdateProfileDto = this.profileForm.value;

    this.userService.updateProfile(data).subscribe({
      next: () => {
        this.successMessage.set('Profile updated successfully!');
        this.error.set('');
        this.editMode = false;
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Error updating profile');
      }
    });
  }

  deleteAccount() {
    const dto: DeleteProfileDto = { password: this.deletePassword };
    this.userService.deleteAccount(dto).subscribe({
      next: () => {
        this.successMessage.set('Profile deleted successfully!');
        this.authService.logout();
        this.router.navigate(['/']).then(() => location.reload());
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error deleting profile');
      }
    });
  }
}
