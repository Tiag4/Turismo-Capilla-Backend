import { PrismaClient, Role, AttractionCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando semillero de datos (seed)...');

  // 1. Crear Administrador General de la Comisión de Turismo
  const adminEmail = 'admin@capilladelmonte.gov.ar';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('AdminCapilla2026!', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Comisión de Turismo',
        lastName: 'Capilla del Monte',
        phone: '+543548481903',
        role: Role.ADMIN,
      },
    });
    console.log(`✓ Administrador creado: ${admin.email} (Password: AdminCapilla2026!)`);
  } else {
    console.log(`ℹ Administrador ya existente: ${adminEmail}`);
  }

  // 2. Sembrar Atractivos y Paseos Turísticos Iniciales
  const attractions = [
    {
      name: 'Cerro Uritorco',
      description: 'El pico más alto de las Sierras Chicas con 1979 msnm. Emblemático atractivo natural reconocido por su mística, senderismo de montaña y vistas panorámicas del Valle de Punilla.',
      category: AttractionCategory.HILL,
      difficulty: 'ALTA',
      estimatedDuration: '6 a 8 horas',
      howToGet: 'Acceso por la base del Cerro Uritorco, a 3 km del centro de la ciudad.',
      requiresGuide: false,
      admissionFee: 15000.00,
      latitude: -30.8492,
      longitude: -64.4789,
    },
    {
      name: 'Parque Autóctono Los Terrones',
      description: 'Reserva natural y geológica con formaciones de arenisca rojiza esculpidas por el viento y el agua a lo largo de millones de años.',
      category: AttractionCategory.NATURE_TRAIL,
      difficulty: 'MEDIA',
      estimatedDuration: '3 a 4 horas',
      howToGet: 'Por Ruta Nacional 38, a 14 km al norte de Capilla del Monte.',
      requiresGuide: true,
      admissionFee: 10000.00,
      latitude: -30.7938,
      longitude: -64.5021,
    },
    {
      name: 'El Zapato',
      description: 'Escultura natural de roca erosionada con la forma exacta de un calzado, ubicada en un mirador panorámico con vista al Dique El Cajón.',
      category: AttractionCategory.CULTURAL,
      difficulty: 'BAJA',
      estimatedDuration: '1 hora',
      howToGet: 'A 1 km hacia el oeste de la plaza principal San Martín.',
      requiresGuide: false,
      admissionFee: 2000.00,
      latitude: -30.8601,
      longitude: -64.5367,
    },
    {
      name: 'Balneario La Toma',
      description: 'Paseo ribereño sobre el Río Calabalumba con ollas de agua cristalina, playas de arena y bosque autóctono al pie del cerro.',
      category: AttractionCategory.RIVER_BEACH,
      difficulty: 'BAJA',
      estimatedDuration: '2 a 3 horas',
      howToGet: 'Al este de la ciudad, siguiendo el curso del Río Calabalumba.',
      requiresGuide: false,
      admissionFee: 3000.00,
      latitude: -30.8524,
      longitude: -64.5085,
    },
  ];

  for (const attr of attractions) {
    const existingAttr = await prisma.attraction.findFirst({
      where: { name: attr.name },
    });

    if (!existingAttr) {
      await prisma.attraction.create({ data: attr });
      console.log(`✓ Paseo creado: ${attr.name}`);
    }
  }

  console.log('Semillero de datos finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error durante el semillero:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
