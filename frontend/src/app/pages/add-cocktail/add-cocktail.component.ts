import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CocktailService } from '../../services/cocktails.service';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthModalService } from "../../services/auth-modal.service";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-cocktail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-cocktail.component.html',
  styleUrls: ['./add-cocktail.component.scss'],
})
export class AddCocktailComponent {
  form: FormGroup;
  loading = false;
  isAuthenticated = false;
  imagePreview: string | ArrayBuffer | null = null;
  selectedImageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cocktailService: CocktailService,
    private authService: AuthService,
    private authModalService: AuthModalService) {
    this.form = this.fb.group({
      strDrink: ['', Validators.required],
      strCategory: ['', Validators.required],
      strAlcoholic: ['', Validators.required],
      strGlass: ['', Validators.required],
      strInstructions: ['', Validators.required],
      ingredients: this.fb.array([
        this.createIngredientFormGroup()
      ])
    });
  }

  get ingredients() {
    return this.form.get('ingredients') as FormArray;
  }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      this.isAuthenticated = isLoggedIn;
    });
  }

  createIngredientFormGroup(): FormGroup {
    return this.fb.group({
      ingredient: ['', Validators.required],
      measure: ['', Validators.required],
    });
  }

  addIngredient() {
    if (this.ingredients.length < 15) {
      this.ingredients.push(this.createIngredientFormGroup());
    }
  }

  removeIngredient(index: number) {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }


  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }
  
  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    if (this.isAuthenticated === false) {
      this.authModalService.open();
      return;
    }
  
    this.loading = true;
  
    if (!this.selectedImageFile) {
      alert('Please select an image before submitting.');
      this.loading = false;
      return;
    }
    const uploadImage = this.cocktailService.uploadImage(this.selectedImageFile);
  
    uploadImage.pipe(
      switchMap((response) => {
        const imageUrl = response?.url ?? '';
        const dto: any = {
          strDrink: this.form.value.strDrink,
          strCategory: this.form.value.strCategory,
          strAlcoholic: this.form.value.strAlcoholic,
          strGlass: this.form.value.strGlass,
          strInstructions: this.form.value.strInstructions,
          strDrinkThumb: imageUrl,
        }

        this.form.value.ingredients.forEach((item: any, index: number) => {
          dto[`strIngredient${index + 1}`] = item.ingredient;
          dto[`strMeasure${index + 1}`] = item.measure;
        });
        
        return this.cocktailService.createCocktail(dto);
      })
    ).subscribe({
      next: () => {
        this.loading = false;
        alert('Cocktail aggiunto!');
      },
      error: () => {
        this.loading = false;
        alert('Errore durante la creazione del cocktail');
      }
    });
  }  
}
