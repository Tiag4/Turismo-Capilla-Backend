---
name: git-commit-rules
description: Reglas estrictas para inspección previa, staging atómico granular, formato de commits y prohibición de atribución IA en Turismo-Capilla.
---

# Git Commit Rules & Conventions (Turismo-Capilla)

Esta skill define las reglas obligatorias para el manejo de versiones, inspección de diffs, staging atómico y mensajes de commit en el repositorio **Turismo-Capilla**.

## 1. Inspección Previa OBLIGATORIA
Antes de realizar cualquier staging (`git add`), es **estrictamente obligatorio**:
1. Ejecutar `git status` para revisar el estado del árbol de trabajo (archivos modificados, creados o eliminados).
2. Ejecutar `git diff` (o `git diff --cached`) para auditar las líneas exactas modificadas, verificando que no existan:
   - Archivos temporales, logs o artefactos accidentales.
   - Caracteres de mojibake o errores de encoding (UTF-8 sin BOM requerido).
   - Cambios de formato no deseados, archivos de backup (`*.bak`, `*_new.*`) ni `console.log` sueltos.

## 2. Staging Atómico y Granular
- **PROHIBIDO usar `git add .` o `git add -A` a ciegas.**
- El staging DEBE ser focalizado y granular: seleccionar explícitamente los archivos específicos pertenecientes a la tarea, feature o bugfix actual (`git add path/to/file1 path/to/file2`).
- Agrupar cambios en commits lógicos independientes cuando una tarea abarque múltiples áreas no relacionadas (ej. backend vs frontend vs docs).

## 3. Frecuencia de Commits
- Realizar commits pequeños y cohesivos por cambio o corrección específica.
- Al finalizar una fase o ciclo completo de desarrollo o SDD, realizar el commit final de cierre de fase.

## 4. Formato Conventional Commits (OBLIGATORIO EN ESPAÑOL PARA BACKEND)
Todos los mensajes de commit, mensajes de push, títulos y descripciones de Pull Requests (PRs) del repositorio de backend **DEBEN ESTAR SIEMPRE ESCRITOS EN ESPAÑOL**.

Estructura:
`<type>(<scope>): <descripción breve en minúsculas en español>`

### Tipos permitidos (`type`):
- `feat`: Nueva funcionalidad.
- `fix`: Corrección de un error o bug.
- `refactor`: Cambio de código que ni agrega feature ni corrige bug (limpieza, deduplicación, arquitectura).
- `style`: Formateo, espacios, puntos y comas (sin cambios de lógica).
- `test`: Adición o corrección de pruebas unitarias/integración.
- `docs`: Cambios exclusivamente en documentación o diagramas.
- `chore`: Tareas de build, dependencias, skills o configuración sin tocar lógica de negocio.

### Ámbitos (`scope`) en Turismo-Capilla (Backend):
Indica el módulo o área afectada:
- `backend`, `db`, `prisma`
- `auth`, `invitations`, `accommodations`, `bookings`, `attractions`, `users`, `health`
- `skills`, `docs`, `tests`, `common`

### Ejemplos válidos en español:
- `refactor(backend): eliminar codigo muerto de app controller e integrar extension uuidv7`
- `refactor(accommodations): unificar dtos de imagenes y eliminar duplicaciones`
- `feat(bookings): prevenir solapamiento de fechas con transacciones atomicas de prisma`
- `test(auth): agregar pruebas unitarias para registro de anfitrion con tokens`

## 5. Prohibición Estricta de Atribución de IA
- **PROHIBIDO** incluir cabeceras de atribución de IA como `Co-Authored-By: CoPilot/ChatGPT/Gemini/Claude` o comentarios similares en el mensaje del commit o en el código.
- Los commits deben ser firmados/atribuidos únicamente mediante la autoría git estándar del desarrollador/entorno sin marcas de agua de IA.
