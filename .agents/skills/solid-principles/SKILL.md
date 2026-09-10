---
name: solid-principles
description: >-
  Directrices y ejemplos prácticos para aplicar los 5 principios SOLID en el desarrollo
  con TypeScript, NestJS y Arquitectura Limpia dentro del proyecto Turismo-Capilla.
---

# Principios SOLID en Turismo-Capilla

Este documento detalla cómo aplicar rigurosamente los principios SOLID en el backend y frontend del proyecto.

---

## 1. Single Responsibility Principle (SRP) — Responsabilidad Única
> *Una clase o módulo debe tener una sola razón para cambiar.*

* **En NestJS:**
  * **Controllers:** Su única responsabilidad es recibir el payload HTTP, invocar la validación de DTOs y delegar la ejecución al servicio/caso de uso. No contienen lógica de negocio ni consultas a la base de datos.
  * **Services / Use Cases:** Su única responsabilidad es orquestar la regla de negocio (por ejemplo, validar disponibilidad y crear la reserva).
  * **Repositories:** Su única responsabilidad es la persistencia y recuperación de datos contra la base de datos (Prisma).

**Anti-patrón:**
```typescript
// ❌ MAL: El servicio calcula precios, guarda en DB y envía emails directamente
class BookingService {
  async createBooking(data) {
    const total = data.nights * 100;
    await prisma.booking.create({ data: { ...data, total } });
    await nodemailer.sendMail({ to: data.email, subject: 'Reserva confirmada' });
  }
}
```

**Correcto:**
```typescript
// ✅ BIEN: Separación en componentes de responsabilidad única
class BookingService {
  constructor(
    private readonly bookingRepo: IBookingRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async createBooking(command: CreateBookingCommand): Promise<Booking> {
    const booking = Booking.create(command);
    await this.bookingRepo.save(booking);
    await this.notificationService.sendBookingConfirmation(booking);
    return booking;
  }
}
```

---

## 2. Open/Closed Principle (OCP) — Abierto para Extensión, Cerrado para Modificación
> *El software debe estar abierto a extensiones sin necesidad de modificar el código existente.*

* Si se incorpora un nuevo método de notificación (por ejemplo, WhatsApp además de Email), no se debe modificar la lógica del servicio de reservas; se implementa una nueva estrategia que respete el contrato `INotificationService`.

```typescript
// Contrato base
interface INotificationService {
  sendBookingNotification(booking: Booking): Promise<void>;
}

// Extensiones sin modificar el llamador
class EmailNotificationService implements INotificationService { ... }
class WhatsAppNotificationService implements INotificationService { ... }
```

---

## 3. Liskov Substitution Principle (LSP) — Sustitución de Liskov
> *Los subtipos o implementaciones deben ser sustituibles por sus tipos base sin alterar el comportamiento del programa.*

* Si un repositorio de pruebas en memoria (`InMemoryBookingRepository`) implementa `IBookingRepository`, debe comportarse de forma idéntica a la implementación real (`PrismaBookingRepository`) en cuanto a contratos de retorno, tipos y excepciones esperadas.

---

## 4. Interface Segregation Principle (ISP) — Segregación de Interfaces
> *Los clientes no deben verse obligados a depender de interfaces que no utilizan.*

* Evitar interfaces "monolíticas" que mezclen operaciones no relacionadas.
* Es preferible definir interfaces pequeñas y cohesivas:

```typescript
// ❌ MAL: Interfaz gigante obligatoria
interface IAccommodationManager {
  createAccommodation(data: any): Promise<void>;
  updatePricing(id: string, price: number): Promise<void>;
  uploadPhotos(id: string, photos: File[]): Promise<void>;
  generateMonthlyRevenueReport(id: string): Promise<Report>;
}

// ✅ BIEN: Interfaces segregadas según el caso de uso
interface IAccommodationReader {
  findById(id: string): Promise<Accommodation | null>;
  search(criteria: SearchCriteria): Promise<Accommodation[]>;
}

interface IAccommodationWriter {
  save(accommodation: Accommodation): Promise<void>;
  delete(id: string): Promise<void>;
}
```

---

## 5. Dependency Inversion Principle (DIP) — Inversión de Dependencias
> *Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.*

* Los servicios del dominio (`BookingService`) nunca importan directamente el cliente de Prisma o el SDK de Cloudinary.
* Dependen de interfaces (puertos) inyectadas en el constructor mediante los mecanismos de Inversión de Control (IoC) de NestJS.

```typescript
// Token de inyección y abstracción
export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');

export interface IBookingRepository {
  findOverlappingBookings(accommodationId: string, from: Date, to: Date): Promise<Booking[]>;
  save(booking: Booking): Promise<void>;
}

// Servicio desacoplado de Prisma
@Injectable()
export class CreateBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
  ) {}
}
```

---

## 6. SOLID en Frontend (React & Astro Islands)

En la capa de presentación (`apps/frontend`), aplicamos los mismos 5 principios para evitar componentes monolíticos y frágiles:

### 6.1 S - Single Responsibility Principle (SRP) & Container-Presentational
* **Smart Containers (`< 100 líneas`)**: Se encargan de orquestar custom hooks, coordinar el estado de la búsqueda o reserva, y distribuir datos a subcomponentes. No renderizan markup visual complejo ni layouts densos.
* **Custom Hooks (`/hooks`)**: Toda la lógica no visual, cálculo de noches/tarifas y llamadas a la API de NestJS vive encapsulada en custom hooks (`useBookingFlow`, `useAvailabilitySearch`).
* **Dumb Components (`/components` o `/ui`)**: Componentes puramente visuales, puros y testeables que solo reciben props y disparan callbacks. Cero efectos secundarios directos (`useEffect` con fetch de datos).

```tsx
// ❌ MAL: Componente monolítico de 300 líneas con fetch, cálculo y renderizado mezclado
export function CabinCard({ cabinId }: { cabinId: string }) {
  const [data, setData] = useState(null);
  useEffect(() => { fetch(`/api/v1/accommodations/${cabinId}`).then(...); }, []);
  // ... cálculos de fechas, modales y JSX mezclado ...
}

// ✅ BIEN: SRP con Custom Hook + Dumb Component
export function CabinCardContainer({ cabinId }: { cabinId: string }) {
  const { cabin, isLoading, onBook } = useCabinBooking(cabinId);
  if (isLoading) return <CabinCardSkeleton />;
  return <CabinCardView cabin={cabin} onBook={onBook} />;
}
```

### 6.2 O - Open/Closed Principle (OCP)
* Extender componentes mediante composición (`children` o slots) en lugar de agregar cadenas interminables de `if/else` o booleanos como `isPromoted`, `isFeatured`, `hasSeasonalDiscount` dentro del mismo componente.

```tsx
// ✅ BIEN: Composición abierta a extensión
export function CardHeader({ title, badge }: { title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="font-display font-bold text-lg">{title}</h3>
      {badge}
    </div>
  );
}
```

### 6.3 L - Liskov Substitution Principle (LSP)
* Todo componente derivado o wrapper (ej. `Button`, `DateInput`, `Modal`) debe propagar correctamente referencias (`forwardRef`) y aceptar todas las propiedades estándar del elemento HTML subyacente sin alterar su contrato funcional.

### 6.4 I - Interface Segregation Principle (ISP)
* Los componentes visuales no deben recibir entidades gigantes si solo necesitan 2 o 3 campos. Pasar solo lo indispensable para reducir acoplamiento y re-renders innecesarios.

```tsx
// ❌ MAL: Acopla la tarjeta a toda la entidad de base de datos
function PriceBadge({ accommodation }: { accommodation: AccommodationWithRelations }) {
  return <span>${accommodation.pricePerNight}</span>;
}

// ✅ BIEN: Interfaz segregada mínima
function PriceBadge({ pricePerNight }: { pricePerNight: number }) {
  return <span>${pricePerNight.toLocaleString('es-AR')}</span>;
}
```

### 6.5 D - Dependency Inversion Principle (DIP)
* Los dumb components dependen de funciones callback abstractas (`onSelectDate`, `onConfirmBooking`) provistas por el container, nunca de mutaciones o llamadas directas a APIs globales.

---

## 7. Higiene de Código: Eliminación de Código Muerto y Boilerplate Remanente

> *El código más rápido, seguro y fácil de mantener es el que no existe (YAGNI).*

### 7.1 Cero Scaffolding Huérfano
* Todo archivo generado automáticamente por CLI (`nest g`, plantillas base como `app.controller.ts`, `app.service.ts` con `"Hello World!"`) DEBE ser eliminado o transformado en un artefacto de negocio real antes de considerar el módulo completo.
* Si existe un módulo especializado (como `HealthModule` para `/api/v1/health`), el controlador de prueba por defecto y su test e2e asociado deben ser purgados para evitar confusión y endpoints fantasma.

### 7.2 Prohibición de Overrides Vacíos
* Queda prohibido sobrescribir métodos de clases base o guards para únicamente invocar `super.method()`.
```typescript
// ❌ MAL: Método zombi que no altera comportamiento
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context); // Redundancia innecesaria
  }
}

// ✅ BIEN: Solo implementar cuando se agrega lógica o manejo de excepciones
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o ausente');
    }
    return user;
  }
}
```

### 7.3 Dependencias Huérfanas
* Toda librería instalada en `dependencies` o `devDependencies` en `package.json` debe tener al menos una referencia real o script activo. Paquetes no utilizados ensucian el lockfile y aumentan la superficie de ataque.

---

## 8. Anti-Duplicación (DRY) y Reutilización Tipada

### 8.1 Prohibición de DTOs Clonados
* Si dos operaciones requieren la misma estructura de datos (ej. cargar una imagen en un alta vs. agregarla a una galería existente), **DEBEN compartir el mismo DTO**.
```typescript
// ❌ MAL: Dos archivos o clases con los mismos atributos
export class AccommodationImageInputDto { url: string; publicId: string; isMain?: boolean; }
export class AddAccommodationImageDto { url: string; publicId: string; isMain?: boolean; }

// ✅ BIEN: Un único DTO canónico reutilizado en ambas operaciones
export class AccommodationImageDto { ... }
```

### 8.2 Herencia y Composición en DTOs
* Cuando un DTO es una extensión de otro (ej. registro de anfitrión que solicita los mismos datos del turista más un token de invitación), debe extenderlo (`extends`) o componerlo en lugar de duplicar validaciones y decoradores de Swagger.
```typescript
// ✅ BIEN: Herencia de DTO
export class RegisterHostDto extends RegisterTouristDto {
  @ApiProperty({ description: 'Token de invitación emitido por la Comisión' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
```

### 8.3 Centralización de Lógica de Negocio Transversal
* Validaciones repetitivas (como el chequeo de rango de fechas de reserva `checkIn < checkOut` o el filtro anti-overbooking) no deben duplicarse entre controladores o servicios. Deben residir en servicios de dominio compartidos o helpers testeables.
* Las proyecciones de Prisma (`select` o `include` recurrentes) deben declararse como constantes tipadas exportables para garantizar que la sanitización de datos (ej. omitir contraseñas) sea uniforme en todo el sistema.

---

## 9. Prevención de Riesgos Técnicos Críticos en Producción

### 9.1 Prohibición de Bucles No Acotados (Anti-Infinite Loops)
* Queda terminantemente prohibido generar identificadores o códigos mediante bucles `while` que dependan de colisiones aleatorias sin un espacio de búsqueda garantizado ni un límite de reintentos (*bounded retries*).
```typescript
// ❌ MAL: Riesgo de bucle infinito bajo alta concurrencia o saturación
while (exists) {
  const code = `CAP-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
  const existing = await tx.booking.findUnique({ where: { bookingCode: code } });
  if (!existing) exists = false;
}

// ✅ BIEN: Espacio probabilístico seguro (CUID / NanoID / UUID) o reintentos acotados con excepción
const MAX_ATTEMPTS = 5;
for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
  const candidate = generateSecureCode();
  const exists = await tx.booking.findUnique({ where: { bookingCode: candidate } });
  if (!exists) return candidate;
}
throw new ServiceUnavailableException('No fue posible generar un código único en este momento');
```

### 9.2 Principio Fail-Fast en Configuración y Secretos
* Está terminantemente prohibido utilizar fallbacks silenciosos para secretos de autenticación (`JWT_SECRET || 'secret-key-default'`) en código que pueda ejecutarse en producción o staging. Si una variable de entorno crítica está ausente, el proceso debe fallar inmediatamente al arrancar (*fail-fast*).

### 9.3 Consultas Acotadas y Paginación Obligatoria
* Toda consulta a colección o catálogo público (`findMany`, listados de reservas, atractivos o usuarios) DEBE implementar límites máximos (`take`, `skip`, cursores) y ordenamiento explícito para prevenir saturación de memoria (*heap exhaustion*).

### 9.4 Resiliencia en Filtros Globales de Excepciones
* El filtro de excepciones global (`HttpExceptionFilter`) debe capturar y traducir de forma determinista errores del motor de persistencia (como violaciones de unicidad `P2002` o registros inexistentes `P2025` de Prisma) a códigos HTTP semánticos (`409 Conflict`, `404 Not Found`), evitando exponer errores 500 no controlados.

---

## 10. Estrategia Obligatoria de Testing

Para certificar la confiabilidad y prevenir regresiones, el proyecto exige tres niveles de pruebas automatizadas:

```
          / \
         /   \      Tests Dinámicos / E2E (Flujos completos, concurrencia, transacciones reales)
        /-----\
       /       \    Tests Regresivos (Garantía post-bugfix: reproducir y blindar contra reaparición)
      /---------\
     /           \  Tests Unitarios (Aislados, mocks de Prisma, casos borde, 100% servicios críticos)
    ---------------
```

### 10.1 Tests Unitarios (Unit Tests con `@nestjs/testing` + Vitest)
* **Alcance:** Probar clases, servicios y funciones de negocio de forma aislada respetando el contenedor IoC.
* **Stack Obligatorio:** Se utiliza obligatoriamente el módulo oficial `@nestjs/testing` (`Test.createTestingModule`) combinado con **Vitest**. Queda prohibido instanciar clases directamente con `new Service(...)` para asegurar que la inyección de dependencias se evalúe fielmente.
* **Obligatoriedad:** Todos los módulos que contengan lógica de negocio, validaciones o cálculos (`auth`, `bookings`, `invitations`, `accommodations`) deben tener su respectivo archivo `.spec.ts`.
* **Reglas:**
  * Aislar dependencias externas (Prisma, JWT, servicios de terceros) utilizando mocks limpios con la API de Vitest (`vi.fn()`).
  * Testear obligatoriamente el camino feliz (*happy path*) y **todos los caminos de error y casos límite** (fechas invertidas, capacidad de huéspedes excedida, tokens expirados, usuarios ya registrados).

### 10.2 Tests Regresivos (Regression Tests)
* **Alcance:** Blindar el sistema contra errores previamente descubiertos.
* **Protocolo ante Bugfix:**
  1. Ante un defecto reportado en producción o revisión, **lo primero es escribir un test automatizado que reproduzca fielmente la falla**.
  2. Implementar la corrección hasta que dicho test pase a verde.
  3. El test de regresión permanece permanentemente en la suite para asegurar que ningún refactor futuro vuelva a romper la misma funcionalidad.

### 10.3 Tests Dinámicos y de Integración (Dynamic & Integration Tests)
* **Alcance:** Evaluar el comportamiento del sistema en tiempo de ejecución interactuando con infraestructura real o simulada bajo condiciones cambiantes.
* **Obligatoriedad en Turismo-Capilla:**
  * **Integridad Transaccional:** Validar que el motor anti-overbooking (`$transaction`) rechace colisiones de reservas enviadas concurrentemente para el mismo alojamiento y fechas.
  * **Casos con Datos Dinámicos:** Pruebas que utilicen rangos de fechas dinámicos relativos a la fecha actual (`Date.now() + N días`) para verificar expiraciones de invitaciones y transiciones de estados de reserva (`PENDING` -> `CONFIRMED` -> `COMPLETED`).
  * **Verificación de Contratos de API (E2E):** Pruebas de integración vía `supertest` que validen códigos de estado HTTP, estructura de respuestas JSON y funcionamiento de Guards (`JwtAuthGuard`, `RolesGuard`).

