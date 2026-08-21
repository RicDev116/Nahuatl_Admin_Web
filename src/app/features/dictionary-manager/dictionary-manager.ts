import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../core/services/firestore.service';
import { GrammarValidatorService } from '../../core/services/grammar-validator.service';
import { DictionaryItem, MorphemePart } from '../../core/models/models';

@Component({
  selector: 'app-dictionary-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dictionary-page">
      <div class="header">
        <div>
          <h1>Gestor de Diccionario & Ortografía Huasteca</h1>
          <p>Valida el estándar de 18 grafías (Marcelino Hernández Beatriz) y construye desgloses morfológicos.</p>
        </div>
        <button class="btn btn-primary" (click)="openNewModal()">+ Nueva Palabra</button>
      </div>

      <!-- Buscador -->
      <div class="card filter-card">
        <input 
          type="text" 
          class="form-control" 
          [(ngModel)]="searchQuery" 
          (keyup)="filterWords()" 
          placeholder="Buscar en Náhuatl o Español..." 
        />
      </div>

      <!-- Tabla de Vocabulario -->
      <div class="card table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Palabra Náhuatl</th>
              <th>Traducción Español</th>
              <th>Categoría</th>
              <th>Compuesta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredWords()">
              <td><code>{{ item.wordId }}</code></td>
              <td><strong class="nah-word">{{ item.nahuatlWord }}</strong></td>
              <td>{{ item.translationEs }}</td>
              <td><span class="badge">{{ item.category }}</span></td>
              <td>{{ item.isCompound ? 'Sí (Aglutinante)' : 'Simple' }}</td>
              <td class="actions">
                <button class="btn-sm btn-edit" (click)="editWord(item)">Editar</button>
                <button class="btn-sm btn-delete" (click)="deleteWord(item.wordId)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Formulario & Validador de Grafías -->
      <div class="modal-backdrop" *ngIf="showModal()">
        <div class="modal-card">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Editar Entrada de Diccionario' : 'Agregar Nueva Palabra' }}</h2>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>

          <form (ngSubmit)="saveWord()">
            <div class="modal-body grid-cols-2">
              <div>
                <div class="form-group">
                  <label>ID de la Palabra (wordId)</label>
                  <input type="text" class="form-control" [(ngModel)]="currentWord.wordId" name="wordId" [disabled]="isEditing" required />
                </div>

                <div class="form-group">
                  <label>Palabra en Náhuatl (Huasteca Hidalguense)</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="currentWord.nahuatlWord" 
                    name="nahuatlWord" 
                    (keyup)="onNahuatlWordChange()" 
                    required 
                  />
                  <!-- Alerta de Ortografía 18 Grafías -->
                  <div *ngIf="!orthographyStatus().isValid" class="ortho-warning">
                    ⚠️ <strong>Grafías no oficiales detectadas:</strong> 
                    <span>{{ orthographyStatus().invalidTokens.join(', ') }}</span>. 
                    <small>Usa únicamente las 18 grafías del estándar (a, ch, e, i, k, m, n, o, p, s, t, tl, ts, u, x, y, ').</small>
                  </div>
                </div>

                <div class="form-group">
                  <label>Traducción en Español</label>
                  <input type="text" class="form-control" [(ngModel)]="currentWord.translationEs" name="translationEs" required />
                </div>

                <div class="form-group">
                  <label>Traducción en Inglés (Opcional)</label>
                  <input type="text" class="form-control" [(ngModel)]="currentWord.translationEn" name="translationEn" />
                </div>

                <div class="form-group">
                  <label>Categoría Gramatical</label>
                  <select class="form-control" [(ngModel)]="currentWord.category" name="category">
                    <option value="saludos">Saludos & Cortesía</option>
                    <option value="verbos">Acciones / Verbos</option>
                    <option value="familia">Familia & Comunidad</option>
                    <option value="naturaleza">Naturaleza & Entorno</option>
                    <option value="alimentos">Alimentos & Tianguis</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div>
                <!-- Oración de Ejemplo -->
                <div class="form-group">
                  <label>Oración de Ejemplo (Náhuatl)</label>
                  <input type="text" class="form-control" [(ngModel)]="currentWord.exampleSentenceNah" name="exampleSentenceNah" />
                </div>

                <div class="form-group">
                  <label>Oración de Ejemplo (Español)</label>
                  <input type="text" class="form-control" [(ngModel)]="currentWord.exampleSentenceEs" name="exampleSentenceEs" />
                </div>

                <!-- Subida de Audio WAV -->
                <div class="form-group">
                  <label>Audio de Pronunciación (.wav / .mp3)</label>
                  <input type="file" (change)="onAudioSelected($event)" accept="audio/*" class="file-input" />
                  <span *ngIf="currentWord.audioFile" class="audio-badge">🔊 {{ currentWord.audioFile }}</span>
                </div>

                <!-- Configuración Morfológica / Palabra Compuesta -->
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="currentWord.isCompound" name="isCompound" />
                    <strong>Es Palabra Compuesta / Aglutinante</strong>
                  </label>
                </div>

                <!-- Desglose de Morfemas (si isCompound es true) -->
                <div *ngIf="currentWord.isCompound" class="morpheme-builder">
                  <label>Morfemas Aglutinantes (SmartHighlightedText)</label>
                  <div *ngFor="let part of morphemes; let i = index" class="morpheme-row">
                    <select [(ngModel)]="part.type" [name]="'mtype_' + i" class="form-control-sm">
                      <option value="prefix">Prefijo</option>
                      <option value="root">Raíz</option>
                      <option value="suffix">Sufijo</option>
                    </select>
                    <input type="text" [(ngModel)]="part.text" [name]="'mtext_' + i" class="form-control-sm" placeholder="Morfema" />
                    <input type="text" [(ngModel)]="part.meaningEs" [name]="'mmean_' + i" class="form-control-sm" placeholder="Significado" />
                    <button type="button" class="btn-remove" (click)="removeMorpheme(i)">×</button>
                  </div>
                  <button type="button" class="btn-sm btn-add-morpheme" (click)="addMorpheme()">+ Agregar Morfema</button>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="!orthographyStatus().isValid">Guardar Palabra</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dictionary-page { padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .filter-card { margin-bottom: 1.5rem; }
    .nah-word { color: #4ADE80; font-size: 1.05rem; }
    
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th, .data-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #334155; }
    .data-table th { color: #94A3B8; font-size: 0.8rem; text-transform: uppercase; }

    .modal-backdrop { position: fixed; top:0; left:0; width:100vw; height:100vh; background: rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:1000; }
    .modal-card { background: #1E293B; border: 1px solid #334155; border-radius: 20px; width: 90%; max-width: 900px; max-height: 90vh; overflow-y: auto; padding: 2rem; }
    .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem; }
    .close-btn { background:none; border:none; color:white; font-size: 1.5rem; cursor:pointer; }
    
    .ortho-warning { background: rgba(239, 68, 68, 0.15); border: 1px solid #EF4444; color: #F87171; padding: 0.5rem; border-radius: 8px; font-size: 0.8rem; margin-top: 0.5rem; }
    .morpheme-builder { background: #0F172A; border: 1px solid #334155; border-radius: 12px; padding: 1rem; margin-top: 1rem; }
    .morpheme-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .form-control-sm { background: #1E293B; border: 1px solid #334155; color: white; border-radius: 6px; padding: 0.4rem; font-size: 0.85rem; }
    .btn-remove { background: #EF4444; color: white; border: none; border-radius: 6px; width: 28px; cursor: pointer; }
    .btn-add-morpheme { background: #334155; color: white; margin-top: 0.5rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .audio-badge { display: block; margin-top: 0.5rem; color: #FACC15; font-size: 0.85rem; }
  `]
})
export class DictionaryManagerComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private grammarValidator = inject(GrammarValidatorService);

  words = signal<DictionaryItem[]>([]);
  filteredWords = signal<DictionaryItem[]>([]);
  searchQuery = '';

  showModal = signal<boolean>(false);
  isEditing = false;
  currentWord: DictionaryItem = this.getEmptyWord();
  morphemes: MorphemePart[] = [];

  orthographyStatus = signal<{ isValid: boolean; invalidTokens: string[] }>({ isValid: true, invalidTokens: [] });

  async ngOnInit() {
    await this.loadWords();
  }

  async loadWords() {
    const list = await this.firestoreService.getDictionaryWords();
    this.words.set(list);
    this.filterWords();
  }

  filterWords() {
    const q = this.searchQuery.toLowerCase();
    if (!q) {
      this.filteredWords.set(this.words());
    } else {
      this.filteredWords.set(this.words().filter(w => 
        w.nahuatlWord.toLowerCase().includes(q) || 
        w.translationEs.toLowerCase().includes(q)
      ));
    }
  }

  getEmptyWord(): DictionaryItem {
    return {
      wordId: `w_${Date.now()}`,
      nahuatlWord: '',
      translationEs: '',
      category: 'general',
      type: 'simple',
      isCompound: false,
      version: 1
    };
  }

  openNewModal() {
    this.isEditing = false;
    this.currentWord = this.getEmptyWord();
    this.morphemes = [];
    this.orthographyStatus.set({ isValid: true, invalidTokens: [] });
    this.showModal.set(true);
  }

  editWord(item: DictionaryItem) {
    this.isEditing = true;
    this.currentWord = { ...item };
    if (item.breakdownJson) {
      try { this.morphemes = JSON.parse(item.breakdownJson); } catch (e) { this.morphemes = []; }
    } else {
      this.morphemes = [];
    }
    this.onNahuatlWordChange();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onNahuatlWordChange() {
    this.orthographyStatus.set(this.grammarValidator.validateNahuatlText(this.currentWord.nahuatlWord));
  }

  addMorpheme() {
    this.morphemes.push({ type: 'root', text: '', meaningEs: '' });
  }

  removeMorpheme(index: number) {
    this.morphemes.splice(index, 1);
  }

  async onAudioSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const url = await this.firestoreService.uploadMediaFile(file, 'audios');
      this.currentWord.audioFile = url;
    }
  }

  async saveWord() {
    if (!this.currentWord.nahuatlWord || !this.currentWord.translationEs) return;
    if (this.currentWord.isCompound) {
      this.currentWord.breakdownJson = JSON.stringify(this.morphemes);
    }
    await this.firestoreService.saveDictionaryWord(this.currentWord);
    this.closeModal();
    await this.loadWords();
  }

  async deleteWord(id: string) {
    if (confirm('¿Deseas borrar esta palabra del diccionario?')) {
      await this.firestoreService.deleteDictionaryWord(id);
      await this.loadWords();
    }
  }
}
