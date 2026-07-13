import db from '../db/db';
import paquetesBase from './paquetes';
import equipoData from './equipo';
import { excursionesBase, trasladosBase } from './extras';

export async function seedDatabase() {
  // Check if database is already seeded
  let packagesCount = await db.paquetes.count();
  const firstPkg = await db.paquetes.get(1).catch(() => null);

  // Si ya existían datos pero sin la columna de "incluye" (esquema viejo), forzar re-siembra
  if (packagesCount > 0 && (!firstPkg || !firstPkg.incluye)) {
    console.log('Esquema de paquetes viejo detectado. Limpiando y re-sembrando catálogo...');
    await db.paquetes.clear().catch(() => {});
    await db.precios.clear().catch(() => {});
    packagesCount = 0;
  }

  // Siempre sincronizar el equipo activo y la imagen de Cataratas
  await db.paquetes.update(16, {
    imagen: '/fotos/destinos/cataratas_real.png',
    imagenHero: '/fotos/destinos/cataratas_real.png'
  }).catch(() => {});
  
  await db.equipo.clear().catch(() => {});
  const equipoToInsertOnSync = equipoData.map(e => ({
    id: e.id,
    vendedor: e.vendedor,
    cargo: e.cargo,
    imagen: e.imagen,
    telefono: e.telefono,
    orden: e.orden,
    contactar: e.contactar ? 1 : 0,
    visible: e.visible ? 1 : 0
  }));
  await db.equipo.bulkAdd(equipoToInsertOnSync).catch(() => {});

  if (packagesCount > 0) {
    console.log('La base de datos ya contiene datos. Sincronización de equipo y Cataratas completa.');
    return;
  }

  console.log('Sembrando base de datos local (Dexie)...');

  // 1. Cargar configuración básica (PINs)
  await db.config.put({ clave: 'adminPin', valor: '1234' });
  await db.config.put({ clave: 'sellerPin', valor: '0000' });

  // 2. Cargar paquetes
  const packagesToInsert = paquetesBase.map(p => ({
    id: p.id,
    categoria: p.categoria,
    slug: p.slug,
    titulo: p.titulo,
    subtitulo: p.subtitulo,
    descCorta: p.descCorta,
    descripcion: p.descripcion,
    imagen: p.imagen,
    imagenHero: p.imagenHero,
    noches: p.noches,
    destacado: p.destacado ? 1 : 0,
    orden: p.orden || 99,
    activo: 1,
    incluye: p.incluye || [],
    noIncluye: p.noIncluye || []
  }));
  await db.paquetes.bulkAdd(packagesToInsert);

  // 3. Cargar precios iniciales por defecto (matriz de precios base)
  // Generaremos precios estimativos para todos los paquetes del catálogo base
  const preciosMatrix = [];
  const temporadas = ['baja', 'alta', 'semana_santa', 'finde_largo', 'vacaciones_invierno'];
  const hoteles = ['economico', 'familiar', 'premium'];

  // Definir un precio base para cada paquete para generar la matriz
  const preciosBasesPorPaquete = {
    1: 799,  // Búzios Full
    2: 70,   // Arraial do Cabo
    3: 35,   // Paseo en escuna
    4: 60,   // Buceo en Búzios
    5: 45,   // Paseo en Buggy
    6: 120,  // City tour Rio
    7: 1199, // Miami / Orlando Full
    8: 2499, // Europa Soñada
    9: 2199, // Italia con Amalfi
    10: 950, // Cancún
    11: 890, // Playa del Carmen
    12: 990, // Punta Cana
    13: 850, // Varadero
    14: 1450,// Cancún + Playa del Carmen
    15: 1650,// Combinado Habana Cayo Varadero
    16: 350, // Cataratas del Iguazú
    17: 420, // Salta + Jujuy
    18: 480, // Bariloche
    19: 690, // Ushuaia
    20: 390, // Mendoza
    21: 590, // El Calafate
  };

  paquetesBase.forEach((paquete) => {
    const base = preciosBasesPorPaquete[paquete.id] || 500;
    
    temporadas.forEach((temp) => {
      // Coeficiente por temporada
      let coefTemp = 1.0;
      if (temp === 'alta') coefTemp = 1.3;
      if (temp === 'semana_santa') coefTemp = 1.4;
      if (temp === 'finde_largo') coefTemp = 1.15;
      if (temp === 'vacaciones_invierno') coefTemp = 1.25;

      hoteles.forEach((hotel) => {
        // Coeficiente por hotel
        let coefHotel = 1.0;
        if (hotel === 'familiar') coefHotel = 1.25;
        if (hotel === 'premium') coefHotel = 1.6;

        // Si el paquete no tiene noches (ej. excursiones de un día), omitir hoteles excepto económico como base única o no generar
        if (paquete.noches === null && hotel !== 'economico') {
          return;
        }

        const precioFinal = Math.round(base * coefTemp * coefHotel);
        preciosMatrix.push({
          paqueteId: paquete.id,
          temporada: temp,
          hotel: hotel,
          precio: precioFinal
        });
      });
    });
  });

  await db.precios.bulkAdd(preciosMatrix);

  // 4. Cargar equipo
  const equipoToInsert = equipoData.map(e => ({
    id: e.id,
    vendedor: e.vendedor,
    cargo: e.cargo,
    imagen: e.imagen,
    telefono: e.telefono,
    orden: e.orden,
    contactar: e.contactar ? 1 : 0,
    visible: e.visible ? 1 : 0
  }));
  await db.equipo.bulkAdd(equipoToInsert);

  // 5. Cargar excursiones base
  // Damos valores en USD reales para el cotizador
  const excursionesToInsert = excursionesBase.map(e => {
    let precio = 30;
    if (e.id === 1) precio = 60; // Arraial
    if (e.id === 2) precio = 30; // Escuna
    if (e.id === 3) precio = 75; // Buceo
    if (e.id === 4) precio = 40; // Buggy
    if (e.id === 5) precio = 95; // Rio
    if (e.id === 6) precio = 150; // Pan de Azúcar
    if (e.id === 7) precio = 66; // Maracaná
    return {
      nombre: e.nombre,
      precio: precio,
      descripcion: e.descripcion,
      porPersona: e.porPersona ? 1 : 0,
      activo: 1
    };
  });
  await db.excursiones.bulkAdd(excursionesToInsert);

  // 6. Cargar traslados base
  const trasladosToInsert = trasladosBase.map(t => {
    let precio = 40;
    if (t.id === 1 || t.id === 2) precio = 45; // Río Búzios Regular
    if (t.id === 3 || t.id === 4) precio = 180; // Río Búzios Privado
    if (t.id === 5 || t.id === 6) precio = 30; // Aeropuerto IN/OUT
    return {
      nombre: t.nombre,
      precio: precio,
      tipo: t.tipo,
      activo: 1
    };
  });
  await db.traslados.bulkAdd(trasladosToInsert);

  console.log('Sembrado finalizado exitosamente.');
}
