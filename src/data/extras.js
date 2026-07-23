// Excursiones y traslados — datos iniciales para precargar en panel Admin
export const excursionesBase = [
  { id: 1, paqueteId: 2, nombre: 'Arraial do Cabo Full Day', precio: 0, descripcion: 'Paseo en barco 4hs + almuerzo', porPersona: true, activo: true },
  { id: 2, paqueteId: 3, nombre: 'Paseo en Escuna Búzios', precio: 0, descripcion: '2:30hs recorrido playas norte', porPersona: true, activo: true },
  { id: 3, paqueteId: 4, nombre: 'Buceo con Instructor', precio: 0, descripcion: 'Clase + inmersión + fotos', porPersona: true, activo: true },
  { id: 4, paqueteId: 5, nombre: 'Paseo en Buggy', precio: 0, descripcion: '8 playas y miradores', porPersona: true, activo: true },
  { id: 5, paqueteId: 6, nombre: 'City Tour Río de Janeiro', precio: 0, descripcion: 'Cristo Redentor + almuerzo', porPersona: true, activo: true },
];

export const trasladosBase = [
  { id: 1, paqueteId: 40, nombre: 'Traslado Río de Janeiro ↔ Búzios', precio: 0, tipo: 'privado', activo: true },
  { id: 2, paqueteId: 41, nombre: 'Traslado Aeropuerto Mar del Plata', precio: 0, tipo: 'privado', activo: true },
];

export default { excursionesBase, trasladosBase };
