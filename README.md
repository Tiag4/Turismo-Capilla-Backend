# Turismo Capilla del Monte — Backend API

<p align="center">
  <img src="https://img.shields.io/badge/Proyecto-Turismo%20Capilla%20del%20Monte-2ea44f?style=for-the-badge" alt="Proyecto">
  <img src="https://img.shields.io/badge/Componente-API%20%26%20Backend-blue?style=for-the-badge" alt="Backend">
  <img src="https://img.shields.io/badge/Framework-NestJS%2012-ea2845?style=for-the-badge" alt="NestJS">
  <img src="https://img.shields.io/badge/ORM-Prisma%206-2d3748?style=for-the-badge" alt="Prisma">
  <img src="https://img.shields.io/badge/Base%20de%20Datos-PostgreSQL-336791?style=for-the-badge" alt="PostgreSQL">
</p>

<p align="center">
  <strong>Servicios backend y API REST transaccional para centralizar, gestionar y proveer la información turística y motor de reservas de Capilla del Monte, Córdoba.</strong>
</p>

---

## 1. Sobre el Proyecto

Este repositorio contiene la arquitectura, servicios de dominio y API REST del proyecto **Turismo Capilla del Monte**. 

Provee una capa de servidor robusta y escalable bajo **Screaming Architecture (Hexagonal / Puertos y Adaptadores)** encargada de:
* **Autenticación e Identidad:** JWT y control de acceso basado en roles (`ADMIN`, `HOST`, `TOURIST`).
* **Sistema de Invitaciones Seguras:** Tokens criptográficos emitidos por la Comisión de Turismo para la adhesión formal de prestadores.
* **Catálogos Turísticos:** ABM y consulta pública de paseos, cerros y atractivos naturales.
* **Gestión de Alojamientos:** Inventario de cabañas, amenidades y galerías multimedia.
* **Motor Transaccional de Reservas:** Creación atómica con validación estricta anti-overbooking (`checkIn < requested.checkOut && checkOut > requested.checkIn`).

---

## 2. Equipo de Desarrollo

| Integrante | Rol |
| :--- | :--- |
| **Martino Costigliolo** | Arquitectura & Backend / Frontend |
| **Tiago Nicolitsis** | Desarrollo |
| **Juan Larcher** | Desarrollo |

---

## 3. Requisitos Previos

* **Node.js:** v20.x o v22.x LTS
* **pnpm:** v9.x o v11.x
* **PostgreSQL:** v15+ corriendo localmente o mediante Docker

---

## 4. Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto a partir de la plantilla:

```bash
cp .env.example .env
```

Contenido base de `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/turismo_capilla?schema=public"
JWT_SECRET="super-secret-key-capilla-monte-2026-production"
JWT_EXPIRES_IN="7d"
PORT=3001
```

> **Nota:** El backend corre por defecto en el puerto **3001** para no colisionar con aplicaciones cliente en el puerto 3000 o 4321.

---

## 5. Instalación y Base de Datos

```bash
# 1. Instalar dependencias
pnpm install

# 2. Generar el cliente de Prisma
pnpm run prisma:generate

# 3. Aplicar las migraciones a PostgreSQL
pnpm run prisma:migrate

# 4. Poblar la base de datos con datos semilla iniciales
pnpm run prisma:seed
```

### Datos Semilla Iniciales (Seed)
Al ejecutar `pnpm run prisma:seed` se configuran automáticamente:
* **Administrador Oficial de la Comisión:**
  * **Email:** `admin@capilladelmonte.gov.ar`
  * **Contraseña:** `AdminCapilla2026!`
  * **Rol:** `ADMIN`
* **Atractivos Turísticos Iniciales:**
  * Cerro Uritorco (Ascenso diurno/nocturno, 1979 msnm)
  * Los Terrones (Parque autóctono y circuito geológico)
  * El Zapato (Monumento natural de roca)
  * Balneario La Toma (Río Calabalumba)

---

## 6. Ejecución del Servidor

```bash
# Modo desarrollo con recarga en vivo (hot-reload)
pnpm run dev

# Compilar el proyecto para producción
pnpm run build

# Iniciar el servidor compilado en producción
pnpm run start:prod
```

### URLs del Servicio
* **API REST Base:** [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
* **Documentación Interactiva (Swagger UI):** [http://localhost:3001/api](http://localhost:3001/api)
* **Healthcheck:** [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)

---

## 7. Inspección Visual de Datos (Prisma Studio)

Para explorar, filtrar y editar registros en una interfaz gráfica:

```bash
pnpm run prisma:studio
```
Disponible en [http://localhost:5555](http://localhost:5555).

---

## 8. Calidad de Código y Pruebas

```bash
# Ejecutar suite completa de pruebas unitarias (33 tests)
pnpm run test

# Modo interactivo / observador (watch)
pnpm run test:watch

# Ejecutar el linter estricto (Oxlint)
pnpm run lint

# Formatear el código con Prettier
pnpm run format
```

---

## 9. Estructura del Repositorio

```text
/
├── docs/                          # Documentación técnica de arquitectura y endpoints
│   ├── api-reference.md           # Catálogo exhaustivo de endpoints (24 rutas)
│   ├── endpoints.md               # Mapeo de endpoints a Historias de Usuario
│   ├── database-and-domain-model.md # DER, UML de dominio y reglas de overbooking
│   ├── diagrams/                  # Diagramas editables en Excalidraw
│   └── manual-testing/            # Guías paso a paso de pruebas funcionales
├── prisma/
│   ├── schema.prisma              # Definición de entidades, índices y relaciones
│   ├── migrations/                # Historial de migraciones versionadas
│   └── seed.ts                    # Población inicial de base de datos
├── src/
│   ├── common/                    # Infraestructura transversal (guards, filters, decorators)
│   ├── modules/                   # Dominios de negocio (auth, invitations, users, accommodations, bookings, attractions, health)
│   ├── prisma/                    # Servicio global de base de datos
│   ├── app.module.ts              # Módulo raíz de NestJS
│   └── main.ts                    # Bootstrap, CORS, ValidationPipe y Swagger
├── test/                          # Pruebas End-to-End
├── package.json
└── tsconfig.json
```

---

## 10. Documentación de Referencia

* 📖 [**Referencia Oficial de Endpoints de la API**](docs/api-reference.md)
* 🗄️ [**Modelo de Datos (DER/UML) y Reglas de Negocio**](docs/database-and-domain-model.md)
* 🧪 [**Guías de Pruebas Manuales por Módulo**](docs/manual-testing-guide.md)
