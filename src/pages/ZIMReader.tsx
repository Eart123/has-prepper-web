import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Home, FileText, Image, Loader2, RotateCcw, Minus, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { zimReader } from '../lib/zim-reader';
import { Input } from '../components/ui/Input';

export const ZIMReader: React.FC = () => {
  const { zimId } = useParams<{ zimId: string }>();
  const [searchParams] = useSearchParams();
  const { state, addToast } = useApp();

  const [currentPath, setCurrentPath] = useState('/');
  const [history, setHistory] = useState<string[]>(['/']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [entries, setEntries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [articleContent, setArticleContent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ path: string; title: string }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showTOC, setShowTOC] = useState(false);

  const zimFile = state.zimFiles.find(f => f.id === zimId);

  useEffect(() => {
    if (zimId) {
      loadEntries('/');
      if (searchParams.get('search')) {
        setShowSearch(true);
      }
    }
  }, [zimId, searchParams]);

  const loadEntries = async (path: string) => {
    if (!zimId) return;
    setLoading(true);
    try {
      const zimEntries = await zimReader.listEntries(zimId, path);
      setEntries(zimEntries);
      setCurrentPath(path);
    } catch (error) {
      console.error('Failed to load entries:', error);
      addToast({ type: 'error', title: 'Hata', message: 'İçerik yüklenemedi' });
    } finally {
      setLoading(false);
    }
  };

  const loadArticle = async (path: string) => {
    if (!zimId) return;
    setLoading(true);
    try {
      const html = await zimReader.getArticleHTML(zimId, path);
      if (html) {
        // const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        // const title = titleMatch ? titleMatch[1] : path.split('/').pop() || path;

        setArticleContent(html);

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(path);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      } else {
        loadEntries(path);
      }
    } catch (error) {
      console.error('Failed to load article:', error);
      addToast({ type: 'error', title: 'Hata', message: 'Makale yüklenemedi' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!zimId || !searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await zimReader.search(zimId, searchQuery, 50);
      setSearchResults(results);
      setShowSearch(true);
    } catch (error) {
      console.error('Search failed:', error);
      addToast({ type: 'error', title: 'Arama hatası', message: 'Arama yapılamadı' });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadArticle(history[newIndex]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      loadArticle(history[newIndex]);
    }
  };

  const goHome = () => {
    loadEntries('/');
    setArticleContent(null);
    setHistory(['/']);
    setHistoryIndex(0);
  };

  const handleZoomIn = () => setZoom(Math.min(2, zoom + 0.1));
  const handleZoomOut = () => setZoom(Math.max(0.5, zoom - 0.1));
  const handleZoomReset = () => setZoom(1);

  const isImage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
  };

  if (!zimFile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-12 h-12 text-has-textMuted mx-auto mb-4" />
          <h2 className="text-has-text">ZIM dosyası bulunamadı</h2>
          <Link to="/library" className="text-has-blue hover:text-has-orange mt-2 inline-block">
            Kütüphaneye dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px]">
      <aside
        className={cn(
          'w-72 bg-white border-r border-has-border flex flex-col transition-transform duration-200',
          showTOC ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-3 border-b border-has-border flex items-center justify-between">
          <h3 className="font-medium text-has-text">İçindekiler</h3>
          <button
            onClick={() => setShowTOC(false)}
            className="lg:hidden p-1 text-has-textMuted hover:text-has-text"
            aria-label="Kapat"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-3">
            <Input
              placeholder="Bu ZIM'de ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="text-sm"
            />
          </div>

          {showSearch && searchResults.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-has-textMuted mb-2">
                Arama sonuçları ({searchResults.length})
              </h4>
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {searchResults.map((result) => (
                  <li key={result.path}>
                    <button
                      onClick={() => loadArticle(result.path)}
                      className="w-full text-left p-2 text-sm text-has-blue hover:bg-has-blue/10 rounded transition-colors truncate"
                    >
                      {result.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!showSearch && (
            <ul className="space-y-1">
              {entries.map((entry) => (
                <li key={entry}>
                  <button
                    onClick={() => {
                      if (entry.endsWith('/')) {
                        loadEntries(entry);
                      } else {
                        loadArticle(entry);
                      }
                    }}
                    className={cn(
                      'w-full text-left p-2 text-sm rounded transition-colors truncate flex items-center gap-2',
                      currentPath === entry ? 'bg-has-blue/10 text-has-blue' : 'text-has-text hover:bg-has-cardBg'
                    )}
                  >
                    {isImage(entry) ? <Image className="w-4 h-4 text-has-textMuted" /> : <FileText className="w-4 h-4 text-has-textMuted" />}
                    {entry.split('/').filter(Boolean).pop() || entry}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-has-blue animate-spin" />
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-has-border flex items-center gap-3 bg-white">
          <button
            onClick={() => setShowTOC(true)}
            className="lg:hidden p-2 text-has-textMuted hover:text-has-text rounded hover:bg-has-cardBg"
            aria-label="İçindekileri aç"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={goHome}
            className="p-2 text-has-textMuted hover:text-has-text rounded hover:bg-has-cardBg"
            aria-label="Ana sayfa"
            title="Ana sayfa"
          >
            <Home className="w-5 h-5" />
          </button>

          <button
            onClick={goBack}
            disabled={historyIndex <= 0}
            className="p-2 text-has-textMuted hover:text-has-text rounded hover:bg-has-cardBg disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Geri"
            title="Geri"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-has-textMuted hover:text-has-text rounded hover:bg-has-cardBg disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="İleri"
            title="İleri"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-md">
            <Input
              placeholder="Yol veya arama..."
              value={currentPath}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="text-sm"
            />
          </div>

          <button
            onClick={handleSearch}
            className="p-2 text-has-textMuted hover:text-has-text rounded hover:bg-has-cardBg"
            aria-label="Ara"
            title="Ara"
          >
            <Search className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1 border-l border-has-border pl-3 ml-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-1 text-has-textMuted hover:text-has-text rounded hover:bg-has-cardBg disabled:opacity-30"
              aria-label="Yaklaştır"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm text-has-textMuted w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 2}
              className="p-1 text-has-textMuted hover:text-has-text rounded hover:bg-has-cardBg disabled:opacity-30"
              aria-label="Uzaklaştır"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1 text-has-textMuted hover:text-has-text rounded hover:bg-has-cardBg"
              aria-label="Sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4" style={{ zoom }}>
          {articleContent ? (
            <article className="max-w-3xl mx-auto prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: articleContent }} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="w-16 h-16 text-has-textMuted mb-4" />
              <h2 className="font-heading text-has-blue text-xl font-bold mb-2">{zimFile.name}</h2>
              <p className="text-has-textMuted mb-4">Sol taraftan bir içerik seçin veya arama yapın</p>
              <div className="text-sm text-has-textMuted space-y-1">
                <p><strong>Boyut:</strong> {zimFile.size.toLocaleString()} bytes</p>
                {zimFile.zimData && (
                  <>
                    <p><strong>Maddeler:</strong> {zimFile.zimData.entryCount.toLocaleString()}</p>
                    <p><strong>Ana giriş:</strong> {zimFile.zimData.mainEntryPath}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};