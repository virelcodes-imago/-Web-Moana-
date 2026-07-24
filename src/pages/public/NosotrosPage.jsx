import { equipoData } from '../../data/equipo';
import { useLanguage } from '../../i18n/LanguageContext';

export default function NosotrosPage() {
  const { t } = useLanguage();
  const equipoVisible = equipoData.filter((e) => e.visible).sort((a, b) => a.orden - b.orden);

  const NOSOTROS = [
    { titleKey: 'nosotros_sec1_title', textKey: 'nosotros_sec1_text', imagen: '/fotos/Nosotros.jpg' },
    { titleKey: 'nosotros_sec2_title', textKey: 'nosotros_sec2_text', imagen: '/fotos/home.jpg' },
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-moana-blue py-14 text-white">
        <div className="container-moana text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-3">{t('nosotros_header_title')}</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">{t('nosotros_header_subtitle')}</p>
        </div>
      </div>

      {/* About sections */}
      {NOSOTROS.map(({ titleKey, textKey, imagen }, i) => (
        <section key={i} className={i % 2 === 0 ? 'section-white' : 'section-cream'}>
          <div className={`container-moana grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
            <div className={i % 2 !== 0 ? 'lg:order-2' : ''}>
              <h2 className="section-title mb-4">{t(titleKey)}</h2>
              <p className="text-moana-gray leading-relaxed">{t(textKey)}</p>
            </div>
            <div className={`rounded-2xl overflow-hidden shadow-card ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
              <img
                src={imagen}
                alt={t(titleKey)}
                className="w-full h-[480px] object-cover object-top"
                onError={(e) => { e.target.src = '/fotos/home.jpg'; }}
              />
            </div>
          </div>
        </section>
      ))}

      {/* Team */}
      <section className="section-pale-blue">
        <div className="container-moana">
          <div className="text-center mb-10">
            <h2 className="section-title">{t('nosotros_equipo_title')}</h2>
            <p className="section-subtitle">{t('nosotros_equipo_subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {equipoVisible.map((miembro) => (
              <div key={miembro.id} className="card p-5 text-center group">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-moana-blue-pale">
                  {miembro.imagen ? (
                    <img
                      src={miembro.imagen}
                      alt={miembro.vendedor}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full bg-moana-blue flex items-center justify-center text-white text-2xl font-bold"
                    style={{ display: miembro.imagen ? 'none' : 'flex' }}
                  >
                    {miembro.vendedor.charAt(0)}
                  </div>
                </div>
                <h3 className="font-semibold text-moana-blue text-sm">{miembro.vendedor}</h3>
                <p className="text-moana-gray text-xs mt-0.5">{miembro.cargo}</p>
                {miembro.contactar && miembro.telefono && (
                  <a
                    href={`https://wa.me/${miembro.telefono}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 text-xs text-[#25D366] font-medium hover:underline"
                  >
                    WhatsApp →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-blue">
        <div className="container-moana text-center">
          <h2 className="font-display font-bold text-3xl mb-4">{t('nosotros_cta_title')}</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">{t('nosotros_cta_desc')}</p>
          <a
            href="https://wa.me/5522998024697?text=Hola%20Moana!%20Quiero%20planificar%20mi%20viaje%20%F0%9F%8C%8A"
            target="_blank"
            rel="noreferrer"
            className="btn-whatsapp inline-flex"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
            </svg>
            {t('nosotros_cta_btn')}
          </a>
        </div>
      </section>
    </>
  );
}
