import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '../../core/services/firestore.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <div class="header-section">
        <h1>Panel de Administración y Co-creación</h1>
        <p>Bienvenido, <strong>{{ authService.currentUser()?.displayName || 'Admin' }}</strong>. Supervisa y gestiona el contenido pedagógico de Nahuatl App.</p>
      </div>

      <!-- Tarjetas de Métricas -->
      <div class="grid-cols-4 metrics-grid">
        <div class="card metric-card">
          <div class="metric-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <div class="metric-info">
            <span class="label">Módulos</span>
            <span class="value">{{ modulesCount() }}</span>
          </div>
        </div>

        <div class="card metric-card">
          <div class="metric-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="metric-info">
            <span class="label">Ejercicios</span>
            <span class="value">{{ exercisesCount() }}</span>
          </div>
        </div>

        <div class="card metric-card">
          <div class="metric-icon purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div class="metric-info">
            <span class="label">Palabras Diccionario</span>
            <span class="value">{{ dictionaryCount() }}</span>
          </div>
        </div>

        <div class="card metric-card">
          <div class="metric-icon amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>
          </div>
          <div class="metric-info">
            <span class="label">Versión Sync DB</span>
            <span class="value">v{{ syncVersion() }}</span>
          </div>
        </div>
      </div>

      <!-- Acciones Rápidas -->
      <h2 class="section-title">Gestión de Contenido</h2>
      <div class="grid-cols-2 action-grid">
        <a routerLink="/exercises" class="card action-card">
          <div class="action-header">
            <h3>Creador de Ejercicios (4 Modalidades)</h3>
            <span class="badge">Nuevos Reactivos</span>
          </div>
          <p>Crea reactivos pedagógicos de traducción de palabras, frases, selección de imágenes y armado de oraciones en tiempo real.</p>
        </a>

        <a routerLink="/dictionary" class="card action-card">
          <div class="action-header">
            <h3>Diccionario & Grafías Huastecas</h3>
            <span class="badge">18 Grafías DGEI</span>
          </div>
          <p>Gestiona vocabulario, verifica las 18 grafías de Marcelino Hernández Beatriz, audios .wav y desgloses de morfemas aglutinantes.</p>
        </a>

        <a routerLink="/modules" class="card action-card">
          <div class="action-header">
            <h3>Ruta Módulos & Submódulos</h3>
            <span class="badge">Estructura</span>
          </div>
          <p>Organiza los niveles educativos, cambia íconos, títulos en Náhuatl/Español y orden de desbloqueo.</p>
        </a>

        <a routerLink="/sync" class="card action-card">
          <div class="action-header">
            <h3>Centro de Publicación & Sync</h3>
            <span class="badge highlight">ADMIN</span>
          </div>
          <p>Publica borradores e incrementa la versión remota de Firestore para disparar Tactical Delta Sync en todas las apps móviles.</p>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 2rem;
    }
    .header-section {
      margin-bottom: 2rem;
    }
    .header-section h1 {
      font-size: 1.8rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
    }
    .header-section p {
      color: #94A3B8;
    }
    .metrics-grid {
      margin-bottom: 2.5rem;
    }
    .metric-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .metric-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .metric-icon.green { background: rgba(27, 94, 32, 0.2); color: #4ADE80; }
    .metric-icon.orange { background: rgba(216, 67, 21, 0.2); color: #FB923C; }
    .metric-icon.purple { background: rgba(142, 36, 170, 0.2); color: #C084FC; }
    .metric-icon.amber { background: rgba(255, 179, 0, 0.2); color: #FACC15; }
    
    .metric-info .label {
      display: block;
      font-size: 0.8rem;
      color: #94A3B8;
      text-transform: uppercase;
      font-weight: 600;
    }
    .metric-info .value {
      font-size: 1.6rem;
      font-weight: 800;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .action-grid {
      gap: 1.5rem;
    }
    .action-card {
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .action-card:hover {
      border-color: #475569;
      transform: translateY(-2px);
    }
    .action-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .action-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
    }
    .badge {
      background: #334155;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      color: #94A3B8;
    }
    .badge.highlight {
      background: rgba(216, 67, 21, 0.3);
      color: #FF7D47;
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);

  modulesCount = signal<number>(0);
  exercisesCount = signal<number>(0);
  dictionaryCount = signal<number>(0);
  syncVersion = signal<number>(1);

  async ngOnInit() {
    try {
      const [mods, exers, dict, sync] = await Promise.all([
        this.firestoreService.getModules(),
        this.firestoreService.getExercises(),
        this.firestoreService.getDictionaryWords(),
        this.firestoreService.getSyncConfig()
      ]);
      this.modulesCount.set(mods.length);
      this.exercisesCount.set(exers.length);
      this.dictionaryCount.set(dict.length);
      this.syncVersion.set(sync.version || 1);
    } catch (e) {
      console.error('Error al cargar datos del dashboard:', e);
    }
  }
}
