import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChipSelectorProps {
  items: string[];
  selected: string[];
  onChange: (items: string[]) => void;
  columns?: number;
}

export default function ChipSelector({ items, selected, onChange, columns }: ChipSelectorProps) {
  const toggle = (item: string) => {
    onChange(
      selected.includes(item)
        ? selected.filter((i) => i !== item)
        : [...selected, item],
    );
  };

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2',
        columns === 1 && 'flex-col',
      )}
    >
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <motion.button
            key={item}
            type="button"
            onClick={() => toggle(item)}
            className={cn(
              'relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium',
              'border transition-all duration-200',
              active
                ? 'bg-[hsl(160_30%_65%/0.15)] border-[hsl(160_30%_65%/0.5)] text-white shadow-[0_0_12px_-4px_hsl(160_30%_65%/0.3)]'
                : 'bg-white/[0.04] border-white/10 text-white/50 hover:bg-white/[0.08] hover:text-white/70 hover:border-white/20',
            )}
            whileTap={{ scale: 0.95 }}
            layout
          >
            {active && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(160_30%_65%)] text-black"
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </motion.span>
            )}
            {item}
          </motion.button>
        );
      })}
    </div>
  );
}
