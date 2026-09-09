# Guía de Pruebas: Alojamientos y Hospedajes

Endpoints para la gestión de alojamientos por prestadores y el catálogo público:
- `GET /api/v1/accommodations` (Público, con filtros de disponibilidad y características)
- `GET /api/v1/accommodations/my-accommodations` (Prestador autenticado: `HOST` o `ADMIN`)
- `GET /api/v1/accommodations/:id` (Público, ficha técnica completa)
- `POST /api/v1/accommodations` (Prestador autenticado: `HOST` o `ADMIN`)
- `PUT /api/v1/accommodations/:id` (Dueño `HOST` o `ADMIN`)
- `DELETE /api/v1/accommodations/:id` (Dueño `HOST` o `ADMIN`)
- `POST /api/v1/accommodations/:id/images` (Dueño `HOST` o `ADMIN`)
- `DELETE /api/v1/accommodations/:id/images/:imageId` (Dueño `HOST` o `ADMIN`)

---

## 1. Autorización como Prestador (HOST)
1. Inicia sesión en `POST /api/v1/auth/login` con la cuenta de un prestador adherido (ej. `cabanias.valle@gmail.com` / `PasswordSegura123!`).
2. Copia el `accessToken`.
3. Haz clic en **"Authorize"** en Swagger y pega el token.

---

## 2. Publicar un Alojamiento (Cabaña)
1. En Swagger, abre `POST /api/v1/accommodations`.
2. Presiona **"Try it out"** y envía:
   ```json
   {
     "name": "Cabañas Los Nogales",
     "description": "Hermosa cabaña serrana con vista panorámica al Cerro Uritorco, pileta, asador y parque arbolado.",
     "type": "CABIN",
     "address": "Av. Las Gemelas 450",
     "locality": "Capilla del Monte",
     "pricePerNight": 45000,
     "maxGuests": 4,
     "amenities": ["Pileta", "Wi-Fi", "Asador", "Cochera cubierta"],
     "latitude": -30.8521,
     "longitude": -64.5218,
     "images": [
       {
         "url": "https://res.cloudinary.com/turismo-capilla/image/upload/v1/cabana-nogales-frente.jpg",
         "publicId": "accommodations/nogales_01",
         "isMain": true
       }
     ]
   }
   ```
3. Respuesta esperada: **HTTP 201 Created** con el ID del alojamiento generado y la cabaña vinculada a tu usuario `hostId`. Copia este `id`.
4. **Verificación SQL en PostgreSQL:**
   ```sql
   SELECT a.id, a.name, a.type, a."pricePerNight", a."maxGuests", a."isActive", u.email AS prestador
   FROM accommodations a
   JOIN users u ON a."hostId" = u.id
   WHERE a.name = 'Cabañas Los Nogales';
   ```

---

## 3. Listar Mis Alojamientos (`my-accommodations`)
1. Abre `GET /api/v1/accommodations/my-accommodations`.
2. Ejecuta la petición con el token de `HOST`.
3. Respuesta esperada: **HTTP 200 OK** con la lista de establecimientos del prestador logueado, incluyendo conteo de reservas e imágenes.

---

## 4. Búsqueda Pública en el Catálogo (Turista)
1. Abre `GET /api/v1/accommodations`.
2. Prueba los filtros disponibles:
   - `guests`: `2` (debe retornar alojamientos donde `maxGuests >= 2`).
   - `type`: `CABIN`.
   - `minPrice`: `30000`, `maxPrice`: `60000`.
   - `amenity`: `Pileta`.
   - `checkIn`: `2026-10-10`, `checkOut`: `2026-10-15` (valida disponibilidad anti-overbooking).
3. Respuesta esperada: **HTTP 200 OK** con los alojamientos disponibles ordenados por precio por noche.

---

## 5. Control de Permisos y Propiedad (Prueba de Seguridad)
1. Intenta modificar el alojamiento anterior usando el token de un prestador diferente (o de un turista).
2. Abre `PUT /api/v1/accommodations/{id}`.
3. Respuesta esperada: **HTTP 403 Forbidden** con mensaje:
   `"No tiene permisos para administrar este alojamiento"`
4. Solo el prestador dueño original o un usuario con rol `ADMIN` pueden modificarlo o eliminarlo.

---

## 6. Agregar y Remover Fotos de la Galería
1. **Agregar foto:** `POST /api/v1/accommodations/{id}/images`
   ```json
   {
     "url": "https://res.cloudinary.com/turismo-capilla/image/upload/v1/cabana-nogales-pileta.jpg",
     "publicId": "accommodations/nogales_02",
     "isMain": false
   }
   ```
2. **Eliminar foto:** `DELETE /api/v1/accommodations/{id}/images/{imageId}`
3. **Verificación SQL en PostgreSQL:**
   ```sql
   SELECT id, "accommodationId", url, "isMain" 
   FROM accommodation_images;
   ```
