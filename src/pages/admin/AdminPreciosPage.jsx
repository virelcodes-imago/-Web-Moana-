import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, CheckCircle, Settings, Edit3, Star, Eye, EyeOff, Search, Sparkles, Home, LogOut } from 'lucide-react';
import db from '../../db/db';
import { paquetesBase, TEMPORADAS, TEMPORADAS_BUZIOS, HOTELES } from '../../data/paquetes';
import { excursionesBase, trasladosBase } from '../../data/extras';
import useAuthStore from '../../store/authStore';

const HABITACIONES_POSADA = [
  { id: 'single', label: 'Single (1 pax)', emoji: '👤' },
  { id: 'doble', label: 'Doble (2 pax)', emoji: '👥' },
  { id: 'triple', label: 'Triple (3 pax)', emoji: '👨‍👩‍👦' },
  { id: 'cuadruple', label: 'Cuádruple (4 pax)', emoji: '👨‍👩‍👧‍👦' },
];

export default function AdminPreciosPage() {
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('paquetes');
  const [savedMsg, setSavedMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortField, setSortField] = useState('titulo');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <span className="opacity-30 text-xs ml-1 font-mono">↕</span>;
    }
    return sortDirection === 'asc' ? (
      <span className="text-moana-orange font-bold text-xs ml-1">▲</span>
    ) : (
      <span className="text-moana-orange font-bold text-xs ml-1">▼</span>
    );
  };

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

  // --- Posada Moana ---
  const [posadaMatrix, setPosadaMatrix] = useState({}); // key: `temporada-habitacion` → precio

  // --- Excursiones ---
  const [excursiones, setExcursiones] = useState(excursionesBase);

  // --- Traslados ---
  const [traslados, setTraslados] = useState(trasladosBase);

  // Cargar paquetes desde Dexie al iniciar
  const reloadPaquetes = async () => {
    const list = await db.paquetes.toArray();
    const final = list.length > 0 ? list : paquetesBase;
    setPaquetesList(final);
    if (final.length > 0 && !selectedPaquete) {
      setSelectedPaquete(final[0].id);
    }
  };

  useEffect(() => {
    reloadPaquetes();
  }, []);

  // Cargar tarifario de la Posada desde Dexie
  const reloadPosadaPrecios = async () => {
    try {
      const rows = await db.posadaPrecios.toArray();
      const map = {};
      rows.forEach((r) => { map[`${r.temporada}-${r.habitacion}`] = r.precio; });
      setPosadaMatrix(map);
    } catch {
      setPosadaMatrix({});
    }
  };

  useEffect(() => {
    reloadPosadaPrecios();
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
          activo: pkg.activo !== 0 && pkg.activo !== false,
          destacado: pkg.destacado === 1 || pkg.destacado === true
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
            destacado: Boolean(basePkg.destacado)
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

  // Cargar excursiones/traslados desde Dexie
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

  const handlePosadaPrecioChange = (temporada, habitacion, value) => {
    const key = `${temporada}-${habitacion}`;
    setPosadaMatrix((prev) => ({ ...prev, [key]: value === '' ? '' : Number(value) }));
  };

  const handleMetaChange = (key, val) => {
    setPaqueteMeta(prev => ({ ...prev, [key]: val }));
  };

  // Toggle directo de Publicación Activa / Inactiva desde la lista
  const handleToggleActivo = async (pkg, e) => {
    e?.stopPropagation();
    const currentIsActive = pkg.activo !== 0 && pkg.activo !== false;
    const newStatus = currentIsActive ? 0 : 1;
    
    await db.paquetes.update(pkg.id, { activo: newStatus });
    
    if (Number(selectedPaquete) === pkg.id) {
      setPaqueteMeta(prev => ({ ...prev, activo: newStatus === 1 }));
    }
    
    await reloadPaquetes();
    showSaved(newStatus === 1 ? `"${pkg.titulo}" ahora está PUBLICADO en la web.` : `"${pkg.titulo}" fue SACADO DE VENTA (oculto).`);
  };

  // Toggle directo de Destacado del Mes en Portada
  const handleToggleDestacado = async (pkg, e) => {
    e?.stopPropagation();
    const currentIsDestacado = pkg.destacado === 1 || pkg.destacado === true;
    const newDest = currentIsDestacado ? 0 : 1;
    
    await db.paquetes.update(pkg.id, { destacado: newDest });
    
    if (Number(selectedPaquete) === pkg.id) {
      setPaqueteMeta(prev => ({ ...prev, destacado: newDest === 1 }));
    }

    await reloadPaquetes();
    showSaved(newDest === 1 ? `⭐ "${pkg.titulo}" marcado como Destacado del Mes.` : `"${pkg.titulo}" ya no es Destacado del Mes.`);
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

    await reloadPaquetes();
    showSaved('¡Publicación y precios guardados correctamente!');
  };

  const handleSavePosada = async () => {
    await db.posadaPrecios.clear();
    const rows = [];
    for (const [key, precio] of Object.entries(posadaMatrix)) {
      if (precio === '' || precio === null) continue;
      const [temporada, habitacion] = key.split('-');
      rows.push({ temporada, habitacion, precio: Number(precio) });
    }
    await db.posadaPrecios.bulkAdd(rows);
    showSaved('¡Tarifario de la Posada Moana guardado exitosamente!');
  };

  const handleSaveExcursiones = async () => {
    await db.excursiones.clear();
    await db.excursiones.bulkAdd(excursiones.map(({ id: _id, ...e }) => e));

    const pkgMap = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
    const temporadas = ['baja', 'alta', 'semana_santa', 'vacaciones_invierno'];

    for (let i = 0; i < excursiones.length; i++) {
      const exc = excursiones[i];
      const pId = exc.paqueteId || pkgMap[exc.id] || pkgMap[i + 1];
      if (pId) {
        if (exc.nombre) {
          await db.paquetes.update(pId, { titulo: exc.nombre, descCorta: exc.descripcion || '' }).catch(() => {});
        }
        await db.precios.where({ paqueteId: pId }).delete().catch(() => {});
        if (exc.precio && Number(exc.precio) > 0) {
          const rows = temporadas.map(t => ({ paqueteId: pId, temporada: t, hotel: 'economico', precio: Number(exc.precio) }));
          await db.precios.bulkAdd(rows).catch(() => {});
        }
      }
    }

    await reloadPaquetes();
    showSaved('¡Excursiones guardadas y actualizadas en la web correctamente!');
  };

  const handleSaveTraslados = async () => {
    await db.traslados.clear();
    await db.traslados.bulkAdd(traslados.map(({ id: _id, ...t }) => t));

    const pkgMap = { 1: 40, 2: 41 };
    const temporadas = ['baja', 'alta', 'semana_santa', 'vacaciones_invierno'];

    for (let i = 0; i < traslados.length; i++) {
      const tras = traslados[i];
      const pId = tras.paqueteId || pkgMap[tras.id] || pkgMap[i + 1];
      if (pId) {
        if (tras.nombre) {
          await db.paquetes.update(pId, { titulo: tras.nombre }).catch(() => {});
        }
        await db.precios.where({ paqueteId: pId }).delete().catch(() => {});
        if (tras.precio && Number(tras.precio) > 0) {
          const rows = temporadas.map(t => ({ paqueteId: pId, temporada: t, hotel: 'economico', precio: Number(tras.precio) }));
          await db.precios.bulkAdd(rows).catch(() => {});
        }
      }
    }

    await reloadPaquetes();
    showSaved('¡Traslados guardados y actualizados en la web correctamente!');
  };

  const addExcursion = () => {
    setExcursiones((prev) => [...prev, { nombre: '', precio: 0, descripcion: '', porPersona: true, activo: true }]);
  };

  const addTraslado = () => {
    setTraslados((prev) => [...prev, { nombre: '', precio: 0, tipo: 'regular', activo: true }]);
  };

  const showSaved = (msg) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 4000);
  };

  // Filtrar y ordenar lista de publicaciones de viajes en el admin
  const paquetesFiltrados = paquetesList
    .filter((p) => {
      const isExcursionOrTrasladoPkg = p.noches === null || p.categoria === 'traslados_excursiones' || p.categoria === 'traslados' || p.categoria === 'excursiones';
      if (isExcursionOrTrasladoPkg) return false;
      if (!searchFilter.trim()) return true;
      const term = searchFilter.toLowerCase().trim();
      return (
        p.titulo.toLowerCase().includes(term) ||
        (p.categoria && p.categoria.toLowerCase().includes(term)) ||
        (p.subtitulo && p.subtitulo.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortField === 'titulo') {
        valA = a.titulo.toLowerCase();
        valB = b.titulo.toLowerCase();
      } else if (sortField === 'categoria') {
        valA = (a.categoria || '').toLowerCase();
        valB = (b.categoria || '').toLowerCase();
      } else if (sortField === 'activo') {
        valA = a.activo !== 0 && a.activo !== false ? 1 : 0;
        valB = b.activo !== 0 && b.activo !== false ? 1 : 0;
      } else if (sortField === 'destacado') {
        valA = a.destacado === 1 || a.destacado === true ? 1 : 0;
        valB = b.destacado === 1 || b.destacado === true ? 1 : 0;
      } else {
        valA = a.orden || 99;
        valB = b.orden || 99;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPublicados = paquetesList.filter(p => p.activo !== 0 && p.activo !== false).length;
  const totalDestacados = paquetesList.filter(p => p.destacado === 1 || p.destacado === true).length;

  const selectedPkg = paquetesList.find(p => p.id === Number(selectedPaquete));
  const isExcursionOrTraslado = selectedPkg?.noches === null || selectedPkg?.categoria === 'traslados_excursiones' || selectedPkg?.categoria === 'traslados' || selectedPkg?.categoria === 'excursiones';
  const isInternationalPkg = selectedPkg?.categoria === 'internacional';
  const isNacionalPkg = selectedPkg?.categoria === 'nacional';
  const isBuziosPkg = selectedPkg?.categoria === 'buzios' || selectedPkg?.slug?.includes('buzios');

  const temporadasMatrix = isBuziosPkg ? TEMPORADAS_BUZIOS : TEMPORADAS;
  const columnsMatrix = isInternationalPkg
    ? [
        { id: 'economico', label: 'Con Desayuno' },
        { id: 'premium',   label: 'All Inclusive' },
      ]
    : HOTELES;

  return (
    <div className="min-h-screen bg-moana-cream pb-16">
      {/* Header */}
      <div className="bg-moana-blue text-white py-8 shadow-md">
        <div className="container-moana">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-moana-orange rounded-2xl flex items-center justify-center shadow-lg">
                <Settings size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl md:text-3xl">Panel Admin — Moana Turismo</h1>
                <p className="text-white/70 text-sm">Control total de publicaciones, destacados del mes, posada y precios</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="/" target="_blank" rel="noreferrer"
                 className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-white font-semibold border border-white/20 transition-all flex items-center gap-2">
                <Eye size={14} /> Ver Web Pública
              </a>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/admin';
                }}
                className="text-xs bg-red-500/20 hover:bg-red-500 text-white px-3.5 py-2.5 rounded-xl font-semibold border border-red-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Cerrar sesión de administrador"
              >
                <LogOut size={14} /> Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success notification toast */}
      {savedMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-6 py-4 rounded-2xl
                        shadow-2xl flex items-center gap-3 animate-bounce font-medium text-sm">
          <CheckCircle size={20} className="flex-shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="container-moana py-8 space-y-8">

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 flex items-center justify-between border-l-4 border-moana-blue">
            <div>
              <p className="text-moana-gray text-xs font-semibold uppercase">Total Publicaciones</p>
              <p className="text-2xl font-bold text-moana-blue mt-1">{paquetesList.length}</p>
            </div>
            <div className="w-10 h-10 bg-moana-blue-pale rounded-full flex items-center justify-center text-moana-blue">
              <Home size={20} />
            </div>
          </div>
          <div className="card p-5 flex items-center justify-between border-l-4 border-green-500">
            <div>
              <p className="text-moana-gray text-xs font-semibold uppercase">Publicados en Web</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totalPublicados}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Eye size={20} />
            </div>
          </div>
          <div className="card p-5 flex items-center justify-between border-l-4 border-amber-500">
            <div>
              <p className="text-moana-gray text-xs font-semibold uppercase font-bold text-amber-600">Destacados Portada</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{totalDestacados}</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
              <Star size={20} className="fill-amber-500" />
            </div>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-gray-200 gap-2">
          <button
            onClick={() => setActiveTab('paquetes')}
            className={`px-6 py-3 font-semibold text-sm rounded-t-xl transition-all ${
              activeTab === 'paquetes'
                ? 'bg-moana-blue text-white shadow-sm'
                : 'bg-white text-moana-gray hover:text-moana-blue'
            }`}
          >
            ✈️ Paquetes de Viajes
          </button>
          <button
            onClick={() => setActiveTab('excursiones')}
            className={`px-6 py-3 font-semibold text-sm rounded-t-xl transition-all ${
              activeTab === 'excursiones'
                ? 'bg-moana-blue text-white shadow-sm'
                : 'bg-white text-moana-gray hover:text-moana-blue'
            }`}
          >
            ⛵ Excursiones & Traslados
          </button>
        </div>

        {/* TAB 1: PAQUETES DE VIAJES */}
        {activeTab === 'paquetes' && (
          <div className="space-y-8">

            {/* 1. GESTIÓN RÁPIDA DE PUBLICACIONES */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display font-bold text-moana-blue text-xl flex items-center gap-2">
                    <Sparkles size={20} className="text-moana-orange" />
                    Gestión Rápida de Publicaciones en la Web
                  </h2>
                  <p className="text-moana-gray text-sm mt-0.5">
                    Hacé clic en los nombres de columna para ordenar A-Z / Z-A o usar la búsqueda rápida.
                  </p>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 w-full sm:w-80">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-moana-gray" />
                    <input
                      type="text"
                      placeholder="🔍 Búsqueda rápida por título..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-moana-orange shadow-sm"
                    />
                    {searchFilter && (
                      <button
                        onClick={() => setSearchFilter('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold bg-gray-100 hover:bg-gray-200 w-4 h-4 rounded-full flex items-center justify-center"
                        title="Limpiar búsqueda"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-moana-gray font-semibold whitespace-nowrap bg-moana-blue-pale/80 px-2.5 py-1.5 rounded-lg border border-moana-teal/20">
                    {paquetesFiltrados.length} pub.
                  </span>
                </div>
              </div>

              {/* Package list table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-moana-blue-pale text-left text-moana-blue text-xs uppercase tracking-wider select-none">
                      <th
                        onClick={() => handleSort('titulo')}
                        className="px-4 py-3 rounded-l-xl cursor-pointer hover:bg-moana-blue/10 transition-colors"
                        title="Hacé clic para ordenar por título"
                      >
                        <div className="flex items-center gap-1">
                          <span>Publicación</span>
                          {renderSortIndicator('titulo')}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('categoria')}
                        className="px-4 py-3 cursor-pointer hover:bg-moana-blue/10 transition-colors"
                        title="Hacé clic para ordenar por categoría"
                      >
                        <div className="flex items-center gap-1">
                          <span>Categoría</span>
                          {renderSortIndicator('categoria')}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('activo')}
                        className="px-4 py-3 text-center cursor-pointer hover:bg-moana-blue/10 transition-colors"
                        title="Hacé clic para ordenar por estado en web"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Estado en Web</span>
                          {renderSortIndicator('activo')}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('destacado')}
                        className="px-4 py-3 text-center cursor-pointer hover:bg-moana-blue/10 transition-colors"
                        title="Hacé clic para ordenar por destacado del mes"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Destacado Portada</span>
                          {renderSortIndicator('destacado')}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center rounded-r-xl">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paquetesFiltrados.map((pkg) => {
                      const isActive = pkg.activo !== 0 && pkg.activo !== false;
                      const isSelected = Number(selectedPaquete) === pkg.id;

                      return (
                        <tr
                          key={pkg.id}
                          className={`hover:bg-moana-cream/50 transition-colors ${
                            isSelected ? 'bg-moana-orange-light/20 font-medium' : ''
                          }`}
                        >
                          {/* Title & thumb */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={pkg.imagen}
                                alt={pkg.titulo}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                                onError={(e) => { e.target.src = '/fotos/home.jpg'; }}
                              />
                              <div>
                                <p className="font-bold text-moana-blue text-sm">{pkg.titulo}</p>
                                <p className="text-moana-gray text-xs">{pkg.subtitulo || 'Sin subtítulo'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3 text-xs text-moana-gray font-semibold capitalize">
                            {pkg.categoria}
                          </td>

                          {/* Publicado toggle button */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={(e) => handleToggleActivo(pkg, e)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                isActive
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                              }`}
                              title={isActive ? "Hacé clic para ocultar de la web" : "Hacé clic para publicar en la web"}
                            >
                              {isActive ? (
                                <>
                                  <Eye size={14} /> 🟢 Publicado
                                </>
                              ) : (
                                <>
                                  <EyeOff size={14} /> 🔴 Oculto
                                </>
                              )}
                            </button>
                          </td>

                          {/* Destacado del Mes toggle button */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={(e) => handleToggleDestacado(pkg, e)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                isDestacado
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                              }`}
                              title={isDestacado ? "Hacé clic para quitar de destacados" : "Hacé clic para mostrar en destacados del mes"}
                            >
                              <Star size={14} className={isDestacado ? "fill-amber-500 text-amber-500" : "text-gray-400"} />
                              {isDestacado ? "⭐ Destacado del Mes" : "☆ Normal"}
                            </button>
                          </td>

                          {/* Action edit button */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedPaquete(pkg.id);
                                const el = document.getElementById('editor-formulario');
                                el?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-moana-blue text-white shadow'
                                  : 'bg-moana-blue-pale text-moana-blue hover:bg-moana-orange hover:text-white'
                              }`}
                            >
                              ✏️ Editar Precios y Datos
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. EDITOR DE METADATOS Y MATRIZ DE PRECIOS */}
            <div id="editor-formulario" className="space-y-6 scroll-mt-6">
              <div className="card p-6">
                <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Edit3 size={20} className="text-moana-orange" />
                    <h2 className="font-display font-bold text-moana-blue text-xl">
                      Editor Detallado de Publicación y Precios
                    </h2>
                  </div>
                  <span className="text-xs bg-moana-orange-light text-moana-orange font-bold px-3 py-1 rounded-full">
                    ID #{selectedPaquete}
                  </span>
                </div>

                <div className="mb-6">
                  <label className="label-field text-sm mb-1 block">Seleccionar publicación a modificar:</label>
                  <select
                    value={selectedPaquete || ''}
                    onChange={(e) => setSelectedPaquete(e.target.value)}
                    className="input-field max-w-md font-semibold text-moana-blue text-base"
                  >
                    {paquetesList.map((p) => {
                      const isActive = p.activo !== 0 && p.activo !== false;
                      const isDest = p.destacado === 1 || p.destacado === true;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.titulo} {isActive ? '🟢' : '🔴'} {isDest ? '⭐' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Campos de metadatos */}
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

                  {/* Toggles en el form */}
                  <div className="sm:col-span-2 flex flex-wrap gap-6 pt-3 bg-moana-cream/50 p-4 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paqueteMeta.activo}
                        onChange={(e) => handleMetaChange('activo', e.target.checked)}
                        className="accent-moana-orange w-5 h-5"
                      />
                      <span className="font-semibold text-sm text-moana-dark select-none flex items-center gap-1.5">
                        <Eye size={16} className={paqueteMeta.activo ? "text-green-600" : "text-gray-400"} />
                        Mostrar en la Web (Publicación Activa)
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paqueteMeta.destacado}
                        onChange={(e) => handleMetaChange('destacado', e.target.checked)}
                        className="accent-moana-orange w-5 h-5"
                      />
                      <span className="font-semibold text-sm text-moana-dark select-none flex items-center gap-1.5">
                        <Star size={16} className={paqueteMeta.destacado ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
                        Destacar en Portada (Destacados del Mes ⭐)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Matriz de Precios */}
              <div className="card p-6">
                <h2 className="font-display font-bold text-moana-blue text-xl mb-1">
                  {isInternationalPkg
                    ? 'Precio de Salida Grupal Internacional (USD)'
                    : isNacionalPkg
                    ? 'Tarifario Nacional por Temporada (USD)'
                    : isExcursionOrTraslado
                    ? 'Tarifario del Servicio / Excursión (USD)'
                    : 'Matriz de Precios de Venta (USD)'}
                </h2>
                <p className="text-moana-gray text-sm mb-5">
                  {isInternationalPkg
                    ? 'Ingresá el precio único final por persona para este paquete de Salida Grupal Acompañada. Si lo dejás vacío, figurará como CONSULTAR.'
                    : isNacionalPkg
                    ? 'Ingresá el precio final en USD por persona para cada temporada. Sin diferenciación de hotel.'
                    : isExcursionOrTraslado
                    ? 'Ingresá el precio final en USD por persona / servicio para cada temporada.'
                    : 'Ingresá el precio final en USD por persona (base doble) para cada combinación de Temporada y Categoría de Hotel.'}
                </p>

                <div className="overflow-x-auto">
                  {isInternationalPkg ? (
                    <div className="p-5 bg-moana-cream/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-lg border border-moana-teal/20">
                      <div>
                        <p className="font-bold text-moana-blue text-base">Precio Único por Pasajero (USD)</p>
                        <p className="text-xs text-moana-gray mt-0.5">Aplica a todas las fechas de la salida grupal</p>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-moana-gray font-semibold text-sm">USD</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Consultar"
                          value={precioMatrix['baja-economico'] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            ['baja', 'alta', 'semana_santa', 'vacaciones_invierno'].forEach((t) => {
                              handlePrecioChange(t, 'economico', val);
                              handlePrecioChange(t, 'familiar', val);
                              handlePrecioChange(t, 'premium', val);
                            });
                          }}
                          className="w-44 pl-12 pr-3 py-2.5 border border-gray-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-moana-orange font-bold text-moana-blue text-lg shadow-sm"
                        />
                      </div>
                    </div>
                  ) : isNacionalPkg || isExcursionOrTraslado ? (
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-moana-blue-pale">
                          <th className="text-left px-4 py-3 text-moana-blue font-semibold rounded-l-xl">
                            Temporada
                          </th>
                          <th className="px-4 py-3 text-moana-blue font-semibold text-center rounded-r-xl">
                            Precio en USD por Persona (Vacío = CONSULTAR)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {temporadasMatrix.map((t, ti) => (
                          <tr key={t.id} className={ti % 2 === 0 ? 'bg-white' : 'bg-moana-cream'}>
                            <td className="px-4 py-3 font-medium text-moana-dark">{t.label}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="relative inline-block">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-moana-gray font-semibold text-sm">
                                  USD
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Consultar"
                                  value={precioMatrix[`${t.id}-economico`] ?? ''}
                                  onChange={(e) => {
                                    handlePrecioChange(t.id, 'economico', e.target.value);
                                    handlePrecioChange(t.id, 'familiar', e.target.value);
                                    handlePrecioChange(t.id, 'premium', e.target.value);
                                  }}
                                  className="w-44 pl-12 pr-3 py-2 border border-gray-200 rounded-lg text-center
                                             focus:outline-none focus:ring-2 focus:ring-moana-orange text-moana-dark font-semibold"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-moana-blue-pale">
                          <th className="text-left px-4 py-3 text-moana-blue font-semibold rounded-l-xl">
                            Temporada
                          </th>
                          {columnsMatrix.map((h) => (
                            <th key={h.id} className="px-4 py-3 text-moana-blue font-semibold text-center">
                              {h.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {temporadasMatrix.map((t, ti) => (
                          <tr key={t.id} className={ti % 2 === 0 ? 'bg-white' : 'bg-moana-cream'}>
                            <td className="px-4 py-3 font-medium text-moana-dark">{t.label}</td>
                            {columnsMatrix.map((h) => (
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
                                    className="w-32 pl-12 pr-3 py-2 border border-gray-200 rounded-lg text-center
                                               focus:outline-none focus:ring-2 focus:ring-moana-orange text-moana-dark font-semibold"
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSavePaquete}
                    className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base shadow-lg"
                  >
                    <Save size={20} /> Guardar Cambios en la Web
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === POSADA MOANA TAB === */}
        {activeTab === 'posada' && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-2 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-moana-teal/20 rounded-xl flex items-center justify-center text-moana-blue">
                  <Home size={22} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-moana-blue text-xl">
                    Tarifario Exclusivo Posada Moana B&B (Búzios)
                  </h2>
                  <p className="text-moana-gray text-sm">
                    Establecé la tarifa en USD por noche/persona según la ocupación de la habitación (Single, Doble, Triple, Cuádruple) y la temporada.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto mt-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-moana-blue-pale">
                      <th className="text-left px-4 py-3 text-moana-blue font-semibold rounded-l-xl">
                        Temporada
                      </th>
                      {HABITACIONES_POSADA.map((hab) => (
                        <th key={hab.id} className="px-4 py-3 text-moana-blue font-semibold text-center">
                          {hab.emoji} {hab.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TEMPORADAS.map((temp, ti) => (
                      <tr key={temp.id} className={ti % 2 === 0 ? 'bg-white' : 'bg-moana-cream'}>
                        <td className="px-4 py-3 font-semibold text-moana-blue">{temp.label}</td>
                        {HABITACIONES_POSADA.map((hab) => (
                          <td key={hab.id} className="px-4 py-3">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-moana-gray font-semibold text-xs">
                                USD
                              </span>
                              <input
                                type="number"
                                min="0"
                                placeholder="—"
                                value={posadaMatrix[`${temp.id}-${hab.id}`] ?? ''}
                                onChange={(e) => handlePosadaPrecioChange(temp.id, hab.id, e.target.value)}
                                className="w-28 pl-10 pr-2 py-2 border border-gray-200 rounded-lg text-center
                                           focus:outline-none focus:ring-2 focus:ring-moana-orange text-moana-dark font-semibold text-sm"
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSavePosada}
                  className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base shadow-lg"
                >
                  <Save size={20} /> Guardar Tarifario Posada Moana
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === EXCURSIONES TAB === */}
        {activeTab === 'excursiones' && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-moana-blue text-xl mb-5">Excursiones Adicionales</h2>
            <div className="space-y-3">
              {excursiones.map((exc, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-moana-cream rounded-xl items-center">
                  <input
                    type="text"
                    placeholder="Nombre de la excursión"
                    value={exc.nombre}
                    onChange={(e) => setExcursiones((prev) => prev.map((x, j) => j === i ? { ...x, nombre: e.target.value } : x))}
                    className="input-field sm:col-span-5 font-semibold text-moana-blue"
                  />
                  <div className="sm:col-span-3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-moana-gray text-sm font-semibold">USD</span>
                    <input
                      type="number"
                      placeholder="Precio"
                      value={exc.precio || ''}
                      onChange={(e) => setExcursiones((prev) => prev.map((x, j) => j === i ? { ...x, precio: Number(e.target.value) } : x))}
                      className="input-field pl-12 font-semibold"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={exc.descripcion || ''}
                    onChange={(e) => setExcursiones((prev) => prev.map((x, j) => j === i ? { ...x, descripcion: e.target.value } : x))}
                    className="input-field sm:col-span-3 text-xs"
                  />
                  <button
                    onClick={() => setExcursiones((prev) => prev.filter((_, j) => j !== i))}
                    className="sm:col-span-1 text-red-400 hover:text-red-600 flex justify-center items-center p-2"
                    title="Eliminar excursión"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addExcursion} className="btn-secondary flex items-center gap-2 text-sm">
                <Plus size={16} /> Agregar Excursión
              </button>
              <button onClick={handleSaveExcursiones} className="btn-primary flex items-center gap-2 text-sm">
                <Save size={16} /> Guardar Excursiones
              </button>
            </div>
          </div>
        )}

        {/* === TRASLADOS TAB === */}
        {activeTab === 'traslados' && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-moana-blue text-xl mb-5">Traslados Adicionales</h2>
            <div className="space-y-3">
              {traslados.map((tr, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-moana-cream rounded-xl items-center">
                  <input
                    type="text"
                    placeholder="Nombre del traslado"
                    value={tr.nombre}
                    onChange={(e) => setTraslados((prev) => prev.map((x, j) => j === i ? { ...x, nombre: e.target.value } : x))}
                    className="input-field sm:col-span-5 font-semibold text-moana-blue"
                  />
                  <select
                    value={tr.tipo}
                    onChange={(e) => setTraslados((prev) => prev.map((x, j) => j === i ? { ...x, tipo: e.target.value } : x))}
                    className="input-field sm:col-span-2 text-xs"
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
                      className="input-field pl-12 font-semibold"
                    />
                  </div>
                  <button
                    onClick={() => setTraslados((prev) => prev.filter((_, j) => j !== i))}
                    className="sm:col-span-2 text-red-400 hover:text-red-600 flex justify-center items-center p-2"
                    title="Eliminar traslado"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addTraslado} className="btn-secondary flex items-center gap-2 text-sm">
                <Plus size={16} /> Agregar Traslado
              </button>
              <button onClick={handleSaveTraslados} className="btn-primary flex items-center gap-2 text-sm">
                <Save size={16} /> Guardar Traslados
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
