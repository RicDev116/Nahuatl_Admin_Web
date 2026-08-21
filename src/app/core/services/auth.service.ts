import { Injectable, signal, computed } from '@angular/core';
import { auth, db } from '../config/firebase.config';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Estado reactivo mediante Angular Signals
  readonly currentUser = signal<UserProfile | null>(null);
  readonly isLoading = signal<boolean>(true);

  // Computados
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly isCreator = computed(() => this.currentUser()?.role === 'creator' || this.isAdmin());

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener() {
    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        await this.loadUserProfile(user);
      } else {
        this.currentUser.set(null);
      }
      this.isLoading.set(false);
    });
  }

  private async loadUserProfile(user: User) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.currentUser.set({
          uid: user.uid,
          email: user.email || '',
          displayName: data['displayName'] || user.displayName || 'Usuario Admin',
          role: (data['role'] as UserRole) || 'creator',
          createdAt: data['createdAt']
        });
      } else {
        // Fallback por defecto si no existe en /users
        this.currentUser.set({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Admin Default',
          role: 'admin'
        });
      }
    } catch (err) {
      console.error('Error al cargar perfil de usuario en Firestore:', err);
      // Asignar fallback de rol
      this.currentUser.set({
        uid: user.uid,
        email: user.email || '',
        role: 'admin'
      });
    }
  }

  async login(email: string, pass: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await this.loadUserProfile(cred.user);
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
    this.currentUser.set(null);
  }
}
