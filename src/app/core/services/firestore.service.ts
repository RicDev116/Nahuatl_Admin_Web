import { Injectable } from '@angular/core';
import { db, storage } from '../config/firebase.config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  ModuleItem, 
  SubmoduleItem, 
  ExerciseItem, 
  DictionaryItem, 
  DailyPhraseItem, 
  SyncConfig 
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  // ── 1. GESTIÓN DE MÓDULOS ──────────────────────────────────────────────────
  async getModules(): Promise<ModuleItem[]> {
    const q = query(collection(db, 'modules'), orderBy('orderIndex', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ModuleItem));
  }

  async saveModule(moduleItem: ModuleItem): Promise<void> {
    const docRef = doc(db, 'modules', moduleItem.id);
    await setDoc(docRef, moduleItem, { merge: true });
  }

  async deleteModule(id: string): Promise<void> {
    await deleteDoc(doc(db, 'modules', id));
  }

  // ── 2. GESTIÓN DE SUBMÓDULOS ────────────────────────────────────────────────
  async getSubmodules(moduleId?: string): Promise<SubmoduleItem[]> {
    const colRef = collection(db, 'submodules');
    const q = moduleId 
      ? query(colRef, where('moduleId', '==', moduleId), orderBy('orderIndex', 'asc'))
      : query(colRef, orderBy('orderIndex', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubmoduleItem));
  }

  async saveSubmodule(submoduleItem: SubmoduleItem): Promise<void> {
    const docRef = doc(db, 'submodules', submoduleItem.id);
    await setDoc(docRef, submoduleItem, { merge: true });
  }

  async deleteSubmodule(id: string): Promise<void> {
    await deleteDoc(doc(db, 'submodules', id));
  }

  // ── 3. GESTIÓN DE EJERCICIOS (4 MODALIDADES) ────────────────────────────────
  async getExercises(submoduleId?: string): Promise<ExerciseItem[]> {
    const colRef = collection(db, 'exercises');
    const q = submoduleId 
      ? query(colRef, where('submoduleId', '==', submoduleId))
      : query(colRef);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ExerciseItem));
  }

  async saveExercise(exercise: ExerciseItem): Promise<void> {
    const docRef = doc(db, 'exercises', exercise.id);
    await setDoc(docRef, exercise, { merge: true });
  }

  async deleteExercise(id: string): Promise<void> {
    await deleteDoc(doc(db, 'exercises', id));
  }

  // ── 4. GESTIÓN DE DICCIONARIO HUASTECO ──────────────────────────────────────
  async getDictionaryWords(): Promise<DictionaryItem[]> {
    const snap = await getDocs(collection(db, 'dictionary'));
    return snap.docs.map(d => ({ wordId: d.id, ...d.data() } as DictionaryItem));
  }

  async saveDictionaryWord(word: DictionaryItem): Promise<void> {
    const docRef = doc(db, 'dictionary', word.wordId);
    await setDoc(docRef, word, { merge: true });
  }

  async deleteDictionaryWord(wordId: string): Promise<void> {
    await deleteDoc(doc(db, 'dictionary', wordId));
  }

  // ── 5. GESTIÓN DE FRASES DEL DÍA ────────────────────────────────────────────
  async getDailyPhrases(): Promise<DailyPhraseItem[]> {
    const snap = await getDocs(collection(db, 'daily_phrases'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as DailyPhraseItem));
  }

  async saveDailyPhrase(phrase: DailyPhraseItem): Promise<void> {
    const docRef = doc(db, 'daily_phrases', phrase.id);
    await setDoc(docRef, phrase, { merge: true });
  }

  async deleteDailyPhrase(id: string): Promise<void> {
    await deleteDoc(doc(db, 'daily_phrases', id));
  }

  // ── 6. CONTROL DE VERSIONADO & SINCRONIZACIÓN TÁCTICA ──────────────────────
  async getSyncConfig(): Promise<SyncConfig> {
    const docRef = doc(db, 'config', 'app_data');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SyncConfig;
    }
    return { version: 1, last_update: null };
  }

  async incrementGlobalSyncVersion(): Promise<number> {
    const docRef = doc(db, 'config', 'app_data');
    const snap = await getDoc(docRef);
    let newVersion = 1;

    if (snap.exists()) {
      await updateDoc(docRef, {
        version: 1,
        last_update: serverTimestamp()
      });
    } else {
      await setDoc(docRef, {
        version: 1,
        last_update: serverTimestamp()
      });
    }
    return newVersion;
  }

  // ── 7. SUBIDA DE ARCHIVOS MULTIMEDIA (FIREBASE STORAGE) ─────────────────────
  async uploadMediaFile(file: File, folder: 'audios' | 'images'): Promise<string> {
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
}
