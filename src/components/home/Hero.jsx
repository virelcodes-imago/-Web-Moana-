import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import db from '../../db/db';

const SLIDES = [
  {
    id: 1,
    paqueteId: 1,
    slug: 'buzios-clasico',
    titulo: 'BÚZIOS CLÁSICO',
    subtitulo: '8 Días / 7 Noches — Aéreos + Transfer + Hospedaje + Barco',
    tagline: 'Aéreos Directos · 7 Noches · Transfer Privado Río · Desayuno · Barco',
    imagen: '/fotos/buzios.jpg',
    temporada: 'Temporada Baja 2026',
    precio: 825,
    precioLabel: 'DESDE',
    moneda: 'USD',
    base: 'por persona - base doble',
    badge: '⭐ Más vendido',
  },
  {
    id: 2,
    paqueteId: 7,
    slug: 'miami-orlando-full',
    titulo: 'MIAMI · ORLANDO',
    subtitulo: '¡El sueño americano!',
    tagline: 'Aéreos · 8 Noches · Desayuno · Traslados · Seguro',
    imagen: '/fotos/miami-night-scene.jpg',
    temporada: 'Todo el año',
    precio: null,
    precioLabel: 'DESDE',
    moneda: 'USD',
    base: 'por persona - base doble',
    badge: '🔥 Oferta especial',
  },
  {
    id: 3,
    paqueteId: 16,
    slug: 'cataratas-iguazu',
    titulo: 'CATARATAS',
    subtitulo: '¡Una maravilla natural!',
    tagline: 'Aéreos · Hotel · Traslados · Entradas al Parque',
    imagen: '/fotos/destinos/cataratas_real.png',
    temporada: 'Temporada alta',
    precio: null,
    precioLabel: 'DESDE',
    moneda: 'USD',
    base: 'por persona - base doble',
    badge: '🌿 Destino nacional',
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [precios, setPrecios] = useState({});
  const { addItem } = useCartStore();

  // Load prices from Dexie
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const allPrecios = await db.precios.toArray();
        const map = {};
        allPrecios.forEach((p) => {
          const key = `${p.paqueteId}-${p.temporada}-${p.hotel}`;
          if (!map[p.paqueteId] || p.precio < map[p.paqueteId]) {
            map[p.paqueteId] = p.precio;
          }
        });
        setPrecios(map);
      } catch {}
    };
    loadPrices();
  }, []);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length);

  const slide = SLIDES[current];
  const precio = precios[slide.paqueteId];

  const handleConsultar = () => {
    addItem(
      { id: slide.paqueteId, titulo: slide.titulo, slug: slide.slug, imagen: slide.imagen },
      { temporada: 'alta', hotel: 'economico', precio: precio || null }
    );
  };

  return (
    <section
      className="relative w-full h-[85vh] min-h-[560px] overflow-hidden"
      aria-label="Destacados del mes"
    >
      {/* Background images */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={s.imagen}
            alt={s.titulo}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/fotos/home.jpg'; }}
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-16">
        <div className="container-moana">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Left: text */}
            <div className="text-white max-w-2xl">
              {slide.badge && (
                <span className="inline-block mb-3 px-4 py-1.5 bg-moana-orange text-white text-xs font-bold rounded-full uppercase tracking-widest animate-fade-up">
                  {slide.badge}
                </span>
              )}
              <p className="text-moana-orange-light font-semibold text-lg md:text-xl italic mb-1 animate-fade-up-delay-1">
                {slide.subtitulo}
              </p>
              <h1 className="font-display font-black text-6xl md:text-8xl text-white leading-none drop-shadow-lg animate-fade-up-delay-1">
                {slide.titulo}
              </h1>
              <p className="mt-3 text-white/80 text-base md:text-lg animate-fade-up-delay-2">
                {slide.tagline}
              </p>

              <div className="flex flex-wrap gap-3 mt-6 animate-fade-up-delay-3">
                <button
                  id={`hero-consultar-btn-${slide.id}`}
                  onClick={handleConsultar}
                  className="btn-primary text-base px-8 py-4"
                >
                  ¡Reservá el tuyo!
                </button>
                <Link
                  to={`/paquetes/${slide.slug}`}
                  className="btn-secondary bg-white/20 border-white text-white hover:bg-white hover:text-moana-blue text-base px-8 py-4"
                >
                  Ver detalle
                </Link>
              </div>
            </div>

            {/* Right: price box */}
            <div className="bg-moana-blue/90 backdrop-blur-sm rounded-2xl p-5 min-w-[220px] max-w-[260px] border border-white/20 animate-fade-up-delay-2">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
                📅 {slide.temporada}
              </p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/70 text-sm font-medium">DESDE</span>
              </div>
              {precio ? (
                <>
                  <p className="font-display font-black text-4xl text-moana-orange leading-none">
                    {slide.moneda} {precio.toLocaleString()}
                  </p>
                  <p className="text-white/60 text-xs mt-1 uppercase tracking-wide">
                    {slide.base}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display font-black text-3xl text-moana-orange leading-none">
                    A CONSULTAR
                  </p>
                  <p className="text-white/60 text-xs mt-1">¡Financiación en cuotas!</p>
                </>
              )}
              <a
                href="https://wa.me/5491126810289"
                target="_blank"
                rel="noreferrer"
                className="mt-3 btn-whatsapp w-full justify-center text-sm py-2.5"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
                </svg>
                Consultar precio
              </a>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-moana-orange' : 'w-2 bg-white/40'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Arrow controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20
                   backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center
                   text-white transition-all"
        aria-label="Anterior"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20
                   backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center
                   text-white transition-all"
        aria-label="Siguiente"
      >
        <ChevronRight size={20} />
      </button>
    </section>
  );
}
