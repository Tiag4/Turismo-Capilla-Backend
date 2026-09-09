# Guía de Pruebas: Motor de Reservas y Prevención de Overbooking

Endpoints del motor transaccional de reservas:
- `POST /api/v1/bookings` (Público / Turista autenticado)
- `GET /api/v1/bookings/my-bookings` (Prestador: `HOST` o `ADMIN`)
- `GET /api/v1/bookings/tourist-bookings` (Turista autenticado: `TOURIST`)
- `GET /api/v1/bookings/lookup` (Público, consulta con código y email)
- `GET /api/v1/bookings/:id` (Huésped titular, Prestador dueño o `ADMIN`)
- `PATCH /api/v1/bookings/:id/status` (Prestador dueño o `ADMIN`)

---

## 1. Crear Solicitud de Reserva (Turista)
Simula a un turista reservando una cabaña disponible:

1. Obtén el UUID de un alojamiento activo (ej. `Cabañas Los Nogales`).
2. En Swagger, abre `POST /api/v1/bookings`.
3. Presiona **"Try it out"** y envía:
   ```json
   {
     "accommodationId": "PEGA_AQUI_EL_UUID_DEL_ALOJAMIENTO",
     "checkIn": "2026-10-10",
     "checkOut": "2026-10-15",
     "guestCount": 3,
     "guestName": "Lucía Fernández",
     "guestEmail": "lucia.turista@gmail.com",
     "guestPhone": "+54 11 9876-5432",
     "guestOrigin": "Rosario, Santa Fe",
     "notes": "Llegamos en horario de la tarde alrededor de las 16 hs."
   }
   ```
4. Respuesta esperada: **HTTP 201 Created** con:
   - Código único generado (ej. `CAP-2026-8491`).
   - `totalNights: 5`.
   - `totalAmount` calculado automáticamente (`pricePerNight * totalNights`).
   - Estado inicial: `PENDING`.
5. **Verificación SQL en PostgreSQL:**
   ```sql
   SELECT id, "bookingCode", "checkIn", "checkOut", "totalNights", "totalAmount", status, "guestName" 
   FROM bookings 
   ORDER BY "createdAt" DESC 
   LIMIT 1;
   ```

---

## 2. Prueba Crítica: Conflicto de Fechas (Anti-Overbooking)
Verifica que el sistema rechaza atómicamente reservas superpuestas para evitar sobreventa:

1. Sin cambiar el alojamiento, intenta enviar otra solicitud que se solape en fechas (por ejemplo `checkIn: 2026-10-12` a `checkOut: 2026-10-14`, o exactamente las mismas fechas).
2. Presiona **"Execute"**.
3. **Resultado Esperado:** Código **HTTP 409 Conflict** con mensaje:
   ```json
   {
     "statusCode": 409,
     "message": "El alojamiento no tiene disponibilidad para las fechas seleccionadas."
   }
   ```
4. **Verificación SQL en PostgreSQL:**
   ```sql
   -- Debe haber una sola reserva creada; la segunda no se guardó
   SELECT count(*) FROM bookings WHERE "accommodationId" = 'PEGA_AQUI_EL_UUID_DEL_ALOJAMIENTO';
   ```

---

## 3. Consulta de Reservas Recibidas por el Cabañero (HOST)
1. Inicia sesión como el prestador dueño del alojamiento (`cabanias.valle@gmail.com`) y autoriza Swagger.
2. Abre `GET /api/v1/bookings/my-bookings`.
3. Ejecuta la petición.
4. Respuesta esperada: **HTTP 200 OK** con la lista de reservas asociadas a sus cabañas.

---

## 4. Confirmación o Cancelación de Reserva (HOST)
El prestador aprueba la reserva:

1. Abre `PATCH /api/v1/bookings/{id}/status`.
2. Ingresa el `id` de la reserva y envía:
   ```json
   {
     "status": "CONFIRMED"
   }
   ```
3. Respuesta esperada: **HTTP 200 OK** con `status: CONFIRMED`.
4. **Verificación SQL en PostgreSQL:**
   ```sql
   SELECT "bookingCode", status, "updatedAt" FROM bookings WHERE id = 'ID_DE_LA_RESERVA';
   ```

---

## 5. Consulta Pública por Código y Correo (Sin Login)
Permite a un turista revisar el estado de su estadía:

1. Cierra sesión o desautoriza Swagger para probar como usuario anónimo.
2. Abre `GET /api/v1/bookings/lookup`.
3. Ingresa los parámetros:
   - `code`: `CAP-2026-XXXX` (el código obtenido en el paso 1)
   - `email`: `lucia.turista@gmail.com`
4. Respuesta esperada: **HTTP 200 OK** con los datos de la reserva y datos de contacto del prestador.
