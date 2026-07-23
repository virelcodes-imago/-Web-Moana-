import { Phone, Mail, MapPin, Instagram, Clock } from 'lucide-react';

export default function ContactoPage() {
  return (
    <>
      <div className="bg-moana-blue py-14 text-white">
        <div className="container-moana text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-3">Contacto</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            ¿Querés planificar tu viaje? Nuestro equipo te responde al instante por WhatsApp.
          </p>
        </div>
      </div>

      <section className="section-cream">
        <div className="container-moana grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Info */}
          <div className="space-y-6">
            <h2 className="section-title">Estamos para ayudarte</h2>

            <div className="space-y-4">
              <a href="tel:+5491126810289" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                <div className="w-12 h-12 bg-moana-blue rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-moana-blue text-sm">Teléfono / WhatsApp</p>
                  <p className="text-moana-gray">+54 9 11 2681-0289</p>
                </div>
              </a>

              <a href="mailto:reservas@moanaturismo.com" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                <div className="w-12 h-12 bg-moana-orange rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-moana-blue text-sm">Email</p>
                  <p className="text-moana-gray">reservas@moanaturismo.com</p>
                </div>
              </a>

              <a href="https://instagram.com/moanaturismo.oficial" target="_blank" rel="noreferrer"
                 className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Instagram size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-moana-blue text-sm">Instagram</p>
                  <p className="text-moana-gray">@moanaturismo.oficial</p>
                </div>
              </a>

              <div className="card p-4 flex items-start gap-4">
                <div className="w-12 h-12 bg-moana-teal rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-moana-blue" />
                </div>
                <div>
                  <p className="font-semibold text-moana-blue text-sm">Dirección</p>
                  <p className="text-moana-gray">Rua portal da Ferradura Nº10, Búzios, Rio de Janeiro, Brasil</p>
                </div>
              </div>

              <div className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-moana-blue-pale rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-moana-blue" />
                </div>
                <div>
                  <p className="font-semibold text-moana-blue text-sm">Horarios de atención</p>
                  <p className="text-moana-gray">Lunes a Sábados, 9:00 a 18:00 (BRT)</p>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA card */}
          <div className="card p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-[#25D366] rounded-full flex items-center justify-center mb-5">
              <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
              </svg>
            </div>
            <h3 className="font-display font-bold text-moana-blue text-2xl mb-2">
              ¡La forma más rápida!
            </h3>
            <p className="text-moana-gray mb-6">
              Escribinos por WhatsApp y en minutos te respondemos con precios, disponibilidad y opciones de financiación.
            </p>
            <a
              href="https://wa.me/5491126810289?text=Hola%20Moana!%20Quiero%20consultar%20sobre%20un%20viaje%20%F0%9F%8C%8A"
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp text-base px-8 py-4"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
              </svg>
              Escribir ahora por WhatsApp
            </a>
            <p className="text-xs text-moana-gray mt-3">💳 Financiación en cuotas sin tarjeta disponible</p>
          </div>
        </div>
      </section>
    </>
  );
}
