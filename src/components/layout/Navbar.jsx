import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone, Instagram } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import { useLanguage } from '../../i18n/LanguageContext';

const NAV_KEYS = [
  { key: 'nav_inicio', to: '/' },
  { key: 'nav_paquetes', to: '/paquetes' },
  { key: 'nav_posada', to: '/posada' },
  { key: 'nav_nosotros', to: '/nosotros' },
  { key: 'nav_contacto', to: '/contacto' },
];

const LANG_OPTIONS = [
  { code: 'es', flag: '🇦🇷' },
  { code: 'pt', flag: '🇧🇷' },
  { code: 'en', flag: '🇺🇸' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items, toggleCart } = useCartStore();
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const cartCount = items.length;

  return (
    <>
      {/* Top bar */}
      <div className="bg-moana-blue text-white text-xs py-1.5 hidden md:block">
        <div className="container-moana flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>📍 Mar del Plata, Argentina</span>
            <span className="text-white/30">|</span>
            <span>📍 Búzios, Brasil</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+5522998090599" className="flex items-center gap-1 hover:text-moana-orange transition-colors">
              <Phone size={12} /> +55 22 99809-0599
            </a>
            <a href="https://instagram.com/moanaturismo.oficial" target="_blank" rel="noreferrer"
               className="flex items-center gap-1 hover:text-moana-orange transition-colors">
              <Instagram size={12} /> @moanaturismo.oficial
            </a>
            {/* Language selector */}
            <div className="flex items-center gap-1 ml-2 border-l border-white/20 pl-3">
              {LANG_OPTIONS.map(({ code, flag }) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`px-1.5 py-0.5 rounded text-base transition-all ${
                    lang === code
                      ? 'opacity-100 scale-125'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                  aria-label={`Cambiar idioma a ${code.toUpperCase()}`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white shadow-moana'
            : 'bg-white/95 backdrop-blur-sm shadow-sm'
        }`}
      >
        <div className="container-moana flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/fotos/LOGOS/logo.png"
              alt="Moana Turismo"
              className="h-12 md:h-14 w-auto"
            />
            <div className="hidden sm:block">
              <p className="text-[10px] font-medium text-moana-gray leading-tight">
                AGENCIA DE TURISMO
              </p>
              <p className="text-[10px] text-moana-teal-dark font-medium">ARGENTINA · BRASIL</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_KEYS.map(({ key, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `nav-link text-sm ${isActive ? 'text-moana-orange font-semibold' : ''}`
                }
              >
                {t(key)}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/5522998090599"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex btn-primary text-sm px-4 py-2 items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
              </svg>
              {t('nav_consultar')}
            </a>

            {/* Cart button */}
            <button
              id="cart-toggle-btn"
              onClick={toggleCart}
              className="relative p-2 text-moana-blue hover:text-moana-orange transition-colors"
              aria-label="Ver carrito"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-moana-orange text-white text-xs
                                 w-5 h-5 rounded-full flex items-center justify-center font-bold
                                 animate-pulse-slow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-moana-blue"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
            <nav className="container-moana py-4 flex flex-col gap-1">
              {NAV_KEYS.map(({ key, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `py-3 px-4 rounded-xl font-medium transition-colors ${
                      isActive
                        ? 'bg-moana-orange-light text-moana-orange-dark'
                        : 'text-moana-dark hover:bg-moana-blue-pale'
                    }`
                  }
                >
                  {t(key)}
                </NavLink>
              ))}
              {/* Mobile language switcher */}
              <div className="flex gap-2 mt-2 px-4">
                {LANG_OPTIONS.map(({ code, flag, label }) => (
                  <button
                    key={code}
                    onClick={() => setLang(code)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      lang === code
                        ? 'bg-moana-orange text-white'
                        : 'bg-gray-100 text-moana-gray hover:bg-moana-orange-light'
                    }`}
                  >
                    {flag} {label}
                  </button>
                ))}
              </div>
              <a
                href="https://wa.me/5522998090599"
                className="mt-2 btn-whatsapp justify-center text-sm"
                target="_blank"
                rel="noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
                </svg>
                Consultar por WhatsApp
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
