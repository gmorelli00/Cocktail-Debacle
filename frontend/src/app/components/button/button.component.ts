import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [CommonModule, RouterModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() label: string = 'Click';
  @Input() loadingLabel: string = 'Loading...';
  @Input() isLoading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() link?: string; // opzionale

  @Output() clicked = new EventEmitter<void>();

  handleClick(): void {
    if (!this.disabled && !this.isLoading && !this.link) {
      this.clicked.emit();
    }
  }
}
