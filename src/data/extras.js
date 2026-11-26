// Excursiones y traslados — datos iniciales para precargar en panel Admin
// Cada ítem tiene 'destino' para que el cotizador pueda filtrar por paquete seleccionado

export const excursionesBase = [
  // === BÚZIOS (Solo las 3 oficiales activas inicialmente, el resto apagadas) ===
  { id: 1, nombre: 'Arraial do Cabo Full Day', precio: 55, precioReales: null, moneda: 'BRL', descripcion: 'Paseo en barco 4hs + almuerzo incluido', porPersona: true, activo: true, destino: 'buzios' },
  { id: 2, nombre: 'Paseo en Escuna Búzios', precio: 35, precioReales: null, moneda: 'BRL', descripcion: '2:30hs recorrido por las playas del norte', porPersona: true, activo: true, destino: 'buzios' },
  { id: 3, nombre: 'Buceo en Búzios', precio: 50, precioReales: null, moneda: 'BRL', descripcion: 'Inmersiones entre corales con instructor, equipo y fotos', porPersona: true, activo: true, destino: 'buzios' },
  { id: 4, nombre: 'Buggy en Búzios', precio: 40, precioReales: null, moneda: 'BRL', descripcion: 'Recorrido en buggy por las 23 playas de Búzios', porPersona: true, activo: false, destino: 'buzios' },

  // === RÍO DE JANEIRO ===
  { id: 5, nombre: 'City Tour Río de Janeiro', precio: 45, precioReales: null, moneda: 'BRL', descripcion: 'Cristo Redentor + Pan de Azúcar + almuerzo', porPersona: true, activo: false, destino: 'buzios' },
  { id: 6, nombre: 'Corcovado & Cristo Redentor', precio: 35, precioReales: null, moneda: 'BRL', descripcion: 'Subida en tren al Cristo Redentor, vistas panorámicas', porPersona: true, activo: false, destino: 'buzios' },

  // === CANCÚN / PLAYA DEL CARMEN ===
  { id: 7, nombre: 'Xcaret Park', precio: 120, precioReales: null, moneda: 'USD', descripcion: 'Parque eco-arqueológico todo el día con espectáculo nocturno', porPersona: true, activo: false, destino: 'cancun' },
  { id: 8, nombre: 'Xel-Há', precio: 100, precioReales: null, moneda: 'USD', descripcion: 'Parque acuático natural con snorkel ilimitado y almuerzo', porPersona: true, activo: false, destino: 'cancun' },
  { id: 9, nombre: 'Chichén Itzá + Cenote', precio: 85, precioReales: null, moneda: 'USD', descripcion: 'Maravilla del Mundo + nado en cenote + almuerzo buffet', porPersona: true, activo: false, destino: 'cancun' },
  { id: 10, nombre: 'Tulum + Cobá + Cenote', precio: 80, precioReales: null, moneda: 'USD', descripcion: 'Ruinas mayas frente al mar + pirámide Cobá + cenote', porPersona: true, activo: false, destino: 'cancun' },
  { id: 11, nombre: 'Isla Mujeres', precio: 65, precioReales: null, moneda: 'USD', descripcion: 'Catamaran + snorkel + playa virgen + almuerzo a bordo', porPersona: true, activo: false, destino: 'cancun' },

  // === CATARATAS ===
  { id: 12, nombre: 'Cataratas Lado Argentino', precio: 0, precioReales: null, moneda: 'USD', descripcion: 'Circuito Superior, Inferior y Garganta del Diablo (entrada aparte)', porPersona: true, activo: false, destino: 'cataratas' },
  { id: 13, nombre: 'Cataratas Lado Brasileño', precio: 0, precioReales: null, moneda: 'BRL', descripcion: 'Panorámica completa de las cataratas desde Brasil (entrada aparte)', porPersona: true, activo: false, destino: 'cataratas' },
  { id: 14, nombre: 'Gran Aventura en Lancha', precio: 30, precioReales: null, moneda: 'USD', descripcion: 'Lancha que se acerca a la base de las cataratas, experiencia única', porPersona: true, activo: false, destino: 'cataratas' },
  { id: 15, nombre: 'Parque das Aves', precio: 20, precioReales: null, moneda: 'BRL', descripcion: 'Avistaje de aves tropicales nativas en contacto directo', porPersona: true, activo: false, destino: 'cataratas' },
  { id: 16, nombre: 'Ruinas de San Ignacio', precio: 15, precioReales: null, moneda: 'USD', descripcion: 'Patrimonio Jesuítico UNESCO en la selva misionera', porPersona: true, activo: false, destino: 'cataratas' },
  { id: 17, nombre: 'Minas de Wanda', precio: 15, precioReales: null, moneda: 'USD', descripcion: 'Piedras preciosas y semipreciosas en la selva de Misiones', porPersona: true, activo: false, destino: 'cataratas' },

  // === USHUAIA ===
  { id: 18, nombre: 'Tren del Fin del Mundo', precio: 40, precioReales: null, moneda: 'USD', descripcion: 'Ferrocarril austral histórico por la selva fueguina', porPersona: true, activo: false, destino: 'ushuaia' },
  { id: 19, nombre: 'Navegación Canal Beagle', precio: 45, precioReales: null, moneda: 'USD', descripcion: 'Lobos marinos, pingüinos y glaciares desde el agua', porPersona: true, activo: false, destino: 'ushuaia' },
  { id: 20, nombre: 'Pingüinera Isla Martillo', precio: 60, precioReales: null, moneda: 'USD', descripcion: 'Contacto único con pingüinos de Magallanes en su hábitat', porPersona: true, activo: false, destino: 'ushuaia' },
  { id: 21, nombre: 'Parque Nacional Tierra del Fuego', precio: 20, precioReales: null, moneda: 'USD', descripcion: 'Bosques, lagos y senderos en el confín del mundo', porPersona: true, activo: false, destino: 'ushuaia' },
  { id: 22, nombre: 'Centro de Ski Cerro Castor', precio: 55, precioReales: null, moneda: 'USD', descripcion: 'Pase de ski o actividades en nieve (trineo, snowboard)', porPersona: true, activo: false, destino: 'ushuaia' },

  // === EL CALAFATE ===
  { id: 23, nombre: 'Glaciar Perito Moreno (entrada)', precio: 25, precioReales: null, moneda: 'USD', descripcion: 'Pasarelas frente al glaciar más famoso del mundo', porPersona: true, activo: false, destino: 'calafate' },
  { id: 24, nombre: 'Minitrekking sobre el Perito Moreno', precio: 120, precioReales: null, moneda: 'USD', descripcion: 'Caminata con crampones sobre el hielo con guía especializado', porPersona: true, activo: false, destino: 'calafate' },
  { id: 25, nombre: 'Safari Náutico', precio: 45, precioReales: null, moneda: 'USD', descripcion: 'Navegación entre bloques de hielo flotantes frente al glaciar', porPersona: true, activo: false, destino: 'calafate' },
  { id: 26, nombre: 'Todo Glaciares', precio: 80, precioReales: null, moneda: 'USD', descripcion: 'Navegación glaciares Upsala y Spegazzini — día completo', porPersona: true, activo: false, destino: 'calafate' },
  { id: 27, nombre: 'Estancia Patagónica', precio: 70, precioReales: null, moneda: 'USD', descripcion: 'Asado, cabalgata, tradiciones y sabores del campo austral', porPersona: true, activo: false, destino: 'calafate' },
  { id: 28, nombre: 'Cerro Frías + Tirolesa', precio: 65, precioReales: null, moneda: 'USD', descripcion: 'Trekking, panorámicas y tirolesa sobre la Patagonia', porPersona: true, activo: false, destino: 'calafate' },

  // === JAMAICA ===
  { id: 29, nombre: 'Dunn\'s River Falls', precio: 40, precioReales: null, moneda: 'USD', descripcion: 'Cascadas naturales para escalar con guía en Ocho Ríos', porPersona: true, activo: false, destino: 'jamaica' },
  { id: 30, nombre: 'Bob Marley Museum', precio: 20, precioReales: null, moneda: 'USD', descripcion: 'Visita al hogar y legado del ícono del reggae en Kingston', porPersona: true, activo: false, destino: 'jamaica' },

  // === PERÚ / MACHU PICCHU ===
  { id: 31, nombre: 'Machu Picchu (entrada + tren)', precio: 0, precioReales: null, moneda: 'USD', descripcion: 'Incluido en el paquete — Tren Inca Rail + entrada ciudadela', porPersona: true, activo: false, destino: 'peru' },
  { id: 32, nombre: 'Valle Sagrado de los Incas', precio: 50, precioReales: null, moneda: 'USD', descripcion: 'Pisac, Ollantaytambo y mercado artesanal andino', porPersona: true, activo: false, destino: 'peru' },
  { id: 33, nombre: 'City Tour Lima', precio: 35, precioReales: null, moneda: 'USD', descripcion: 'Miraflores, Centro Histórico Patrimonio UNESCO y Larco Herrera', porPersona: true, activo: false, destino: 'peru' },
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
