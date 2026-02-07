import { useState, useEffect, useRef, type ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface OrbitalItem {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  icon: ElementType;
}

interface OrbitalTimelineProps {
  items: OrbitalItem[];
  /** Radius of the orbit in px — should roughly match the sage circle */
  radius?: number;
  /** Radius on mobile */
  mobileRadius?: number;
}

export default function OrbitalTimeline({
  items,
  radius = 230,
  mobileRadius = 160,
}: OrbitalTimelineProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const currentRadius = isMobile ? mobileRadius : radius;

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.04) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const toggleItem = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setAutoRotate(true);
    } else {
      setExpandedId(id);
      setAutoRotate(false);
      // Rotate so the clicked item goes to top (270°)
      const index = items.findIndex((i) => i.id === id);
      const targetAngle = (index / items.length) * 360;
      setRotationAngle(270 - targetAngle);
    }
  };

  // handleBackdropClick removed — using overlay instead

  const getNodePosition = (index: number) => {
    const angle = ((index / items.length) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;
    const x = currentRadius * Math.cos(radian);
    const y = currentRadius * Math.sin(radian);
    // Depth effect — items at "back" are slightly smaller/dimmer
    const depthScale = 0.75 + 0.25 * ((1 + Math.sin(radian)) / 2);
    const depthOpacity = 0.5 + 0.5 * ((1 + Math.sin(radian)) / 2);
    const zIndex = Math.round(50 + 50 * Math.sin(radian));
    return { x, y, depthScale, depthOpacity, zIndex, angle };
  };

  const dismiss = () => {
    setExpandedId(null);
    setAutoRotate(true);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20 pointer-events-none"
    >
      {/* Full-screen dismiss overlay when a card is expanded */}
      {expandedId !== null && (
        <div
          className="fixed inset-0 z-10 pointer-events-auto"
          onClick={dismiss}
        />
      )}

      {/* Orbit ring — faint dashed circle */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed"
        style={{
          width: currentRadius * 2,
          height: currentRadius * 2,
          borderColor: 'hsl(160 30% 72% / 0.3)',
        }}
      />

      {/* Orbital nodes */}
      {items.map((item, index) => {
        const pos = getNodePosition(index);
        const isExpanded = expandedId === item.id;
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            className="absolute left-1/2 top-1/2 pointer-events-auto"
            style={{
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
              zIndex: isExpanded ? 200 : pos.zIndex,
              transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease',
              opacity: isExpanded ? 1 : pos.depthOpacity,
            }}
          >
            {/* Icon button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleItem(item.id);
              }}
              className="group relative flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none"
              style={{
                width: isExpanded ? 52 : 44,
                height: isExpanded ? 52 : 44,
                transform: `scale(${isExpanded ? 1.15 : pos.depthScale})`,
                background: isExpanded
                  ? 'hsl(160 30% 72%)'
                  : 'hsl(var(--card) / 0.9)',
                border: isExpanded
                  ? '2px solid hsl(160 30% 62%)'
                  : '1.5px solid hsl(160 30% 72% / 0.5)',
                boxShadow: isExpanded
                  ? '0 0 20px hsl(160 30% 72% / 0.4), 0 4px 12px hsl(0 0% 0% / 0.1)'
                  : '0 2px 8px hsl(0 0% 0% / 0.06)',
              }}
            >
              <Icon
                size={isExpanded ? 20 : 17}
                className="transition-colors duration-300"
                style={{
                  color: isExpanded
                    ? 'hsl(160 30% 20%)'
                    : 'hsl(160 30% 42%)',
                }}
              />

              {/* Pulse ring on hover */}
              <span
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: '0 0 0 4px hsl(160 30% 72% / 0.2)',
                }}
              />
            </button>

            {/* Label below icon */}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-center transition-all duration-300"
              style={{
                transform: `translateX(-50%) scale(${isExpanded ? 1 : pos.depthScale})`,
                opacity: isExpanded ? 1 : pos.depthOpacity * 0.8,
              }}
            >
              <span
                className="text-[10px] font-semibold tracking-wider uppercase"
                style={{
                  color: isExpanded
                    ? 'hsl(160 30% 35%)'
                    : 'hsl(var(--muted-foreground))',
                }}
              >
                {item.title}
              </span>
            </div>

            {/* Expanded card */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-1/2 -translate-x-1/2 w-64 sm:w-72"
                  style={{
                    top: '70px',
                    zIndex: 250,
                  }}
                >
                  <div
                    className="rounded-xl border p-5 shadow-xl"
                    style={{
                      background: 'hsl(var(--card) / 0.95)',
                      backdropFilter: 'blur(16px)',
                      borderColor: 'hsl(160 30% 72% / 0.3)',
                    }}
                  >
                    {/* Arrow */}
                    <div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
                      style={{
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderBottom: '6px solid hsl(160 30% 72% / 0.3)',
                      }}
                    />

                    {/* Close button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismiss();
                      }}
                      className="absolute top-2.5 right-2.5 rounded-full p-1 transition-colors hover:bg-secondary"
                    >
                      <X size={14} className="text-muted-foreground" />
                    </button>

                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
                        style={{
                          background: 'hsl(160 30% 72% / 0.2)',
                        }}
                      >
                        <Icon size={14} style={{ color: 'hsl(160 30% 35%)' }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
