# Estándares de Programación y Calidad

Como agente, **DEBES** seguir estos lineamientos en todo momento para asegurar la calidad y consistencia del proyecto:

## 1. Reglas de Testing
Por cada funcionalidad nueva (`feat`) o corrección de error (`fix`), **DEBES** crear o actualizar la prueba unitaria correspondiente (ej. JUnit/MockK en Android o Jasmine/Karma/Jest en Angular). Nunca des por terminada una tarea sin comprobar que su test pasa exitosamente.

## 2. Contenido y Gramática Náhuatl (Integridad)
Al generar, modificar o sugerir contenido para los ejercicios o el diccionario, **DEBES** apegarte estrictamente a las reglas gramaticales documentadas y al léxico existente en los archivos JSON. **Nunca** alucines ni inventes traducciones al Náhuatl sin confirmación.

## 3. Documentación Continua
Siempre que resuelvas un bug complejo o tomes una decisión de diseño importante (`fix` o `refactor`), **DEBES** agregar una pequeña nota en el `ARCHITECTURE.md` (o documento equivalente) para evitar que futuros desarrolladores o agentes tropiecen con el mismo problema.

## 4. Arquitectura Limpia (Clean Architecture)
Nunca agregues lógica de negocio directamente en los Fragmentos/Actividades (Android) o Componentes UI (Angular). Toda la lógica de negocio **DEBE** residir en Casos de Uso (Use Cases), Servicios, o Repositorios.

## 5. Internacionalización (i18n)
Bajo ninguna circunstancia escribas texto visible para el usuario (cadenas hardcodeadas) directamente en las vistas de interfaz de usuario. Todos los textos **DEBEN** estar centralizados (ej. `strings.xml` en Android o constantes globales en Web).
