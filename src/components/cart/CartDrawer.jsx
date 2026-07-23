import { useEffect, useRef } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import useCartStore from '../../store/cartStore';

const TEMPORADA_LABELS = {
  baja: 'Temporada Baja',
  alta: 'Temporada Alta',
  semana_santa: 'Semana Santa',
  finde_largo: 'Fin de Semana Largo',
  vacaciones_invierno: 'Vacaciones de Invierno',
};

const HOTEL_LABELS = {
  economico: 'Est\u00e1ndar',
  familiar: 'Familiar',
  premium: 'Premium',
};

const WA_NUMBER = '5522998024697';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, generateWhatsAppMessage } = useCartStore();
  const drawerRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeCart]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleWhatsApp = () => {
    const msg = generateWhatsAppMessage();
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 cart-backdrop"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white shadow-2xl
                   flex flex-col animate-slide-in-right"
        aria-label="Carrito de consultas"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-moana-blue text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <h2 className="font-display font-bold text-lg">Mi Consulta</h2>
            {items.length > 0 && (
              <span className="bg-moana-orange text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <div className="w-20 h-20 bg-moana-blue-pale rounded-full flex items-center justify-center">
                <ShoppingBag size={32} className="text-moana-blue opacity-40" />
              </div>
              <h3 className="font-display font-semibold text-moana-blue text-xl">
                Tu consulta está vacía
              </h3>
              <p className="text-moana-gray text-sm">
                Explorá nuestros paquetes y añadí los que te interesen para consultarnos por WhatsApp
              </p>
              <button
                onClick={closeCart}
                className="btn-primary flex items-center gap-2"
              >
                Ver paquetes <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.cartId}
                  className="card p-4 flex gap-3"
                >
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    onError={(e) => { e.target.src = '/fotos/home.jpg'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-moana-blue text-sm leading-tight">
                      {item.titulo}
                    </h4>
                    <p className="text-moana-gray text-xs mt-1">
                      {TEMPORADA_LABELS[item.temporada]} · Hotel {HOTEL_LABELS[item.hotel]}
                    </p>
                    <p className="text-moana-gray text-xs">
                      👥 {item.pasajeros} pasajero{item.pasajeros > 1 ? 's' : ''}
                    </p>
                    {item.precio ? (
                      <p className="text-moana-orange font-bold text-sm mt-1">
                        DESDE USD {item.precio} / persona
                      </p>
                    ) : (
                      <p className="text-moana-teal-dark text-xs mt-1">
                        ✉️ Precio a consultar
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.cartId)}
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 self-start"
                    aria-label="Eliminar del carrito"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-moana-cream space-y-3">
            <p className="text-xs text-moana-gray text-center">
              💳 Financiación en cuotas sin tarjeta disponible
            </p>
            <button
              id="whatsapp-send-btn"
              onClick={handleWhatsApp}
              className="btn-whatsapp w-full justify-center text-sm font-bold py-4"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.863L0 24l6.338-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.776 9.776 0 01-5.013-1.38l-.36-.213-3.764.89.937-3.654-.234-.376A9.78 9.78 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
              </svg>
              ¡Consultar por WhatsApp! ({items.length} paquete{items.length > 1 ? 's' : ''})
            </button>
            <button
              onClick={() => useCartStore.getState().clearCart()}
              className="w-full text-xs text-moana-gray hover:text-red-400 transition-colors text-center py-1"
            >
              Vaciar consulta
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
