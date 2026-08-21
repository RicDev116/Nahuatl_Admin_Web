import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ModulesManagerComponent } from './features/modules-manager/modules-manager';
import { ExercisesManagerComponent } from './features/exercises-manager/exercises-manager';
import { DictionaryManagerComponent } from './features/dictionary-manager/dictionary-manager';
import { SyncCenterComponent } from './features/sync-center/sync-center';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'modules', component: ModulesManagerComponent, canActivate: [authGuard] },
  { path: 'exercises', component: ExercisesManagerComponent, canActivate: [authGuard] },
  { path: 'dictionary', component: DictionaryManagerComponent, canActivate: [authGuard] },
  { path: 'sync', component: SyncCenterComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
