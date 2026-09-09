# Referencia Oficial de la API REST — Turismo Capilla del Monte

Documentación técnica exhaustiva para desarrolladores frontend, backend y QA.

---

## 1. Información General y Convenciones

* **Versión de la API:** `v1`
* **Prefijo base:** `/api/v1`
* **Documentación interactiva (Swagger UI):** [http://localhost:3001/api](http://localhost:3001/api)
* **Formato de intercambio:** `application/json` (UTF-8)
* **Formato de fechas:** ISO 8601 (`YYYY-MM-DD` para reservas y `YYYY-MM-DDTHH:mm:ss.sssZ` para timestamps).
* **Moneda:** Pesos Argentinos (ARS) representados como número decimal con 2 decimales (`Decimal(10,2)`).

---

## 2. Autenticación y Autorización

La API utiliza tokens de acceso **JSON Web Tokens (JWT)** con firma simétrica.

### Formato de Cabecera
Para rutas protegidas, incluir en los encabezados HTTP:
```http
Authorization: Bearer <accessToken>
```

### Roles del Sistema (`Role`)
| Rol | Identificador | Alcance de Permisos |
| :--- | :--- | :--- |
| **Administrador** | `ADMIN` | Miembro de la Comisión de Turismo. Emite invitaciones a prestadores, crea/edita paseos turísticos, audita usuarios y supervisa todas las reservas. |
| **Prestador / Cabañero** | `HOST` | Dueño o administrador de alojamientos formalmente adherido. Publica sus cabañas, sube fotos, audita reservas recibidas y confirma/cancela reservas. |
| **Turista** | `TOURIST` | Visitante que consulta el catálogo, reserva estadías y audita su historial de reservas. |

---

## 3. Formato Estándar de Errores (`HttpExceptionFilter`)

Todas las respuestas con código de error (4xx y 5xx) siguen una estructura uniforme:

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "El alojamiento no tiene disponibilidad para las fechas seleccionadas.",
  "timestamp": "2026-09-05T00:45:00.000Z",
  "path": "/api/v1/bookings"
}
```

---

## 4. Índice Maestro de Endpoints

### 🔐 Autenticación e Invitaciones (`/api/v1/auth`, `/api/v1/invitations`)
| Método | Ruta | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/invitations` | `ADMIN` | Genera un token único de invitación para un prestador formalmente adherido (vigencia: 7 días). |
| `GET` | `/api/v1/invitations` | `ADMIN` | Lista todas las invitaciones emitidas, su estado y si fueron utilizadas. |
| `GET` | `/api/v1/invitations/validate/:token` | Público | Valida si un token de invitación existe y no ha sido utilizado ni expirado. |
| `POST` | `/api/v1/auth/register-host` | Público (con Token) | Registra un nuevo Prestador con rol `HOST` canjeando un token de invitación válido. |
| `POST` | `/api/v1/auth/register-tourist` | Público | Registra una cuenta de Turista con rol `TOURIST`. |
| `POST` | `/api/v1/auth/login` | Público | Inicia sesión con email y contraseña, retorna JWT y datos sanitizados del usuario. |
| `GET` | `/api/v1/auth/me` | Autenticado (`JWT`) | Retorna el perfil completo del usuario en sesión. |

### 👥 Administración de Usuarios (`/api/v1/users`)
| Método | Ruta | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users` | `ADMIN` | Lista los usuarios registrados con filtros opcionales por rol (`role`) y texto (`search`). |
| `GET` | `/api/v1/users/:id` | `ADMIN` | Consulta el detalle de un usuario por su UUID con conteo de cabañas y reservas. |

### 🏔️ Atractivos y Paseos Turísticos (`/api/v1/attractions`)
| Método | Ruta | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/attractions` | Público | Catálogo de paseos con filtros (`category`, `difficulty`, `requiresGuide`, `search`). |
| `GET` | `/api/v1/attractions/:id` | Público | Ficha técnica y galería de fotos de un atractivo. |
| `POST` | `/api/v1/attractions` | `ADMIN` | Alta de un nuevo paseo gestionado por la Comisión. |
| `PUT` | `/api/v1/attractions/:id` | `ADMIN` | Actualización de datos o recomendaciones del paseo. |
| `DELETE` | `/api/v1/attractions/:id` | `ADMIN` | Baja de un atractivo turístico. |
| `POST` | `/api/v1/attractions/:id/images` | `ADMIN` | Vincula una fotografía a la galería del atractivo. |
| `DELETE` | `/api/v1/attractions/:id/images/:imageId` | `ADMIN` | Elimina una fotografía de la galería. |

### 🏡 Alojamientos y Hospedajes (`/api/v1/accommodations`)
| Método | Ruta | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/accommodations` | Público | Búsqueda pública con filtros de disponibilidad de fechas (`checkIn`, `checkOut`), huéspedes, tipo y precio. |
| `GET` | `/api/v1/accommodations/my-accommodations` | `HOST` / `ADMIN` | Lista los alojamientos pertenecientes al prestador autenticado. |
| `GET` | `/api/v1/accommodations/:id` | Público | Detalle completo de un alojamiento (comodidades, fotos y contacto). |
| `POST` | `/api/v1/accommodations` | `HOST` / `ADMIN` | Publicación de un nuevo alojamiento vinculado al prestador autenticado. |
| `PUT` | `/api/v1/accommodations/:id` | Dueño `HOST` / `ADMIN` | Modificación de datos generales, tarifas o capacidad. |
| `DELETE` | `/api/v1/accommodations/:id` | Dueño `HOST` / `ADMIN` | Eliminación de un alojamiento. |
| `POST` | `/api/v1/accommodations/:id/images` | Dueño `HOST` / `ADMIN` | Agrega una foto a la galería (con opción de portada `isMain`). |
| `DELETE` | `/api/v1/accommodations/:id/images/:imageId` | Dueño `HOST` / `ADMIN` | Elimina una foto de la galería. |

### 📅 Motor de Reservas (`/api/v1/bookings`)
| Método | Ruta | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/bookings` | Público / `TOURIST` | Crea una solicitud de reserva atómica validando disponibilidad y previniendo overbooking. |
| `GET` | `/api/v1/bookings/my-bookings` | `HOST` / `ADMIN` | Lista todas las reservas recibidas para los alojamientos del prestador. |
| `GET` | `/api/v1/bookings/tourist-bookings` | `TOURIST` / `ADMIN` | Lista las reservas efectuadas por el turista autenticado. |
| `GET` | `/api/v1/bookings/lookup` | Público | Permite a cualquier huésped consultar el estado de su reserva con código y email. |
| `GET` | `/api/v1/bookings/:id` | Titular / Dueño / `ADMIN` | Consulta detallada de una reserva por ID. |
| `PATCH` | `/api/v1/bookings/:id/status` | Dueño `HOST` / `ADMIN` | Cambia el estado de la reserva (`CONFIRMED`, `CANCELLED`, `COMPLETED`). |

### 🩺 Monitoreo y Salud (`/api/v1/health`)
| Método | Ruta | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Público | Verifica tiempo de actividad (uptime) y conectividad activa con PostgreSQL. |

---

## 5. Reglas de Negocio Clave

### 5.1 Prevención de Sobreventa (Anti-Overbooking)
Dos rangos de fechas colisionan si y solo si:
$$\text{checkIn}_{\text{existente}} < \text{checkOut}_{\text{solicitado}} \quad \land \quad \text{checkOut}_{\text{existente}} > \text{checkIn}_{\text{solicitado}}$$
* El egreso (check-out) ocurre a las 10:00 hs y el ingreso (check-in) a las 14:00 hs. Por ende, si un huésped egresa el 15 de octubre, otro huésped **sí puede ingresar el 15 de octubre**.
* Toda reserva se procesa en una transacción aislada de base de datos (`$transaction`) con estado inicial `PENDING`. Si existe colisión con una reserva activa (`PENDING` o `CONFIRMED`), la API aborta la operación y retorna **HTTP 409 Conflict**.

### 5.2 Ciclo de Vida del Token de Invitación
1. El Administrador genera un token asignado a un correo de prestador.
2. El token tiene una vigencia de 7 días (`expiresAt = now + 7 days`).
3. Al registrarse el prestador (`POST /api/v1/auth/register-host`), se verifica dentro de una transacción que el token coincida con el email registrado, no esté expirado y no tenga fecha de uso (`usedAt === null`).
4. Tras crear el usuario con rol `HOST`, el token se marca como consumido fijando `usedAt = now()`.

### 5.3 Control Estricto de Propiedad en Alojamientos
* Un usuario con rol `HOST` **únicamente** puede modificar, eliminar o cargar imágenes en alojamientos cuyo `hostId` coincida exactamente con su propio `user.id`.
* Intentos de modificación sobre recursos ajenos son denegados con código **HTTP 403 Forbidden**.
* Los usuarios con rol `ADMIN` poseen bypass administrativo para moderar cualquier publicación del sistema.
