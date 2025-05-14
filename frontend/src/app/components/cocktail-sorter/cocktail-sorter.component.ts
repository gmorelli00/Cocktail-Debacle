import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-cocktail-sorter',
  imports: [CommonModule],
  templateUrl: './cocktail-sorter.component.html',
  styleUrl: './cocktail-sorter.component.scss'
})
export class CocktailSorterComponent {
  @Output() sortChange = new EventEmitter<string>();

  onSortChange(event: Event) {
    const select = event.target as HTMLSelectElement | null; // cast esplicito
    if (select) {
      this.sortChange.emit(select.value);
    } else {
      console.error('Target is not a select element');
    }
  }
}
