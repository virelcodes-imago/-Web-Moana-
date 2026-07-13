import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Wifi, Wind, Car, Coffee, Waves, Users } from 'lucide-react';

const SERVICIOS = [
  { icon: Wifi, label: 'WiFi Gratis' },
  { icon: Wind, label: 'Aire Acondicionado' },
  { icon: Car, label: 'Traslado Aeropuerto' },
  { icon: Coffee, label: 'Desayuno Continental' },
  { icon: Waves, label: 'Cerca de las Playas' },
  { icon: Users, label: 'Ideal Familias y Parejas' },
];

const FOTOS = [
  '/fotos/habitaciones/habitacion1.jpg',
  '/fotos/habitaciones/habitacion2.jpg',
  '/fotos/habitaciones/100924152927-01.jpg',
  '/fotos/habitaciones/100924152928-02.jpg',
  '/fotos/habitaciones/100924152929-03.jpg',
  '/fotos/habitaciones/100924152929-04.jpg',
  '/fotos/habitaciones/100924152930-05.jpg',
  '/fotos/habitaciones/100924152959-06.jpg',
];

export default function PosadaPage() {
  return (
    <>
      {/* Header */}
      <div className="relative h-72 overflow-hidden">
        <img src="/fotos/habitaciones/habitacion1.jpg" alt="Posada Moana Búzios" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-moana-blue/70 flex items-center">
          <div className="container-moana text-white">
            <span className="badge-teal mb-3 inline-block">🏡 Posada propia en Búzios</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl">Posada Moana B&B</h1>
            <p className="text-white/80 mt-2 flex items-center gap-2">
              <MapPin size={16} /> Rua portal da Ferradura Nº10, Búzios, RJ, Brasil
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="section-white">
        <div className="container-moana grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="section-title mb-4">La casa de Búzios que siempre quisiste</h2>
            <p className="text-moana-gray leading-relaxed mb-4">
              La <strong>Posada Moana B&B</strong> se encuentra en Búzios, a <strong>600m de Rua das Pedras</strong> (el centro de la ciudad) y de la Playa do Canto. A 1km de las playas de Ferradura y Tartaruga, y a solo 50m del transporte público.
            </p>
            <p className="text-moana-gray leading-relaxed mb-4">
              Nuestras habitaciones en suite cuentan con <strong>aire acondicionado, TV, minibar</strong> y un ambiente cálido y confortable, ideal tanto para parejas que buscan romanticismo como para familias que quieren comodidad.
            </p>
            <p className="text-moana-gray leading-relaxed mb-6">
              Cada mañana te espera un <strong>desayuno continental</strong> para empezar el día con energía. Por un pequeño suplemento, ofrecemos también servicio de brunch y cena con plato principal, bebida y postre.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/5522998024697?text=Hola!%20Quiero%20consultar%20disponibilidad%20en%20la%20Posada%20Moana%20%F0%9F%8C%8A"
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
                </svg>
                Consultar disponibilidad
              </a>
              <Link to="/paquetes/buzios-full" className="btn-secondary flex items-center gap-2">
                Ver paquete Búzios Full <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-moana-blue mb-4">Servicios incluidos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICIOS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-4 bg-moana-cream rounded-2xl text-center">
                  <div className="w-10 h-10 bg-moana-teal rounded-full flex items-center justify-center">
                    <Icon size={18} className="text-moana-blue" />
                  </div>
                  <p className="text-xs font-medium text-moana-dark">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-moana-blue-pale rounded-2xl text-sm text-moana-blue">
              🐾 <strong>Aceptamos mascotas</strong> • 🚭 Sector no fumador • 🌳 Jardín
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section-cream">
        <div className="container-moana">
          <h2 className="section-title text-center mb-8">Galería de la Posada</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {FOTOS.map((foto, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-2xl">
                <img
                  src={foto}
                  alt={`Posada Moana - foto ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-blue">
        <div className="container-moana text-center">
          <h2 className="font-display font-bold text-3xl mb-4">¿Listo para conocer Búzios?</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Combiná tu estadía en Posada Moana con nuestro paquete Búzios Full y viví la experiencia completa del Caribe Brasileño.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/paquetes/buzios-full" className="btn-primary">
              Ver Paquete Búzios Full
            </Link>
            <a
              href="https://wa.me/5522998024697"
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
              </svg>
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
