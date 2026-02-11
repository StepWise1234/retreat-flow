import { Link } from 'react-router-dom';

const BRAND_COLORS = ['#FFA500', '#FF4500', '#800080'];

const NAV_LINKS = [
  { label: 'Find a Facilitator', href: '/facilitators' },
  { label: 'Common Questions', href: '#faq' },
  { label: 'Apply', href: '/apply' },
];

export default function SiteFooter() {
  return (
    <footer className="relative bg-background border-t border-foreground/10">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-20">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
            StepWise
          </h2>
          <div className="flex items-center gap-2 sm:gap-3">
            {BRAND_COLORS.map((color, i) => (
              <span
                key={i}
                className="block h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-wrap gap-x-8 gap-y-3 mb-12">
          {NAV_LINKS.map((link) =>
            link.href.startsWith('/') ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm text-foreground/50 hover:text-foreground transition-colors duration-200"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-foreground/50 hover:text-foreground transition-colors duration-200"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Divider */}
        <div className="h-px bg-foreground/10 mb-6" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-foreground/30">
            © {new Date().getFullYear()} StepWise. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-foreground/30 hover:text-foreground/60 transition-colors duration-200">
              Privacy
            </a>
            <a href="#" className="text-xs text-foreground/30 hover:text-foreground/60 transition-colors duration-200">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
