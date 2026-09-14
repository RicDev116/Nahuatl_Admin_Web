import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../core/services/firestore.service';
import { GrammarValidatorService } from '../../core/services/grammar-validator.service';
import { ExerciseItem, ExerciseType, ExerciseDirection, SubmoduleItem } from '../../core/models/models';

@Component({
  selector: 'app-exercises-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="exercises-page">
      <div class="header">
        <div>
          <h1>Gestor de Ejercicios Educativos</h1>
          <p>Crea y administra ejercicios pedagógicos de las 4 modalidades soportadas.</p>
        </div>
        <button class="btn btn-primary" (click)="openNewModal()">+ Nuevo Ejercicio</button>
      </div>

      <!-- Filtro por Submódulo -->
      <div class="card filter-card">
        <label>Filtrar por Submódulo:</label>
        <select class="form-control" [(ngModel)]="selectedSubmoduleId" (change)="loadExercises()">
          <option value="">-- Todos los Submódulos --</option>
          <option *ngFor="let s of submodules()" [value]="s.id">
            [{{ s.moduleId }}] {{ s.titleEs }} ({{ s.titleNah }})
          </option>
        </select>
      </div>

      <!-- Tabla de Ejercicios -->
      <div class="card table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Pregunta / Prompt</th>
              <th>Respuesta Correcta</th>
              <th>Submódulo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ex of exercises()">
              <td><code>{{ ex.id }}</code></td>
              <td><span class="type-tag" [ngClass]="ex.type">{{ ex.type }}</span></td>
              <td><strong>{{ ex.promptText }}</strong></td>
              <td class="text-success">{{ ex.correctAnswer }}</td>
              <td>{{ ex.submoduleId }}</td>
              <td class="actions">
                <button class="btn-sm btn-edit" (click)="editExercise(ex)">Editar</button>
                <button class="btn-sm btn-delete" (click)="deleteExercise(ex.id)">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="exercises().length === 0">
              <td colspan="6" class="empty-state">No se encontraron ejercicios en este submódulo.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de Formulario & Simulador Vivo -->
      <div class="modal-backdrop" *ngIf="showModal()">
        <div class="modal-card">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio' }}</h2>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>

          <div class="modal-body grid-cols-2">
            <!-- Formulario de Configuración -->
            <form (ngSubmit)="saveExercise()">
              <div class="form-group">
                <label>ID del Ejercicio</label>
                <input type="text" class="form-control" [(ngModel)]="currentExercise.id" name="id" [disabled]="isEditing" required />
              </div>

              <div class="form-group">
                <label>Submódulo Perteneciente</label>
                <select class="form-control" [(ngModel)]="currentExercise.submoduleId" name="submoduleId" required>
                  <option *ngFor="let s of submodules()" [value]="s.id">{{ s.id }} - {{ s.titleEs }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Modalidad de Ejercicio</label>
                <select class="form-control" [(ngModel)]="currentExercise.type" name="type" (change)="onTypeChange()">
                  <option value="WORD_TRANSLATION">WORD_TRANSLATION (Traducción Léxica)</option>
                  <option value="SENTENCE_TRANSLATION">SENTENCE_TRANSLATION (Traducción Frase)</option>
                  <option value="IMAGE_SELECTION">IMAGE_SELECTION (Selección con Imagen)</option>
                  <option value="SENTENCE_BUILDER">SENTENCE_BUILDER (Armado de Oración)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Dirección Pedagógica</label>
                <select class="form-control" [(ngModel)]="currentExercise.direction" name="direction">
                  <option value="ES_TO_NAH">Español ➔ Náhuatl (ES_TO_NAH)</option>
                  <option value="NAH_TO_ES">Náhuatl ➔ Español (NAH_TO_ES)</option>
                </select>
              </div>

              <div class="lang-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                <button type="button" class="tab-btn" [class.active]="activeLangTab === 'es'" (click)="setLangTab('es')">🇲🇽 Español</button>
                <button type="button" class="tab-btn" [class.active]="activeLangTab === 'en'" (click)="setLangTab('en')">🇺🇸 English</button>
              </div>

              <!-- Contenido en Español -->
              <div *ngIf="activeLangTab === 'es'">
                <div class="form-group">
                  <label>Pregunta / Texto Prompt (Español)</label>
                  <input type="text" class="form-control" [(ngModel)]="currentExercise.promptText" name="promptText" (keyup)="onPromptChange()" required />
                </div>

                <div class="form-group">
                  <label>Respuesta Correcta (Español/Náhuatl)</label>
                  <input type="text" class="form-control" [(ngModel)]="currentExercise.correctAnswer" name="correctAnswer" (keyup)="onAnswerChange()" required />
                </div>

                <div class="form-group">
                  <label>Opciones / Fichas en Español (separadas por coma)</label>
                  <input type="text" class="form-control" [ngModel]="optionsInput" (ngModelChange)="onOptionsInputChange($event)" name="optionsInput" placeholder="Ej: ¿Cómo, estás?, Hola, gracias, yo" />
                </div>

                <div class="form-group">
                  <label>Explicación Gramatical / Nota Cultural (Español)</label>
                  <textarea class="form-control" [(ngModel)]="currentExercise.grammarExplanation" name="grammarExplanation" rows="2"></textarea>
                </div>
              </div>

              <!-- Contenido en Inglés -->
              <div *ngIf="activeLangTab === 'en'">
                <div class="form-group">
                  <label>Pregunta / Texto Prompt (English)</label>
                  <input type="text" class="form-control" [(ngModel)]="currentExercise.promptTextEn" name="promptTextEn" (keyup)="onPromptChange()" placeholder="What does... mean?" />
                </div>

                <div class="form-group">
                  <label>Respuesta Correcta (English)</label>
                  <input type="text" class="form-control" [(ngModel)]="currentExercise.correctAnswerEn" name="correctAnswerEn" (keyup)="onAnswerChange()" placeholder="How are you?" />
                </div>

                <div class="form-group">
                  <label>Opciones / Fichas en English (separadas por coma)</label>
                  <input type="text" class="form-control" [ngModel]="optionsEnInput" (ngModelChange)="onOptionsEnInputChange($event)" name="optionsEnInput" placeholder="Ej: How, are, you?, Hello, thanks, I" />
                </div>

                <div class="form-group">
                  <label>Explicación Gramatical / Nota Cultural (English)</label>
                  <textarea class="form-control" [(ngModel)]="currentExercise.grammarExplanationEn" name="grammarExplanationEn" rows="2" placeholder="Grammar and vocabulary note in English"></textarea>
                </div>
              </div>

              <!-- Uploader de Imagen (IMAGE_SELECTION) -->
              <div class="form-group" *ngIf="currentExercise.type === 'IMAGE_SELECTION'">
                <label>Subir Imagen o Nombre de Asset Local</label>
                <input type="text" class="form-control" [(ngModel)]="currentExercise.imageUrl" name="imageUrl" placeholder="img_atl" />
                <input type="file" (change)="onFileSelected($event, 'images')" accept="image/*" class="file-input" style="margin-top: 0.5rem;" />
              </div>

              <!-- Uploader de Audio Pronunciación (.wav / .mp3) -->
              <div class="form-group">
                <label>Audio del Ejercicio (.wav / .mp3 o URL de Storage)</label>
                <input type="text" class="form-control" [(ngModel)]="currentExercise.audioUrl" name="audioUrl" placeholder="https://firebasestorage... o ex_1_audio.wav" />
                <input type="file" (change)="onFileSelected($event, 'audios')" accept="audio/*" class="file-input" style="margin-top: 0.5rem;" />
                <div *ngIf="currentExercise.audioUrl" class="audio-badge" style="margin-top: 0.5rem; color: #FACC15; display: flex; align-items: center; gap: 0.5rem;">
                  <span>🔊 Audio vinculado</span>
                  <button type="button" class="btn-sm btn-edit" (click)="playSimAudio(currentExercise.audioUrl)">▶ Probar</button>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar Ejercicio</button>
              </div>
            </form>

            <!-- SIMULADOR VIVO TIPO DUOLINGO -->
            <div class="simulator-container">
              <div class="simulator-header">
                <span>SIMULADOR EN TIEMPO REAL</span>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <button type="button" class="btn-sm" [style.background]="simLang === 'es' ? '#0284C7' : '#334155'" (click)="setSimLang('es')">ES</button>
                  <button type="button" class="btn-sm" [style.background]="simLang === 'en' ? '#0284C7' : '#334155'" (click)="setSimLang('en')">EN</button>
                  <span class="type-badge">{{ currentExercise.type }}</span>
                </div>
              </div>

              <div class="sim-screen">
                <div class="prompt-header">
                  <h3>{{ getSimPrompt() }}</h3>
                </div>

                <!-- Modos WORD_TRANSLATION / SENTENCE_TRANSLATION / IMAGE_SELECTION -->
                <div class="sim-options-grid" *ngIf="currentExercise.type !== 'SENTENCE_BUILDER'">
                  <button 
                    class="tile-btn sim-option" 
                    *ngFor="let opt of getSimOptions()"
                    [class.correct]="opt === getSimCorrectAnswer()"
                  >
                    {{ opt }}
                  </button>
                </div>

                <!-- Modo SENTENCE_BUILDER -->
                <div class="sentence-builder-sim" *ngIf="currentExercise.type === 'SENTENCE_BUILDER'">
                  <div class="answer-zone">
                    <span class="placeholder-text" *ngIf="builderSelectedTiles.length === 0">
                      {{ simLang === 'en' ? 'Tap the words below to build the sentence...' : 'Toca las palabras de abajo para formar la oración...' }}
                    </span>
                    <button class="tile-btn" *ngFor="let tile of builderSelectedTiles; let i = index" (click)="removeBuilderTile(i)">
                      {{ tile }}
                    </button>
                  </div>

                  <div style="margin-bottom: 0.5rem; font-size: 0.75rem; color: #94A3B8; font-weight: bold;">
                    {{ simLang === 'en' ? 'Word bank:' : 'Banco de palabras:' }}
                  </div>
                  <div class="bank-zone">
                    <button class="tile-btn" *ngFor="let tile of builderBankTiles; let i = index" (click)="selectBuilderTile(i)">
                      {{ tile }}
                    </button>
                  </div>
                </div>

                <div class="explanation-box" *ngIf="getSimExplanation()">
                  💡 <strong>Nota:</strong> {{ getSimExplanation() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .exercises-page { padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .filter-card { margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem; }
    
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th, .data-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #334155; }
    .data-table th { color: #94A3B8; font-size: 0.8rem; text-transform: uppercase; }
    
    .type-tag { padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; }
    .type-tag.WORD_TRANSLATION { background: rgba(34, 197, 94, 0.2); color: #4ADE80; }
    .type-tag.SENTENCE_TRANSLATION { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }
    .type-tag.IMAGE_SELECTION { background: rgba(168, 85, 247, 0.2); color: #C084FC; }
    .type-tag.SENTENCE_BUILDER { background: rgba(245, 158, 11, 0.2); color: #FBBF24; }

    .actions { display: flex; gap: 0.5rem; }
    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
    .btn-edit { background: #334155; color: white; }
    .btn-delete { background: rgba(239, 68, 68, 0.2); color: #F87171; }

    .tab-btn { padding: 0.5rem 1rem; background: #334155; border: 1px solid #475569; color: #CBD5E1; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
    .tab-btn.active { background: #0284C7; border-color: #38BDF8; color: white; }

    .modal-backdrop { position: fixed; top:0; left:0; width:100vw; height:100vh; background: rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:1000; }
    .modal-card { background: #1E293B; border: 1px solid #334155; border-radius: 20px; width: 90%; max-width: 1000px; max-height: 90vh; overflow-y: auto; padding: 2rem; }
    .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem; }
    .close-btn { background:none; border:none; color:white; font-size: 1.5rem; cursor:pointer; }
    
    .simulator-container { background: #0F172A; border: 1px solid #334155; border-radius: 16px; padding: 1.5rem; }
    .simulator-header { display:flex; justify-content:space-between; align-items: center; font-size: 0.75rem; color: #94A3B8; font-weight: 700; margin-bottom: 1rem; }
    .sim-screen { background: #1E293B; border-radius: 12px; padding: 1.5rem; min-height: 300px; display:flex; flex-direction:column; justify-content:space-between; }
    .sim-options-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0; }
    .tile-btn.sim-option.correct { border-color: #22C55E; background: rgba(34, 197, 94, 0.2); }
    
    .sentence-builder-sim { margin: 1.5rem 0; }
    .answer-zone { min-height: 60px; border-bottom: 2px dashed #475569; padding-bottom: 0.5rem; display:flex; flex-wrap:wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .placeholder-text { color: #64748B; font-size: 0.85rem; font-style: italic; }
    .bank-zone { display:flex; flex-wrap:wrap; gap: 0.5rem; }
    .explanation-box { background: rgba(255,179,0,0.1); border: 1px solid #FFB300; padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; color: #FDE047; }
  `]
})
export class ExercisesManagerComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private grammarValidator = inject(GrammarValidatorService);

  exercises = signal<ExerciseItem[]>([]);
  submodules = signal<SubmoduleItem[]>([]);
  selectedSubmoduleId = '';

  showModal = signal<boolean>(false);
  isEditing = false;

  activeLangTab: 'es' | 'en' = 'es';
  simLang: 'es' | 'en' = 'es';

  currentExercise: ExerciseItem = this.getEmptyExercise();
  optionsInput = '';
  optionsEnInput = '';

  // Variables para el simulador Vivo de SENTENCE_BUILDER
  builderBankTiles: string[] = [];
  builderSelectedTiles: string[] = [];

  async ngOnInit() {
    this.submodules.set(await this.firestoreService.getSubmodules());
    await this.loadExercises();
  }

  async loadExercises() {
    this.exercises.set(await this.firestoreService.getExercises(this.selectedSubmoduleId || undefined));
  }

  getEmptyExercise(): ExerciseItem {
    return {
      id: `ex_${Date.now()}`,
      submoduleId: this.submodules()[0]?.id || 'sub_1_1',
      type: 'WORD_TRANSLATION',
      direction: 'ES_TO_NAH',
      promptText: '',
      correctAnswer: '',
      options: [],
      difficultyLevel: 1,
      isHardLevel: false,
      wordIds: [],
      version: 1
    };
  }

  openNewModal() {
    this.isEditing = false;
    this.activeLangTab = 'es';
    this.simLang = 'es';
    this.currentExercise = this.getEmptyExercise();
    this.optionsInput = '';
    this.optionsEnInput = '';
    this.updateSimulator();
    this.showModal.set(true);
  }

  editExercise(ex: ExerciseItem) {
    this.isEditing = true;
    this.activeLangTab = 'es';
    this.simLang = 'es';
    this.currentExercise = { ...ex };
    this.optionsInput = ex.options ? ex.options.join(', ') : '';
    this.optionsEnInput = ex.optionsEn ? ex.optionsEn.join(', ') : '';
    this.updateSimulator();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  setLangTab(tab: 'es' | 'en') {
    this.activeLangTab = tab;
  }

  setSimLang(lang: 'es' | 'en') {
    this.simLang = lang;
    this.updateSimulator();
  }

  onOptionsInputChange(val: string) {
    this.optionsInput = val;
    this.currentExercise.options = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.updateSimulator();
  }

  onOptionsEnInputChange(val: string) {
    this.optionsEnInput = val;
    this.currentExercise.optionsEn = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.updateSimulator();
  }

  onPromptChange() { this.updateSimulator(); }
  onAnswerChange() { this.updateSimulator(); }

  onTypeChange() {
    this.updateSimulator();
  }

  getSimPrompt(): string {
    if (this.simLang === 'en') {
      return this.currentExercise.promptTextEn || this.currentExercise.promptText || 'Build the translation of:';
    }
    return this.currentExercise.promptText || '¿Cómo se dice...?';
  }

  getSimCorrectAnswer(): string {
    if (this.simLang === 'en') {
      return this.currentExercise.correctAnswerEn || this.currentExercise.correctAnswer;
    }
    return this.currentExercise.correctAnswer;
  }

  getSimOptions(): string[] {
    if (this.simLang === 'en' && this.currentExercise.optionsEn && this.currentExercise.optionsEn.length > 0) {
      return this.currentExercise.optionsEn;
    }
    return this.currentExercise.options || [];
  }

  getSimExplanation(): string | undefined {
    if (this.simLang === 'en') {
      return this.currentExercise.grammarExplanationEn || this.currentExercise.grammarExplanation;
    }
    return this.currentExercise.grammarExplanation;
  }

  updateSimulator() {
    if (this.currentExercise.type === 'SENTENCE_BUILDER') {
      const opts = this.getSimOptions();
      if (opts.length > 0) {
        this.builderBankTiles = [...opts];
      } else {
        const ans = this.getSimCorrectAnswer();
        this.builderBankTiles = ans ? this.grammarValidator.generateSentenceTokens(ans) : [];
      }
      this.builderSelectedTiles = [];
    }
  }

  selectBuilderTile(index: number) {
    const tile = this.builderBankTiles.splice(index, 1)[0];
    this.builderSelectedTiles.push(tile);
  }

  removeBuilderTile(index: number) {
    const tile = this.builderSelectedTiles.splice(index, 1)[0];
    this.builderBankTiles.push(tile);
  }

  async onFileSelected(event: any, folder: 'images' | 'audios') {
    const file = event.target.files[0];
    if (file) {
      const url = await this.firestoreService.uploadMediaFile(file, folder);
      if (folder === 'images') this.currentExercise.imageUrl = url;
      else this.currentExercise.audioUrl = url;
    }
  }

  playSimAudio(url?: string) {
    if (!url) return;
    try {
      const audio = new Audio(url);
      audio.play().catch(err => console.log('Audio preview playback error:', err));
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }

  async saveExercise() {
    if (!this.currentExercise.promptText || !this.currentExercise.correctAnswer) return;
    await this.firestoreService.saveExercise(this.currentExercise);
    this.closeModal();
    await this.loadExercises();
  }

  async deleteExercise(id: string) {
    if (confirm('¿Estás seguro de eliminar este ejercicio?')) {
      await this.firestoreService.deleteExercise(id);
      await this.loadExercises();
    }
  }
}
