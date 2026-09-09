# Guía de Pruebas: Atractivos y Paseos Turísticos

Endpoints del catálogo de paseos y circuitos de Capilla del Monte:
- `GET /api/v1/attractions` (Público, con filtros)
- `GET /api/v1/attractions/:id` (Público, detalle con fotos)
- `POST /api/v1/attractions` (Solo `ADMIN`)
- `PUT /api/v1/attractions/:id` (Solo `ADMIN`)
- `DELETE /api/v1/attractions/:id` (Solo `ADMIN`)
- `POST /api/v1/attractions/:id/images` (Solo `ADMIN`)
- `DELETE /api/v1/attractions/:id/images/:imageId` (Solo `ADMIN`)

---

## 1. Autorización Previa en Swagger
Dado que la creación y administración de paseos es responsabilidad institucional de la Comisión de Turismo:
1. Asegúrate de haber iniciado sesión con el usuario Administrador (`admin@capilladelmonte.gov.ar` / `AdminCapilla2026!`).
2. Ten pegado el Bearer token en el botón **"Authorize"** de Swagger.

---

## 2. Crear un Atractivo Turístico (Comisión / Admin)
1. Abre `POST /api/v1/attractions`.
2. Presiona **"Try it out"** y envía:
   ```json
   {
     "name": "Cerro Uritorco",
     "description": "El pico más alto de las Sierras Chicas con 1979 msnm. Famoso por sus senderos y mística.",
     "category": "HILL",
     "difficulty": "Alta",
     "estimatedDuration": "6 a 8 horas",
     "howToGet": "Acceso por la base del cerro, a 3 km del centro de Capilla del Monte.",
     "requiresGuide": false,
     "admissionFee": 15000.00,
     "latitude": -30.8492,
     "longitude": -64.4789
   }
   ```
3. Respuesta esperada: **HTTP 201 Created** con el ID generado. Copia este `id`.
4. **Verificación SQL en PostgreSQL:**
   ```sql
   SELECT id, name, category, difficulty, "admissionFee" 
   FROM attractions 
   WHERE name = 'Cerro Uritorco';
   ```

---

## 3. Consultar Paseos con Filtros (Público)
1. Abre `GET /api/v1/attractions`.
2. Prueba diferentes combinaciones de filtros:
   - `category`: Selecciona `HILL` -> Devuelve solo cerros.
   - `search`: Ingresa `uritorco` -> Búsqueda insensible a mayúsculas/minúsculas.
   - `requiresGuide`: `false`.
3. Respuesta esperada: **HTTP 200 OK** con la lista filtrada de paseos y sus imágenes asociadas.

---

## 4. Agregar Imagen a la Galería del Paseo
1. Abre `POST /api/v1/attractions/{id}/images`.
2. En el parámetro `id`, ingresa el UUID del paseo.
3. En el body envía:
   ```json
   {
     "url": "https://res.cloudinary.com/turismo-capilla/image/upload/v1/uritorco-cima.jpg",
     "publicId": "attractions/uritorco_01"
   }
   ```
4. Respuesta esperada: **HTTP 201 Created**.
5. **Verificación SQL en PostgreSQL:**
   ```sql
   SELECT id, "attractionId", url, "publicId" 
   FROM attraction_images;
   ```

---

## 5. Eliminar un Atractivo
1. Abre `DELETE /api/v1/attractions/{id}` con el ID del atractivo.
2. Respuesta esperada: **HTTP 200 OK** con mensaje de confirmación.
3. Las imágenes asociadas se eliminan en cascada automáticamente.
