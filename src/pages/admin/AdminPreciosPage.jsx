import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, CheckCircle, Settings, Edit3, Star, Eye, EyeOff, Search, Sparkles, Home, LogOut, Key, X } from 'lucide-react';
import db, { saveAdminOverride } from '../../db/db';
import { paquetesBase, TEMPORADAS, TEMPORADAS_BUZIOS, HOTELES, isExcursionOrTransfer } from '../../data/paquetes';
import { excursionesBase, trasladosBase } from '../../data/extras';
import useAuthStore from '../../store/authStore';

const HABITACIONES_POSADA = [
  { id: 'single', label: 'Single (1 pax)', emoji: '👤' },
  { id: 'doble', label: 'Doble (2 pax)', emoji: '👥' },
  { id: 'triple', label: 'Triple (3 pax)', emoji: '👨‍👩‍👦' },
  { id: 'cuadruple', label: 'Cuádruple (4 pax)', emoji: '👨‍👩‍👧‍👦' },
];

export default function AdminPreciosPage() {
  const { logout, adminPin, sellerPin, updatePins } = useAuthStore();
  const [activeTab, setActiveTab] = useState('paquetes');
  const [savedMsg, setSavedMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortField, setSortField] = useState('titulo');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modal para cambiar PINs de acceso
  const [showPinModal, setShowPinModal] = useState(false);
  const [newAdminPinInput, setNewAdminPinInput] = useState(adminPin || '1234');
  const [newSellerPinInput, setNewSellerPinInput] = useState(sellerPin || '0000');

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
    incluye: '',
    noIncluye: '',
    activo: true,
    destacado: false
  });

  // --- Posada Moana ---
  const [posadaMatrix, setPosadaMatrix] = useState({}); // key: `temporada-habitacion` → precio
  const [posadaMeta, setPosadaMeta] = useState({ activo: true, destacado: false });

  // --- Excursiones ---
  const [excursiones, setExcursiones] = useState(excursionesBase);
  const [excDestinoFiltro, setExcDestinoFiltro] = useState('todos');
  const [excSearchTerm, setExcSearchTerm] = useState('');

  // --- Traslados ---
  const [traslados, setTraslados] = useState(trasladosBase);
  const [trasDestinoFiltro, setTrasDestinoFiltro] = useState('todos');
  const [trasSearchTerm, setTrasSearchTerm] = useState('');

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

  // Cargar estado activo/destacado de la Posada (id: 30) desde Dexie
  const reloadPosadaMeta = async () => {
    try {
      const pkg = await db.paquetes.get(30);
      if (pkg) {
        setPosadaMeta({
          activo: pkg.activo !== 0 && pkg.activo !== false,
          destacado: pkg.destacado === 1 || pkg.destacado === true,
        });
      }
    } catch {
      // usar default
    }
  };

  useEffect(() => {
    reloadPosadaMeta();
  }, []);

  const handleTogglePosadaActivo = async () => {
    const newStatus = posadaMeta.activo ? 0 : 1;
    await db.paquetes.update(30, { activo: newStatus });
    saveAdminOverride(30, { activo: newStatus === 1 });
    setPosadaMeta(prev => ({ ...prev, activo: newStatus === 1 }));
    await reloadPaquetes();
    showSaved(newStatus === 1 ? '🏡 Posada ahora está PUBLICADA en la web.' : '🏡 Posada fue OCULTADA de la web.');
  };

  const handleTogglePosadaDestacado = async () => {
    const newDest = posadaMeta.destacado ? 0 : 1;
    await db.paquetes.update(30, { destacado: newDest });
    saveAdminOverride(30, { destacado: newDest === 1 });
    setPosadaMeta(prev => ({ ...prev, destacado: newDest === 1 }));
    await reloadPaquetes();
    showSaved(newDest === 1 ? '⭐ Posada marcada como Destacada del Mes.' : 'Posada ya no es Destacada del Mes.');
  };

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
          incluye: Array.isArray(pkg.incluye) ? pkg.incluye.join('\n') : '',
          noIncluye: Array.isArray(pkg.noIncluye) ? pkg.noIncluye.join('\n') : '',
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
            incluye: Array.isArray(basePkg.incluye) ? basePkg.incluye.join('\n') : '',
            noIncluye: Array.isArray(basePkg.noIncluye) ? basePkg.noIncluye.join('\n') : '',
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
    // Guardar en localStorage para sobrevivir resets de IndexedDB
    saveAdminOverride(pkg.id, { activo: newStatus === 1 });
    
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
    // Guardar en localStorage para sobrevivir resets de IndexedDB
    saveAdminOverride(pkg.id, { destacado: newDest === 1 });
    
    if (Number(selectedPaquete) === pkg.id) {
      setPaqueteMeta(prev => ({ ...prev, destacado: newDest === 1 }));
    }

    await reloadPaquetes();
    showSaved(newDest === 1 ? `⭐ "${pkg.titulo}" marcado como Destacado del Mes.` : `"${pkg.titulo}" ya no es Destacado del Mes.`);
  };

  const handleSavePaquete = async () => {
    const pId = Number(selectedPaquete);
    const parseItems = (value) => String(value || '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    
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
      incluye: parseItems(paqueteMeta.incluye),
      noIncluye: parseItems(paqueteMeta.noIncluye),
    };
    await db.paquetes.put(updatedPkg);
    // Guardar en localStorage para que los cambios de visibilidad sobrevivan resets del navegador
    saveAdminOverride(pId, { activo: paqueteMeta.activo, destacado: paqueteMeta.destacado });

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
    setExcursiones((prev) => [
      ...prev,
      {
        nombre: '',
        precio: 0,
        precioAlta: '',
        precioSemanaSanta: '',
        precioVacacionesInvierno: '',
        descripcion: '',
        destino: excDestinoFiltro !== 'todos' ? excDestinoFiltro : 'buzios',
        porPersona: true,
        activo: true,
      },
    ]);
  };

  const addTraslado = () => {
    setTraslados((prev) => [
      ...prev,
      {
        nombre: '',
        precio: 0,
        precioAlta: '',
        precioSemanaSanta: '',
        precioVacacionesInvierno: '',
        tipo: 'regular',
        destino: trasDestinoFiltro !== 'todos' ? trasDestinoFiltro : 'buzios',
        activo: true,
      },
    ]);
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
  const totalDestacados = paquetesList.filter(
    (p) => (p.destacado === 1 || p.destacado === true) && !isExcursionOrTransfer(p)
  ).length;

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
              <button
                onClick={() => {
                  setNewAdminPinInput(adminPin || '1234');
                  setNewSellerPinInput(sellerPin || '0000');
                  setShowPinModal(true);
                }}
                className="text-xs bg-moana-orange hover:bg-moana-orange-dark text-white px-3.5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Cambiar PINs de acceso"
              >
                <Key size={14} /> Cambiar Claves
              </button>
              <a href="/" target="_blank" rel="noreferrer"
                 className="text-xs bg-white/10 hover:bg-white/20 px-3.5 py-2.5 rounded-xl text-white font-semibold border border-white/20 transition-all flex items-center gap-2">
                <Eye size={14} /> Ver Web
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
        <div className="flex flex-wrap border-b border-gray-200 gap-2">
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
            onClick={() => setActiveTab('posada')}
            className={`px-6 py-3 font-semibold text-sm rounded-t-xl transition-all ${
              activeTab === 'posada'
                ? 'bg-moana-blue text-white shadow-sm'
                : 'bg-white text-moana-gray hover:text-moana-blue'
            }`}
          >
            🏡 Alojamiento
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
                      const isDestacado = pkg.destacado === 1 || pkg.destacado === true;
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

                  <div>
                    <label className="label-field text-green-700">Qué incluye</label>
                    <p className="text-xs text-moana-gray mb-2">Escribí un concepto por línea.</p>
                    <textarea
                      value={paqueteMeta.incluye}
                      rows="7"
                      placeholder={'Aéreos ida y vuelta\nHotel con desayuno\nTraslados'}
                      onChange={(e) => handleMetaChange('incluye', e.target.value)}
                      className="input-field py-3 text-sm leading-relaxed border-green-200 focus:ring-green-500"
                    ></textarea>
                  </div>

                  <div>
                    <label className="label-field text-red-700">Qué no incluye</label>
                    <p className="text-xs text-moana-gray mb-2">Escribí un concepto por línea.</p>
                    <textarea
                      value={paqueteMeta.noIncluye}
                      rows="7"
                      placeholder={'Excursiones opcionales\nComidas no especificadas\nTasas locales'}
                      onChange={(e) => handleMetaChange('noIncluye', e.target.value)}
                      className="input-field py-3 text-sm leading-relaxed border-red-200 focus:ring-red-500"
                    ></textarea>
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
                          onFocus={(e) => e.target.select()}
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
                                  onFocus={(e) => e.target.select()}
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
                                    onFocus={(e) => e.target.select()}
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
            {/* Controles de visibilidad y destacado */}
            <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-moana-blue text-base flex items-center gap-2">
                  <Home size={18} /> Posada Moana B&B — Visibilidad en la web
                </h3>
                <p className="text-xs text-moana-gray mt-0.5">Controlá si la Posada aparece publicada y si figura como destacada en la portada.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleTogglePosadaActivo}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    posadaMeta.activo
                      ? 'bg-green-100 border-green-300 text-green-800 hover:bg-red-50 hover:border-red-300 hover:text-red-700'
                      : 'bg-red-100 border-red-300 text-red-700 hover:bg-green-50 hover:border-green-300 hover:text-green-800'
                  }`}
                >
                  {posadaMeta.activo ? <><Eye size={15}/> Publicada</> : <><EyeOff size={15}/> Oculta</>}
                </button>
                <button
                  onClick={handleTogglePosadaDestacado}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    posadaMeta.destacado
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700'
                  }`}
                >
                  <Star size={15} className={posadaMeta.destacado ? 'fill-yellow-500' : ''} />
                  {posadaMeta.destacado ? 'Destacada del Mes' : 'No Destacada'}
                </button>
              </div>
            </div>

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
                                onFocus={(e) => e.target.select()}
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
          <div className="card p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="font-display font-bold text-moana-blue text-xl flex items-center gap-2">
                  🗺️ Excursiones Adicionales
                </h2>
                <p className="text-xs text-moana-gray mt-1">
                  Gestioná los precios por temporada (Baja, Alta, Semana Santa, Invierno) y asigná cada excursión a su destino.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Filtro por Destino */}
                <select
                  value={excDestinoFiltro}
                  onChange={(e) => setExcDestinoFiltro(e.target.value)}
                  className="input-field text-xs py-2 bg-moana-blue-pale/50 font-semibold text-moana-blue"
                >
                  <option value="todos">🌐 Todos los Destinos ({excursiones.length})</option>
                  <option value="buzios">🌴 Búzios / Río de Janeiro</option>
                  <option value="cancun">🏖️ Cancún / Playa del Carmen</option>
                  <option value="cataratas">🌊 Cataratas del Iguazú</option>
                  <option value="ushuaia">🐧 Ushuaia</option>
                  <option value="calafate">🧊 El Calafate</option>
                  <option value="salta">🏔️ Salta</option>
                  <option value="bariloche">🌲 Bariloche</option>
                  <option value="mendoza">🍷 Mendoza</option>
                  <option value="bayahibe">🇩🇴 Miches / Bayahíbe</option>
                  <option value="jamaica">🇯🇲 Jamaica</option>
                  <option value="peru">🇵🇪 Perú / Machu Picchu</option>
                </select>

                {/* Buscador */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-moana-gray" />
                  <input
                    type="text"
                    placeholder="Buscar excursión..."
                    value={excSearchTerm}
                    onChange={(e) => setExcSearchTerm(e.target.value)}
                    className="input-field text-xs py-2 pl-8 w-44"
                  />
                </div>
              </div>
            </div>

            {/* Excursiones Grid/List */}
            <div className="space-y-4">
              {excursiones
                .filter((exc) => {
                  const matchDest = excDestinoFiltro === 'todos' || (exc.destino || '').toLowerCase() === excDestinoFiltro.toLowerCase();
                  const matchSearch = excSearchTerm === '' || exc.nombre.toLowerCase().includes(excSearchTerm.toLowerCase());
                  return matchDest && matchSearch;
                })
                .map((exc, idx) => {
                  const realIndex = excursiones.findIndex((x) => x === exc);
                  return (
                    <div key={realIndex} className="p-4 bg-moana-cream rounded-2xl border border-gray-100 space-y-3 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        {/* Nombre */}
                        <div className="md:col-span-4">
                          <label className="text-[10px] font-semibold text-moana-gray uppercase tracking-wider block mb-1">
                            Nombre de Excursión
                          </label>
                          <input
                            type="text"
                            placeholder="Nombre de la excursión"
                            value={exc.nombre}
                            onChange={(e) =>
                              setExcursiones((prev) =>
                                prev.map((x, j) => (j === realIndex ? { ...x, nombre: e.target.value } : x))
                              )
                            }
                            className="input-field text-xs font-bold text-moana-blue"
                          />
                        </div>

                        {/* Destino */}
                        <div className="md:col-span-3">
                          <label className="text-[10px] font-semibold text-moana-gray uppercase tracking-wider block mb-1">
                            Destino Asignado
                          </label>
                          <select
                            value={exc.destino || 'buzios'}
                            onChange={(e) =>
                              setExcursiones((prev) =>
                                prev.map((x, j) => (j === realIndex ? { ...x, destino: e.target.value } : x))
                              )
                            }
                            className="input-field text-xs font-medium"
                          >
                            <option value="buzios">🌴 Búzios / Río</option>
                            <option value="cancun">🏖️ Cancún / Playa</option>
                            <option value="cataratas">🌊 Cataratas Iguazú</option>
                            <option value="ushuaia">🐧 Ushuaia</option>
                            <option value="calafate">🧊 El Calafate</option>
                            <option value="salta">🏔️ Salta</option>
                            <option value="bariloche">🌲 Bariloche</option>
                            <option value="mendoza">🍷 Mendoza</option>
                            <option value="bayahibe">🇩🇴 Miches / Bayahíbe</option>
                            <option value="jamaica">🇯🇲 Jamaica</option>
                            <option value="peru">🇵🇪 Perú / Machu</option>
                          </select>
                        </div>

                        {/* Descripción */}
                        <div className="md:col-span-4">
                          <label className="text-[10px] font-semibold text-moana-gray uppercase tracking-wider block mb-1">
                            Descripción / Incluye
                          </label>
                          <input
                            type="text"
                            placeholder="Detalle o duración..."
                            value={exc.descripcion || ''}
                            onChange={(e) =>
                              setExcursiones((prev) =>
                                prev.map((x, j) => (j === realIndex ? { ...x, descripcion: e.target.value } : x))
                              )
                            }
                            className="input-field text-xs"
                          />
                        </div>

                        {/* Eliminar */}
                        <div className="md:col-span-1 flex justify-end">
                          <button
                            onClick={() => setExcursiones((prev) => prev.filter((_, j) => j !== realIndex))}
                            className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Eliminar excursión"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Desglose de Tarifas por Temporada (USD) */}
                      <div className="bg-white p-3 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-moana-blue uppercase tracking-wider mb-2 flex items-center gap-1">
                          📅 Tarifas por Temporada (USD por persona)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-[10px] font-medium text-moana-gray block mb-1">Temp. Baja (Base)</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-moana-gray font-bold">USD</span>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={exc.precio ?? ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  setExcursiones((prev) =>
                                    prev.map((x, j) => (j === realIndex ? { ...x, precio: Number(e.target.value) } : x))
                                  )
                                }
                                className="w-full pl-9 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-moana-dark text-center focus:ring-1 focus:ring-moana-orange"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-medium text-moana-gray block mb-1">Temp. Alta</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-moana-gray font-bold">USD</span>
                              <input
                                type="number"
                                min="0"
                                placeholder={exc.precio || 'Base'}
                                value={exc.precioAlta ?? ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  setExcursiones((prev) =>
                                    prev.map((x, j) => (j === realIndex ? { ...x, precioAlta: e.target.value === '' ? '' : Number(e.target.value) } : x))
                                  )
                                }
                                className="w-full pl-9 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-moana-dark text-center focus:ring-1 focus:ring-moana-orange"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-medium text-moana-gray block mb-1">Semana Santa</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-moana-gray font-bold">USD</span>
                              <input
                                type="number"
                                min="0"
                                placeholder={exc.precio || 'Base'}
                                value={exc.precioSemanaSanta ?? ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  setExcursiones((prev) =>
                                    prev.map((x, j) => (j === realIndex ? { ...x, precioSemanaSanta: e.target.value === '' ? '' : Number(e.target.value) } : x))
                                  )
                                }
                                className="w-full pl-9 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-moana-dark text-center focus:ring-1 focus:ring-moana-orange"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-medium text-moana-gray block mb-1">Vacaciones Invierno</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-moana-gray font-bold">USD</span>
                              <input
                                type="number"
                                min="0"
                                placeholder={exc.precio || 'Base'}
                                value={exc.precioVacacionesInvierno ?? ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  setExcursiones((prev) =>
                                    prev.map((x, j) => (j === realIndex ? { ...x, precioVacacionesInvierno: e.target.value === '' ? '' : Number(e.target.value) } : x))
                                  )
                                }
                                className="w-full pl-9 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-moana-dark text-center focus:ring-1 focus:ring-moana-orange"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
              <button onClick={addExcursion} className="btn-secondary flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
                <Plus size={16} /> Agregar Nueva Excursión
              </button>
              <button onClick={handleSaveExcursiones} className="btn-primary flex items-center gap-2 text-sm w-full sm:w-auto justify-center shadow-lg px-8">
                <Save size={16} /> Guardar Cambios en Excursiones
              </button>
            </div>
          </div>
        )}

        {/* === TRASLADOS TAB === */}
        {activeTab === 'traslados' && (
          <div className="card p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="font-display font-bold text-moana-blue text-xl flex items-center gap-2">
                  🚌 Traslados Adicionales
                </h2>
                <p className="text-xs text-moana-gray mt-1">
                  Gestioná los costos de traslados por temporada y tipo de servicio (Regular / Privado).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Filtro por Destino */}
                <select
                  value={trasDestinoFiltro}
                  onChange={(e) => setTrasDestinoFiltro(e.target.value)}
                  className="input-field text-xs py-2 bg-moana-blue-pale/50 font-semibold text-moana-blue"
                >
                  <option value="todos">🌐 Todos los Destinos ({traslados.length})</option>
                  <option value="buzios">🌴 Búzios / Río de Janeiro</option>
                  <option value="cancun">🏖️ Cancún / Playa del Carmen</option>
                  <option value="cataratas">🌊 Cataratas del Iguazú</option>
                  <option value="ushuaia">🐧 Ushuaia</option>
                  <option value="calafate">🧊 El Calafate</option>
                  <option value="salta">🏔️ Salta</option>
                  <option value="bariloche">🌲 Bariloche</option>
                  <option value="mendoza">🍷 Mendoza</option>
                  <option value="bayahibe">🇩🇴 Miches / Bayahíbe</option>
                  <option value="jamaica">🇯🇲 Jamaica</option>
                  <option value="peru">🇵🇪 Perú / Machu Picchu</option>
                </select>

                {/* Buscador */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-moana-gray" />
                  <input
                    type="text"
                    placeholder="Buscar traslado..."
                    value={trasSearchTerm}
                    onChange={(e) => setTrasSearchTerm(e.target.value)}
                    className="input-field text-xs py-2 pl-8 w-44"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {traslados
                .filter((tr) => {
                  const matchDest = trasDestinoFiltro === 'todos' || (tr.destino || '').toLowerCase() === trasDestinoFiltro.toLowerCase();
                  const matchSearch = trasSearchTerm === '' || tr.nombre.toLowerCase().includes(trasSearchTerm.toLowerCase());
                  return matchDest && matchSearch;
                })
                .map((tr, idx) => {
                  const realIndex = traslados.findIndex((x) => x === tr);
                  return (
                    <div key={realIndex} className="p-4 bg-moana-cream rounded-2xl border border-gray-100 space-y-3 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        {/* Nombre */}
                        <div className="md:col-span-5">
                          <label className="text-[10px] font-semibold text-moana-gray uppercase tracking-wider block mb-1">
                            Nombre del Traslado
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Traslado Aeropuerto ↔ Hotel"
                            value={tr.nombre}
                            onChange={(e) =>
                              setTraslados((prev) =>
                                prev.map((x, j) => (j === realIndex ? { ...x, nombre: e.target.value } : x))
                              )
                            }
                            className="input-field text-xs font-bold text-moana-blue"
                          />
                        </div>

                        {/* Tipo de servicio */}
                        <div className="md:col-span-3">
                          <label className="text-[10px] font-semibold text-moana-gray uppercase tracking-wider block mb-1">
                            Tipo de Servicio
                          </label>
                          <select
                            value={tr.tipo || 'regular'}
                            onChange={(e) =>
                              setTraslados((prev) =>
                                prev.map((x, j) => (j === realIndex ? { ...x, tipo: e.target.value } : x))
                              )
                            }
                            className="input-field text-xs font-medium"
                          >
                            <option value="regular">Regular (Compartido)</option>
                            <option value="privado">Privado (Exclusivo)</option>
                          </select>
                        </div>

                        {/* Destino */}
                        <div className="md:col-span-3">
                          <label className="text-[10px] font-semibold text-moana-gray uppercase tracking-wider block mb-1">
                            Destino Asignado
                          </label>
                          <select
                            value={tr.destino || 'buzios'}
                            onChange={(e) =>
                              setTraslados((prev) =>
                                prev.map((x, j) => (j === realIndex ? { ...x, destino: e.target.value } : x))
                              )
                            }
                            className="input-field text-xs font-medium"
                          >
                            <option value="buzios">🌴 Búzios / Río</option>
                            <option value="cancun">🏖️ Cancún / Playa</option>
                            <option value="cataratas">🌊 Cataratas Iguazú</option>
                            <option value="ushuaia">🐧 Ushuaia</option>
                            <option value="calafate">🧊 El Calafate</option>
                            <option value="salta">🏔️ Salta</option>
                            <option value="bariloche">🌲 Bariloche</option>
                            <option value="mendoza">🍷 Mendoza</option>
                            <option value="bayahibe">🇩🇴 Miches / Bayahíbe</option>
                            <option value="jamaica">🇯🇲 Jamaica</option>
                            <option value="peru">🇵🇪 Perú / Machu</option>
                          </select>
                        </div>

                        {/* Eliminar */}
                        <div className="md:col-span-1 flex justify-end">
                          <button
                            onClick={() => setTraslados((prev) => prev.filter((_, j) => j !== realIndex))}
                            className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Eliminar traslado"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Tarifas por Temporada */}
                      <div className="bg-white p-3 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-moana-blue uppercase tracking-wider mb-2 flex items-center gap-1">
                          📅 Tarifas del Traslado por Temporada (USD total o por pax)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-[10px] font-medium text-moana-gray block mb-1">Temp. Baja (Base)</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-moana-gray font-bold">USD</span>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={tr.precio ?? ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  setTraslados((prev) =>
                                    prev.map((x, j) => (j === realIndex ? { ...x, precio: Number(e.target.value) } : x))
                                  )
                                }
                                className="w-full pl-9 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-moana-dark text-center focus:ring-1 focus:ring-moana-orange"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-medium text-moana-gray block mb-1">Temp. Alta</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-moana-gray font-bold">USD</span>
                              <input
                                type="number"
                                min="0"
                                placeholder={tr.precio || 'Base'}
                                value={tr.precioAlta ?? ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  setTraslados((prev) =>
                                    prev.map((x, j) => (j === realIndex ? { ...x, precioAlta: e.target.value === '' ? '' : Number(e.target.value) } : x))
                                  )
                                }
                                className="w-full pl-9 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-moana-dark text-center focus:ring-1 focus:ring-moana-orange"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-medium text-moana-gray block mb-1">Semana Santa</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-moana-gray font-bold">USD</span>
                              <input
                                type="number"
                                min="0"
                                placeholder={tr.precio || 'Base'}
                                value={tr.precioSemanaSanta ?? ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  setTraslados((prev) =>
                                    prev.map((x, j) => (j === realIndex ? { ...x, precioSemanaSanta: e.target.value === '' ? '' : Number(e.target.value) } : x))
                                  )
                                }
                                className="w-full pl-9 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-moana-dark text-center focus:ring-1 focus:ring-moana-orange"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-medium text-moana-gray block mb-1">Vacaciones Invierno</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-moana-gray font-bold">USD</span>
                              <input
                                type="number"
                                min="0"
                                placeholder={tr.precio || 'Base'}
                                value={tr.precioVacacionesInvierno ?? ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  setTraslados((prev) =>
                                    prev.map((x, j) => (j === realIndex ? { ...x, precioVacacionesInvierno: e.target.value === '' ? '' : Number(e.target.value) } : x))
                                  )
                                }
                                className="w-full pl-9 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-moana-dark text-center focus:ring-1 focus:ring-moana-orange"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
              <button onClick={addTraslado} className="btn-secondary flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
                <Plus size={16} /> Agregar Nuevo Traslado
              </button>
              <button onClick={handleSaveTraslados} className="btn-primary flex items-center gap-2 text-sm w-full sm:w-auto justify-center shadow-lg px-8">
                <Save size={16} /> Guardar Cambios en Traslados
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Cambiar Claves de Acceso (Admin y Vendedores) */}
      {showPinModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPinModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-moana-dark shadow-2xl relative border border-gray-100 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <div className="w-14 h-14 bg-moana-orange/10 rounded-2xl flex items-center justify-center text-moana-orange mx-auto mb-3">
                <Key size={26} />
              </div>
              <h3 className="font-display font-bold text-moana-blue text-xl">Cambiar Claves de Acceso</h3>
              <p className="text-xs text-moana-gray mt-1">Establecé PINs personalizados para ingresar al panel Admin y al Cotizador.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 bg-moana-blue-pale/50 rounded-2xl border border-moana-blue/10 space-y-2">
                <label className="text-xs font-bold text-moana-blue block">🔑 PIN de Administrador (Flor)</label>
                <p className="text-[11px] text-moana-gray">Acceso total a precios, publicaciones y posada.</p>
                <input
                  type="text"
                  maxLength="8"
                  value={newAdminPinInput}
                  onChange={(e) => setNewAdminPinInput(e.target.value)}
                  className="input-field text-center font-mono font-bold text-lg py-2"
                  placeholder="Ej: 9876"
                />
              </div>

              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/50 space-y-2">
                <label className="text-xs font-bold text-moana-orange block">🔑 PIN de Vendedores</label>
                <p className="text-[11px] text-moana-gray">Acceso exclusivo al Cotizador para el equipo.</p>
                <input
                  type="text"
                  maxLength="8"
                  value={newSellerPinInput}
                  onChange={(e) => setNewSellerPinInput(e.target.value)}
                  className="input-field text-center font-mono font-bold text-lg py-2"
                  placeholder="Ej: 5544"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="btn-secondary flex-1 py-3 text-sm justify-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newAdminPinInput.trim() || !newSellerPinInput.trim()) {
                    alert('Por favor ingresá PINs válidos.');
                    return;
                  }
                  updatePins(newAdminPinInput.trim(), newSellerPinInput.trim());
                  setShowPinModal(false);
                  showSaved('¡Claves de acceso actualizadas con éxito!');
                }}
                className="btn-primary flex-1 py-3 text-sm justify-center font-bold shadow-md"
              >
                Guardar Claves
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
