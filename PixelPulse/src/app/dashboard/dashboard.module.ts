import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainContentComponent } from './main-content/main-content.component';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from "@angular/forms"
import { SettingsComponent } from './settings/settings.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ThemeService } from '../services/theme.service';
import { RouterModule } from '@angular/router';
@NgModule({
  declarations: [
    DashboardComponent,
    MainContentComponent,
    HeaderComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,FormsModule,RouterModule,
  ],
  providers: [
    ThemeService
  ],
  exports: [
    DashboardComponent 
  ]
})
export class DashboardModule { }