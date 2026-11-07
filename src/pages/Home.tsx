import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Map, HeartPulse, Wrench, GraduationCap, Search as SearchIcon, Download, ExternalLink } from 'lucide-react';
import { escapeHtml } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { DEFAULT_CATEGORIES, type ZIMContentItem } from '../lib/types';
import { database } from '../lib/database';

export const Home: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [_selectedBook, _setSelectedBook] = useState('');
  const [books, setBooks] = useState<{ id: string; href: string; title: string }[]>([]);
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [diskWarnings, setDiskWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
    loadServerTime();
    loadDiskHealth();
  }, []);

  const loadBooks = async () => {
    try {
      await database.getZIMFiles();

      try {
        const response = await fetch('/kiwix/catalog/v2/entries?count=-1', { cache: 'no-store' });
        if (response.ok) {
          const xml = new DOMParser().parseFromString(await response.text(), 'application/xml');
          const entries: { id: string; href: string; title: string }[] = [];
          for (const e of xml.querySelectorAll('entry')) {
            const l = e.querySelector('link[type="text/html"]');
            if (!l) continue;
            const href = l.getAttribute('href') ?? '';
            const title = (e.querySelector('title') || {}).textContent || '';
            entries.push({ id: href.split('/').filter(Boolean).pop() || '', href, title });
          }
          setBooks(entries);
        }
      } catch {
        // Kiwix not available, use local files
      }
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServerTime = async () => {
    try {
      const response = await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
      const dateHeader = response.headers.get('Date');
      if (dateHeader) {
        setServerTime(new Date(dateHeader));
      }
    } catch {
      // Ignore
    }
  };

  const loadDiskHealth = async () => {
    try {
      const response = await fetch('/home/disk.json', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data.warnings && data.warnings.length > 0) {
          setDiskWarnings(data.warnings);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const firstZim = state.zimFiles[0];
    if (firstZim) {
      navigate(`/reader/${firstZim.id}?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/library?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleDownloadItem = (item: ZIMContentItem) => {
    // Internal routes - use navigate
    if (item.url && item.url.startsWith('/')) {
      navigate(item.url);
      return;
    }
    // External URLs
    if (item.url) {
      window.open(item.url, '_blank');
      return;
    }
    if (!item.zim) return;

    const firstZim = state.zimFiles[0];
    if (firstZim) {
      navigate(`/reader/${firstZim.id}?search=${encodeURIComponent(item.name)}`);
      return;
    }
    
    navigate('/download');
  };

  const getCategoryIcon = (title: string) => {
    switch (title) {
      case 'Ansiklopedi': return <BookOpen className="w-5 h-5" />;
      case 'Haritalar ve Navigasyon': return <Map className="w-5 h-5" />;
      case 'Sağlık ve İlk Yardım': return <HeartPulse className="w-5 h-5" />;
      case 'Tamir ve Beceriler': return <Wrench className="w-5 h-5" />;
      case 'Eğitim': return <GraduationCap className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const isItemReady = (item: ZIMContentItem, books: { id: string }[]): boolean => {
    if (item.url) return true;
    if (!item.zim) return false;
    return books.some(b => b.id.startsWith(item.zim! + '_'));
  };

  const getItemUrl = (item: ZIMContentItem, books: { id: string; href: string }[]): string | null => {
    if (item.url) return item.url;
    if (!item.zim) return null;
    const match = books.filter(b => b.id.startsWith(item.zim + '_')).sort((a, z) => a.id < z.id ? 1 : -1)[0];
    return match?.href || null;
  };

  const getItemStatus = (item: ZIMContentItem, books: { id: string }[]): string => {
    if (item.url) return 'Kurulu';
    if (!item.zim) return 'Henüz yüklenmedi';
    const match = books.filter(b => b.id.startsWith(item.zim + '_')).sort((a, z) => a.id < z.id ? 1 : -1)[0];
    if (!match) return 'Henüz yüklenmedi';
    const version = match.id.match(/(\d{4})-(\d{2})[a-z]?$/);
    return version ? `${version[2]}/${version[1]} sürümü` : 'Kurulu';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner" />
        <span className="ml-3 text-has-textMuted">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="has-table has-search mb-4">
        <tr>
          <td>
            <b>Ara:</b>
            <input
              type="text"
              id="q"
              placeholder="ilk yardım, su arıtma, deprem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="has-input ml-2"
            />
            <button type="submit" className="has-btn ml-2">
              <SearchIcon className="w-4 h-4 mr-1" />
              Ara
            </button>
          </td>
        </tr>
      </form>

      <div className="has-crumb">
        <Link to="/" className="text-has-blue hover:text-has-orange">HAS_PrepperDisk Ana Sayfa</Link>
      </div>

      {serverTime && (
        <div className="has-small ml-2 mb-4">
          Sunucu saati: {serverTime.toLocaleDateString('tr-TR')} {serverTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      {diskWarnings.length > 0 && (
        <table className="has-table" id="disk">
          <tr><th>Disk ve güç uyarısı</th></tr>
          {diskWarnings.map((w, i) => (
            <tr key={i}><td>{escapeHtml(w)}</td></tr>
          ))}
        </table>
      )}

      <div className="has-scroll">
        <table className="has-table" id="forums">
          <thead>
            <tr>
              <th colSpan={2}>Bölüm</th>
              <th className="hide-s">Dil</th>
              <th>Boyut</th>
              <th className="hide-s">Durum</th>
              <th className="hide-s">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {DEFAULT_CATEGORIES.map((category) => (
              <React.Fragment key={category.title}>
                <tr>
                  <td className="has-td-cat" colSpan={6}>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category.title)}
                      {category.title}
                    </div>
                  </td>
                </tr>
                {category.items.map((item) => {
                  const ready = isItemReady(item, books);
                  const url = getItemUrl(item, books);
                  const status = getItemStatus(item, books);
                  const iconClass = ready ? 'has-fold' : 'has-fold has-fold-gray';

                  const itemUrl = url;
                  const hasUrl = itemUrl !== null;

                  return (
                    <tr key={item.zim || item.url || item.name} className={ready ? '' : 'has-off'}>
                      <td className="has-row1 has-td-center" width="40">
                        <i className={iconClass} />
                      </td>
                      <td className="has-row1">
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); handleDownloadItem(item); }}
                          className="has-fname cursor-pointer"
                        >{escapeHtml(item.name)}</a>
                        <div className="has-fdesc">{escapeHtml(item.desc)}</div>
                      </td>
                      <td className="has-row2 has-td-center hide-s">{escapeHtml(item.lang)}</td>
                      <td className="has-row2 has-td-center">{escapeHtml(item.size)}</td>
                      <td className="has-row3 has-td-center hide-s has-small">{escapeHtml(status)}</td>
                      <td className="has-td-center">
                        <button
                          onClick={(e) => { e.preventDefault(); handleDownloadItem(item); }}
                          className="p-1 text-has-textMuted hover:text-has-blue transition-colors"
                          title={hasUrl ? 'Aç' : 'İndir'}
                        >
                          {hasUrl ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="has-legend has-small">
        <span><i className="has-fold" /> Hazır</span>
        <span><i className="has-fold has-fold-gray" /> Henüz yüklenmedi</span>
      </div>

      <table className="has-table">
        <tr><td className="has-td-cat">Sistem bilgisi</td></tr>
        <tr>
          <td className="has-row1" id="stats">
            Toplam <b>{DEFAULT_CATEGORIES.reduce((acc, c) => acc + c.items.length, 0)}</b> kaynak var, bunlardan <b>{books.length + state.zimFiles.length}</b> tanesi kullanıma hazır.<br />
            Bu sayfa internet bağlantısı olmadan çalışır.
          </td>
        </tr>
      </table>

      <div className="has-copy">
        HAS_PrepperDisk &copy; {new Date().getFullYear()} &middot; Raspberry Pi 5 üzerinde çalışır<br />
        İçerikler: Wikipedia, OpenStreetMap, Kolibri &mdash; ilgili lisanslar altında
      </div>
    </div>
  );
};