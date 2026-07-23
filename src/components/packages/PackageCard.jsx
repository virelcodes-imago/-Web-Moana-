import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Moon, MessageCircle } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import db from '../../db/db';
import { useLanguage } from '../../i18n/LanguageContext';

export default function PackageCard({ paquete }) {
  const [hotel, setHotel] = useState('economico');
  const [temporada, setTemporada] = useState('baja');
  const [precio, setPrecio] = useState(null);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();
  const { t } = useLanguage();

  const isExcursionOrTraslado = paquete?.noches === null || paquete?.categoria === 'traslados_excursiones' || paquete?.categoria === 'traslados' || paquete?.categoria === 'excursiones';

  const HOTEL_OPTIONS = [
    { id: 'economico', label: t('card_hotel_estandar') },
    { id: 'familiar',  label: t('card_hotel_familiar') },
    { id: 'premium',   label: t('card_hotel_premium') },
  ];

  const TEMPORADA_OPTIONS = [
    { id: 'baja',               label: t('card_temp_baja') },
    { id: 'alta',               label: t('card_temp_alta') },
    { id: 'semana_santa',       label: t('card_temp_semana_santa') },
    { id: 'finde_largo',        label: t('card_temp_finde') },
    { id: 'vacaciones_invierno',label: t('card_temp_invierno') },
  ];

  // Load price from Dexie
  useEffect(() => {
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
        const p = await db.precios
          .where({ paqueteId: paquete.id, temporada, hotel })
          .first();
        setPrecio(p && p.precio ? p.precio : null);
      } catch {
        setPrecio(null);
      }
    };
    load();
  }, [paquete.id, paquete.slug, paquete.categoria, hotel, temporada]);

  const handleAdd = () => {
    addItem(paquete, { temporada, hotel, precio });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleConsultar = () => {
    const tempObj = TEMPORADA_OPTIONS.find((t) => t.id === temporada);
    const hotelObj = HOTEL_OPTIONS.find((h) => h.id === hotel);
    const detailText = isExcursionOrTraslado
      ? `${tempObj?.label || ''}`
      : `${tempObj?.label || ''} - Categoría: ${hotelObj?.label || ''}`;
    const text = encodeURIComponent(
      `Hola Moana! Quiero consultar precio y disponibilidad para el paquete *${paquete.titulo}* (${detailText}) 🌊`
    );
    window.open(`https://wa.me/5491126810289?text=${text}`, '_blank');
  };

  return (
    <article className="card card-hover group flex flex-col h-full">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={paquete.imagen}
          alt={paquete.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = '/fotos/home.jpg'; }}
          loading="lazy"
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {paquete.destacado && (
          <span className="absolute top-3 left-3 badge-orange text-xs font-bold">
            {t('card_destacado')}
          </span>
        )}
        {paquete.noches && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-medium">
            <Moon size={12} /> {paquete.noches} {t('card_noches')}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="font-display font-bold text-moana-blue text-xl leading-tight">
            {paquete.titulo}
          </h3>
          <p className="text-moana-gray text-sm mt-1 line-clamp-2">
            {paquete.descCorta}
          </p>
        </div>

        {/* Selectors */}
        {isExcursionOrTraslado ? (
          <div>
            <label className="label-field text-xs">{t('card_temporada_label')}</label>
            <select
              value={temporada}
              onChange={(e) => setTemporada(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-moana-orange font-medium"
            >
              {TEMPORADA_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-field text-xs">{t('card_hotel_label')}</label>
              <select
                value={hotel}
                onChange={(e) => setHotel(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-moana-orange"
              >
                {HOTEL_OPTIONS.map((h) => (
                  <option key={h.id} value={h.id}>{h.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field text-xs">{t('card_temporada_label')}</label>
              <select
                value={temporada}
                onChange={(e) => setTemporada(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-moana-orange"
              >
                {TEMPORADA_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="price-tag flex-shrink-0">
          {precio ? (
            <>
              <p className="price-desde">{t('card_desde')}</p>
              <p className="price-amount font-display">USD {precio.toLocaleString()}</p>
              <p className="price-unit">{isExcursionOrTraslado ? 'por persona · servicio' : t('card_por_persona')}</p>
            </>
          ) : (
            <div className="py-1">
              <p className="price-amount font-display text-lg text-moana-orange font-bold uppercase tracking-wider">
                CONSULTAR
              </p>
              <p className="text-xs text-white/90 font-medium mt-0.5">Cotización por WhatsApp</p>
            </div>
          )}
        </div>

        {/* Includes preview */}
        {paquete.incluye && (
          <ul className="text-xs text-moana-gray space-y-0.5">
            {paquete.incluye.slice(0, 3).map((item, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-moana-teal-dark mt-0.5">✓</span> {item}
              </li>
            ))}
            {paquete.incluye.length > 3 && (
              <li className="text-moana-blue font-medium">+{paquete.incluye.length - 3} {t('card_mas_incluidos')}</li>
            )}
          </ul>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          {precio ? (
            <button
              id={`add-cart-btn-${paquete.id}`}
              onClick={handleAdd}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                added
                  ? 'bg-green-500 text-white'
                  : 'btn-primary'
              }`}
            >
              <ShoppingCart size={16} />
              {added ? t('card_agregado') : t('card_lo_quiero')}
            </button>
          ) : (
            <button
              id={`consult-btn-${paquete.id}`}
              onClick={handleConsultar}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm btn-whatsapp text-white transition-all duration-200"
            >
              <MessageCircle size={16} />
              Consultar
            </button>
          )}
          <Link
            to={`/paquetes/${paquete.slug}`}
            className="w-10 h-10 border-2 border-moana-teal text-moana-blue hover:bg-moana-teal hover:text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            title="Ver detalles"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
