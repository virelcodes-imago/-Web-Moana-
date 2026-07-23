import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NACIONAL_SEASON_TEXT } from '../data/paquetes';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (paquete, opciones = {}) => {
        const { items } = get();
        const existing = items.find(
          (i) => i.id === paquete.id &&
            i.temporada === opciones.temporada &&
            i.hotel === opciones.hotel
        );
        if (existing) return; // Ya está en el carrito
        set({
          items: [...items, {
            ...paquete,
            temporada: opciones.temporada || 'baja',
            hotel: opciones.hotel || 'economico',
            habitacion: opciones.habitacion || 'doble',
            pasajeros: opciones.pasajeros || 2,
            precio: opciones.precio || null,
            cantidad: 1,
            cartId: `${paquete.id}-${Date.now()}`,
          }],
          isOpen: true,
        });
      },

      removeItem: (cartId) => {
        set({ items: get().items.filter((i) => i.cartId !== cartId) });
      },

      updatePasajeros: (cartId, pasajeros) => {
        set({
          items: get().items.map((i) =>
            i.cartId === cartId ? { ...i, pasajeros } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      // Genera el mensaje de WhatsApp formateado
      generateWhatsAppMessage: () => {
        const { items } = get();
        if (!items.length) return '';

        const TEMPORADA_LABELS = {
          baja: 'Temporada Baja',
          alta: 'Temporada Alta',
          semana_santa: 'Semana Santa',
          vacaciones_invierno: 'Vacaciones de Invierno',
        };
        const HOTEL_LABELS = {
          economico: 'Est\u00e1ndar \u2b50\u2b50',
          familiar: 'Familiar ⭐⭐⭐',
          premium: 'Premium ⭐⭐⭐⭐',
        };

        let msg = `🌊 *MOANA TURISMO — Nueva Consulta*\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

        items.forEach((item, idx) => {
          msg += `*${idx + 1}. ${item.titulo}*\n`;
          if (item.noches) msg += `   🌙 ${item.noches} noches\n`;
          const isInter = item.categoria === 'internacional';
          const isNacional = item.categoria === 'nacional';
          const hotelLabel = isInter
            ? (item.hotel === 'premium' ? 'All Inclusive 🍹' : 'Con Desayuno ☕')
            : (HOTEL_LABELS[item.hotel] || item.hotel);
          if (isNacional) {
            msg += `   📅 ${NACIONAL_SEASON_TEXT}\n`;
          } else {
            msg += `   ${isInter ? '🍽️ Plan' : '🏨 Hotel'}: ${hotelLabel}\n`;
          }
          msg += `   🛏️ Habitación: ${item.habitacion}\n`;
          msg += `   👥 Pasajeros: ${item.pasajeros}\n`;
          if (item.precio) {
            msg += `   💰 *DESDE USD ${item.precio} por persona*\n`;
          }
          msg += `\n`;
        });

        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `¡Hola! Me interesa${items.length > 1 ? 'n estos paquetes' : ' este paquete'} 😊\n`;
        msg += `¿Podrían darme más información y disponibilidad?`;

        return msg;
      },
    }),
    {
      name: 'moana-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
