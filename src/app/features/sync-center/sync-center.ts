import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../core/services/firestore.service';
import { AuthService } from '../../core/services/auth.service';
import { SyncConfig } from '../../core/models/models';

@Component({
  selector: 'app-sync-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sync-page">
      <div class="header">
        <h1>Centro de Publicación & Sincronización Táctica</h1>
        <p>Controla el versionado global de datos en Cloud Firestore para notificar a las aplicaciones móviles Android.</p>
      </div>

      <div class="grid-cols-2">
        <!-- Tarjeta de Estado de Versión -->
        <div class="card version-card">
          <div class="card-header">
            <h3>Estado de Versión Remota (SSOT)</h3>
            <span class="badge highlight">Firestore Sync</span>
          </div>

          <div class="version-display">
            <span class="version-number">v{{ syncConfig().version }}</span>
            <p class="last-update" *ngIf="lastUpdateDate()">
              Última actualización: <strong>{{ lastUpdateDate() }}</strong>
            </p>
          </div>

          <div class="info-alert">
            ℹ️ Al hacer clic en <strong>Incrementar Versión Global</strong>, todas las instancias de <em>Nahuatl App</em> detectarán la nueva versión en su próxima comprobación y descargarán el contenido actualizado sin requerir actualización de APK en Play Store.
          </div>

          <button 
            class="btn btn-accent btn-lg" 
            [disabled]="!authService.isAdmin() || isIncrementing()"
            (click)="onIncrementVersion()"
          >
            <span *ngIf="!isIncrementing()">🚀 Publicar Cambios & Disparar Sync Global</span>
            <span *ngIf="isIncrementing()">Incrementando versión remota...</span>
          </button>
          
          <p *ngIf="!authService.isAdmin()" class="role-warning">
            🔒 Solo los usuarios con rol <strong>ADMIN</strong> pueden disparar el incremento global de versión.
          </p>
        </div>

        <!-- Exportación de Datos Semilla -->
        <div class="card backup-card">
          <div class="card-header">
            <h3>Respaldos & Exportación JSON Local</h3>
            <span class="badge">Paridad de Assets</span>
          </div>

          <p class="backup-desc">
            Genera y descarga copias de respaldo en formato JSON estructurado para mantener paridad con los archivos locales del repositorio (words.json y seed_data.json).
          </p>

          <div class="export-actions">
            <button class="btn btn-primary" (click)="exportDictionaryJSON()">
              📥 Exportar Diccionario (words.json)
            </button>
            <button class="btn btn-primary" (click)="exportSeedDataJSON()">
              📥 Exportar Módulos y Ejercicios (seed_data.json)
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sync-page { padding: 2rem; }
    .header { margin-bottom: 2rem; }
    .header h1 { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; }
    .header p { color: #94A3B8; }
    
    .version-card, .backup-card { display: flex; flex-direction: column; justify-content: space-between; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .card-header h3 { font-size: 1.2rem; font-weight: 700; }

    .version-display { text-align: center; margin: 1.5rem 0; background: #0F172A; padding: 2rem; border-radius: 16px; border: 1px solid #334155; }
    .version-number { font-size: 3.5rem; font-weight: 900; color: #FFB300; display: block; }
    .last-update { color: #94A3B8; font-size: 0.9rem; margin-top: 0.5rem; }
    
    .info-alert { background: rgba(59, 130, 246, 0.15); border: 1px solid #3B82F6; color: #93C5FD; padding: 1rem; border-radius: 12px; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .btn-lg { width: 100%; justify-content: center; padding: 1rem; font-size: 1.05rem; }
    .role-warning { color: #F87171; font-size: 0.85rem; text-align: center; margin-top: 0.75rem; }
    
    .backup-desc { color: #94A3B8; font-size: 0.95rem; margin-bottom: 2rem; line-height: 1.5; }
    .export-actions { display: flex; flex-direction: column; gap: 1rem; }
    .export-actions .btn { justify-content: center; }
  `]
})
export class SyncCenterComponent implements OnInit {
  authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);

  syncConfig = signal<SyncConfig>({ version: 1, last_update: null });
  lastUpdateDate = signal<string>('');
  isIncrementing = signal<boolean>(false);

  async ngOnInit() {
    await this.loadSyncConfig();
  }

  async loadSyncConfig() {
    const config = await this.firestoreService.getSyncConfig();
    this.syncConfig.set(config);
    if (config.last_update) {
      const date = config.last_update.toDate ? config.last_update.toDate() : new Date(config.last_update);
      this.lastUpdateDate.set(date.toLocaleString('es-MX'));
    }
  }

  async onIncrementVersion() {
    if (!confirm('¿Confirmas disparar el incremento de versión remota? Todas las apps móviles sincronizarán los nuevos datos.')) {
      return;
    }
    this.isIncrementing.set(true);
    try {
      const newVer = await this.firestoreService.incrementGlobalSyncVersion();
      alert(`✅ ¡Versión remota incrementada con éxito a v${newVer}!`);
      await this.loadSyncConfig();
    } catch (e) {
      console.error('Error al incrementar versión:', e);
      alert('❌ Error al incrementar versión en Firestore.');
    } finally {
      this.isIncrementing.set(false);
    }
  }

  async exportDictionaryJSON() {
    const words = await this.firestoreService.getDictionaryWords();
    this.downloadJSON(words, 'words.json');
  }

  async exportSeedDataJSON() {
    const [modules, submodules, exercises] = await Promise.all([
      this.firestoreService.getModules(),
      this.firestoreService.getSubmodules(),
      this.firestoreService.getExercises()
    ]);
    this.downloadJSON({ modules, submodules, exercises }, 'seed_data.json');
  }

  private downloadJSON(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
