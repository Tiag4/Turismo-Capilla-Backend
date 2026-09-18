import {
  PrismaClient,
  Role,
  AttractionCategory,
  AccommodationType,
  BookingStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // Ignore if .env is missing (e.g. env vars provided by Render or container)
  }
}

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando semillero integral de datos (seed) ---');

  // 1. Usuarios del Sistema
  const defaultPassword = await bcrypt.hash('Capilla2026!', 10);
  const adminPassword = await bcrypt.hash('AdminCapilla2026!', 10);

  // Admin
  const adminEmail = 'admin@capilladelmonte.gov.ar';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminPassword,
        name: 'Comisión de Turismo',
        lastName: 'Capilla del Monte',
        phone: '+543548481903',
        role: Role.ADMIN,
      },
    });
    console.log(`✓ Admin creado: ${admin.email}`);
  } else {
    console.log(`ℹ Admin existente: ${admin.email}`);
  }

  // Cabañero 1 (Host)
  const host1Email = 'cabanero.uritorco@capilla.com';
  let host1 = await prisma.user.findUnique({ where: { email: host1Email } });
  if (!host1) {
    host1 = await prisma.user.create({
      data: {
        email: host1Email,
        password: defaultPassword,
        name: 'Esteban',
        lastName: 'Gómez',
        phone: '+543548550101',
        role: Role.HOST,
      },
    });
    console.log(`✓ Host 1 creado: ${host1.email}`);
  } else {
    console.log(`ℹ Host 1 existente: ${host1.email}`);
  }

  // Cabañero 2 (Host)
  const host2Email = 'hostel.zen@capilla.com';
  let host2 = await prisma.user.findUnique({ where: { email: host2Email } });
  if (!host2) {
    host2 = await prisma.user.create({
      data: {
        email: host2Email,
        password: defaultPassword,
        name: 'Mariana',
        lastName: 'Soler',
        phone: '+543548550202',
        role: Role.HOST,
      },
    });
    console.log(`✓ Host 2 creado: ${host2.email}`);
  } else {
    console.log(`ℹ Host 2 existente: ${host2.email}`);
  }

  // Turista Registrado (Tourist)
  const touristEmail = 'turista.valle@gmail.com';
  let tourist = await prisma.user.findUnique({ where: { email: touristEmail } });
  if (!tourist) {
    tourist = await prisma.user.create({
      data: {
        email: touristEmail,
        password: defaultPassword,
        name: 'Lucía',
        lastName: 'Fernández',
        phone: '+543516112233',
        role: Role.TOURIST,
      },
    });
    console.log(`✓ Turista creado: ${tourist.email}`);
  } else {
    console.log(`ℹ Turista existente: ${tourist.email}`);
  }

  // 2. Tokens de Invitación (para Casos de Prueba de Registro de Prestador)
  const validToken = 'INV-HOST-2026-VAL';
  const existingValidToken = await prisma.invitationToken.findUnique({ where: { token: validToken } });
  if (!existingValidToken) {
    await prisma.invitationToken.create({
      data: {
        token: validToken,
        email: 'nuevo.prestador@capilla.com',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días en el futuro
        createdById: admin.id,
      },
    });
    console.log(`✓ Token válido creado: ${validToken} (Email: nuevo.prestador@capilla.com)`);
  }

  const expiredToken = 'INV-HOST-2026-EXP';
  const existingExpiredToken = await prisma.invitationToken.findUnique({ where: { token: expiredToken } });
  if (!existingExpiredToken) {
    await prisma.invitationToken.create({
      data: {
        token: expiredToken,
        email: 'expirado@capilla.com',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Venció ayer
        createdById: admin.id,
      },
    });
    console.log(`✓ Token expirado creado: ${expiredToken}`);
  }

  // 3. Atractivos Turísticos con Imágenes
  const attractionsData = [
    {
      name: 'Cerro Uritorco',
      description: 'El pico más alto de las Sierras Chicas con 1979 msnm. Emblemático atractivo natural reconocido por su mística, senderismo de montaña y vistas panorámicas del Valle de Punilla.',
      category: AttractionCategory.HILL,
      difficulty: 'ALTA',
      estimatedDuration: '6 a 8 horas',
      howToGet: 'Acceso por la base del Cerro Uritorco, a 3 km del centro de la ciudad.',
      requiresGuide: false,
      admissionFee: 15000.0,
      latitude: -30.8492,
      longitude: -64.4789,
      images: [
        { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', publicId: 'uritorco_1' },
      ],
    },
    {
      name: 'Parque Autóctono Los Terrones',
      description: 'Reserva natural y geológica con formaciones de arenisca rojiza esculpidas por el viento y el agua a lo largo de millones de años.',
      category: AttractionCategory.NATURE_TRAIL,
      difficulty: 'MEDIA',
      estimatedDuration: '3 a 4 horas',
      howToGet: 'Por Ruta Nacional 38, a 14 km al norte de Capilla del Monte.',
      requiresGuide: true,
      admissionFee: 10000.0,
      latitude: -30.7938,
      longitude: -64.5021,
      images: [
        { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', publicId: 'terrones_1' },
      ],
    },
    {
      name: 'El Zapato',
      description: 'Escultura natural de roca erosionada con la forma exacta de un calzado, ubicada en un mirador panorámico con vista al Dique El Cajón.',
      category: AttractionCategory.CULTURAL,
      difficulty: 'BAJA',
      estimatedDuration: '1 hora',
      howToGet: 'A 1 km hacia el oeste de la plaza principal San Martín.',
      requiresGuide: false,
      admissionFee: 2000.0,
      latitude: -30.8601,
      longitude: -64.5367,
      images: [
        { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', publicId: 'zapato_1' },
      ],
    },
    {
      name: 'Balneario La Toma',
      description: 'Paseo ribereño sobre el Río Calabalumba con ollas de agua cristalina, playas de arena y bosque autóctono al pie del cerro.',
      category: AttractionCategory.RIVER_BEACH,
      difficulty: 'BAJA',
      estimatedDuration: '2 a 3 horas',
      howToGet: 'Al este de la ciudad, siguiendo el curso del Río Calabalumba.',
      requiresGuide: false,
      admissionFee: 3000.0,
      latitude: -30.8524,
      longitude: -64.5085,
      images: [
        { url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80', publicId: 'latoma_1' },
      ],
    },
  ];

  for (const item of attractionsData) {
    const { images, ...attrFields } = item;
    const existing = await prisma.attraction.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.attraction.create({
        data: {
          ...attrFields,
          images: {
            create: images.map((img) => ({
              url: img.url,
              publicId: img.publicId,
            })),
          },
        },
      });
      console.log(`✓ Atractivo creado: ${item.name}`);
    } else {
      console.log(`ℹ Atractivo existente: ${item.name}`);
    }
  }

  // 4. Alojamientos con Imágenes Reales y Amenities Normalizados
  const accommodationsData = [
    {
      name: 'Cabañas Cerro Azul',
      description: 'Hermoso complejo de cabañas de troncos y piedra con vista directa al Cerro Uritorco. Parque arbolado, piscina y asadores individuales.',
      type: AccommodationType.CABIN,
      address: 'Las Gemelas 450',
      locality: 'Capilla del Monte',
      latitude: -30.857,
      longitude: -64.515,
      pricePerNight: 85000.0,
      maxGuests: 4,
      amenities: ['wifi', 'pileta', 'asador', 'estacionamiento', 'pet'],
      isActive: true,
      hostId: host1.id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
          publicId: 'cabin_cerro_azul_1',
          isMain: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
          publicId: 'cabin_cerro_azul_2',
          isMain: false,
        },
      ],
    },
    {
      name: 'Hostería & Spa Mística Serrana',
      description: 'Hostería boutique céntrica con circuito de spa, piscina climatizada y desayuno artesanal serrano incluido en la estadía.',
      type: AccommodationType.HOTEL,
      address: 'Av. Pueyrredón 120',
      locality: 'Capilla del Monte',
      latitude: -30.862,
      longitude: -64.523,
      pricePerNight: 120000.0,
      maxGuests: 2,
      amenities: ['wifi', 'pileta', 'estacionamiento'],
      isActive: true,
      hostId: host2.id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          publicId: 'hotel_mistica_1',
          isMain: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          publicId: 'hotel_mistica_2',
          isMain: false,
        },
      ],
    },
    {
      name: 'Departamento Los Algarrobos',
      description: 'Departamento moderno y luminoso de 2 ambientes totalmente equipado a 3 cuadras de la plaza principal y techado comercial.',
      type: AccommodationType.APARTMENT,
      address: 'Hipólito Yrigoyen 312',
      locality: 'Capilla del Monte',
      latitude: -30.859,
      longitude: -64.527,
      pricePerNight: 60000.0,
      maxGuests: 3,
      amenities: ['wifi', 'estacionamiento', 'asador'],
      isActive: true,
      hostId: host1.id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          publicId: 'dept_algarrobos_1',
          isMain: true,
        },
      ],
    },
    {
      name: 'Refugio Albergue Uritorco',
      description: 'Hostería y albergue juvenil ideal para senderistas, grupos de amigos y amantes de la naturaleza. Cocina compartida y ambiente comunitario.',
      type: AccommodationType.HOSTEL,
      address: 'Camino al Cerro s/n',
      locality: 'Capilla del Monte',
      latitude: -30.851,
      longitude: -64.498,
      pricePerNight: 35000.0,
      maxGuests: 6,
      amenities: ['wifi', 'asador'],
      isActive: true,
      hostId: host2.id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
          publicId: 'hostel_uritorco_1',
          isMain: true,
        },
      ],
    },
  ];

  const createdAccommodations: Record<string, string> = {};

  for (const item of accommodationsData) {
    const { images, ...fields } = item;
    let acc = await prisma.accommodation.findFirst({ where: { name: item.name } });
    if (!acc) {
      acc = await prisma.accommodation.create({
        data: {
          ...fields,
          images: {
            create: images.map((img) => ({
              url: img.url,
              publicId: img.publicId,
              isMain: img.isMain,
            })),
          },
        },
      });
      console.log(`✓ Alojamiento creado: ${item.name} ($${item.pricePerNight}/noche)`);
    } else {
      console.log(`ℹ Alojamiento existente: ${item.name}`);
    }
    createdAccommodations[item.name] = acc.id;
  }

  // 5. Reservas Testigo (Críticas para Casos de Prueba de Colisión, Overbooking y Lookup)
  const cerroAzulId = createdAccommodations['Cabañas Cerro Azul'];
  if (cerroAzulId) {
    const bookingCode1 = 'CAP-2026-0001';
    const existingBooking1 = await prisma.booking.findUnique({ where: { bookingCode: bookingCode1 } });
    if (!existingBooking1) {
      await prisma.booking.create({
        data: {
          bookingCode: bookingCode1,
          checkIn: new Date('2026-10-10T00:00:00.000Z'),
          checkOut: new Date('2026-10-15T00:00:00.000Z'),
          totalNights: 5,
          guestCount: 2,
          pricePerNight: 85000.0,
          totalAmount: 425000.0,
          status: BookingStatus.CONFIRMED,
          guestName: 'Martín Valenzuela',
          guestEmail: 'mvalenzuela@test.com',
          guestPhone: '+5493512345678',
          guestOrigin: 'Córdoba Capital',
          notes: 'Reserva testigo: Confirmada para pruebas de colisión y lookup',
          accommodationId: cerroAzulId,
          touristId: tourist.id,
        },
      });
      console.log(`✓ Reserva testigo 1 creada: ${bookingCode1} (10/10/2026 al 15/10/2026 - CONFIRMED)`);
    } else {
      console.log(`ℹ Reserva testigo 1 existente: ${bookingCode1}`);
    }
  }

  const misticaId = createdAccommodations['Hostería & Spa Mística Serrana'];
  if (misticaId) {
    const bookingCode2 = 'CAP-2026-0002';
    const existingBooking2 = await prisma.booking.findUnique({ where: { bookingCode: bookingCode2 } });
    if (!existingBooking2) {
      await prisma.booking.create({
        data: {
          bookingCode: bookingCode2,
          checkIn: new Date('2026-11-01T00:00:00.000Z'),
          checkOut: new Date('2026-11-05T00:00:00.000Z'),
          totalNights: 4,
          guestCount: 2,
          pricePerNight: 120000.0,
          totalAmount: 480000.0,
          status: BookingStatus.PENDING,
          guestName: 'Carla Rossi',
          guestEmail: 'carla.rossi@test.com',
          guestPhone: '+5491143219876',
          guestOrigin: 'Buenos Aires',
          notes: 'Reserva testigo pendiente',
          accommodationId: misticaId,
        },
      });
      console.log(`✓ Reserva testigo 2 creada: ${bookingCode2} (01/11/2026 al 05/11/2026 - PENDING)`);
    } else {
      console.log(`ℹ Reserva testigo 2 existente: ${bookingCode2}`);
    }
  }

  console.log('--- Semillero de datos finalizado con éxito ---');
}

main()
  .catch((e) => {
    console.error('Error durante el semillero:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
