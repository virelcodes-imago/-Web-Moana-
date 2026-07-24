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
