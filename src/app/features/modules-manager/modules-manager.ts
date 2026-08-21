import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../core/services/firestore.service';
import { ModuleItem, SubmoduleItem } from '../../core/models/models';

@Component({
  selector: 'app-modules-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modules-page">
      <div class="header">
        <div>
          <h1>Gestor de Módulos & Submódulos</h1>
          <p>Define el mapa de niveles, ordenación de lecciones, colores de tema e íconos.</p>
        </div>
        <button class="btn btn-primary" (click)="openModuleModal()">+ Nuevo Módulo</button>
      </div>

      <div class="modules-list">
        <div class="card module-card" *ngFor="let mod of modules()">
          <div class="module-header" [style.borderLeftColor]="mod.colorHex">
            <div class="mod-info">
              <span class="badge" [style.background]="mod.colorHex">Nivel {{ mod.orderIndex }}</span>
              <h2>{{ mod.titleEs }} <small>({{ mod.titleNah }})</small></h2>
            </div>
            <div class="actions">
              <button class="btn-sm btn-sub" (click)="openSubmoduleModal(mod.id)">+ Submódulo</button>
              <button class="btn-sm btn-edit" (click)="editModule(mod)">Editar</button>
              <button class="btn-sm btn-delete" (click)="deleteModule(mod.id)">Eliminar</button>
            </div>
          </div>

          <!-- Lista de Submódulos del Módulo -->
          <div class="submodules-container">
            <h4>Submódulos / Lecciones:</h4>
            <div class="submodules-grid">
              <div class="sub-card" *ngFor="let sub of getSubmodulesFor(mod.id)">
                <div class="sub-header">
                  <strong>#{{ sub.orderIndex }} - {{ sub.titleEs }}</strong>
                  <div class="sub-actions">
                    <button class="btn-sm btn-edit" (click)="editSubmodule(sub)">✏️</button>
                    <button class="btn-sm btn-delete" (click)="deleteSubmodule(sub.id)">🗑️</button>
                  </div>
                </div>
                <p class="nah-title">{{ sub.titleNah }}</p>
                <p class="desc">{{ sub.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Formulario de Módulo -->
      <div class="modal-backdrop" *ngIf="showModModal()">
        <div class="modal-card">
          <div class="modal-header">
            <h2>{{ isEditingMod ? 'Editar Módulo' : 'Nuevo Módulo' }}</h2>
            <button class="close-btn" (click)="showModModal.set(false)">×</button>
          </div>
          <form (ngSubmit)="saveModule()">
            <div class="form-group">
              <label>ID del Módulo (ej. mod_1)</label>
              <input type="text" class="form-control" [(ngModel)]="currentMod.id" name="id" [disabled]="isEditingMod" required />
            </div>
            <div class="form-group">
              <label>Índice de Orden</label>
              <input type="number" class="form-control" [(ngModel)]="currentMod.orderIndex" name="orderIndex" required />
            </div>
            <div class="form-group">
              <label>Título en Español</label>
              <input type="text" class="form-control" [(ngModel)]="currentMod.titleEs" name="titleEs" required />
            </div>
            <div class="form-group">
              <label>Título en Náhuatl</label>
              <input type="text" class="form-control" [(ngModel)]="currentMod.titleNah" name="titleNah" required />
            </div>
            <div class="form-group">
              <label>Ícono (ic_greeting, ic_actions, ic_family, ic_nature, ic_food)</label>
              <input type="text" class="form-control" [(ngModel)]="currentMod.iconName" name="iconName" required />
            </div>
            <div class="form-group">
              <label>Color Temático (HEX)</label>
              <input type="color" class="form-control color-picker" [(ngModel)]="currentMod.colorHex" name="colorHex" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="showModModal.set(false)">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Módulo</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Formulario de Submódulo -->
      <div class="modal-backdrop" *ngIf="showSubModal()">
        <div class="modal-card">
          <div class="modal-header">
            <h2>{{ isEditingSub ? 'Editar Submódulo' : 'Nuevo Submódulo' }}</h2>
            <button class="close-btn" (click)="showSubModal.set(false)">×</button>
          </div>
          <form (ngSubmit)="saveSubmodule()">
            <div class="form-group">
              <label>ID del Submódulo (ej. sub_1_1)</label>
              <input type="text" class="form-control" [(ngModel)]="currentSub.id" name="id" [disabled]="isEditingSub" required />
            </div>
            <div class="form-group">
              <label>ID Módulo Padre</label>
              <input type="text" class="form-control" [(ngModel)]="currentSub.moduleId" name="moduleId" readonly />
            </div>
            <div class="form-group">
              <label>Índice de Orden</label>
              <input type="number" class="form-control" [(ngModel)]="currentSub.orderIndex" name="orderIndex" required />
            </div>
            <div class="form-group">
              <label>Título en Español</label>
              <input type="text" class="form-control" [(ngModel)]="currentSub.titleEs" name="titleEs" required />
            </div>
            <div class="form-group">
              <label>Título en Náhuatl</label>
              <input type="text" class="form-control" [(ngModel)]="currentSub.titleNah" name="titleNah" required />
            </div>
            <div class="form-group">
              <label>Descripción / Objetivos Pedagogicos</label>
              <textarea class="form-control" [(ngModel)]="currentSub.description" name="description" rows="2" required></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="showSubModal.set(false)">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Submódulo</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modules-page { padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modules-list { display: flex; flex-direction: column; gap: 1.5rem; }
    
    .module-card { border-left: 6px solid #1B5E20; }
    .module-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 1rem; margin-bottom: 1rem; }
    .mod-info h2 { font-size: 1.3rem; font-weight: 700; margin-top: 0.25rem; }
    .mod-info small { color: #4ADE80; }
    
    .submodules-container h4 { color: #94A3B8; font-size: 0.85rem; margin-bottom: 0.75rem; text-transform: uppercase; }
    .submodules-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .sub-card { background: #0F172A; border: 1px solid #334155; border-radius: 12px; padding: 1rem; }
    .sub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
    .nah-title { color: #FACC15; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; }
    .desc { color: #94A3B8; font-size: 0.8rem; }
    
    .actions, .sub-actions { display: flex; gap: 0.5rem; }
    .btn-sm { padding: 0.35rem 0.75rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; font-size: 0.8rem; }
    .btn-sub { background: rgba(27, 94, 32, 0.3); color: #4ADE80; }
    .btn-edit { background: #334155; color: white; }
    .btn-delete { background: rgba(239, 68, 68, 0.2); color: #F87171; }
    
    .modal-backdrop { position: fixed; top:0; left:0; width:100vw; height:100vh; background: rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:1000; }
    .modal-card { background: #1E293B; border: 1px solid #334155; border-radius: 20px; width: 90%; max-width: 500px; padding: 2rem; }
    .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem; }
    .close-btn { background:none; border:none; color:white; font-size: 1.5rem; cursor:pointer; }
    .color-picker { height: 40px; cursor: pointer; }
  `]
})
export class ModulesManagerComponent implements OnInit {
  private firestoreService = inject(FirestoreService);

  modules = signal<ModuleItem[]>([]);
  submodules = signal<SubmoduleItem[]>([]);

  showModModal = signal<boolean>(false);
  isEditingMod = false;
  currentMod: ModuleItem = this.getEmptyMod();

  showSubModal = signal<boolean>(false);
  isEditingSub = false;
  currentSub: SubmoduleItem = this.getEmptySub();

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    const [mods, subs] = await Promise.all([
      this.firestoreService.getModules(),
      this.firestoreService.getSubmodules()
    ]);
    this.modules.set(mods);
    this.submodules.set(subs);
  }

  getSubmodulesFor(moduleId: string): SubmoduleItem[] {
    return this.submodules().filter(s => s.moduleId === moduleId);
  }

  getEmptyMod(): ModuleItem {
    return { id: `mod_${Date.now()}`, orderIndex: this.modules().length + 1, titleEs: '', titleNah: '', iconName: 'ic_greeting', colorHex: '#1B5E20', version: 1 };
  }

  getEmptySub(moduleId: string = ''): SubmoduleItem {
    return { id: `sub_${Date.now()}`, moduleId, orderIndex: 1, titleEs: '', titleNah: '', description: '', version: 1 };
  }

  openModuleModal() {
    this.isEditingMod = false;
    this.currentMod = this.getEmptyMod();
    this.showModModal.set(true);
  }

  editModule(mod: ModuleItem) {
    this.isEditingMod = true;
    this.currentMod = { ...mod };
    this.showModModal.set(true);
  }

  openSubmoduleModal(moduleId: string) {
    this.isEditingSub = false;
    this.currentSub = this.getEmptySub(moduleId);
    this.showSubModal.set(true);
  }

  editSubmodule(sub: SubmoduleItem) {
    this.isEditingSub = true;
    this.currentSub = { ...sub };
    this.showSubModal.set(true);
  }

  async saveModule() {
    await this.firestoreService.saveModule(this.currentMod);
    this.showModModal.set(false);
    await this.loadData();
  }

  async deleteModule(id: string) {
    if (confirm('¿Eliminar módulo? Esto no borrará automáticamente sus ejercicios.')) {
      await this.firestoreService.deleteModule(id);
      await this.loadData();
    }
  }

  async saveSubmodule() {
    await this.firestoreService.saveSubmodule(this.currentSub);
    this.showSubModal.set(false);
    await this.loadData();
  }

  async deleteSubmodule(id: string) {
    if (confirm('¿Eliminar submódulo?')) {
      await this.firestoreService.deleteSubmodule(id);
      await this.loadData();
    }
  }
}
