
import React from 'react';
import Link from 'next/link';

interface Crumb {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="bg-white border-b border-forest/5 py-4" aria-label="Breadcrumb">
      <div className="w-full max-w-[2400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
        <ul className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-charcoal/40">
          <li>
            <Link href="/" className="hover:text-forest transition-colors">Home</Link>
          </li>
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <li className="flex items-center">
                <i className="fas fa-chevron-right text-[7px] opacity-30"></i>
              </li>
              <li>
                {item.path ? (
                  <Link href={item.path} className="hover:text-forest transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-forest">{item.label}</span>
                )}
              </li>
            </React.Fragment>
          ))}
        </ul>
      </div>
    </nav>
  );
};
