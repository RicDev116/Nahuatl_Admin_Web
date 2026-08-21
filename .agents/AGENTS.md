# AGENTS.md - Harness Engineering & Guidelines for Nahuatl Admin Web

Este archivo contiene los principios de ingeniería, estándares de calidad y normas de arnés (Harness Engineering) para agentes de Inteligencia Artificial y desarrolladores trabajando en **Nahuatl Admin Web**.

---

## 1. Declaración de Misión

Crear y mantener un portal de administración web **altamente intuitivo, estéticamente deslumbrante (Glassmorphism, vibrante, responsive)** y **robusto** para la gestión del plan de estudios del Náhuatl Huasteco, sus 4 tipos de ejercicio, morfología aglutinante y sincronización con Firebase Cloud Firestore.

---

## 2. Arquitectura & Stack Tecnológico

- **Framework**: Angular v22 (Standalone Components obligatorios, Zero NgModules).
- **Lenguaje**: TypeScript 5.x con `strict: true`.
- **UI & Estilos**: Vanilla CSS3, Glassmorphism, micro-animaciones fluidas, paleta HSL adaptada, cero frameworks pesados CSS.
- **Backend & Auth**: Firebase Cloud Firestore SDK + Firebase Authentication.
- **Patrón**: Clean Architecture orientada a Features (`src/app/core` para servicios/modelos, `src/app/features` para UI).

---

## 3. Reglas Críticas de Código (Mandatos Inviolables)

### A. Componentes Angular Standalone
- **REGLA 1**: Todo componente DEBE ser Standalone (`@Component({ standalone: true, imports: [...] })`).
- **REGLA 2**: Inyectar servicios preferentemente vía la función `inject(Service)` en lugar de parámetros en el constructor.

### B. Consistencia de Datos & Bilingüismo
- **REGLA 3**: Todo módulo, submódulo, ejercicio o palabra agregada/editada en el portal DEBE tener soporte para **Español** e **Inglés** (`titleEs`, `titleEn`, `wordEs`, `wordEn`, `promptEs`, `promptEn`).
- **REGLA 4**: Los reactivos de ejercicios deben respetar estrictamente los 4 tipos soportados por la app móvil Android:
  1. `WORD_TRANSLATION`
  2. `SENTENCE_TRANSLATION`
  3. `IMAGE_SELECTION`
  4. `SENTENCE_BUILDER`

### C. Verificación & Compilación antes de Concluir (TDD / RDD)
- **REGLA 5**: NUNCA declarar una tarea como completada sin ejecutar `npm run build` y asegurar que la compilación Angular termine en **0 errores TypeScript**.

### D. Seguridad de Credenciales & Entorno
- **REGLA 6**: NUNCA subir credenciales en texto plano a `environment.ts` en Git. Se debe mantener `environment.example.ts` como plantilla pública y usar GitHub Secrets (`ENV_CONFIG` Base64) en el pipeline de GitHub Actions.

---

## 4. Matriz de Agentes de Desarrollo

- **`WebUiAgent`**: Especializado en componentes visuales Angular, UI Glassmorphism, animaciones CSS y formularios de gestión.
- **`WebDataAgent`**: Especializado en servicios Firestore, Auth, contratos de datos TypeScript y validación de gramática Náhuatl.
- **`WebOpsAgent`**: Especializado en despliegues a Firebase Hosting, GitHub Actions (`web-ci-cd.yml`) y gestión de entorno.
