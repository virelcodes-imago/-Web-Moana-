import { useState, useEffect } from 'react';
import { Copy, Send, Calculator, ChevronDown, ChevronUp, Layers, Compass, Plus, Trash2 } from 'lucide-react';
import db from '../../db/db';
import { paquetesBase, TEMPORADAS, HOTELES, TIPOS_HABITACION } from '../../data/paquetes';

const WA_NUMBER = '5522998024697';

export default function VendedorCotizadorPage() {
  const [modo, setModo] = useState('catalogo'); // 'catalogo' | 'a_medida'
  const [form, setForm] = useState({
    // Común
    nombreCliente: '',
    asesor: '',
    pasajeros: 2,

    // Modo Catálogo
    paqueteId: paquetesBase[0]?.id || '',
    temporada: 'baja',
    hotel: 'economico',
    habitacion: 'doble',
    excursiones: [],
    traslados: [],
    asistencia: { incluir: false, tarifaDiaria: 0, dias: 0 },

    // Modo A Medida (5 Bloques)
    transporteBase: 0,
    transporteTasas: 0,
    alojamientoNoche: 0,
    alojamientoNoches: 7,
    alojamientoRegimen: 'desayuno', // 'desayuno' | 'media_pension' | 'all_inclusive'
    alojamientoHabitacion: 'doble',
    trasladoTramo: 0,
    trasladoTipo: 'regular', // 'regular' | 'privado'
    asistenciaDiariaMed: 0,
    asistenciaDiasMed: 7,
    excursionesMed: [], // array de { nombre, precio }
    margenGanancia: 15, // % de ganancia
  });

  const [precio, setPrecio] = useState(null);
  const [paquetesList, setPaquetesList] = useState(paquetesBase);
  const [excursionesList, setExcursionesList] = useState([]);
  const [trasladosList, setTrasladosList] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [nuevoExtraNombre, setNuevoExtraNombre] = useState('');
  const [nuevoExtraPrecio, setNuevoExtraPrecio] = useState('');

  useEffect(() => {
    const loadPkgs = async () => {
      const list = await db.paquetes.toArray();
      if (list.length > 0) setPaquetesList(list);
    };
    loadPkgs();
  }, []);

  const paqueteSeleccionado = paquetesList.find((p) => p.id === Number(form.paqueteId)) || paquetesBase.find((p) => p.id === Number(form.paqueteId));

  // Cargar precio desde Dexie (Modo Catálogo)
  useEffect(() => {
    const load = async () => {
      try {
        const p = await db.precios
          .where({ paqueteId: Number(form.paqueteId), temporada: form.temporada, hotel: form.hotel })
          .first();
        setPrecio(p ? p.precio : null);
      } catch {
        setPrecio(null);
      }
    };
    if (form.paqueteId && modo === 'catalogo') load();
  }, [form.paqueteId, form.temporada, form.hotel, modo]);

  // Cargar extras desde Dexie
  useEffect(() => {
    const load = async () => {
      const excs = await db.excursiones.toArray();
      setExcursionesList(excs.length ? excs : []);
      const tras = await db.traslados.toArray();
      setTrasladosList(tras.length ? tras : []);
    };
    load();
  }, []);

  const toggleExcursion = (exc) => {
    setForm((prev) => {
      const exists = prev.excursiones.find((e) => e.nombre === exc.nombre);
      return {
        ...prev,
        excursiones: exists
          ? prev.excursiones.filter((e) => e.nombre !== exc.nombre)
          : [...prev.excursiones, exc],
      };
    });
  };

  const toggleTraslado = (tr) => {
    setForm((prev) => {
      const exists = prev.traslados.find((t) => t.nombre === tr.nombre);
      return {
        ...prev,
        traslados: exists
          ? prev.traslados.filter((t) => t.nombre !== tr.nombre)
          : [...prev.traslados, tr],
      };
    });
  };

  const agregarExtraAMedida = () => {
    if (!nuevoExtraNombre.trim() || !nuevoExtraPrecio) return;
    setForm((prev) => ({
      ...prev,
      excursionesMed: [
        ...prev.excursionesMed,
        { nombre: nuevoExtraNombre.trim(), precio: Number(nuevoExtraPrecio) }
      ]
    }));
    setNuevoExtraNombre('');
    setNuevoExtraPrecio('');
  };

  const eliminarExtraAMedida = (index) => {
    setForm((prev) => ({
      ...prev,
      excursionesMed: prev.excursionesMed.filter((_, i) => i !== index)
    }));
  };

  // --- CÁLCULOS MATEMÁTICOS ---

  // 1. Modo Catálogo (Sencillo, los precios ya son de Venta)
  const precioBaseCat = precio || 0;
  const excTotalCat = form.excursiones.reduce((acc, e) => acc + (e.precio || 0), 0);
  const trasTotalCat = form.traslados.reduce((acc, t) => acc + (t.precio || 0), 0) / form.pasajeros;
  const asistTotalCat = form.asistencia.incluir
    ? (form.asistencia.tarifaDiaria * form.asistencia.dias)
    : 0;
  const totalPorPersonaCat = precioBaseCat + excTotalCat + trasTotalCat + asistTotalCat;
  const totalGeneralCat = totalPorPersonaCat * form.pasajeros;

  // 2. Modo A Medida (5 Bloques con Margen de Ganancia)
  const costoTransporte = Number(form.transporteBase) + Number(form.transporteTasas); // por persona
  const costoAlojamientoTotal = Number(form.alojamientoNoche) * Number(form.alojamientoNoches); // total hotel
  const costoAlojamientoPorPersona = costoAlojamientoTotal / form.pasajeros;
  const costoTrasladoPorPersona = Number(form.trasladoTramo) / form.pasajeros;
  const costoAsistenciaPorPersona = Number(form.asistenciaDiariaMed) * Number(form.asistenciaDiasMed);
  const costoExcursionesPorPersona = form.excursionesMed.reduce((acc, e) => acc + e.precio, 0);

  const costoNetoTotalPorPersona =
    costoTransporte +
    costoAlojamientoPorPersona +
    costoTrasladoPorPersona +
    costoAsistenciaPorPersona +
    costoExcursionesPorPersona;

  // Aplicar margen de ganancia
  const factorGanancia = 1 + Number(form.margenGanancia) / 100;
  const totalPorPersonaMed = Math.round(costoNetoTotalPorPersona * factorGanancia);
  const totalGeneralMed = totalPorPersonaMed * form.pasajeros;

  const finalPorPersona = modo === 'catalogo' ? totalPorPersonaCat : totalPorPersonaMed;
  const finalGeneral = modo === 'catalogo' ? totalGeneralCat : totalGeneralMed;

  // --- FORMATO MENSAJE ---
  const generateMessage = () => {
    const TEMP_LABELS = {
      baja: 'Temporada Baja',
      alta: 'Temporada Alta',
      semana_santa: 'Semana Santa',
      vacaciones_invierno: 'Vacaciones de Invierno',
    };
    const HOTEL_LABELS = {
      economico: 'Posada',
      familiar: '2 Estrellas',
      premium: '3 Estrellas',
    };
    const REGIMEN_LABELS = {
      desayuno: 'Desayuno',
      media_pension: 'Media Pensión',
      all_inclusive: 'All Inclusive',
    };

    let msg = `🌊 *MOANA TURISMO — Cotización Especial*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    if (form.nombreCliente) msg += `👤 *Cliente:* ${form.nombreCliente}\n`;
    if (form.asesor) msg += `🙋 *Asesor:* ${form.asesor}\n`;
    msg += `\n`;

    if (modo === 'catalogo') {
      msg += `✈️ *Paquete:* ${paqueteSeleccionado?.titulo || ''}\n`;
      msg += `📅 *Temporada:* ${TEMP_LABELS[form.temporada]}\n`;
      msg += `🏨 *Hotel:* ${HOTEL_LABELS[form.hotel]}\n`;
      msg += `🛏️ *Habitación:* ${form.habitacion.toUpperCase()}\n`;
      msg += `👥 *Pasajeros:* ${form.pasajeros}\n`;
      if (paqueteSeleccionado?.noches) msg += `🌙 *Noches:* ${paqueteSeleccionado.noches}\n`;
      msg += `\n`;

      if (form.excursiones.length > 0) {
        msg += `🗺️ *Excursiones incluidas:*\n`;
        form.excursiones.forEach((e) => {
          msg += `   • ${e.nombre}${e.precio ? ` (USD ${e.precio}/pax)` : ''}\n`;
        });
        msg += `\n`;
      }

      if (form.traslados.length > 0) {
        msg += `🚌 *Traslados:*\n`;
        form.traslados.forEach((t) => {
          msg += `   • ${t.nombre}${t.precio ? ` (USD ${t.precio} total)` : ''}\n`;
        });
        msg += `\n`;
      }

      if (form.asistencia.incluir) {
        msg += `🏥 *Asistencia al viajero:* USD ${asistTotalCat}/pax\n\n`;
      }
    } else {
      // Modo a medida
      msg += `✈️ *Paquete:* Viaje a Medida / Internacional\n`;
      msg += `👥 *Pasajeros:* ${form.pasajeros}\n`;
      msg += `🌙 *Alojamiento:* ${form.alojamientoNoches} Noches (${REGIMEN_LABELS[form.alojamientoRegimen]} · Hab. ${form.alojamientoHabitacion.toUpperCase()})\n`;
      msg += `🚌 *Traslados:* ${form.trasladoTipo.toUpperCase()}\n`;
      msg += `\n`;

      if (form.excursionesMed.length > 0) {
        msg += `🗺️ *Excursiones / Extras:*\n`;
        form.excursionesMed.forEach((e) => {
          msg += `   • ${e.nombre} (USD ${e.precio})\n`;
        });
        msg += `\n`;
      }
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    if (modo === 'catalogo' && !precio) {
      msg += `💰 *Precio:* A cotizar (consultar disponibilidad)\n`;
    } else {
      msg += `💰 *Precio por persona: USD ${finalPorPersona.toLocaleString()}*\n`;
      msg += `💰 *Total general (${form.pasajeros} pax): USD ${finalGeneral.toLocaleString()}*\n`;
    }
    msg += `💳 *Financiación:* ¡Hasta en 12 cuotas sin tarjeta de crédito! 💵\n`;
    msg += `\n¿Qué te parece la propuesta? ¡Reservá el tuyo! 🌊`;

    return msg;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(generateMessage())}`;
    window.open(url, '_blank');
  };

  const setF = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="min-h-screen bg-moana-cream">
      {/* Header */}
      <div className="bg-moana-blue text-white py-8">
        <div className="container-moana">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Calculator size={28} className="text-moana-orange" />
              <div>
                <h1 className="font-display font-bold text-2xl">Cotizador — Panel Vendedor</h1>
                <p className="text-white/70 text-sm">Generá cotizaciones al instante en pesos/dólares</p>
              </div>
            </div>

            {/* Selector de Modo */}
            <div className="flex bg-white/10 p-1 rounded-xl border border-white/20">
              <button
                onClick={() => setModo('catalogo')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  modo === 'catalogo' ? 'bg-moana-orange text-white' : 'text-white hover:text-moana-orange'
                }`}
              >
                <Compass size={14} /> Paquetes del Catálogo
              </button>
              <button
                onClick={() => setModo('a_medida')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  modo === 'a_medida' ? 'bg-moana-orange text-white' : 'text-white hover:text-moana-orange'
                }`}
              >
                <Layers size={14} /> Destino a Medida (Abierto)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-moana py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Formulario */}
          <div className="lg:col-span-2 space-y-5">

            {/* Datos cliente */}
            <div className="card p-5">
              <h2 className="font-semibold text-moana-blue mb-4">Datos de la Consulta</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="label-field">Nombre del cliente</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={form.nombreCliente}
                    onChange={(e) => setF('nombreCliente', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">Cantidad de pasajeros</label>
                  <input
                    type="number"
                    min="1"
                    value={form.pasajeros}
                    onChange={(e) => setF('pasajeros', Math.max(1, Number(e.target.value)))}
                    className="input-field"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="label-field">Vendedora / Asesor</label>
                  <input
                    type="text"
                    placeholder="Tu nombre (Ej: Melisa Cano)"
                    value={form.asesor}
                    onChange={(e) => setF('asesor', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* MODO CATÁLOGO */}
            {modo === 'catalogo' && (
              <>
                <div className="card p-5">
                  <h2 className="font-semibold text-moana-blue mb-4">Paquete Precargado</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="label-field">Destino / Paquete</label>
                      <select
                        value={form.paqueteId}
                        onChange={(e) => setF('paqueteId', e.target.value)}
                        className="input-field"
                      >
                        {paquetesList.map((p) => (
                          <option key={p.id} value={p.id}>{p.titulo}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-field">Temporada</label>
                      <select
                        value={form.temporada}
                        onChange={(e) => setF('temporada', e.target.value)}
                        className="input-field"
                      >
                        {TEMPORADAS.map((t) => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-field">Categoría Hotel</label>
                      <select
                        value={form.hotel}
                        onChange={(e) => setF('hotel', e.target.value)}
                        className="input-field"
                      >
                        {HOTELES.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-field">Habitación</label>
                      <select
                        value={form.habitacion}
                        onChange={(e) => setF('habitacion', e.target.value)}
                        className="input-field"
                      >
                        {TIPOS_HABITACION.map((h) => (
                          <option key={h.id} value={h.id}>{h.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Extras */}
                <div className="card overflow-hidden">
                  <button
                    onClick={() => setShowExtras(!showExtras)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-moana-blue-pale transition-colors font-semibold text-moana-blue"
                  >
                    <span>Excursiones, Traslados y Asistencia adicional</span>
                    {showExtras ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {showExtras && (
                    <div className="p-5 border-t border-gray-100 space-y-4">
                      {/* Excursiones precargadas */}
                      <div>
                        <h3 className="label-field">🗺️ Excursiones</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {excursionesList.map((exc, i) => {
                            const checked = form.excursiones.some((e) => e.nombre === exc.nombre);
                            return (
                              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                checked ? 'border-moana-orange bg-moana-orange-light/20' : 'border-gray-100'
                              }`}>
                                <input type="checkbox" checked={checked} onChange={() => toggleExcursion(exc)} className="accent-moana-orange" />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-moana-dark">{exc.nombre}</p>
                                  <p className="text-[10px] text-moana-orange font-bold">USD {exc.precio}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Traslados precargados */}
                      <div>
                        <h3 className="label-field">🚌 Traslados</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {trasladosList.map((tr, i) => {
                            const checked = form.traslados.some((t) => t.nombre === tr.nombre);
                            return (
                              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                checked ? 'border-moana-blue bg-moana-blue-pale' : 'border-gray-100'
                              }`}>
                                <input type="checkbox" checked={checked} onChange={() => toggleTraslado(tr)} className="accent-moana-blue" />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-moana-dark">{tr.nombre}</p>
                                  <p className="text-[10px] text-moana-blue font-bold">USD {tr.precio} total</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Asistencia */}
                      <div>
                        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          form.asistencia.incluir ? 'border-moana-teal bg-moana-teal/10' : 'border-gray-100'
                        }`}>
                          <input
                            type="checkbox"
                            checked={form.asistencia.incluir}
                            onChange={(e) => setF('asistencia', { ...form.asistencia, incluir: e.target.checked })}
                          />
                          <span className="text-xs font-semibold text-moana-dark">🏥 Incluir Asistencia al Viajero</span>
                        </label>
                        {form.asistencia.incluir && (
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="label-field text-xs">Tarifa diaria (USD)</label>
                              <input
                                type="number"
                                value={form.asistencia.tarifaDiaria}
                                onChange={(e) => setF('asistencia', { ...form.asistencia, tarifaDiaria: Number(e.target.value) })}
                                className="input-field"
                              />
                            </div>
                            <div>
                              <label className="label-field text-xs">Días totales</label>
                              <input
                                type="number"
                                value={form.asistencia.dias}
                                onChange={(e) => setF('asistencia', { ...form.asistencia, dias: Number(e.target.value) })}
                                className="input-field"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* MODO A MEDIDA / ABIERTO (5 BLOQUES) */}
            {modo === 'a_medida' && (
              <div className="space-y-5">
                {/* 1. Transporte */}
                <div className="card p-5">
                  <h3 className="font-semibold text-moana-blue mb-3">✈️ Bloque 1: Transporte (Por Persona)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-field text-xs">Tarifa base aérea/micro (USD)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.transporteBase}
                        onChange={(e) => setF('transporteBase', Number(e.target.value))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-field text-xs">Impuestos/Tasas (USD)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.transporteTasas}
                        onChange={(e) => setF('transporteTasas', Number(e.target.value))}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Alojamiento */}
                <div className="card p-5">
                  <h3 className="font-semibold text-moana-blue mb-3">🏨 Bloque 2: Alojamiento</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="label-field text-xs">Tarifa por noche (USD)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.alojamientoNoche}
                        onChange={(e) => setF('alojamientoNoche', Number(e.target.value))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-field text-xs">Cantidad de noches</label>
                      <input
                        type="number"
                        min="1"
                        value={form.alojamientoNoches}
                        onChange={(e) => setF('alojamientoNoches', Number(e.target.value))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-field text-xs">Tipo de habitación</label>
                      <select
                        value={form.alojamientoHabitacion}
                        onChange={(e) => setF('alojamientoHabitacion', e.target.value)}
                        className="input-field"
                      >
                        <option value="single">Single</option>
                        <option value="doble">Doble</option>
                        <option value="triple">Triple</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="label-field text-xs">Régimen</label>
                      <select
                        value={form.alojamientoRegimen}
                        onChange={(e) => setF('alojamientoRegimen', e.target.value)}
                        className="input-field"
                      >
                        <option value="desayuno">Desayuno</option>
                        <option value="media_pension">Media Pensión</option>
                        <option value="all_inclusive">All Inclusive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Traslados */}
                <div className="card p-5">
                  <h3 className="font-semibold text-moana-blue mb-3">🚌 Bloque 3: Traslados</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-field text-xs">Costo total por tramo (USD)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.trasladoTramo}
                        onChange={(e) => setF('trasladoTramo', Number(e.target.value))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-field text-xs">Tipo de servicio</label>
                      <select
                        value={form.trasladoTipo}
                        onChange={(e) => setF('trasladoTipo', e.target.value)}
                        className="input-field"
                      >
                        <option value="regular">Regular</option>
                        <option value="privado">Privado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Asistencia */}
                <div className="card p-5">
                  <h3 className="font-semibold text-moana-blue mb-3">🏥 Bloque 4: Asistencia Médica</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-field text-xs">Tarifa diaria seguro (USD/persona)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.asistenciaDiariaMed}
                        onChange={(e) => setF('asistenciaDiariaMed', Number(e.target.value))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-field text-xs">Días totales</label>
                      <input
                        type="number"
                        min="1"
                        value={form.asistenciaDiasMed}
                        onChange={(e) => setF('asistenciaDiasMed', Number(e.target.value))}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Excursiones / Extras */}
                <div className="card p-5">
                  <h3 className="font-semibold text-moana-blue mb-3">🗺️ Bloque 5: Excursiones y Extras (Por Persona)</h3>
                  
                  {form.excursionesMed.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {form.excursionesMed.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-moana-cream p-3 rounded-xl border border-gray-100">
                          <span className="text-xs font-semibold text-moana-dark">{item.nombre}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-moana-orange">USD {item.precio}</span>
                            <button
                              onClick={() => eliminarExtraAMedida(idx)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Nombre del extra"
                      value={nuevoExtraNombre}
                      onChange={(e) => setNuevoExtraNombre(e.target.value)}
                      className="input-field sm:col-span-2 text-xs"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Precio (USD)"
                        value={nuevoExtraPrecio}
                        onChange={(e) => setNuevoExtraPrecio(e.target.value)}
                        className="input-field text-xs flex-1"
                      />
                      <button
                        onClick={agregarExtraAMedida}
                        className="btn-primary p-3 w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Margen de ganancia */}
                <div className="card p-5">
                  <h3 className="font-semibold text-moana-blue mb-3">📊 Margen de Ganancia de la Agencia</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={form.margenGanancia}
                        onChange={(e) => setF('margenGanancia', Number(e.target.value))}
                        className="w-full h-2 bg-moana-blue-pale rounded-lg appearance-none cursor-pointer accent-moana-orange"
                      />
                    </div>
                    <div className="relative w-24">
                      <input
                        type="number"
                        min="0"
                        value={form.margenGanancia}
                        onChange={(e) => setF('margenGanancia', Math.max(0, Number(e.target.value)))}
                        className="input-field pr-8 text-center font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-moana-gray">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-moana-gray mt-2">
                    Aplica sobre el costo total calculado ({modo === 'catalogo' ? '—' : 'Transporte + Hotel + Traslados + Asistencia + Extras'}).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Resumen lateral */}
          <div className="space-y-4">
            <div className="card p-5 sticky top-24">
              <h2 className="font-display font-bold text-moana-blue text-xl mb-4">💰 Resumen Cotización</h2>

              <div className="space-y-3 text-sm">
                {modo === 'catalogo' ? (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-moana-gray">Paquete base</span>
                      <span className="font-semibold text-moana-dark">
                        {precio ? `USD ${precio.toLocaleString()}` : '—'}
                      </span>
                    </div>
                    {form.excursiones.map((e, i) => (
                      <div key={i} className="flex justify-between py-1">
                        <span className="text-moana-gray truncate max-w-[150px]">{e.nombre}</span>
                        <span className="font-medium text-moana-dark">USD {e.precio || 0}</span>
                      </div>
                    ))}
                    {form.traslados.map((t, i) => (
                      <div key={i} className="flex justify-between py-1">
                        <span className="text-moana-gray truncate max-w-[150px]">{t.nombre}</span>
                        <span className="font-medium text-moana-dark">USD {Math.round(t.precio / form.pasajeros)}</span>
                      </div>
                    ))}
                    {form.asistencia.incluir && (
                      <div className="flex justify-between py-1">
                        <span className="text-moana-gray">Asistencia</span>
                        <span className="font-medium text-moana-dark">USD {asistTotalCat}/pax</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-moana-gray">Transporte (base + tasas)</span>
                      <span className="font-semibold text-moana-dark">USD {costoTransporte}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-moana-gray">Hotel ({form.alojamientoNoches} Nts)</span>
                      <span className="font-semibold text-moana-dark">USD {Math.round(costoAlojamientoPorPersona)}/pax</span>
                    </div>
                    {costoTrasladoPorPersona > 0 && (
                      <div className="flex justify-between py-1.5 border-b border-gray-100">
                        <span className="text-moana-gray">Traslado ({form.trasladoTipo})</span>
                        <span className="font-semibold text-moana-dark">USD {Math.round(costoTrasladoPorPersona)}/pax</span>
                      </div>
                    )}
                    {costoAsistenciaPorPersona > 0 && (
                      <div className="flex justify-between py-1.5 border-b border-gray-100">
                        <span className="text-moana-gray">Asistencia ({form.asistenciaDiasMed} días)</span>
                        <span className="font-semibold text-moana-dark">USD {costoAsistenciaPorPersona}</span>
                      </div>
                    )}
                    {costoExcursionesPorPersona > 0 && (
                      <div className="flex justify-between py-1.5 border-b border-gray-100">
                        <span className="text-moana-gray">Excursiones / Extras</span>
                        <span className="font-semibold text-moana-dark">USD {costoExcursionesPorPersona}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 border-b border-gray-100 text-moana-orange font-medium">
                      <span>Costo Neto total</span>
                      <span>USD {Math.round(costoNetoTotalPorPersona)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100 text-xs">
                      <span className="text-moana-gray">Margen de ganancia ({form.margenGanancia}%)</span>
                      <span className="font-semibold text-moana-dark">USD {Math.round(costoNetoTotalPorPersona * (form.margenGanancia / 100))}</span>
                    </div>
                  </>
                )}

                {/* Precios finales */}
                <div className="pt-3 border-t-2 border-moana-blue">
                  <div className="price-tag mb-3">
                    <p className="price-desde">Total por persona</p>
                    <p className="price-amount font-display text-3xl">
                      {modo === 'catalogo' && !precio ? 'A cotizar' : `USD ${finalPorPersona.toLocaleString()}`}
                    </p>
                  </div>
                  {(modo === 'a_medida' || precio) && (
                    <div className="bg-moana-blue-pale rounded-xl p-3 text-center">
                      <p className="text-xs text-moana-gray mb-0.5">Total general ({form.pasajeros} pasajeros)</p>
                      <p className="font-display font-bold text-moana-blue text-2xl">
                        USD {finalGeneral.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-3 mt-5">
                <button
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all ${
                    copied ? 'bg-green-500 text-white shadow' : 'btn-secondary'
                  }`}
                >
                  <Copy size={16} />
                  {copied ? '¡Copiado!' : 'Copiar para WhatsApp'}
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="btn-whatsapp justify-center py-3.5"
                >
                  <Send size={16} />
                  Enviar por WhatsApp
                </button>
              </div>

              <p className="text-[10px] text-moana-gray text-center mt-3">
                💵 Financiación en cuotas sin tarjeta de crédito disponible.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
