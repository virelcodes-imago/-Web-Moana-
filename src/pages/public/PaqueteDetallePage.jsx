import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, ShoppingCart, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { paquetesBase, TEMPORADAS, HOTELES } from '../../data/paquetes';
import useCartStore from '../../store/cartStore';
import db from '../../db/db';
import { useLanguage } from '../../i18n/LanguageContext';

export default function PaqueteDetallePage() {
  const { slug } = useParams();
  const [paquete, setPaquete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState('economico');
  const [temporada, setTemporada] = useState('baja');
  const [pasajeros, setPasajeros] = useState(2);
  const [precio, setPrecio] = useState(null);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();
  const { t } = useLanguage();

  // Load package from Dexie
  useEffect(() => {
    const loadPkg = async () => {
      setLoading(true);
      try {
        const pkg = await db.paquetes.where({ slug }).first();
        if (pkg) {
          setPaquete(pkg);
        } else {
          const staticPkg = paquetesBase.find((p) => p.slug === slug);
          setPaquete(staticPkg || null);
        }
      } catch {
        const staticPkg = paquetesBase.find((p) => p.slug === slug);
        setPaquete(staticPkg || null);
      } finally {
        setLoading(false);
      }
    };
    loadPkg();
  }, [slug]);

  // Load price
  useEffect(() => {
    if (!paquete) return;
    const load = async () => {
      try {
        const p = await db.precios.where({ paqueteId: paquete.id, temporada, hotel }).first();
        setPrecio(p ? p.precio : null);
      } catch { setPrecio(null); }
    };
    load();
  }, [paquete, temporada, hotel]);

  if (loading) {
    return (
      <div className="section-white text-center py-20">
        <p className="text-moana-gray text-lg">{t('detalle_cargando')}</p>
      </div>
    );
  }

  if (!paquete) {
    return (
      <div className="section-white text-center py-20">
        <p className="text-moana-gray text-lg mb-4">{t('detalle_no_encontrado')}</p>
        <Link to="/paquetes" className="btn-primary">{t('detalle_ver_todos')}</Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(paquete, { temporada, hotel, pasajeros, precio });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const totalGeneral = precio ? precio * pasajeros : null;

  return (
    <>
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={paquete.imagenHero || paquete.imagen}
          alt={paquete.titulo}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = '/fotos/home.jpg'; }}
        />
        <div className="absolute inset-0 hero-overlay flex items-end">
          <div className="container-moana pb-8 text-white">
            <Link to="/paquetes" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 transition-colors w-fit">
              <ArrowLeft size={16} /> {t('detalle_volver')}
            </Link>
            <h1 className="font-display font-black text-4xl md:text-6xl">{paquete.titulo}</h1>
            <p className="text-white/80 text-lg mt-1">{paquete.subtitulo}</p>
            {paquete.noches && (
              <span className="inline-flex items-center gap-1 mt-2 badge-teal">
                <Moon size={12} /> {paquete.noches} {t('card_noches')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="section-cream">
        <div className="container-moana grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-moana-blue text-xl mb-3">{t('detalle_sobre')}</h2>
              <p className="text-moana-gray leading-relaxed">{paquete.descripcion}</p>
            </div>

            {/* Includes / Not includes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {paquete.incluye && (
                <div className="card p-5">
                  <h3 className="font-semibold text-moana-blue mb-3">{t('detalle_incluye')}</h3>
                  <ul className="space-y-2">
                    {paquete.incluye.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-moana-gray">
                        <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {paquete.noIncluye && (
                <div className="card p-5">
                  <h3 className="font-semibold text-moana-blue mb-3">{t('detalle_no_incluye')}</h3>
                  <ul className="space-y-2">
                    {paquete.noIncluye.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-moana-gray">
                        <X size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="card p-6 h-fit sticky top-24 space-y-4">
            <h2 className="font-display font-bold text-moana-blue text-xl">{t('detalle_personalizar')}</h2>

            <div>
              <label className="label-field">{t('detalle_temporada')}</label>
              <select value={temporada} onChange={(e) => setTemporada(e.target.value)} className="input-field">
                {TEMPORADAS.map((temp) => <option key={temp.id} value={temp.id}>{temp.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">{t('detalle_hotel')}</label>
              <select value={hotel} onChange={(e) => setHotel(e.target.value)} className="input-field">
                {HOTELES.map((h) => <option key={h.id} value={h.id}>{h.label} {'⭐'.repeat(h.stars)}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">{t('detalle_pasajeros')}</label>
              <input type="number" min="1" max="20" value={pasajeros}
                onChange={(e) => setPasajeros(Number(e.target.value))} className="input-field" />
            </div>

            {/* Price display */}
            <div className="price-tag">
              <p className="price-desde">{t('detalle_desde')}</p>
              {precio ? (
                <>
                  <p className="price-amount font-display text-3xl">USD {precio.toLocaleString()}</p>
                  <p className="price-unit">{t('detalle_por_persona')}</p>
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <p className="text-white/70 text-xs">{t('detalle_total')} {pasajeros} {t('detalle_pax')}</p>
                    <p className="font-bold text-moana-orange text-lg">USD {totalGeneral?.toLocaleString()}</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="price-amount font-display text-2xl">{t('detalle_consultar_precio')}</p>
                  <p className="price-unit">{t('detalle_financiacion')}</p>
                </>
              )}
            </div>

            <button
              onClick={handleAdd}
              className={`btn-primary w-full flex items-center justify-center gap-2 py-4 ${added ? 'bg-green-500' : ''}`}
            >
              <ShoppingCart size={18} />
              {added ? t('detalle_agregado') : t('detalle_lo_quiero')}
            </button>

            <a
              href={`https://wa.me/5491126810289?text=Hola%20Moana!%20Me%20interesa%20el%20paquete%20*${encodeURIComponent(paquete.titulo)}*%20%F0%9F%8C%8A%20%C2%BFPodr%C3%ADan%20darme%20m%C3%A1s%20informaci%C3%B3n%3F`}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp w-full justify-center"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
              </svg>
              {t('detalle_consultar_directo')}
            </a>

            <p className="text-xs text-center text-moana-gray">{t('detalle_financiacion_footer')}</p>
          </div>
        </div>
      </div>
    </>
  );
}
