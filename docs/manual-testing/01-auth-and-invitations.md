# Guía de Pruebas: Autenticación, Invitaciones y Roles

Endpoints del módulo de seguridad y control de acceso:
- `POST /api/v1/invitations` (Solo `ADMIN`)
- `GET /api/v1/invitations` (Solo `ADMIN`)
- `GET /api/v1/invitations/validate/:token` (Público)
- `POST /api/v1/auth/register-host` (Público con Token)
- `POST /api/v1/auth/register-tourist` (Público)
- `POST /api/v1/auth/login` (Público)
- `GET /api/v1/auth/me` (Autenticado con JWT)

---

## 1. Login Inicial como Administrador
Para probar endpoints que requieren rol `ADMIN` (como emitir invitaciones o crear paseos):

1. En Swagger, abre `POST /api/v1/auth/login`.
2. Presiona **"Try it out"** y envía:
   ```json
   {
     "email": "admin@capilladelmonte.gov.ar",
     "password": "AdminCapilla2026!"
   }
   ```
3. Respuesta esperada: **HTTP 200 OK** con `accessToken` y datos del usuario.
4. **Autorizar en Swagger:**
   - Copia el valor de `accessToken`.
   - Arriba a la derecha en Swagger, pulsa el botón verde **"Authorize"**.
   - En el campo `Value`, pega el token y pulsa **Authorize**.

---

## 2. Generar Token de Invitación para un Cabañero
Permite a la Comisión de Turismo invitar a un nuevo prestador formalmente adherido.

1. Abre `POST /api/v1/invitations`.
2. Envía el email del prestador:
   ```json
   {
     "email": "cabanias.valle@gmail.com"
   }
   ```
3. Respuesta esperada: **HTTP 201 Created** con el token generado (ej. `inv-7b19a...`) con 7 días de validez.
4. **Verificación SQL en PostgreSQL:**
   ```sql
   SELECT id, token, email, "expiresAt", "usedAt", "createdById" 
   FROM invitation_tokens 
   ORDER BY "createdAt" DESC 
   LIMIT 1;
   ```

---

## 3. Validar Token de Invitación (Público)
Simula la verificación que hace el frontend cuando el prestador hace clic en el link recibido:

1. Abre `GET /api/v1/invitations/validate/{token}`.
2. Pega el token generado en el paso anterior y ejecuta.
3. Respuesta esperada: **HTTP 200 OK** confirmando que el token es válido y está activo.

---

## 4. Registrar Prestador con Token Validado
El cabañero completa su registro utilizando el token asignado:

1. Abre `POST /api/v1/auth/register-host`.
2. Envía los datos:
   ```json
   {
     "token": "PEGA_AQUI_EL_TOKEN_OBTENIDO",
     "name": "Carlos",
     "lastName": "Gómez",
     "email": "cabanias.valle@gmail.com",
     "password": "PasswordSegura123!",
     "phone": "+543548123456"
   }
   ```
3. Respuesta esperada: **HTTP 201 Created** con el perfil del prestador creado con `role: HOST`.
4. **Verificación SQL en PostgreSQL:**
   ```sql
   -- El usuario debe existir con rol HOST
   SELECT id, name, "lastName", email, role FROM users WHERE email = 'cabanias.valle@gmail.com';

   -- El token debe figurar como consumido (usedAt NO nulo)
   SELECT token, email, "usedAt" FROM invitation_tokens WHERE email = 'cabanias.valle@gmail.com';
   ```

---

## 5. Iniciar Sesión como Cabañero
1. Abre `POST /api/v1/auth/login`.
2. Envía:
   ```json
   {
     "email": "cabanias.valle@gmail.com",
     "password": "PasswordSegura123!"
   }
   ```
3. Respuesta esperada: **HTTP 200 OK** con el token del cabañero.
4. Puedes copiar este token para identificarte como `HOST` en Swagger y probar la gestión de sus cabañas.
