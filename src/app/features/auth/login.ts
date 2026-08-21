import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="brand">
          <div class="logo">N</div>
          <h2>Nahuatl App Admin</h2>
          <p>Portal de Gestión y Co-creación Educativa</p>
        </div>

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              class="form-control" 
              [(ngModel)]="email" 
              name="email" 
              placeholder="admin@nahuatlapp.com" 
              required
            />
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              class="form-control" 
              [(ngModel)]="password" 
              name="password" 
              placeholder="••••••••" 
              required
            />
          </div>

          <div *ngIf="errorMessage()" class="error-banner">
            {{ errorMessage() }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading()">
            {{ isLoading() ? 'Iniciando Sesión...' : 'Ingresar al Portal' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, #1B5E20 0%, #0F172A 60%);
    }
    .login-card {
      background: #1E293B;
      border: 1px solid #334155;
      padding: 2.5rem;
      border-radius: 24px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .brand {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #1B5E20, #D84315);
      border-radius: 16px;
      margin: 0 auto 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 800;
      color: white;
      box-shadow: 0 8px 16px rgba(27, 94, 32, 0.4);
    }
    .brand h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .brand p {
      color: #94A3B8;
      font-size: 0.85rem;
    }
    .btn-block {
      width: 100%;
      justify-content: center;
      margin-top: 1rem;
    }
    .error-banner {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #EF4444;
      color: #F87171;
      padding: 0.75rem;
      border-radius: 10px;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Por favor completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      this.errorMessage.set(err.message || 'Credenciales inválidas. Intenta nuevamente.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
