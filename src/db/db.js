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
});

export default db;
