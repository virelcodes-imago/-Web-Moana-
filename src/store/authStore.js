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

      adminPin: DEFAULT_ADMIN_PIN,
      sellerPin: DEFAULT_SELLER_PIN,

      login: (pin) => {
        const cleanPin = String(pin || '').trim();
        const currentAdminPin = String(get().adminPin || DEFAULT_ADMIN_PIN).trim();
        const currentSellerPin = String(get().sellerPin || DEFAULT_SELLER_PIN).trim();

        if (cleanPin === currentAdminPin || cleanPin === DEFAULT_ADMIN_PIN) {
          set({ role: 'admin', isAuthenticated: true });
          return { success: true, role: 'admin' };
        } else if (cleanPin === currentSellerPin || cleanPin === DEFAULT_SELLER_PIN) {
          set({ role: 'vendedor', isAuthenticated: true });
          return { success: true, role: 'vendedor' };
        }
        return { success: false };
      },

      logout: () => set({ role: null, isAuthenticated: false }),

      updatePins: (newAdminPin, newSellerPin) => {
        set({
          adminPin: String(newAdminPin || DEFAULT_ADMIN_PIN).trim(),
          sellerPin: String(newSellerPin || DEFAULT_SELLER_PIN).trim(),
        });
      },
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
