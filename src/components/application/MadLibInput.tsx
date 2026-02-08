import { cn } from '@/lib/utils';

interface MadLibInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  type?: string;
}

export default function MadLibInput({
  value,
  onChange,
  placeholder,
  className,
  type = 'text',
}: MadLibInputProps) {
  return (
    <span className={cn('madlib-field group/ml inline-block relative', className)}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent border-none outline-none font-bold text-white placeholder:text-white/30 placeholder:font-normal w-full py-0.5 text-inherit"
      />
      {/* Rainbow underline */}
      <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-[hsl(160_40%_55%)] via-[hsl(200_60%_60%)] to-[hsl(280_50%_65%)] opacity-30 group-hover/ml:opacity-80 group-focus-within/ml:opacity-100 transition-opacity duration-300" />
    </span>
  );
}
