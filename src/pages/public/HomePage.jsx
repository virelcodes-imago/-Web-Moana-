import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CreditCard, Users, Star } from 'lucide-react';
import Hero from '../../components/home/Hero';
import PackageCard from '../../components/packages/PackageCard';
import { paquetesBase, CATEGORIAS } from '../../data/paquetes';
import db from '../../db/db';
import { useLanguage } from '../../i18n/LanguageContext';

export default function HomePage() {
  const [catActiva, setCatActiva] = useState('todos');
  const [paquetes, setPaquetes] = useState([]);
  const { t } = useLanguage();

  const WHYS = [
    { icon: Shield, titleKey: 'home_why_1_title', descKey: 'home_why_1_desc' },
    { icon: CreditCard, titleKey: 'home_why_2_title', descKey: 'home_why_2_desc' },
    { icon: Users, titleKey: 'home_why_3_title', descKey: 'home_why_3_desc' },
    { icon: Star, titleKey: 'home_why_4_title', descKey: 'home_why_4_desc' },
  ];

  const CATEGORIAS_TABS = [
    { id: 'todos', label: `✈️ ${t('paquetes_todos')}` },
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

  const destacados = paquetes.filter((p) => p.destacado === 1 || p.destacado === true);

  const filtrados = catActiva === 'todos'
    ? paquetes
    : paquetes.filter((p) => p.categoria === catActiva);

  return (
    <>
      {/* Hero Slider */}
      <Hero />

      {/* ¿Por qué Moana? */}
      <section className="section-pale-blue">
        <div className="container-moana">
          <div className="text-center mb-10">
            <h2 className="section-title">{t('home_why_title')}</h2>
            <p className="section-subtitle">{t('home_why_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHYS.map(({ icon: Icon, titleKey, descKey }, i) => (
              <div key={i} className="card p-6 text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 bg-moana-orange-light rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-moana-orange transition-colors">
                  <Icon size={24} className="text-moana-orange group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-moana-blue text-base mb-2">{t(titleKey)}</h3>
                <p className="text-moana-gray text-sm leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destacados */}
      {destacados.length > 0 && (
        <section className="section-white">
          <div className="container-moana">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <h2 className="section-title">{t('home_featured_title')}</h2>
                <p className="section-subtitle">{t('home_featured_subtitle')}</p>
              </div>
              <Link to="/paquetes" className="flex items-center gap-1 text-moana-orange font-semibold hover:gap-2 transition-all">
                {t('home_ver_mas')} <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destacados.map((p) => (
                <PackageCard key={p.id} paquete={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Todos los paquetes con filtros */}
      <section className="section-cream" id="paquetes">
        <div className="container-moana">
          <div className="text-center mb-8">
            <h2 className="section-title">{t('home_catalog_title')}</h2>
            <p className="section-subtitle">{t('home_catalog_subtitle')}</p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {CATEGORIAS_TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setCatActiva(id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  catActiva === id
                    ? 'bg-moana-orange text-white shadow-moana-orange'
                    : 'bg-white text-moana-blue border border-moana-blue-pale hover:border-moana-orange hover:text-moana-orange'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtrados.map((p) => (
              <PackageCard key={p.id} paquete={p} />
            ))}
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-12 text-center">
            <p className="text-moana-gray mb-4">{t('home_custom_q')}</p>
            <a
              href="https://wa.me/5491126810289?text=Hola%20Moana!%20Quiero%20consultar%20sobre%20un%20viaje%20personalizado%20%F0%9F%8C%8A"
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp inline-flex"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
              </svg>
              {t('home_custom_cta')}
            </a>
          </div>
        </div>
      </section>

      {/* Posada banner */}
      <section className="relative overflow-hidden">
        <img
          src="/fotos/habitaciones/habitacion1.jpg"
          alt="Posada Moana Búzios"
          className="w-full h-72 object-cover"
        />
        <div className="absolute inset-0 bg-moana-blue/75 flex items-center">
          <div className="container-moana text-white">
            <div className="max-w-lg">
              <span className="badge-teal mb-3 inline-block">{t('home_posada_badge')}</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">
                {t('home_posada_title')}
              </h2>
              <p className="text-white/80 mb-5">{t('home_posada_desc')}</p>
              <Link to="/posada" className="btn-primary inline-flex items-center gap-2">
                {t('home_posada_cta')} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Financing band */}
      <div className="bg-moana-orange py-5">
        <div className="container-moana flex flex-wrap justify-center gap-6 text-white text-sm font-semibold text-center">
          <span>{t('home_banner_financing')}</span>
          <span>|</span>
          <span>{t('home_banner_prices')}</span>
          <span>|</span>
          <span>{t('home_banner_posada')}</span>
          <span>|</span>
          <span>{t('home_banner_team')}</span>
        </div>
      </div>
    </>
  );
}
