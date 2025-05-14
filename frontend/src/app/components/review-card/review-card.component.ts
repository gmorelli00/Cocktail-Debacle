import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserImageComponent } from '../user-image/user-image.component';
import { ReviewService } from '../../services/review.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, FormsModule, UserImageComponent, RouterModule],
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss']
})
export class ReviewCardComponent {
  @Input() review: any;
  @Input() currentUserName: string = '';
  @Input() showPlaceCocktail: boolean = false;
  @Input() ratingOptions: number[] = [1, 2, 3, 4, 5];

  @Output() navigateToUserProfile = new EventEmitter<string>();
  @Output() refreshParent = new EventEmitter<void>(); // Nuovo: per avvisare che serve ricaricare dal padre

  // Local states
  isEditing: boolean = false;
  editReview: { rating: number; comment: string } = { rating: 5, comment: '' };

  showDeleteConfirm: boolean = false;

  submittingReview: boolean = false;
  deletingReview: boolean = false;
  reviewSuccess: boolean = false;
  reviewError: string = '';
  maxCollapsedChars = 250;
  isCommentExpanded = false;

  constructor(private reviewService: ReviewService) {}

  isAuthor(): boolean {
    return this.review?.userName === this.currentUserName;
  }

  onEdit(): void {
    this.isEditing = true;
    this.editReview = {
      rating: this.review.rating,
      comment: this.review.comment
    };
    this.showDeleteConfirm = false;
  }

  onCancelEditReview(): void {
    this.isEditing = false;
    this.editReview = { rating: 5, comment: '' };
    this.reviewError = '';
  }

  onSaveEditReview(): void {
    if (!this.editReview.comment.trim()) {
      this.reviewError = 'Please enter a comment';
      return;
    }

    this.submittingReview = true;
    this.reviewError = '';

    this.reviewService.updateReview(this.review.id, this.editReview).subscribe({
      next: () => {
        this.submittingReview = false;
        this.reviewSuccess = true;
        setTimeout(() => {
          this.refreshParent.emit(); // Avvisa il padre di ricaricare i dati
          this.isEditing = false;
          this.reviewSuccess = false;
        }, 2000);
      },
      error: (error) => {
        this.submittingReview = false;
        this.reviewError = error.error?.message || 'Failed to update review. Please try again.';
        console.error('Error updating review:', error);
      }
    });
  }

  onDelete(): void {
    this.showDeleteConfirm = true;
    this.isEditing = false;
  }

  onCancelDeleteReview(): void {
    this.showDeleteConfirm = false;
  }

  onConfirmDeleteReview(): void {
    this.deletingReview = true;

    this.reviewService.deleteReview(this.review.id).subscribe({
      next: () => {
        this.deletingReview = false;
        this.showDeleteConfirm = false;
        this.refreshParent.emit(); // Avvisa il padre di ricaricare i dati
      },
      error: (error) => {
        this.deletingReview = false;
        this.reviewError = error.error?.message || 'Failed to delete review. Please try again.';
        console.error('Error deleting review:', error);
      }
    });
  }

  onSetEditRating(rating: number): void {
    this.editReview.rating = rating;
  }

  isEditRatingSelected(rating: number): boolean {
    return this.editReview.rating === rating;
  }

  onNavigateToUserProfile(): void {
    if (this.review?.userName) {
      this.navigateToUserProfile.emit(this.review.userName);
    }
  }

  getStarRating(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  get needsToggle(): boolean {
    return this.review?.comment?.length > this.maxCollapsedChars;
  }

  toggleComment(): void {
    this.isCommentExpanded = !this.isCommentExpanded;
  }
  
}
