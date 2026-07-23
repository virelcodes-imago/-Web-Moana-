import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Volver arriba"
      className="fixed bottom-24 right-7 z-40 w-12 h-12 bg-moana-blue hover:bg-moana-orange text-white
                 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110
                 transition-all duration-300 border-2 border-white/30 group animate-fade-up"
    >
      <ChevronUp size={24} className="group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}
