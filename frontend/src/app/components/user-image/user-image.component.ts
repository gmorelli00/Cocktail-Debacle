import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-image.component.html',
  styleUrls: ['./user-image.component.scss']
})
export class UserImageComponent implements OnInit {
  @Input() imageUrl: string = ''; // Se vuoi usare un'immagine al posto dell'iniziale
  @Input() userName: string = ''; // Allow passing in a username directly
  @Input() size: string = 'medium'; // small, medium, large

  userInitial: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // If a username is provided as input, use it directly
    if (this.userName) {
      this.userInitial = this.userName.charAt(0).toUpperCase();
    } else {
      // Otherwise, get it from the auth service
      this.authService.userInfo$.subscribe((res) => {
        if (res) {
          this.userName = res.username;
          this.userInitial = this.userName.charAt(0).toUpperCase();
        }
      });
    }
  }

  getColorForUser(): string {
    if (!this.userName) return 'hsl(200, 70%, 50%)'; // Default color
    
    let hash = 0;
    for (let i = 0; i < this.userName.length; i++) {
      hash = this.userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 20%)`; // Colori vivaci e leggibili
  }
}
