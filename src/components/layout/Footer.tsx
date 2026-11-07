import React from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, BookOpen, Map, HeartPulse, Wrench, GraduationCap } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    { title: 'Ansiklopedi', icon: BookOpen, path: '/library?category=Ansiklopedi' },
    { title: 'Haritalar', icon: Map, path: '/library?category=Haritalar' },
    { title: 'Sağlık', icon: HeartPulse, path: '/library?category=Sağlık' },
    { title: 'Tamir', icon: Wrench, path: '/library?category=Tamir' },
    { title: 'Eğitim', icon: GraduationCap, path: '/library?category=Eğitim' },
  ];

  return (
    <footer className="border-t border-has-border mt-auto">
      <div className="has-wrap py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {sections.map((section) => (
            <Link
              key={section.title}
              to={section.path}
              className="flex items-center gap-2 text-has-blue hover:text-has-orange transition-colors"
            >
              <section.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{section.title}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2 text-sm text-has-textMuted">
            <span>HAS_PrepperDisk &copy; {currentYear}</span>
            <span>·</span>
            <span>Raspberry Pi 5 üzerinde çalışır</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/schematrix/HAS_Prepper_Disk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-has-textMuted hover:text-has-blue transition-colors"
              aria-label="GitHub"
            >
              <GitBranch className="w-5 h-5" />
            </a>
            <a
              href="https://kiwix.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-has-textMuted hover:text-has-blue transition-colors"
            >
              Kiwix tarafından desteklenir
            </a>
            <a
              href="https://github.com/iiab/iiab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-has-textMuted hover:text-has-blue transition-colors"
            >
              Internet-in-a-Box üzerine kuruludur
            </a>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-has-textMuted">
          <p>İçerikler: Wikipedia, OpenStreetMap, Kolibri &mdash; ilgili lisanslar altında</p>
          <p className="mt-1">Bu proje Internet-in-a-Box veya Kiwix ile bağlantılı değildir.</p>
        </div>
      </div>
    </footer>
  );
};