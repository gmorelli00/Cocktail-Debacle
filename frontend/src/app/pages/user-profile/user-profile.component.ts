import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { UserImageComponent } from '../../components/user-image/user-image.component';
import { AuthService } from '../../services/auth.service';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { CocktailsGridComponent } from '../../components/cocktails-grid/cocktails-grid.component';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../services/review.service';
import { ReviewCardComponent } from '../../components/review-card/review-card.component';
import { SearchService } from '../../services/search.service';
import { UserService } from '../../services/user.service';
import { NgIcon } from '@ng-icons/core';


@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    UserImageComponent,
    ReviewCardComponent,
    NgbNavModule,
    CocktailsGridComponent,
    NgIcon
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  username = '';
  email = '';
  editMode = false;
  isAuthenticated = false;
  loading = false;
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  total = 100;
  favorites: any[] = [];
  currentIndex = 0;
  pageSize = 30;
  isLoading = signal(true);
  activeId = 1; // Per il tab attivo
  profileForm!: FormGroup;

  
  // Profile visibility controls
  isOwnProfile = false;
  profileUsername = '';
  loggedInUsername = '';

  // Reviews
  reviews: Review[] = [];
  reviewsLoading: boolean = false;
  reviewsError: string = '';
  ratingOptions = [1, 2, 3, 4, 5];

  savedScrollY: number = 0;



  constructor(
    private authService: AuthService, 
    private route: ActivatedRoute,
    private reviewService: ReviewService,
    private searchService: SearchService,
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // Get the username from the route
    this.route.paramMap.subscribe(params => {
      const usernameParam = params.get('username');
      if (usernameParam) {
        this.profileUsername = usernameParam;
        this.loadProfileData();
      }
    });

    // Check if user is logged in
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      this.isAuthenticated = isLoggedIn;
      
      if (isLoggedIn) {
        // Get current user info to determine if this is the user's own profile
        this.authService.userInfo$.subscribe(user => {
          if (user) {
            this.loggedInUsername = user.username;
            this.isOwnProfile = (this.loggedInUsername === this.profileUsername);
            
            // Only load detailed info if it's the user's own profile
            if (this.isOwnProfile) {
              this.loadOwnProfileDetails();
            }
          }
        });
        
        this.authService.fetchUserInfoIfLoggedIn();
      }
    });

    this.loadUserReviews();
    this.searchService.resetFilters();
  }

  loadProfileData() {
    // Basic profile data load (works for any user)
    this.isLoading.set(true);
    
    // For the profile page, we only need the username for a public profile
    this.username = this.profileUsername;
    this.isLoading.set(false);
  }

  loadOwnProfileDetails() {
    // Load detailed profile data (only for logged-in user viewing their own profile)
    this.userService.getProfile().subscribe({
      next: (res) => {
        this.username = res.userName;
        this.email = res.email;
        this.isLoading.set(false);

        this.profileForm = this.fb.group({
          username: [this.username, [Validators.required]],
          email: [this.email, [Validators.required, Validators.email]],
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error loading profile data');
        this.isLoading.set(false);
      },
    });
  }

  enableEdit() {
    // Only allow editing own profile
    if (this.isOwnProfile) {
      this.editMode = true;
    }
  }

  loadUserReviews() {
    this.savedScrollY = window.scrollY;
    this.reviewsLoading = true;
    this.reviewsError = '';
  
    this.reviewService.getUserReviews(this.profileUsername).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.reviewsLoading = false;
        setTimeout(() => window.scrollTo(0, this.savedScrollY), 0); // ripristina la posizione
      },
      error: (error) => {
        this.reviewsError = 'Failed to load reviews.';
        console.error(error);
        this.reviewsLoading = false;
      }
    });
  }  
}
