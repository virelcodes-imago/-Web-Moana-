// Excursiones y traslados — datos iniciales para precargar en panel Admin
export const excursionesBase = [
  { id: 1, nombre: 'Arraial do Cabo Full Day', precio: 0, descripcion: 'Paseo en barco + almuerzo', porPersona: true, activo: true },
  { id: 2, nombre: 'Paseo en Escuna Búzios', precio: 0, descripcion: '2:30hs recorrido playas norte', porPersona: true, activo: true },
  { id: 3, nombre: 'Buceo con Instructor', precio: 0, descripcion: 'Clase + inmersión + fotos', porPersona: true, activo: true },
  { id: 4, nombre: 'Paseo en Buggy', precio: 0, descripcion: '8 playas y miradores', porPersona: true, activo: true },
  { id: 5, nombre: 'City Tour Río de Janeiro', precio: 0, descripcion: 'Cristo Redentor + almuerzo', porPersona: true, activo: true },
  { id: 6, nombre: 'Pan de Azúcar', precio: 0, descripcion: 'Opcional en City Tour Río', porPersona: true, activo: true },
  { id: 7, nombre: 'Maracaná (entrada)', precio: 0, descripcion: 'Opcional en City Tour Río', porPersona: true, activo: true },
];

export const trasladosBase = [
  { id: 1, nombre: 'Traslado Río → Búzios (Regular)', precio: 0, tipo: 'regular', activo: true },
  { id: 2, nombre: 'Traslado Búzios → Río (Regular)', precio: 0, tipo: 'regular', activo: true },
  { id: 3, nombre: 'Traslado Río → Búzios (Privado)', precio: 0, tipo: 'privado', activo: true },
  { id: 4, nombre: 'Traslado Búzios → Río (Privado)', precio: 0, tipo: 'privado', activo: true },
  { id: 5, nombre: 'Traslado Aeropuerto IN', precio: 0, tipo: 'regular', activo: true },
  { id: 6, nombre: 'Traslado Aeropuerto OUT', precio: 0, tipo: 'regular', activo: true },
];

export default { excursionesBase, trasladosBase };
