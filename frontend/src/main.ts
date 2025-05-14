/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgIconsModule } from '@ng-icons/core';
import { heroUserCircle, heroHome, heroMapPin, heroBookmark, heroChatBubbleOvalLeft, heroPlusCircle, heroMap, heroAdjustmentsHorizontal, heroCog6Tooth } from '@ng-icons/heroicons/outline';
import { heroHomeSolid, heroMapPinSolid, heroBookmarkSolid, heroChatBubbleOvalLeftSolid, heroPlusCircleSolid, heroArrowLeftCircleSolid, heroArrowRightCircleSolid } from '@ng-icons/heroicons/solid'; 
import { heroXMark } from '@ng-icons/heroicons/outline';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';


bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      NgIconsModule.withIcons({ heroUserCircle, heroXMark, heroHome, heroHomeSolid , heroMapPin, heroMapPinSolid, heroBookmark, heroBookmarkSolid, heroChatBubbleOvalLeft, heroChatBubbleOvalLeftSolid, heroPlusCircle, heroPlusCircleSolid, heroMap, heroAdjustmentsHorizontal, heroArrowLeftCircleSolid, heroArrowRightCircleSolid, heroCog6Tooth }),
    ),
    provideHttpClient(),
    provideRouter(appRoutes),
  ]
}) .catch((err) => console.error(err));