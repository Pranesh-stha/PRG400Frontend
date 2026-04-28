import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-line bg-primary-subtle">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
              <Compass className="h-5 w-5 text-primary" />
              Stay
            </Link>
            <p className="text-sm leading-relaxed text-ink-muted">
              Find unique places to stay and host your own. Built for curious travelers.
            </p>
          </div>

          <FooterCol
            title="Company"
            items={['About', 'Press', 'Careers', 'Newsroom']}
          />
          <FooterCol
            title="Support"
            items={['Help Center', 'Trust & Safety', 'Cancellation', 'Report']}
          />
          <FooterCol
            title="Hosting"
            items={['List your place', 'Host resources', 'Community forum', 'Insurance']}
          />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-ink-line pt-6 text-xs text-ink-muted md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Stay. A student project.</span>
          <div className="flex gap-4">
            <span className="hover:text-ink cursor-pointer">Privacy</span>
            <span className="hover:text-ink cursor-pointer">Terms</span>
            <span className="hover:text-ink cursor-pointer">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-ink">{title}</h4>
      <ul className="space-y-2 text-sm text-ink-muted">
        {items.map((it) => (
          <li key={it} className="hover:text-ink cursor-pointer transition-colors">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
