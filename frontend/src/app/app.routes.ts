import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CocktailsComponent } from './pages/cocktails/cocktails.component';
import { CocktailPageComponent } from './pages/cocktail-page/cocktail-page.component';
import { PlacesComponent } from './pages/places/places.component';
import { PlacePageComponent } from './pages/place-page/place-page.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { AddCocktailComponent } from './pages/add-cocktail/add-cocktail.component';
import { SettingsComponent } from './pages/settings/settings.component';
// import { AboutComponent } from './about/about.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, title: 'Home' },
  { path: 'cocktails', component: CocktailsComponent, title: 'Cocktails' },
  { path: 'cocktail/:id', component: CocktailPageComponent, title: 'Cocktail' },
  { path: 'places', component: PlacesComponent, title: 'Places' },
  { path: 'place/:id', component: PlacePageComponent, title: 'Place' },
  { path: 'profile/:username', component: UserProfileComponent, title: 'Profile' },
  { path: 'reviews/:placeId/:cocktailId', component: ReviewsComponent, title: 'Reviews' },
  // { path: 'add-review', component: AddReviewComponent, title: 'Add Review' },
  { path: 'add-cocktail', component: AddCocktailComponent, title: 'Add Cocktail' },
  { path: 'settings', component: SettingsComponent, title: 'Settings' },
//   { path: 'about', component: AboutComponent }
];