import Dexie from 'dexie';

export const db = new Dexie('MoanaTurismoDB');

db.version(1).stores({
  // Catálogo de paquetes con precios pre-cargados por admin
  paquetes: '++id, categoria, slug, activo, destacado',
  
  // Matriz de precios por paquete/temporada/hotel
  precios: '++id, paqueteId, temporada, hotel',
  
  // Excursiones con precios
  excursiones: '++id, categoria, activo',
  
  // Traslados con precios
  traslados: '++id, tipo, activo',
  
  // Equipo de ventas
  equipo: '++id, visible, orden',
  
  // Cotizaciones guardadas (historial)
  cotizaciones: '++id, fecha, asesorId, destino',

  // Configuración de la app (PIN admin, PIN vendedor, etc.)
  config: 'clave',

  // Tarifario exclusivo Posada Moana por temporada y habitacion
  posadaPrecios: '++id, temporada, habitacion',
});

// Versión 2: agrega campo destino a excursiones y traslados para filtrado por destino en cotizador
db.version(2).stores({
  paquetes: '++id, categoria, slug, activo, destacado',
  precios: '++id, paqueteId, temporada, hotel',
  excursiones: '++id, categoria, activo, destino',
  traslados: '++id, tipo, activo, destino',
  equipo: '++id, visible, orden',
  cotizaciones: '++id, fecha, asesorId, destino',
  config: 'clave',
  posadaPrecios: '++id, temporada, habitacion',
});

export default db;

// ---------------------------------------------------------------------------
// HELPERS para persistir el estado admin en localStorage como backup
// Esto garantiza que los cambios de visibilidad/destacados del admin 
// sobrevivan a limpiezas del navegador y nuevos deploys
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'moana-admin-overrides';

export function loadAdminOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAdminOverride(paqueteId, changes) {
  try {
    const current = loadAdminOverrides();
    current[paqueteId] = { ...(current[paqueteId] || {}), ...changes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function getAdminOverridesForPaquete(paqueteId) {
  const all = loadAdminOverrides();
  return all[paqueteId] || null;
}

export function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function getExcursionImage(nombre = '', destino = '') {
  const n = (nombre || '').toLowerCase();
  const d = (destino || '').toLowerCase();
  if (n.includes('arraial')) return '/fotos/excursiones/arraial.jpg';
  if (n.includes('escuna') || n.includes('barco')) return '/fotos/excursiones/escuna.jpg';
  if (n.includes('buceo')) return '/fotos/excursiones/3-excursion-buceo.jpg';
  if (n.includes('buggy')) return '/fotos/excursiones/4-excursion-buggy.jpg';
  if (n.includes('río') || n.includes('rio') || n.includes('cristo') || n.includes('corcovado')) return '/fotos/excursiones/5-excursion-rio.jpg';
  if (d === 'cancun' || n.includes('xcaret') || n.includes('xel-há') || n.includes('chichén') || n.includes('tulum') || n.includes('mujeres')) return '/fotos/excursiones/33-excursion-cancun.jpg';
  if (d === 'cataratas') return '/fotos/destinos/cataratas_real.png';
  if (d === 'ushuaia') return '/fotos/destinos/ushuaia.jpg';
  if (d === 'calafate') return '/fotos/destinos/calafate.jpg';
  if (d === 'peru') return '/fotos/destinos/peru.jpg';
  if (d === 'jamaica') return '/fotos/destinos/jamaica.jpg';
  if (d === 'salta') return '/fotos/destinos/salta.jpg';
  if (d === 'bariloche') return '/fotos/destinos/bariloche.jpg';
  if (d === 'mendoza') return '/fotos/destinos/mendoza.jpg';
  return '/fotos/excursiones/37-excursion-moana-buzios-full.jpg';
}

export async function syncExcursionToPackage(exc) {
  if (!exc || !exc.nombre) return;
  const isActivo = exc.activo === 1 || exc.activo === true;
  const excSlug = `excursion-${slugify(exc.nombre)}`;

  // Buscar si ya existe un paquete con este slug o nombre
  const allPkgs = await db.paquetes.toArray().catch(() => []);
  let found = allPkgs.find(p => p.slug === excSlug || (p.titulo && p.titulo.toLowerCase().trim() === exc.nombre.toLowerCase().trim()));

  // También asociar con los IDs clásicos (50: Arraial, 51: Escuna, 52: Buceo)
  if (!found && exc.nombre.toLowerCase().includes('arraial')) found = allPkgs.find(p => p.id === 50 || p.id === 2);
  if (!found && exc.nombre.toLowerCase().includes('escuna')) found = allPkgs.find(p => p.id === 51 || p.id === 3);
  if (!found && exc.nombre.toLowerCase().includes('buceo')) found = allPkgs.find(p => p.id === 52 || p.id === 4);

  if (found) {
    const updateData = {
      activo: isActivo ? 1 : 0,
      titulo: exc.nombre,
      descCorta: exc.descripcion || found.descCorta,
      categoria: 'traslados_excursiones',
    };
    await db.paquetes.update(found.id, updateData).catch(() => {});
    saveAdminOverride(found.id, { activo: isActivo });
    if (exc.id) {
      await db.excursiones.update(exc.id, { paqueteId: found.id, activo: isActivo ? 1 : 0 }).catch(() => {});
    }
  } else if (isActivo) {
    // Si está activa y no existe como paquete en el catálogo, crearla para que aparezca en la web
    const newId = 100 + (exc.id || Math.floor(Math.random() * 800));
    const img = getExcursionImage(exc.nombre, exc.destino);
    const newPkg = {
      id: newId,
      slug: excSlug,
      categoria: 'traslados_excursiones',
      titulo: exc.nombre,
      subtitulo: exc.descripcion || 'Excursión oficial Moana Turismo',
      descCorta: exc.descripcion || 'Excursión imperdible.',
      descripcion: exc.descripcion || 'Disfrutá de esta increíble experiencia con Moana Turismo. Asesoramiento personalizado y guías profesionales.',
      imagen: img,
      imagenHero: img,
      noches: null,
      destacado: 0,
      orden: 20 + (exc.id || 1),
      activo: 1,
      incluye: [exc.descripcion || 'Excursión guiada', 'Seguro y asesoramiento Moana'],
      noIncluye: ['Gastos personales extra'],
    };
    await db.paquetes.put(newPkg).catch(() => {});
    saveAdminOverride(newId, { activo: true });
    if (exc.id) {
      await db.excursiones.update(exc.id, { paqueteId: newId, activo: 1 }).catch(() => {});
    }
  }
}
