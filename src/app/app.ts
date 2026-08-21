import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Layout si el usuario está autenticado -->
    <div class="app-container" *ngIf="authService.isLoggedIn(); else unauthLayout">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-badge">N</div>
          <div>
            <h3>Nahuatl Admin</h3>
            <span class="sub-logo">Huasteca Hidalguense</span>
          </div>
        </div>

        <ul class="nav-links">
          <li class="nav-item">
            <a routerLink="/dashboard" routerLinkActive="active">
              📊 <span>Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/modules" routerLinkActive="active">
              🗺️ <span>Módulos & Submódulos</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/exercises" routerLinkActive="active">
              🎮 <span>Ejercicios (4 Tipos)</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/dictionary" routerLinkActive="active">
              📖 <span>Diccionario & Grafías</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/sync" routerLinkActive="active">
              🚀 <span>Publicación & Sync</span>
            </a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <button class="btn btn-logout" (click)="logout()">
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-bar">
          <div class="breadcrumb">
            <span>Módulo de Administración & Co-creación</span>
          </div>

          <div class="user-info">
            <span class="role-badge" [ngClass]="authService.currentUser()?.role || 'creator'">
              ROL: {{ authService.currentUser()?.role?.toUpperCase() || 'CREATOR' }}
            </span>
            <span class="user-email">{{ authService.currentUser()?.email }}</span>
          </div>
        </header>

        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Layout para vista de Login (sin sidebar/topbar) -->
    <ng-template #unauthLayout>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .sub-logo { font-size: 0.75rem; color: #94A3B8; display: block; }
    .sidebar-footer { margin-top: auto; padding-top: 1.5rem; border-top: 1px solid #334155; }
    .btn-logout { background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid #EF4444; width: 100%; justify-content: center; }
    .btn-logout:hover { background: rgba(239, 68, 68, 0.3); }
    .user-info { display: flex; align-items: center; gap: 1rem; }
    .user-email { font-size: 0.85rem; color: #94A3B8; font-weight: 500; }
  `]
})
export class AppComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
