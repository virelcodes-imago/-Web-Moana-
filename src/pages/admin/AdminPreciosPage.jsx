import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, CheckCircle, Settings, Edit3 } from 'lucide-react';
import db from '../../db/db';
import { paquetesBase, TEMPORADAS, HOTELES } from '../../data/paquetes';
import { excursionesBase, trasladosBase } from '../../data/extras';

export default function AdminPreciosPage() {
  const [activeTab, setActiveTab] = useState('paquetes');
  const [savedMsg, setSavedMsg] = useState('');

  // --- Paquetes/Precios ---
  const [paquetesList, setPaquetesList] = useState([]);
  const [selectedPaquete, setSelectedPaquete] = useState(null);
  const [precioMatrix, setPrecioMatrix] = useState({}); // key: `temporada-hotel` → precio
  
  const [paqueteMeta, setPaqueteMeta] = useState({
    titulo: '',
    subtitulo: '',
    descCorta: '',
    descripcion: '',
    activo: true,
    destacado: false
  });

  // --- Excursiones ---
  const [excursiones, setExcursiones] = useState(excursionesBase);

  // --- Traslados ---
  const [traslados, setTraslados] = useState(trasladosBase);

  // Cargar paquetes desde Dexie al iniciar
  useEffect(() => {
    const loadPkgs = async () => {
      const list = await db.paquetes.toArray();
      const final = list.length > 0 ? list : paquetesBase;
      setPaquetesList(final);
      if (final.length > 0) {
        setSelectedPaquete(final[0].id);
      }
    };
    loadPkgs();
  }, []);

  // Cargar metadatos y matriz de precios al seleccionar paquete
  useEffect(() => {
    if (!selectedPaquete) return;
    const load = async () => {
      // 1. Cargar metadatos
      const pkg = await db.paquetes.get(Number(selectedPaquete));
      if (pkg) {
        setPaqueteMeta({
          titulo: pkg.titulo || '',
          subtitulo: pkg.subtitulo || '',
          descCorta: pkg.descCorta || '',
          descripcion: pkg.descripcion || '',
          activo: pkg.activo !== 0,
          destacado: pkg.destacado === 1
        });
      } else {
        const basePkg = paquetesBase.find(p => p.id === Number(selectedPaquete));
        if (basePkg) {
          setPaqueteMeta({
            titulo: basePkg.titulo || '',
            subtitulo: basePkg.subtitulo || '',
            descCorta: basePkg.descCorta || '',
            descripcion: basePkg.descripcion || '',
            activo: true,
            destacado: basePkg.destacado || false
          });
        }
      }

      // 2. Cargar matriz de precios
      const rows = await db.precios.where({ paqueteId: Number(selectedPaquete) }).toArray();
      const map = {};
      rows.forEach((r) => { map[`${r.temporada}-${r.hotel}`] = r.precio; });
      setPrecioMatrix(map);
    };
    load();
  }, [selectedPaquete]);

  // Load excursiones/traslados from Dexie
  useEffect(() => {
    const load = async () => {
      const excs = await db.excursiones.toArray();
      if (excs.length > 0) setExcursiones(excs);
      const tras = await db.traslados.toArray();
      if (tras.length > 0) setTraslados(tras);
    };
    load();
  }, []);

  const handlePrecioChange = (temporada, hotel, value) => {
    const key = `${temporada}-${hotel}`;
    setPrecioMatrix((prev) => ({ ...prev, [key]: value === '' ? '' : Number(value) }));
  };

  const handleMetaChange = (key, val) => {
    setPaqueteMeta(prev => ({ ...prev, [key]: val }));
  };

  const handleSavePaquete = async () => {
    const pId = Number(selectedPaquete);
    
    // 1. Guardar metadatos (Publicación)
    const existing = await db.paquetes.get(pId);
    const updatedPkg = {
      ...(existing || {}),
      id: pId,
      titulo: paqueteMeta.titulo,
      subtitulo: paqueteMeta.subtitulo,
      descCorta: paqueteMeta.descCorta,
      descripcion: paqueteMeta.descripcion,
      activo: paqueteMeta.activo ? 1 : 0,
      destacado: paqueteMeta.destacado ? 1 : 0,
      slug: existing?.slug || paquetesBase.find(p => p.id === pId)?.slug || '',
      categoria: existing?.categoria || paquetesBase.find(p => p.id === pId)?.categoria || '',
      imagen: existing?.imagen || paquetesBase.find(p => p.id === pId)?.imagen || '',
      imagenHero: existing?.imagenHero || paquetesBase.find(p => p.id === pId)?.imagenHero || '',
      noches: existing?.noches !== undefined ? existing.noches : (paquetesBase.find(p => p.id === pId)?.noches || null),
      orden: existing?.orden !== undefined ? existing.orden : (paquetesBase.find(p => p.id === pId)?.orden || 99),
      incluye: existing?.incluye || paquetesBase.find(p => p.id === pId)?.incluye || [],
      noIncluye: existing?.noIncluye || paquetesBase.find(p => p.id === pId)?.noIncluye || [],
    };
    await db.paquetes.put(updatedPkg);

    // 2. Guardar matriz de precios
    await db.precios.where({ paqueteId: pId }).delete();
    const rows = [];
    for (const [key, precio] of Object.entries(precioMatrix)) {
      if (precio === '' || precio === null) continue;
      const [temporada, hotel] = key.split('-');
      rows.push({ paqueteId: pId, temporada, hotel, precio: Number(precio) });
    }
    await db.precios.bulkAdd(rows);

    // Refrescar lista de paquetes por si cambió el nombre
    const list = await db.paquetes.toArray();
    setPaquetesList(list);

    showSaved('¡Publicación y precios guardados correctamente!');
  };

  const handleSaveExcursiones = async () => {
    await db.excursiones.clear();
    await db.excursiones.bulkAdd(excursiones.map(({ id: _id, ...e }) => e));
    showSaved('¡Excursiones guardadas!');
  };

  const handleSaveTraslados = async () => {
    await db.traslados.clear();
    await db.traslados.bulkAdd(traslados.map(({ id: _id, ...t }) => t));
    showSaved('¡Traslados guardados!');
  };

  const showSaved = (msg) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const addExcursion = () => {
    setExcursiones((prev) => [...prev, { nombre: '', precio: 0, descripcion: '', porPersona: true, activo: true }]);
  };

  const addTraslado = () => {
    setTraslados((prev) => [...prev, { nombre: '', precio: 0, tipo: 'regular', activo: true }]);
  };

  return (
    <div className="min-h-screen bg-moana-cream pb-12">
      {/* Header */}
      <div className="bg-moana-blue text-white py-8">
        <div className="container-moana">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings size={28} className="text-moana-orange" />
              <div>
                <h1 className="font-display font-bold text-2xl">Panel Admin — Moana Turismo</h1>
                <p className="text-white/70 text-sm">Gestioná publicaciones, precios y catálogos de la web</p>
              </div>
            </div>
            <a href="/" className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white font-medium border border-white/20 transition-all">
              Ver Web Pública
            </a>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {savedMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl
                        shadow-lg flex items-center gap-2 animate-fade-up">
          <CheckCircle size={18} /> {savedMsg}
        </div>
      )}

      <div className="container-moana py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 shadow-card w-fit">
          {[
            { id: 'paquetes', label: '✈️ Publicaciones y Precios' },
            { id: 'excursiones', label: '🚢 Excursiones' },
            { id: 'traslados', label: '🚌 Traslados' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === id
                  ? 'bg-moana-orange text-white shadow'
                  : 'text-moana-gray hover:text-moana-blue'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* === PAQUETES TAB === */}
        {activeTab === 'paquetes' && (
          <div className="space-y-6">
            {/* Paquete selector */}
            <div className="card p-6">
              <label className="label-field text-base mb-3 block">Seleccioná la publicación a editar</label>
              <select
                value={selectedPaquete || ''}
                onChange={(e) => setSelectedPaquete(e.target.value)}
                className="input-field max-w-sm font-semibold text-moana-blue"
              >
                {paquetesList.map((p) => (
                  <option key={p.id} value={p.id}>{p.titulo} {p.activo === 0 ? '(Inactivo)' : ''}</option>
                ))}
              </select>
            </div>

            {/* Metadatos de la publicación */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                <Edit3 size={18} className="text-moana-orange" />
                <h2 className="font-display font-bold text-moana-blue text-xl">Editar Información de la Web</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Título de la Publicación</label>
                  <input
                    type="text"
                    value={paqueteMeta.titulo}
                    onChange={(e) => handleMetaChange('titulo', e.target.value)}
                    className="input-field font-semibold text-moana-blue"
                  />
                </div>
                <div>
                  <label className="label-field">Subtítulo / Bajada</label>
                  <input
                    type="text"
                    value={paqueteMeta.subtitulo}
                    onChange={(e) => handleMetaChange('subtitulo', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-field">Descripción Corta (Vista de Tarjeta)</label>
                  <input
                    type="text"
                    value={paqueteMeta.descCorta}
                    onChange={(e) => handleMetaChange('descCorta', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-field">Descripción Detallada (Página de Detalle)</label>
                  <textarea
                    value={paqueteMeta.descripcion}
                    rows="4"
                    onChange={(e) => handleMetaChange('descripcion', e.target.value)}
                    className="input-field py-3 text-sm leading-relaxed"
                  ></textarea>
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paqueteMeta.activo}
                      onChange={(e) => handleMetaChange('activo', e.target.checked)}
                      className="accent-moana-orange w-5 h-5"
                    />
                    <span className="font-semibold text-sm text-moana-dark select-none">
                      Mostrar en la Web (Publicación Activa)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paqueteMeta.destacado}
                      onChange={(e) => handleMetaChange('destacado', e.target.checked)}
                      className="accent-moana-orange w-5 h-5"
                    />
                    <span className="font-semibold text-sm text-moana-dark select-none">
                      Destacar en Portada (Featured ⭐)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Price matrix */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-moana-blue text-xl mb-1">
                Matriz de Precios de Venta
              </h2>
              <p className="text-moana-gray text-sm mb-5">
                Ingresá el precio de venta final en USD por persona (base doble) para cada combinación.
                Dejá vacío si no aplica.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-moana-blue-pale">
                      <th className="text-left px-4 py-3 text-moana-blue font-semibold rounded-l-xl">
                        Temporada
                      </th>
                      {HOTELES.map((h) => (
                        <th key={h.id} className="px-4 py-3 text-moana-blue font-semibold text-center">
                          {h.label} {'⭐'.repeat(h.stars)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TEMPORADAS.map((t, ti) => (
                      <tr key={t.id} className={ti % 2 === 0 ? 'bg-white' : 'bg-moana-cream'}>
                        <td className="px-4 py-3 font-medium text-moana-dark">{t.label}</td>
                        {HOTELES.map((h) => (
                          <td key={h.id} className="px-4 py-3">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-moana-gray font-semibold text-sm">
                                USD
                              </span>
                              <input
                                type="number"
                                min="0"
                                placeholder="—"
                                value={precioMatrix[`${t.id}-${h.id}`] ?? ''}
                                onChange={(e) => handlePrecioChange(t.id, h.id, e.target.value)}
                                className="w-28 pl-12 pr-3 py-2 border border-gray-200 rounded-lg text-center
                                           focus:outline-none focus:ring-2 focus:ring-moana-orange text-moana-dark"
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleSavePaquete}
                className="mt-6 btn-primary flex items-center gap-2"
              >
                <Save size={18} /> Guardar Publicación y Precios
              </button>
            </div>
          </div>
        )}

        {/* === EXCURSIONES TAB === */}
        {activeTab === 'excursiones' && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-moana-blue text-xl mb-5">Excursiones</h2>
            <div className="space-y-3">
              {excursiones.map((exc, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-moana-cream rounded-xl">
                  <input
                    type="text"
                    placeholder="Nombre de la excursión"
                    value={exc.nombre}
                    onChange={(e) => setExcursiones((prev) => prev.map((x, j) => j === i ? { ...x, nombre: e.target.value } : x))}
                    className="input-field sm:col-span-5"
                  />
                  <div className="sm:col-span-3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-moana-gray text-sm font-semibold">USD</span>
                    <input
                      type="number"
                      placeholder="Precio"
                      value={exc.precio || ''}
                      onChange={(e) => setExcursiones((prev) => prev.map((x, j) => j === i ? { ...x, precio: Number(e.target.value) } : x))}
                      className="input-field pl-12"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={exc.descripcion || ''}
                    onChange={(e) => setExcursiones((prev) => prev.map((x, j) => j === i ? { ...x, descripcion: e.target.value } : x))}
                    className="input-field sm:col-span-3"
                  />
                  <button
                    onClick={() => setExcursiones((prev) => prev.filter((_, j) => j !== i))}
                    className="sm:col-span-1 text-red-400 hover:text-red-600 flex justify-center items-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addExcursion} className="btn-secondary flex items-center gap-2 text-sm">
                <Plus size={16} /> Agregar excursión
              </button>
              <button onClick={handleSaveExcursiones} className="btn-primary flex items-center gap-2 text-sm">
                <Save size={16} /> Guardar excursiones
              </button>
            </div>
          </div>
        )}

        {/* === TRASLADOS TAB === */}
        {activeTab === 'traslados' && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-moana-blue text-xl mb-5">Traslados</h2>
            <div className="space-y-3">
              {traslados.map((tr, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-moana-cream rounded-xl">
                  <input
                    type="text"
                    placeholder="Nombre del traslado"
                    value={tr.nombre}
                    onChange={(e) => setTraslados((prev) => prev.map((x, j) => j === i ? { ...x, nombre: e.target.value } : x))}
                    className="input-field sm:col-span-5"
                  />
                  <select
                    value={tr.tipo}
                    onChange={(e) => setTraslados((prev) => prev.map((x, j) => j === i ? { ...x, tipo: e.target.value } : x))}
                    className="input-field sm:col-span-2"
                  >
                    <option value="regular">Regular</option>
                    <option value="privado">Privado</option>
                  </select>
                  <div className="sm:col-span-3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-moana-gray text-sm font-semibold">USD</span>
                    <input
                      type="number"
                      placeholder="Precio"
                      value={tr.precio || ''}
                      onChange={(e) => setTraslados((prev) => prev.map((x, j) => j === i ? { ...x, precio: Number(e.target.value) } : x))}
                      className="input-field pl-12"
                    />
                  </div>
                  <button
                    onClick={() => setTraslados((prev) => prev.filter((_, j) => j !== i))}
                    className="sm:col-span-2 text-red-400 hover:text-red-600 flex justify-center items-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addTraslado} className="btn-secondary flex items-center gap-2 text-sm">
                <Plus size={16} /> Agregar traslado
              </button>
              <button onClick={handleSaveTraslados} className="btn-primary flex items-center gap-2 text-sm">
                <Save size={16} /> Guardar traslados
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
