export type UserRole = 'admin' | 'creator';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt?: string;
}

export type ExerciseType = 'WORD_TRANSLATION' | 'SENTENCE_TRANSLATION' | 'IMAGE_SELECTION' | 'SENTENCE_BUILDER';
export type ExerciseDirection = 'ES_TO_NAH' | 'NAH_TO_ES';

export interface ExerciseItem {
  id: string;
  submoduleId: string;
  type: ExerciseType;
  direction: ExerciseDirection;
  promptText: string;
  promptTextEn?: string;
  correctAnswer: string;
  correctAnswerEn?: string;
  options: string[];
  optionsEn?: string[];
  imageUrl?: string;
  audioUrl?: string;
  grammarExplanation?: string;
  grammarExplanationEn?: string;
  difficultyLevel: number;
  isHardLevel: boolean;
  wordIds: string[];
  version: number;
}

export interface ModuleItem {
  id: string;
  orderIndex: number;
  titleEs: string;
  titleEn?: string;
  titleNah: string;
  iconName: string;
  colorHex: string;
  version: number;
}

export interface SubmoduleItem {
  id: string;
  moduleId: string;
  orderIndex: number;
  titleEs: string;
  titleEn?: string;
  titleNah: string;
  description: string;
  descriptionEn?: string;
  totalStars?: number;
  isUnlocked?: boolean;
  version: number;
}

export interface MorphemePart {
  type: 'prefix' | 'root' | 'suffix';
  text: string;
  meaningEs: string;
  meaningEn?: string;
}

export interface DictionaryItem {
  wordId: string;
  nahuatlWord: string;
  translationEs: string;
  translationEn?: string;
  category: string;
  type: string;
  audioFile?: string;
  exampleSentenceNah?: string;
  exampleSentenceEs?: string;
  exampleSentenceEn?: string;
  isCompound: boolean;
  breakdownJson?: string;
  version: number;
}

export interface DailyPhraseItem {
  id: string;
  nahuatl: string;
  spanish: string;
  english?: string;
  pronunciation?: string;
  culturalNote?: string;
  culturalNoteEn?: string;
  version: number;
}

export interface SyncConfig {
  version: number;
  last_update: any;
}
