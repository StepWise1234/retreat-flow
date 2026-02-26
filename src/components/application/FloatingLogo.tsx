import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const BRAND_COLORS = ['#FFA500', '#FF4500', '#800080'];
const DOT_SIZE_SM = 'h-4 w-4';
const DOT_SIZE_MD = 'md:h-5 md:w-5';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Find a Facilitator', path: '/facilitators' },
  { label: 'Apply', path: '/apply' },
  { label: 'Portal', path: '/portal' },
];

export default function FloatingLogo() {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const threshold = window.innerHeight * 0.65;
    const handleScroll = () => setExpanded(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (path: string) => {
    setMenuOpen(false);
    if (path === location.pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  return (
    <div ref={menuRef} className="fixed top-6 left-6 md:top-8 md:left-8 z-50">
      <motion.div
        className="flex items-center gap-2 cursor-pointer"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {/* Text — slides in/out */}
        <motion.span
          className="text-lg md:text-xl font-bold tracking-tight text-foreground overflow-hidden whitespace-nowrap"
          animate={{
            width: expanded ? 'auto' : 0,
            opacity: expanded ? 1 : 0,
            marginRight: expanded ? 4 : 0,
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          StepWise
        </motion.span>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {BRAND_COLORS.map((color, i) => (
            <motion.span
              key={i}
              className={`block rounded-full ${DOT_SIZE_SM} ${DOT_SIZE_MD}`}
              style={{ backgroundColor: color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </div>
      </motion.div>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="absolute top-full left-0 mt-2 min-w-[180px] rounded-lg bg-card border border-border shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer
                    ${isActive
                      ? 'bg-primary/8 text-primary'
                      : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                    }`}
                >
                  {link.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
