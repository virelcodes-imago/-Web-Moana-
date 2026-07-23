import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Heart } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();

  const NAV_LINKS = [
    [t('nav_inicio'), '/'],
    [t('nav_paquetes'), '/paquetes'],
    [t('nav_posada'), '/posada'],
    [t('nav_nosotros'), '/nosotros'],
    [t('nav_contacto'), '/contacto'],
  ];

  return (
    <footer className="bg-moana-blue text-white">
      {/* Main footer */}
      <div className="container-moana py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <img src="/fotos/LOGOS/logo.png" alt="Moana Turismo" className="h-20 w-auto mb-4" />
          <p className="text-white/70 text-sm leading-relaxed">{t('footer_tagline')}</p>
          <div className="flex gap-3 mt-4">
            <a
              href="https://instagram.com/moanaturismo.oficial"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 bg-white/10 hover:bg-moana-orange rounded-full flex items-center justify-center transition-colors"
              aria-label="Instagram Moana Turismo"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://wa.me/5491126810289"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 bg-white/10 hover:bg-[#25D366] rounded-full flex items-center justify-center transition-colors"
              aria-label="WhatsApp Moana Turismo"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold text-moana-orange mb-4 text-sm uppercase tracking-wider">
            {t('footer_nav_title')}
          </h3>
          <ul className="space-y-2">
            {NAV_LINKS.map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="text-white/70 hover:text-moana-orange transition-colors text-sm">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Destinations */}
        <div>
          <h3 className="font-semibold text-moana-orange mb-4 text-sm uppercase tracking-wider">
            {t('footer_dest_title')}
          </h3>
          <ul className="space-y-2">
            {[
              ['Búzios Full', '/paquetes/buzios-full'],
              ['Bayahíbe All Inclusive', '/paquetes/bayahibe'],
              ['Miami / Orlando', '/paquetes/miami-orlando-full'],
              ['Cataratas Iguazú', '/paquetes/cataratas-iguazu'],
              ['Europa Soñada', '/paquetes/europa-sonada'],
              ['Cancún All Inclusive', '/paquetes/cancun'],
              ['El Calafate', '/paquetes/el-calafate'],
              ['Salta + Jujuy', '/paquetes/salta-jujuy'],
            ].map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="text-white/70 hover:text-moana-orange transition-colors text-sm">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-moana-orange mb-4 text-sm uppercase tracking-wider">
            {t('footer_contact_title')}
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-white/70 text-sm">
              <MapPin size={16} className="mt-0.5 text-moana-teal flex-shrink-0" />
              Mar del Plata, Argentina
            </li>
            <li className="flex items-start gap-2 text-white/70 text-sm">
              <MapPin size={16} className="mt-0.5 text-moana-teal flex-shrink-0" />
              Rua portal da Ferradura Nº10, Búzios, Brasil
            </li>
            <li>
              <a href="tel:+5491126810289" className="flex items-center gap-2 text-white/70 hover:text-moana-orange transition-colors text-sm">
                <Phone size={16} className="text-moana-teal" />
                +54 9 11 2681-0289
              </a>
            </li>
            <li>
              <a href="mailto:reservas@moanaturismo.com" className="flex items-center gap-2 text-white/70 hover:text-moana-orange transition-colors text-sm">
                <Mail size={16} className="text-moana-teal" />
                reservas@moanaturismo.com
              </a>
            </li>
          </ul>

          <div className="mt-5 p-3 bg-white/10 rounded-xl text-xs text-white/60 leading-relaxed">
            {t('footer_financing')}<br/>
            {t('footer_quality')}<br/>
            {t('footer_experience')}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-moana py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-white/50 text-xs">
          <p>© {year} Moana Turismo. {t('footer_rights')}</p>
          <p className="flex items-center gap-1">
            {t('footer_made_with')} <Heart size={11} className="text-moana-orange" /> {t('footer_made_in')}
          </p>
        </div>
      </div>
    </footer>
  );
}
