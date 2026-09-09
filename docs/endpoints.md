# Planificación de Endpoints de la API REST — Turismo Capilla del Monte

Este documento define la especificación de endpoints para el backend en NestJS, mapeados directamente a las Historias de Usuario (`HU-01` a `HU-10`).

---

## 1. Módulo de Autenticación e Invitaciones (`/api/v1/auth`, `/api/v1/invitations`)

Permite la gestión de acceso restringido para prestadores formalmente adheridos por la Comisión de Turismo.

| Método | Ruta | Rol / Guardia | Descripción | Historia de Usuario |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/invitations` | `ADMIN` (JWT) | Genera un token único con vencimiento para invitar a un nuevo prestador. | `HU-10` |
| `GET` | `/api/v1/invitations/validate/:token` | Público | Valida si un token de invitación existe, está activo y no expiró. | `HU-10` |
| `POST` | `/api/v1/auth/register-host` | Público (con Token) | Registra un nuevo Cabañero/Prestador validando el token de invitación. | `HU-10`, `HU-07` |
| `POST` | `/api/v1/auth/login` | Público | Autentica un usuario (email + password) y retorna token JWT con su rol. | Transversal |
| `GET` | `/api/v1/auth/me` | Autenticado (JWT) | Obtiene los datos del perfil del usuario en sesión. | Transversal |

---

## 2. Módulo de Alojamientos (`/api/v1/accommodations`)

Gestiona el catálogo público de hospedajes y el panel de administración para los prestadores.

| Método | Ruta | Rol / Guardia | Descripción | Historia de Usuario |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/accommodations` | Público | Lista alojamientos con filtros (fechas `checkIn`/`checkOut`, huéspedes, tipo). | `HU-04`, `HU-08` |
| `GET` | `/api/v1/accommodations/:id` | Público | Detalle completo de un alojamiento (fotos, comodidades, tarifas y reglas). | `HU-05` |
| `POST` | `/api/v1/accommodations` | `HOST` / `ADMIN` | Alta de un nuevo establecimiento asociado al prestador autenticado. | `HU-07` |
| `PUT` | `/api/v1/accommodations/:id` | `HOST` (dueño) / `ADMIN` | Modificación de datos generales, tarifas por noche y capacidad. | `HU-07` |
| `POST` | `/api/v1/accommodations/:id/images` | `HOST` (dueño) | Carga múltiple de fotografías a Cloudinary y vinculación al alojamiento. | `HU-07` |
| `DELETE` | `/api/v1/accommodations/:id/images/:imageId` | `HOST` (dueño) | Eliminación de una foto tanto de la base de datos como de Cloudinary. | `HU-07` |

---

## 3. Módulo de Reservas (`/api/v1/bookings`)

Motor transaccional para la solicitud, confirmación y control de sobreventa (*overbooking*).

| Método | Ruta | Rol / Guardia | Descripción | Historia de Usuario |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/bookings` | Público / Turista | Solicita una reserva validando atómicamente la no superposición de fechas. Estado inicial: `PENDING`. | `HU-06` |
| `GET` | `/api/v1/bookings/my-bookings` | `HOST` (JWT) | Lista todas las reservas recibidas para los alojamientos del prestador. | `HU-09` |
| `GET` | `/api/v1/bookings/:id` | `HOST` / Turista titular | Consulta el estado y detalle de una reserva mediante su código o ID. | `HU-06`, `HU-09` |
| `PATCH` | `/api/v1/bookings/:id/status` | `HOST` (dueño) | Actualiza el estado de la reserva (`CONFIRMED`, `CANCELLED`, `COMPLETED`). | `HU-09` |

---

## 4. Módulo de Atractivos y Paseos (`/api/v1/attractions`)

Provee la información institucional y turística de Capilla del Monte (cerros, balnearios, circuitos).

| Método | Ruta | Rol / Guardia | Descripción | Historia de Usuario |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/attractions` | Público | Lista de paseos categorizados (`HILL`, `RIVER_BEACH`, `CULTURAL`, etc.). | `HU-02`, `HU-08` |
| `GET` | `/api/v1/attractions/:id` | Público | Ficha técnica completa de un atractivo (dificultad, duración, fotos, guía). | `HU-03` |
| `POST` | `/api/v1/attractions` | `ADMIN` (JWT) | Alta de un nuevo paseo turístico gestionado por la Comisión. | `HU-02` |
| `PUT` | `/api/v1/attractions/:id` | `ADMIN` (JWT) | Edición de información técnica, recomendaciones o estado de paseos. | `HU-03` |
| `POST` | `/api/v1/attractions/:id/images` | `ADMIN` (JWT) | Carga de fotografías representativas del atractivo a Cloudinary. | `HU-03` |
