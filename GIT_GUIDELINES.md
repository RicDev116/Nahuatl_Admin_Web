# Conventional Commits - Admin Web Portal (Angular)

Este repositorio sigue estrictamente las especificaciones de **Conventional Commits** para mantener un historial limpio, legible y automatizable.

## Estructura del Commit

```text
<tipo>[scope opcional]: <descripción>

[cuerpo opcional detallando el porqué del cambio]
```

## Tipos Permitidos

- `feat:` Una nueva característica o funcionalidad.
- `fix:` Corrección de un bug.
- `docs:` Cambios únicamente en documentación (`README.md`, `ARCHITECTURE.md`).
- `style:` Cambios de formato, estilo de código, CSS, indentación, etc.
- `refactor:` Refactorización de código sin añadir funcionalidades o arreglar bugs.
- `perf:` Mejoras de rendimiento en la SPA.
- `test:` Agregar o modificar pruebas (Vitest/Karma).
- `chore:` Tareas de mantenimiento, Angular CLI, configuración, actualización de librerías.

## Scopes Web Recomendados

Puedes utilizar scopes para dar contexto rápido de la parte de la aplicación afectada. Ejemplos para admin_web:
- `(auth)`, `(exercises)`, `(modules)`, `(dictionary)`, `(ui)`, `(firebase)`, `(core)`, `(shared)`.

## Ejemplos

**Correctos:**
- `feat(dictionary): add support for morph breakdown arrays`
- `fix(auth): prevent unauthorized access to dashboard`
- `chore(deps): update angular and firebase SDK`
- `style(ui): update glassmorphism opacity in modals`

**Incorrectos:**
- `added new exercise form` (Falta tipo)
- `fix: arregla error de UI` (Descripción demasiado genérica)
- `Feat(Auth): Added login` (Mayúsculas incorrectas y verbo en pasado)

## Reglas de Idioma
- El `<tipo>` y el `[scope]` **siempre van en inglés** para mantener el estándar.
- La `<descripción>` debe escribirse preferentemente en **inglés** usando el verbo en imperativo (ej. `add`, `update`, `fix`). Se permite el **español** para descripciones siempre que mantengan la estructura semántica (ej. `feat(auth): agrega guardia de ruta`).

## Reglas de Ramas (Branching Rules)

Para evitar colisiones y mantener un flujo de trabajo limpio, todo el desarrollo debe utilizar **GitFlow** y la siguiente nomenclatura de ramas:

1. **Ramas Principales Protegidas**:
   - `master` o `main`: Refleja el código en producción y se despliega automáticamente. NUNCA se debe hacer commit directamente aquí.
   - `develop`: Rama base para integración continua. Todo desarrollo parte y se mezcla contra `develop`.

2. **Ramas Efímeras (Trabajo)**:
   - `feature/<nombre-descriptivo>`: Para desarrollar nuevas características (ej. `feature/dictionary-manager`).
   - `fix/<nombre-descriptivo>`: Para corregir bugs no críticos (ej. `fix/login-form-overflow`).
   - `hotfix/<nombre-descriptivo>`: Exclusivamente para corregir bugs críticos directamente en `master` (ej. `hotfix/firebase-auth-crash`).
   - `chore/<nombre-descriptivo>`: Para mantenimiento o actualizaciones de entorno (ej. `chore/update-angular`).

3. **Ciclo de Vida de un Pull Request (PR)**:
   - Siempre hacer *rebase* de `develop` antes de abrir el PR para evitar conflictos (usar `git pull --rebase origin develop`).
   - El título del PR debe seguir la convención de commits (ej. `feat(dictionary): add support for morph breakdown arrays`).
   - Una vez fusionada (merge) la rama, se recomienda eliminarla para no contaminar el historial.
