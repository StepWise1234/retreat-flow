import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const BRAND_COLORS = ['#FFA500', '#FF4500', '#800080'];
const DOT_SIZE_SM = 'h-4 w-4';
const DOT_SIZE_MD = 'md:h-5 md:w-5';

export default function FloatingLogo() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const isSubPage = !isHomePage;

  useEffect(() => {
    if (isSubPage) return; // dots-only on sub pages
    const threshold = window.innerHeight * 0.65;

    const handleScroll = () => {
      setExpanded(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSubPage]);

  const handleClick = () => {
    if (isSubPage) {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      className="fixed top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2 cursor-pointer"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleClick}
    >
      {/* Text — slides in/out (hidden on /apply) */}
      {!isSubPage && (
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
      )}

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
  );
}
