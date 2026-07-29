// Excursiones y traslados — datos iniciales para precargar en panel Admin
// Cada ítem tiene 'destino' para que el cotizador pueda filtrar por paquete seleccionado

export const excursionesBase = [
  // === BÚZIOS ===
  { id: 1, nombre: 'Arraial do Cabo Full Day', precio: 55, descripcion: 'Paseo en barco 4hs + almuerzo incluido', porPersona: true, activo: true, destino: 'buzios' },
  { id: 2, nombre: 'Paseo en Escuna Búzios', precio: 35, descripcion: '2:30hs recorrido por las playas del norte', porPersona: true, activo: true, destino: 'buzios' },
  { id: 3, nombre: 'Buggy en Búzios', precio: 40, descripcion: 'Recorrido en buggy por las 23 playas de Búzios', porPersona: true, activo: true, destino: 'buzios' },

  // === RÍO DE JANEIRO ===
  { id: 4, nombre: 'City Tour Río de Janeiro', precio: 45, descripcion: 'Cristo Redentor + Pan de Azúcar + almuerzo', porPersona: true, activo: true, destino: 'buzios' },
  { id: 5, nombre: 'Corcovado & Cristo Redentor', precio: 35, descripcion: 'Subida en tren al Cristo Redentor, vistas panorámicas', porPersona: true, activo: true, destino: 'buzios' },

  // === CANCÚN / PLAYA DEL CARMEN ===
  { id: 6, nombre: 'Xcaret Park', precio: 120, descripcion: 'Parque eco-arqueológico todo el día con espectáculo nocturno', porPersona: true, activo: true, destino: 'cancun' },
  { id: 7, nombre: 'Xel-Há', precio: 100, descripcion: 'Parque acuático natural con snorkel ilimitado y almuerzo', porPersona: true, activo: true, destino: 'cancun' },
  { id: 8, nombre: 'Chichén Itzá + Cenote', precio: 85, descripcion: 'Maravilla del Mundo + nado en cenote + almuerzo buffet', porPersona: true, activo: true, destino: 'cancun' },
  { id: 9, nombre: 'Tulum + Cobá + Cenote', precio: 80, descripcion: 'Ruinas mayas frente al mar + pirámide Cobá + cenote', porPersona: true, activo: true, destino: 'cancun' },
  { id: 10, nombre: 'Isla Mujeres', precio: 65, descripcion: 'Catamaran + snorkel + playa virgen + almuerzo a bordo', porPersona: true, activo: true, destino: 'cancun' },

  // === CATARATAS ===
  { id: 11, nombre: 'Cataratas Lado Argentino', precio: 0, descripcion: 'Circuito Superior, Inferior y Garganta del Diablo (entrada aparte)', porPersona: true, activo: true, destino: 'cataratas' },
  { id: 12, nombre: 'Cataratas Lado Brasileño', precio: 0, descripcion: 'Panorámica completa de las cataratas desde Brasil (entrada aparte)', porPersona: true, activo: true, destino: 'cataratas' },
  { id: 13, nombre: 'Gran Aventura en Lancha', precio: 30, descripcion: 'Lancha que se acerca a la base de las cataratas, experiencia única', porPersona: true, activo: true, destino: 'cataratas' },
  { id: 14, nombre: 'Parque das Aves', precio: 20, descripcion: 'Avistaje de aves tropicales nativas en contacto directo', porPersona: true, activo: true, destino: 'cataratas' },
  { id: 15, nombre: 'Ruinas de San Ignacio', precio: 15, descripcion: 'Patrimonio Jesuítico UNESCO en la selva misionera', porPersona: true, activo: true, destino: 'cataratas' },
  { id: 16, nombre: 'Minas de Wanda', precio: 15, descripcion: 'Piedras preciosas y semipreciosas en la selva de Misiones', porPersona: true, activo: true, destino: 'cataratas' },

  // === USHUAIA ===
  { id: 17, nombre: 'Tren del Fin del Mundo', precio: 40, descripcion: 'Ferrocarril austral histórico por la selva fueguina', porPersona: true, activo: true, destino: 'ushuaia' },
  { id: 18, nombre: 'Navegación Canal Beagle', precio: 45, descripcion: 'Lobos marinos, pingüinos y glaciares desde el agua', porPersona: true, activo: true, destino: 'ushuaia' },
  { id: 19, nombre: 'Pingüinera Isla Martillo', precio: 60, descripcion: 'Contacto único con pingüinos de Magallanes en su hábitat', porPersona: true, activo: true, destino: 'ushuaia' },
  { id: 20, nombre: 'Parque Nacional Tierra del Fuego', precio: 20, descripcion: 'Bosques, lagos y senderos en el confín del mundo', porPersona: true, activo: true, destino: 'ushuaia' },
  { id: 21, nombre: 'Centro de Ski Cerro Castor', precio: 55, descripcion: 'Pase de ski o actividades en nieve (trineo, snowboard)', porPersona: true, activo: true, destino: 'ushuaia' },

  // === EL CALAFATE ===
  { id: 22, nombre: 'Glaciar Perito Moreno (entrada)', precio: 25, descripcion: 'Pasarelas frente al glaciar más famoso del mundo', porPersona: true, activo: true, destino: 'calafate' },
  { id: 23, nombre: 'Minitrekking sobre el Perito Moreno', precio: 120, descripcion: 'Caminata con crampones sobre el hielo con guía especializado', porPersona: true, activo: true, destino: 'calafate' },
  { id: 24, nombre: 'Safari Náutico', precio: 45, descripcion: 'Navegación entre bloques de hielo flotantes frente al glaciar', porPersona: true, activo: true, destino: 'calafate' },
  { id: 25, nombre: 'Todo Glaciares', precio: 80, descripcion: 'Navegación glaciares Upsala y Spegazzini — día completo', porPersona: true, activo: true, destino: 'calafate' },
  { id: 26, nombre: 'Estancia Patagónica', precio: 70, descripcion: 'Asado, cabalgata, tradiciones y sabores del campo austral', porPersona: true, activo: true, destino: 'calafate' },
  { id: 27, nombre: 'Cerro Frías + Tirolesa', precio: 65, descripcion: 'Trekking, panorámicas y tirolesa sobre la Patagonia', porPersona: true, activo: true, destino: 'calafate' },

  // === JAMAICA ===
  { id: 28, nombre: 'Dunn\'s River Falls', precio: 40, descripcion: 'Cascadas naturales para escalar con guía en Ocho Ríos', porPersona: true, activo: true, destino: 'jamaica' },
  { id: 29, nombre: 'Bob Marley Museum', precio: 20, descripcion: 'Visita al hogar y legado del ícono del reggae en Kingston', porPersona: true, activo: true, destino: 'jamaica' },

  // === PERÚ / MACHU PICCHU ===
  { id: 30, nombre: 'Machu Picchu (entrada + tren)', precio: 0, descripcion: 'Incluido en el paquete — Tren Inca Rail + entrada ciudadela', porPersona: true, activo: true, destino: 'peru' },
  { id: 31, nombre: 'Valle Sagrado de los Incas', precio: 50, descripcion: 'Pisac, Ollantaytambo y mercado artesanal andino', porPersona: true, activo: true, destino: 'peru' },
  { id: 32, nombre: 'City Tour Lima', precio: 35, descripcion: 'Miraflores, Centro Histórico Patrimonio UNESCO y Larco Herrera', porPersona: true, activo: true, destino: 'peru' },
];

export const trasladosBase = [
  // === BÚZIOS / RÍO ===
  { id: 1, nombre: 'Traslado Aeropuerto GIG ↔ Búzios', precio: 180, tipo: 'privado', activo: true, destino: 'buzios' },
  { id: 2, nombre: 'Traslado Aeropuerto SDU ↔ Búzios', precio: 160, tipo: 'privado', activo: true, destino: 'buzios' },
  { id: 3, nombre: 'Traslado Río de Janeiro ↔ Búzios (bus)', precio: 60, tipo: 'regular', activo: true, destino: 'buzios' },

  // === CANCÚN ===
  { id: 4, nombre: 'Traslado Aeropuerto CUN ↔ Hotel Cancún', precio: 30, tipo: 'regular', activo: true, destino: 'cancun' },
  { id: 5, nombre: 'Traslado Cancún ↔ Playa del Carmen', precio: 25, tipo: 'regular', activo: true, destino: 'cancun' },
  { id: 6, nombre: 'Traslado Privado CUN ↔ Hotel', precio: 80, tipo: 'privado', activo: true, destino: 'cancun' },

  // === CATARATAS ===
  { id: 7, nombre: 'Traslado Aeropuerto IGR ↔ Hotel (combi)', precio: 0, tipo: 'regular', activo: true, destino: 'cataratas' },
  { id: 8, nombre: 'Traslado a Cataratas Lado Brasileño', precio: 20, tipo: 'regular', activo: true, destino: 'cataratas' },

  // === USHUAIA ===
  { id: 9, nombre: 'Traslado Aeropuerto USH ↔ Hotel (combi)', precio: 0, tipo: 'regular', activo: true, destino: 'ushuaia' },
  { id: 10, nombre: 'Traslado al Centro de Ski', precio: 25, tipo: 'regular', activo: true, destino: 'ushuaia' },

  // === EL CALAFATE ===
  { id: 11, nombre: 'Traslado Aeropuerto FTE ↔ Hotel (combi)', precio: 0, tipo: 'regular', activo: true, destino: 'calafate' },
  { id: 12, nombre: 'Traslado al Glaciar Perito Moreno', precio: 30, tipo: 'regular', activo: true, destino: 'calafate' },

  // === JAMAICA ===
  { id: 13, nombre: 'Traslado Aeropuerto MBJ ↔ Hotel Negril', precio: 0, tipo: 'regular', activo: true, destino: 'jamaica' },

  // === PERÚ ===
  { id: 14, nombre: 'Traslado Aeropuerto LIM ↔ Hotel Lima', precio: 0, tipo: 'regular', activo: true, destino: 'peru' },
  { id: 15, nombre: 'Traslado Lima ↔ Aeropuerto Cusco', precio: 0, tipo: 'regular', activo: true, destino: 'peru' },
];

export default { excursionesBase, trasladosBase };
