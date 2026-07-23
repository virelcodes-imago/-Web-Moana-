import db from '../db/db';
import paquetesBase, { isExcursionOrTransfer } from './paquetes';
import equipoData from './equipo';
import { excursionesBase, trasladosBase } from './extras';

export async function seedDatabase() {
  const packagesCount = await db.paquetes.count().catch(() => 0);

  // 1. Cargar configuración básica (PINs)
  await db.config.put({ clave: 'adminPin', valor: '1234' }).catch(() => {});
  await db.config.put({ clave: 'sellerPin', valor: '0000' }).catch(() => {});

  // 2. Si la base de datos es totalmente nueva (0 paquetes), sembrar catálogo e inicializar precios
  if (packagesCount === 0) {
    console.log('Sembrando catálogo de paquetes inicial...');
    for (const p of paquetesBase) {
      await db.paquetes.put({
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
        activo: p.activo !== false ? 1 : 0,
        incluye: p.incluye || [],
        noIncluye: p.noIncluye || []
      });
    }

    // Cargar matriz de precios oficial inicial para Búzios Clásico (1), Premium (31), y Hospedaje (30)
    const buziosOfficialPrices = [
      // Búzios Clásico (1)
      { paqueteId: 1, temporada: 'baja', hotel: 'economico', precio: 825 },
      { paqueteId: 1, temporada: 'baja', hotel: 'familiar', precio: 825 },
      { paqueteId: 1, temporada: 'baja', hotel: 'premium', precio: 825 },

      { paqueteId: 1, temporada: 'semana_santa', hotel: 'economico', precio: 925 },
      { paqueteId: 1, temporada: 'semana_santa', hotel: 'familiar', precio: 925 },
      { paqueteId: 1, temporada: 'semana_santa', hotel: 'premium', precio: 925 },

      { paqueteId: 1, temporada: 'alta', hotel: 'economico', precio: 995 },
      { paqueteId: 1, temporada: 'alta', hotel: 'familiar', precio: 995 },
      { paqueteId: 1, temporada: 'alta', hotel: 'premium', precio: 995 },

      { paqueteId: 1, temporada: 'vacaciones_invierno', hotel: 'economico', precio: 995 },
      { paqueteId: 1, temporada: 'vacaciones_invierno', hotel: 'familiar', precio: 995 },
      { paqueteId: 1, temporada: 'vacaciones_invierno', hotel: 'premium', precio: 995 },

      // Búzios Premium (31)
      { paqueteId: 31, temporada: 'baja', hotel: 'economico', precio: 975 },
      { paqueteId: 31, temporada: 'baja', hotel: 'familiar', precio: 975 },
      { paqueteId: 31, temporada: 'baja', hotel: 'premium', precio: 975 },

      { paqueteId: 31, temporada: 'semana_santa', hotel: 'economico', precio: 1095 },
      { paqueteId: 31, temporada: 'semana_santa', hotel: 'familiar', precio: 1095 },
      { paqueteId: 31, temporada: 'semana_santa', hotel: 'premium', precio: 1095 },

      { paqueteId: 31, temporada: 'alta', hotel: 'economico', precio: 1250 },
      { paqueteId: 31, temporada: 'alta', hotel: 'familiar', precio: 1250 },
      { paqueteId: 31, temporada: 'alta', hotel: 'premium', precio: 1250 },

      { paqueteId: 31, temporada: 'vacaciones_invierno', hotel: 'economico', precio: 1250 },
      { paqueteId: 31, temporada: 'vacaciones_invierno', hotel: 'familiar', precio: 1250 },
      { paqueteId: 31, temporada: 'vacaciones_invierno', hotel: 'premium', precio: 1250 },

      // Búzios Hospedaje (30)
      { paqueteId: 30, temporada: 'baja', hotel: 'economico', precio: 395 },
      { paqueteId: 30, temporada: 'baja', hotel: 'familiar', precio: 395 },
      { paqueteId: 30, temporada: 'baja', hotel: 'premium', precio: 395 },

      { paqueteId: 30, temporada: 'semana_santa', hotel: 'economico', precio: 475 },
      { paqueteId: 30, temporada: 'semana_santa', hotel: 'familiar', precio: 475 },
      { paqueteId: 30, temporada: 'semana_santa', hotel: 'premium', precio: 475 },
    ];
    await db.precios.bulkAdd(buziosOfficialPrices).catch(() => {});

    // Precios iniciales generalizados para el resto
    const preciosMatrix = [];
    const temporadas = ['baja', 'alta', 'semana_santa', 'vacaciones_invierno'];
    const hoteles = ['economico', 'familiar', 'premium'];
    const preciosBasesPorPaquete = {
      2: 950,   // Rio de Janeiro
      3: 1100,  // Salvador de Bahia
      4: 1200,  // Florianópolis
      5: 1300,  // Natal & Pipa
      6: 1400,  // Porto de Galinhas
      7: 1199,  // Miami / Orlando Full
      8: 2499,  // Europa Soñada
      9: 2199,  // Italia con Amalfi
      10: 950,  // Cancún
      11: 890,  // Playa del Carmen
      12: 990,  // Punta Cana
      13: 850,  // Varadero
      14: 1450, // Cancún + Playa del Carmen + México
      15: 1650, // Combinado Habana Cayo Varadero
      16: 350,  // Cataratas del Iguazú
      17: 420,  // Salta + Jujuy
      18: 480,  // Bariloche
      19: 690,  // Ushuaia
      20: 390,  // Mendoza
      21: 590,  // El Calafate
      22: 1050, // Bayahíbe All Inclusive
    };

    paquetesBase.forEach((paquete) => {
      if (paquete.id === 1 || paquete.id === 31 || paquete.id === 30) return;
      const base = preciosBasesPorPaquete[paquete.id] || 500;
      temporadas.forEach((temp) => {
        hoteles.forEach((hotel) => {
          preciosMatrix.push({
            paqueteId: paquete.id,
            temporada: temp,
            hotel: hotel,
            precio: base
          });
        });
      });
    });
    await db.precios.bulkAdd(preciosMatrix).catch(() => {});
  } else {
    // Si la DB ya existe, RESPETAR la persistencia total del usuario
    // Solo agregar paquetes nuevos si no están en IndexedDB
    for (const p of paquetesBase) {
      const existing = await db.paquetes.get(p.id).catch(() => null);
      if (!existing) {
        await db.paquetes.put({
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
          activo: p.activo !== false ? 1 : 0,
          incluye: p.incluye || [],
          noIncluye: p.noIncluye || []
        });
      }
    }
  }

  // 3. Cargar Equipo solo si la tabla está vacía
  // Limpiar valores destacados antiguos en excursiones y traslados. Esos
  // servicios conservan su publicación normal, pero no aparecen en el bloque
  // de paquetes destacados de la portada.
  await db.paquetes
    .filter((p) => isExcursionOrTransfer(p) && (p.destacado === 1 || p.destacado === true))
    .modify({ destacado: 0 })
    .catch(() => {});

  const equipoCount = await db.equipo.count().catch(() => 0);
  if (equipoCount === 0) {
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
    await db.equipo.bulkAdd(equipoToInsert).catch(() => {});
  }

  // 4. Cargar Excursiones solo si está vacía
  const excCount = await db.excursiones.count().catch(() => 0);
  if (excCount === 0) {
    const excursionesToInsert = excursionesBase.map(e => ({
      nombre: e.nombre,
      precio: e.precio || 30,
      descripcion: e.descripcion,
      porPersona: e.porPersona ? 1 : 0,
      activo: 1
    }));
    await db.excursiones.bulkAdd(excursionesToInsert).catch(() => {});
  }

  // 5. Cargar Traslados solo si está vacía
  const trasCount = await db.traslados.count().catch(() => 0);
  if (trasCount === 0) {
    const trasladosToInsert = trasladosBase.map(t => ({
      nombre: t.nombre,
      precio: t.precio || 40,
      tipo: t.tipo,
      activo: 1
    }));
    await db.traslados.bulkAdd(trasladosToInsert).catch(() => {});
  }

  // 6. Cargar Posada Precios solo si está vacía
  const posadaCount = await db.posadaPrecios.count().catch(() => 0);
  if (posadaCount === 0) {
    const posadaMatrix = [];
    const temporadas = ['baja', 'alta', 'semana_santa', 'vacaciones_invierno'];
    const habitaciones = ['single', 'doble', 'triple', 'cuadruple'];
    const preciosBaseHab = {
      baja:               { single: 45, doble: 60, triple: 80, cuadruple: 100 },
      alta:               { single: 65, doble: 90, triple: 120, cuadruple: 150 },
      semana_santa:       { single: 75, doble: 100, triple: 135, cuadruple: 170 },
      vacaciones_invierno:{ single: 60, doble: 85, triple: 110, cuadruple: 140 },
    };

    temporadas.forEach((temp) => {
      habitaciones.forEach((hab) => {
        posadaMatrix.push({
          temporada: temp,
          habitacion: hab,
          precio: preciosBaseHab[temp]?.[hab] || 60
        });
      });
    });
    await db.posadaPrecios.bulkAdd(posadaMatrix).catch(() => {});
  }

  console.log('Base de datos sincronizada preservando ediciones de usuario.');
}
