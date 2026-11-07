import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUp, ChevronDown, ChevronUp, Home, HeartPulse, Droplet, Radio, Backpack } from 'lucide-react';
import { escapeHtml } from '../lib/utils';
import { EMERGENCY_SECTIONS } from '../lib/types';

export const Emergency: React.FC = () => {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    an: true,
    enkaz: true,
    sonra: true,
    su: true,
    haber: true,
    canta: true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const sectionIcons: Record<string, React.ReactNode> = {
    an: <AlertTriangle className="w-5 h-5" />,
    enkaz: <HeartPulse className="w-5 h-5" />,
    sonra: <Home className="w-5 h-5" />,
    su: <Droplet className="w-5 h-5" />,
    haber: <Radio className="w-5 h-5" />,
    canta: <Backpack className="w-5 h-5" />,
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-has-blue text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-has-red" />
          Acil Durum
        </h1>
        <p className="text-has-textMuted mt-2">
          Bu sayfa AFAD ve EPA kaynaklarından derlenmiştir. Resmi talimatlar her zaman önceliklidir.
        </p>
      </div>

      <div className="has-table has-alarm mb-6">
        <tr>
          <td>Hayati tehlike varsa ve telefon çalışıyorsa: <strong>112</strong></td>
        </tr>
      </div>

      <nav className="has-toc mb-6" aria-label="İçindekiler">
        <strong>İçindekiler:</strong>
        {EMERGENCY_SECTIONS.map((section) => (
          <span key={section.id} className="mx-2">
            <a
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(section.id);
              }}
              className="text-has-blue hover:text-has-orange text-sm"
            >
              {section.title}
            </a>
          </span>
        ))}
      </nav>

      <div className="space-y-4">
        {EMERGENCY_SECTIONS.map((section) => (
          <section key={section.id} id={section.id}>
            <div className="has-table">
              <tr>
                <td className="has-td-cat">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {sectionIcons[section.id]}
                      {section.title}
                    </div>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="p-1 text-has-textMuted hover:text-has-text rounded transition-colors"
                      aria-label={expandedSections[section.id] ? 'Daralt' : 'Genişlet'}
                      aria-expanded={expandedSections[section.id]}
                    >
                      {expandedSections[section.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </td>
              </tr>
              {expandedSections[section.id] && (
                <>
                  <tr>
                    <td className="has-row1">
                      <ul className="space-y-2">
                        {section.items.map((item, index) => (
                          <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td className="has-src">
                      {escapeHtml(section.source)}
                    </td>
                  </tr>
                </>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="has-table mt-6">
        <tr>
          <td className="has-td-cat">Daha fazlası</td>
        </tr>
        <tr>
          <td className="has-row1">
            İlk yardım, su arıtma ve barınma için ayrıntılı kaynaklar{' '}
            <Link to="/library?category=Sağlık" className="text-has-blue hover:text-has-orange">
              Sağlık ve İlk Yardım
            </Link>{' '}
            ve{' '}
            <Link to="/library?category=Hayatta Kalma" className="text-has-blue hover:text-has-orange">
              Hayatta Kalma ve Hazırlık
            </Link>{' '}
            bölümlerinde. Bu sayfa resmi kaynakların özetidir; sağlık ekiplerinin ve yetkililerin
            talimatları her zaman önceliklidir.
          </td>
        </tr>
      </div>

      <div className="has-copy mt-6">
        HAS_PrepperDisk &middot; Bu sayfa çevrimdışı çalışır, yazdırılabilir.
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <a
          href="#top"
          className="p-3 bg-has-blue text-white rounded-full shadow-lg hover:bg-[#00527a] transition-colors"
          aria-label="Başa dön"
        >
          <ArrowUp className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};