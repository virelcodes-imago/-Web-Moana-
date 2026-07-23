import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star, Moon } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import db from '../../db/db';

const HOTEL_OPTIONS = [
  { id: 'economico', label: 'Estándar', stars: 2 },
  { id: 'familiar', label: 'Familiar', stars: 3 },
  { id: 'premium', label: 'Premium', stars: 4 },
];

const TEMPORADA_OPTIONS = [
  { id: 'baja', label: 'Temporada Baja' },
  { id: 'alta', label: 'Temporada Alta' },
  { id: 'semana_santa', label: 'Semana Santa' },
  { id: 'finde_largo', label: 'Fin de Semana Largo' },
  { id: 'vacaciones_invierno', label: 'Vacaciones de Invierno' },
];

export default function PackageCard({ paquete }) {
  const [hotel, setHotel] = useState('economico');
  const [temporada, setTemporada] = useState('baja');
  const [precio, setPrecio] = useState(null);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  // Load price from Dexie
  useEffect(() => {
    const load = async () => {
      try {
        const p = await db.precios
          .where({ paqueteId: paquete.id, temporada, hotel })
          .first();
        setPrecio(p ? p.precio : null);
      } catch {
        setPrecio(null);
      }
    };
    load();
  }, [paquete.id, hotel, temporada]);

  const handleAdd = () => {
    addItem(paquete, { temporada, hotel, precio });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
            ⭐ Destacado
          </span>
        )}
        {paquete.noches && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-medium">
            <Moon size={12} /> {paquete.noches} noches
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
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label-field text-xs">Hotel</label>
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
            <label className="label-field text-xs">Temporada</label>
            <select
              value={temporada}
              onChange={(e) => setTemporada(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-moana-orange"
            >
              {TEMPORADA_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price */}
        <div className="price-tag flex-shrink-0">
          <p className="price-desde">Desde</p>
          {precio ? (
            <p className="price-amount font-display">USD {precio.toLocaleString()}</p>
          ) : (
            <p className="price-amount font-display text-xl">A consultar</p>
          )}
          <p className="price-unit">por persona · base doble</p>
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
              <li className="text-moana-blue font-medium">+{paquete.incluye.length - 3} más incluidos</li>
            )}
          </ul>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
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
            {added ? '¡Agregado!' : '¡Lo quiero!'}
          </button>
          <Link
            to={`/paquetes/${paquete.slug}`}
            className="w-12 h-12 border-2 border-moana-blue-pale text-moana-blue hover:bg-moana-blue-pale rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Ver detalle"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
