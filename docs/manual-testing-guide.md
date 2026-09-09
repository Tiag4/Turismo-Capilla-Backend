# Guías de Pruebas Manuales — Turismo Capilla del Monte

Este índice centraliza los documentos individuales de pruebas manuales para cada módulo del sistema, diseñados para probar los endpoints interactivamente a través de **Swagger** ([http://localhost:3001/api](http://localhost:3001/api)) y auditar la persistencia en **PostgreSQL**.

---

## 1. Preparación del Entorno

### Paso 1: Iniciar el Servidor Backend
Desde la raíz del repositorio o dentro de `apps/backend`:
```bash
pnpm dev
```
* **Swagger UI:** [http://localhost:3001/api](http://localhost:3001/api)

### Paso 2: Herramientas de Inspección de Base de Datos
* **Prisma Studio (Visual en Navegador):**
  ```bash
  pnpm --filter backend run prisma:studio
  ```
  Accede a [http://localhost:5555](http://localhost:5555).
* **Terminal SQL (`psql`):**
  ```bash
  psql -U postgres -d turismo_capilla
  ```

---

## 2. Documentos de Pruebas por Módulo

Haz clic en el enlace del módulo que desees probar para ver el detalle de cada endpoint, payloads de ejemplo y consultas SQL de verificación:

1. 🔐 [**01 - Autenticación, Invitaciones y Roles**](./manual-testing/01-auth-and-invitations.md)  
   * Login Admin, generación y validación de tokens de invitación, registro de prestadores (`HOST`), registro de turistas (`TOURIST`), perfil `/auth/me`.

2. 🏔️ [**02 - Atractivos y Paseos Turísticos**](./manual-testing/02-attractions.md)  
   * Catálogo público con filtros (`category`, `difficulty`, `requiresGuide`, `search`), creación/edición/baja institucional (`ADMIN`) y galería de imágenes.

3. 🏡 [**03 - Alojamientos y Hospedajes**](./manual-testing/03-accommodations.md)  
   * Catálogo público con filtros por fechas (algoritmo anti-overbooking), capacidad de huéspedes, tipo y amenidades; panel de cabañas del prestador (`my-accommodations`), alta, edición, control de permisos de dueño y gestión de fotos.

4. 📅 [**04 - Motor de Reservas y Anti-Overbooking**](./manual-testing/04-bookings.md)  
   * Solicitud de reserva, bloqueo transaccional de solapamiento de fechas (HTTP 409 Conflict), máquina de estados (`PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`) y búsqueda pública por código.

---

## 3. Consultas SQL de Diagnóstico Rápido

Para auditar el estado global de la base de datos:

```sql
-- 1. Ver usuarios y sus roles
SELECT id, name, "lastName", email, role FROM users;

-- 2. Ver invitaciones emitidas y si fueron usadas
SELECT token, email, "expiresAt", "usedAt" FROM invitation_tokens;

-- 3. Ver atractivos registrados y sus tarifas
SELECT id, name, category, difficulty, "admissionFee" FROM attractions;

-- 4. Ver alojamientos con sus prestadores dueños
SELECT a.name AS cabaña, a."pricePerNight", a."maxGuests", a."isActive", u.email AS prestador
FROM accommodations a
JOIN users u ON a."hostId" = u.id;
```
