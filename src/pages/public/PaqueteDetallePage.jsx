import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, ShoppingCart, Moon, ChevronDown, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { paquetesBase, TEMPORADAS, TEMPORADAS_BUZIOS, HOTELES } from '../../data/paquetes';
import useCartStore from '../../store/cartStore';
import db from '../../db/db';
import { useLanguage } from '../../i18n/LanguageContext';

export default function PaqueteDetallePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [paquete, setPaquete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState('economico');
  const [temporada, setTemporada] = useState('baja');
  const [pasajeros, setPasajeros] = useState(2);
  const [precio, setPrecio] = useState(null);
  const [added, setAdded] = useState(false);
  const [condicionesOpen, setCondicionesOpen] = useState(false);
  const { addItem } = useCartStore();
  const { t } = useLanguage();

  const handleVolver = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/paquetes');
    }
  };

  const isExcursionOrTraslado = paquete?.noches === null || paquete?.categoria === 'traslados_excursiones' || paquete?.categoria === 'traslados' || paquete?.categoria === 'excursiones';

  // Scroll to top on mount / slug change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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
        if (paquete.slug === 'posada-moana-alojamiento' || paquete.categoria === 'alojamiento') {
          const habMap = { economico: 'doble', familiar: 'triple', premium: 'cuadruple' };
          const targetHab = habMap[hotel] || hotel || 'doble';
          const posadaRow = await db.posadaPrecios.where({ temporada, habitacion: targetHab }).first();
          if (posadaRow && posadaRow.precio) {
            setPrecio(posadaRow.precio);
            return;
          }
        }

        if (isExcursionOrTraslado) {
          const excs = await db.excursiones.toArray();
          const foundExc = excs.find(e => (e.paqueteId === paquete.id) || (e.nombre && paquete.titulo && e.nombre.toLowerCase().includes(paquete.titulo.toLowerCase().slice(0, 5))));
          if (foundExc && foundExc.precio && Number(foundExc.precio) > 0) {
            setPrecio(Number(foundExc.precio));
            return;
          }
          const tras = await db.traslados.toArray();
          const foundTras = tras.find(t => (t.paqueteId === paquete.id) || (t.nombre && paquete.titulo && t.nombre.toLowerCase().includes(paquete.titulo.toLowerCase().slice(0, 5))));
          if (foundTras && foundTras.precio && Number(foundTras.precio) > 0) {
            setPrecio(Number(foundTras.precio));
            return;
          }
        }

        const p = await db.precios.where({ paqueteId: paquete.id, temporada, hotel }).first();
        setPrecio(p && p.precio && Number(p.precio) > 0 ? Number(p.precio) : null);
      } catch { setPrecio(null); }
    };
    load();
  }, [paquete, temporada, hotel, isExcursionOrTraslado]);

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

  const isInternational = paquete?.categoria === 'internacional';

  const HOTELES_OPTIONS = isInternational
    ? [
        { id: 'economico', label: 'Con Desayuno' },
        { id: 'premium',   label: 'All Inclusive' },
      ]
    : HOTELES;

  const isBuzios = paquete?.categoria === 'buzios' || paquete?.slug?.includes('buzios');
  const TEMPORADA_LIST = isBuzios ? TEMPORADAS_BUZIOS : TEMPORADAS;

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
            <button
              onClick={handleVolver}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-4 transition-all shadow-md cursor-pointer border border-white/20"
            >
              <ArrowLeft size={18} /> {t('detalle_volver')}
            </button>
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

              {/* Policy & Conditions Accordion */}
              {(paquete.categoria === 'buzios' || paquete.slug?.includes('buzios')) && (
                <div className="card overflow-hidden border border-moana-teal/30 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setCondicionesOpen(!condicionesOpen)}
                    className="w-full flex items-center justify-between p-4 bg-moana-cream/80 hover:bg-moana-cream text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 text-moana-blue font-bold text-sm md:text-base">
                      <Info size={20} className="text-moana-orange flex-shrink-0" />
                      <span>Información Importante & Condiciones</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-moana-blue transition-transform duration-300 flex-shrink-0 ${condicionesOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {condicionesOpen && (
                    <div className="p-5 bg-white space-y-2.5 text-xs md:text-sm text-moana-dark border-t border-moana-cream animate-fade-in">
                      <p>• <strong>Impuestos:</strong> Los paquetes tienen 2.9% tasas e impuestos.</p>
                      <p>• <strong>Menores (0 a 2 años):</strong> No pagan (hasta 2 años sin excepción).</p>
                      <p>• <strong>Menores (2 a 11 años):</strong> 15% OFF en base familiar (solo aplica a menores).</p>
                      <p>• <strong>Días Extras:</strong> Todos los paquetes son por 8 días 7 noches. Para adicionar días extras, la variación del aéreo es de USD 100 y la diaria extra de hospedaje es de USD 25 por noche por pasajero.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Back Button */}
              <div className="pt-2 flex justify-start">
                <button
                  onClick={handleVolver}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-moana-blue hover:bg-moana-blue-dark text-white rounded-full text-sm font-semibold transition-all shadow-md cursor-pointer"
                >
                  <ArrowLeft size={18} /> {t('detalle_volver')}
                </button>
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="card p-6 h-fit sticky top-24 space-y-4">
            <h2 className="font-display font-bold text-moana-blue text-xl">{t('detalle_personalizar')}</h2>

            <div>
              <label className="label-field">{t('detalle_temporada')}</label>
              <select value={temporada} onChange={(e) => setTemporada(e.target.value)} className="input-field">
                {TEMPORADA_LIST.map((temp) => <option key={temp.id} value={temp.id}>{temp.label}</option>)}
              </select>
            </div>
            {!isExcursionOrTraslado && (
              <div>
                <label className="label-field">{isInternational ? 'Régimen' : t('detalle_hotel')}</label>
                <select value={hotel} onChange={(e) => setHotel(e.target.value)} className="input-field">
                  {HOTELES_OPTIONS.map((h) => <option key={h.id} value={h.id}>{h.label}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label-field">{t('detalle_pasajeros')}</label>
              <input type="number" min="1" max="20" value={pasajeros}
                onChange={(e) => setPasajeros(Number(e.target.value))} className="input-field" />
            </div>

            {/* Price display */}
            <div className="price-tag">
              {precio ? (
                <>
                  <p className="price-desde">{t('detalle_desde')}</p>
                  <p className="price-amount font-display text-3xl">USD {precio.toLocaleString()}</p>
                  <p className="price-unit">{isExcursionOrTraslado ? 'por persona · servicio' : t('detalle_por_persona')}</p>
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <p className="text-white/70 text-xs">{t('detalle_total')} {pasajeros} {t('detalle_pax')}</p>
                    <p className="font-bold text-moana-orange text-lg">USD {totalGeneral?.toLocaleString()}</p>
                  </div>
                </>
              ) : (
                <div className="py-2 text-center">
                  <p className="price-amount font-display text-3xl text-moana-orange font-extrabold uppercase tracking-wider">CONSULTAR</p>
                  <p className="text-white/80 text-xs mt-1 font-medium">Cotización personalizada por WhatsApp</p>
                </div>
              )}
            </div>

            {precio ? (
              <button
                onClick={handleAdd}
                className={`btn-primary w-full flex items-center justify-center gap-2 py-4 ${added ? 'bg-green-500' : ''}`}
              >
                <ShoppingCart size={18} />
                {added ? t('detalle_agregado') : t('detalle_lo_quiero')}
              </button>
            ) : null}

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
