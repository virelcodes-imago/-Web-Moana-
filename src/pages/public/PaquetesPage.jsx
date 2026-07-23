import { useState, useEffect } from 'react';
import PackageCard from '../../components/packages/PackageCard';
import { paquetesBase, CATEGORIAS } from '../../data/paquetes';
import { Search } from 'lucide-react';
import db from '../../db/db';
import { useLanguage } from '../../i18n/LanguageContext';




export default function PaquetesPage() {
  const [catActiva, setCatActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [paquetes, setPaquetes] = useState([]);
  const { t } = useLanguage();

  const CATEGORIAS_TABS = [
    { id: 'todos', label: t('paquetes_todos') },
    { id: CATEGORIAS.BUZIOS, label: `🌴 ${t('paquetes_buzios')}` },
    { id: CATEGORIAS.INTERNACIONAL, label: `🌍 ${t('paquetes_internacional')}` },
    { id: CATEGORIAS.NACIONAL, label: `🏔️ ${t('paquetes_nacional')}` },
    { id: CATEGORIAS.ALOJAMIENTO, label: `🏡 ${t('paquetes_alojamiento')}` },
    { id: CATEGORIAS.TRASLADOS_EXCURSIONES, label: `🌊 ${t('paquetes_traslados_excursiones')}` },
  ];

  useEffect(() => {
    const load = async () => {
      const list = await db.paquetes.toArray();
      const activeList = list.length > 0 ? list.filter(p => p.activo !== 0 && p.activo !== false) : paquetesBase;
      setPaquetes(activeList);
    };
    load();
  }, []);

  const filtrados = paquetes
    .filter((p) => {
      if (catActiva === 'todos') return true;
      if (catActiva === CATEGORIAS.BUZIOS) {
        return p.categoria === CATEGORIAS.BUZIOS || p.slug === 'buzios-hospedaje' || p.id === 30;
      }
      return p.categoria === catActiva;
    })
    .filter((p) =>
      busqueda === '' ||
      p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descCorta?.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => (a.orden || 99) - (b.orden || 99));

  return (
    <>
      {/* Header */}
      <div className="bg-moana-blue py-14 text-white">
        <div className="container-moana text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-3">
            {t('paquetes_title')}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            {t('paquetes_subtitle')}
          </p>

          {/* Search */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-moana-gray" />
            <input
              type="search"
              placeholder="Buscar destino..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full text-moana-dark bg-white focus:outline-none focus:ring-2 focus:ring-moana-orange"
            />
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-[80px] z-30">
        <div className="container-moana py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIAS_TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setCatActiva(id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  catActiva === id
                    ? 'bg-moana-orange text-white shadow-moana-orange'
                    : 'bg-moana-blue-pale text-moana-blue hover:bg-moana-orange/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="section-cream">
        <div className="container-moana">
          {filtrados.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-moana-gray text-lg">No encontramos paquetes para tu búsqueda.</p>
              <button
                onClick={() => { setCatActiva('todos'); setBusqueda(''); }}
                className="mt-4 btn-secondary"
              >
                Ver todos los paquetes
              </button>
            </div>
          ) : (
            <>
              <p className="text-moana-gray text-sm mb-6">
                {filtrados.length} destino{filtrados.length !== 1 ? 's' : ''} disponible{filtrados.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtrados.map((p) => (
                  <PackageCard key={p.id} paquete={p} />
                ))}
              </div>
            </>
          )}

          <div className="mt-12 text-center">
            <p className="text-moana-gray mb-4">
              ¿Necesitás un destino personalizado? ¡Escribinos!
            </p>
            <a
              href="https://wa.me/5491126810289?text=Hola%20Moana!%20Quiero%20info%20sobre%20un%20viaje%20%F0%9F%8C%8A"
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp inline-flex"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967c-.273-.099-.471-.148-.67.15c-.197.297-.767.966-.94 1.164c-.173.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.018-.458.13-.606c.134-.133.298-.347.446-.52c.149-.174.198-.298.298-.497c.099-.198.05-.371-.025-.52c-.075-.149-.669-1.612-.916-2.207c-.242-.579-.487-.5-.669-.51c-.173-.008-.371-.01-.57-.01c-.198 0-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625c.712.227 1.36.195 1.871.118c.571-.085 1.758-.719 2.006-1.413c.248-.694.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
              </svg>
              Consultar viaje personalizado
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
