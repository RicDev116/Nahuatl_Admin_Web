# Arquitectura Técnica - Nahuatl Admin Web Portal

Este documento describe la arquitectura técnica integral del módulo **Admin Web Portal** de la plataforma Náhuatl (Variante Huasteca Hidalguense). Sirve como referencia canónica para desarrolladores y agentes de IA.

---

## 1. Resumen Ejecutivo y Stack Tecnológico

El portal administrativo es una Single Page Application (SPA) moderna desarrollada en Angular para la gestión de contenidos, lecciones, 4 modalidades de ejercicios, diccionario aglutinante y sincronización con Firebase Cloud Firestore.

- **Framework**: Angular v22 (Standalone Components, Zero NgModules).
- **Lenguaje**: TypeScript 5.x.
- **Estilos & UI System**: Vanilla CSS3 + Glassmorphism, diseño dinámico responsive, paleta de colores HSL.
- **Backend & DB**: Firebase Cloud Firestore SDK + Firebase Authentication.
- **Hosting & CI/CD**: Firebase Hosting automático vía GitHub Actions.
- **Patrón Arquitectónico**: **Feature-Based & Layered Clean Architecture** (Core, Features, Shared).

---

## 2. Estructura de Capas (Clean Architecture)

```
src/app/
├── core/                        # CAPA DATA / DOMAIN / INFRAESTRUCTURA
│   ├── config/                  # Configuración de Firebase SDK (firebase.config.ts)
│   ├── guards/                  # Guardianes de autenticación (auth.guard.ts)
│   ├── models/                  # Modelos de datos TypeScript (models.ts)
│   └── services/                # Servicios de datos y lógica (auth, firestore, grammar-validator)
│
└── features/                    # CAPA PRESENTATION / UI COMPONENTS
    ├── auth/                    # Pantalla de Login de Administrador (login.ts)
    ├── dashboard/               # Métricas y vista general del sistema (dashboard.ts)
    ├── dictionary-manager/      # Gestión CRUD de vocabulario del diccionario (dictionary-manager.ts)
    ├── exercises-manager/       # Creador y gestor de los 4 tipos de ejercicio (exercises-manager.ts)
    ├── modules-manager/         # Gestor de módulos y submódulos de aprendizaje (modules-manager.ts)
    └── sync-center/             # Centro de sincronización y versión global (sync-center.ts)
```

---

## 3. Infraestructura de CI/CD y Despliegue en GitHub Actions

### A. Repositorio GitHub:
- **`RicDev116/Nahuatl_Admin_Web`**: Repositorio independiente en GitHub.

### B. Ramas GitFlow:
- La estrategia detallada de ramas (master, develop, feature, fix) está documentada en [GIT_GUIDELINES.md](GIT_GUIDELINES.md).

### C. Pipeline de CI/CD (`.github/workflows/web-ci-cd.yml`):
1. **Job 1 (Lint & Build)**: Se ejecuta en todas las ramas en Node 22. Inyecta la variable de entorno `secrets.ENV_CONFIG` en Base64 para compilar Angular en modo producción (`npm run build`).
2. **Job 2 (Deploy a Firebase Hosting)**: Al hacer push/merge a `master`, utiliza `secrets.FIREBASE_SERVICE_ACCOUNT_NAHUATL_APP` para publicar el bundle en `https://nahuatl-app-73a06.web.app`.

---

## 4. Matriz de Roles para Subagentes (Harness Engineering)

| Subagente | Responsabilidad Principal | Archivos Clave |
| :--- | :--- | :--- |
| **WebUiAgent** | Componentes Standalone Angular, diseño responsive, Glassmorphism, formularios de ejercicios y diccionarios. | `src/app/features/*` |
| **WebDataAgent** | Servicios de Firebase Firestore, Auth, validación gramatical del Náhuatl y modelos TypeScript. | `src/app/core/*` |
| **WebOpsAgent** | Configuración de GitHub Actions, Firebase Hosting, `.github/workflows/web-ci-cd.yml` y entornos. | `.github/*`, `firebase.json` |

---

## 5. Reglas de Desarrollo y Seguridad

1. **Standalone Components**: Todo nuevo componente debe usar sintaxis Standalone (`imports: [...]`).
2. **Bilingüismo Estricto**: Todo formulario de módulo o ejercicio debe exigir los equivalentes en inglés y español.
3. **Morfología Huasteca**: Todo ingreso de palabra debe validar su categoría gramatical y desglose aglutinante (raíz, prefijos, sufijos).
4. **Seguridad de Variables de Entorno**: NUNCA subir `environment.ts` con claves en texto plano a Git; usar las variables inyectadas por GitHub Secrets Base64 (`ENV_CONFIG`).
