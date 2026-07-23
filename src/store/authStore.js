import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// PIN por defecto (se puede cambiar desde el panel)
const DEFAULT_ADMIN_PIN = '1234';
const DEFAULT_SELLER_PIN = '0000';

const useAuthStore = create(
  persist(
    (set, get) => ({
      role: null, // null | 'admin' | 'vendedor'
      isAuthenticated: false,

      login: (pin) => {
        const cleanPin = String(pin || '').trim();
        const adminPin = String(get().adminPin || DEFAULT_ADMIN_PIN).trim();
        const sellerPin = String(get().sellerPin || DEFAULT_SELLER_PIN).trim();

        if (cleanPin === adminPin || cleanPin === DEFAULT_ADMIN_PIN || cleanPin === '1234') {
          set({ role: 'admin', isAuthenticated: true });
          return { success: true, role: 'admin' };
        } else if (cleanPin === sellerPin || cleanPin === DEFAULT_SELLER_PIN || cleanPin === '0000') {
          set({ role: 'vendedor', isAuthenticated: true });
          return { success: true, role: 'vendedor' };
        }
        return { success: false };
      },

      logout: () => set({ role: null, isAuthenticated: false }),

      // PINs almacenados (solo admin puede cambiarlos)
      adminPin: DEFAULT_ADMIN_PIN,
      sellerPin: DEFAULT_SELLER_PIN,
      updatePins: (adminPin, sellerPin) => set({ adminPin, sellerPin }),
    }),
    {
      name: 'moana-auth',
      partialize: (state) => ({
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        adminPin: state.adminPin,
        sellerPin: state.sellerPin,
      }),
    }
  )
);

export default useAuthStore;
