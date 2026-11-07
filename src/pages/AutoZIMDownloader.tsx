import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, RefreshCw, Package, Search, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { cn, formatBytes } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { autoZimLoader, type ZIMCatalogEntry, type DownloadProgress } from '../lib/auto-zim-loader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/Modal';

export const AutoZIMDownloader: React.FC = () => {
  const { state, dispatch, addToast } = useApp();
  const [catalog, setCatalog] = useState<ZIMCatalogEntry[]>([]);
  const [filteredCatalog, setFilteredCatalog] = useState<ZIMCatalogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<Record<string, DownloadProgress>>({});
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState<string | null>(null);

  const categories = [
    'Tümü',
    'Ansiklopedi',
    'Türkçe Kitaplık',
    'Haritalar',
    'Sağlık',
    'Hayatta Kalma',
    'Tamir',
    'Eğitim'
  ];

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await autoZimLoader.fetchCatalog();
      setCatalog(data);
      setFilteredCatalog(data);
    } catch (error) {
      console.error('Katalog yükleme hatası:', error);
      addToast({ type: 'error', title: 'Hata', message: 'Katalog yüklenemedi' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = catalog;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(zim => 
        zim.title.toLowerCase().includes(q) ||
        zim.description.toLowerCase().includes(q) ||
        zim.language.toLowerCase().includes(q)
      );
    }
    
    if (selectedCategory !== 'Tümü') {
      const categoryMap: Record<string, string[]> = {
        'Ansiklopedi': ['wikipedia', 'wiktionary', 'wikibooks', 'wikisource', 'wikiquote'],
        'Türkçe Kitaplık': ['_tr_', 'turkish'],
        'Haritalar': ['osm', 'openstreetmap', 'map'],
        'Sağlık': ['medical', 'medicine', 'health', 'wikimed', 'mdwiki'],
        'Hayatta Kalma': ['survival', 'disaster', 'emergency', 'water', 'food'],
        'Tamir': ['ifixit', 'repair', 'diy', 'mechanics'],
        'Eğitim': ['education', 'khan', 'phet', 'kolibri'],
      };
      const keywords = categoryMap[selectedCategory] || [];
      filtered = filtered.filter(zim => 
        keywords.some(kw => zim.id.toLowerCase().includes(kw.toLowerCase()) || 
          zim.title.toLowerCase().includes(kw.toLowerCase()))
      );
    }
    
    setFilteredCatalog(filtered);
  }, [catalog, searchQuery, selectedCategory]);

  const handleDownload = useCallback(async (zim: ZIMCatalogEntry) => {
    const alreadyLoaded = state.zimFiles.some(f => 
      f.name.includes(zim.id) || f.zimData?.metadata?.kiwixId === zim.id
    );
    
    if (alreadyLoaded) {
      addToast({ type: 'info', title: 'Zaten yüklü', message: `${zim.title} zaten kütüphanede` });
      return;
    }

    try {
      const result = await autoZimLoader.downloadAndLoadZIM(zim, (progress) => {
        setDownloading(prev => ({ ...prev, [zim.id]: progress }));
      });

      if (result) {
        dispatch({ type: 'ADD_ZIM_FILE', payload: result });
        addToast({ type: 'success', title: 'İndirme tamamlandı', message: `${zim.title} başarıyla yüklendi` });
      } else {
        const progress = downloading[zim.id];
        if (progress?.status === 'error') {
          addToast({ type: 'error', title: 'İndirme hatası', message: progress.error || 'Bilinmeyen hata' });
        }
      }
    } catch (error) {
      console.error('İndirme hatası:', error);
      addToast({ type: 'error', title: 'Hata', message: 'İndirme sırasında hata oluştu' });
    } finally {
      setDownloading(prev => {
        const next = { ...prev };
        delete next[zim.id];
        return next;
      });
    }
  }, [state.zimFiles, downloading, dispatch, addToast]);

  const handleCancelDownload = (zimId: string) => {
    autoZimLoader.cancelDownload(zimId);
    setDownloading(prev => {
      const next = { ...prev };
      delete next[zimId];
      return next;
    });
    addToast({ type: 'info', title: 'İptal edildi', message: 'İndirme durduruldu' });
  };

  const isLoaded = (zim: ZIMCatalogEntry) => {
    return state.zimFiles.some(f => 
      f.name.includes(zim.id) || f.zimData?.metadata?.kiwixId === zim.id
    );
  };

  const getDownloadStatus = (zimId: string) => {
    return downloading[zimId];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-has-blue animate-spin" />
        <span className="ml-3 text-has-textMuted">Katalog yükleniyor...</span>
      </div>
    );
  }

  const renderZIMCard = (zim: ZIMCatalogEntry) => {
    const loaded = isLoaded(zim);
    const progress = getDownloadStatus(zim.id);
    const isDownloading = !!progress && progress.status === 'downloading';
    const hasError = !!progress && progress.status === 'error';

    let progressContent = null;
    if (isDownloading) {
      progressContent = (
        <div className="p-4 border-t border-has-border bg-has-bg">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>İndiriliyor</span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="w-full bg-has-cardBg rounded-full h-2">
              <div
                className="bg-has-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-has-textMuted">
              <span>{formatBytes(progress.loaded)} / {formatBytes(progress.total)}</span>
              <button
                onClick={() => handleCancelDownload(zim.id)}
                className="text-has-red hover:underline"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      );
    } else if (progress && progress.status === 'processing') {
      progressContent = (
        <div className="p-4 border-t border-has-border bg-has-bg">
          <div className="flex justify-between text-sm">
            <span>İşleniyor</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-has-cardBg rounded-full h-2">
            <div
              className="bg-has-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      );
    } else if (hasError) {
      progressContent = (
        <div className="p-4 border-t border-has-border bg-red-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="font-medium text-red-800">İndirme hatası</p>
              <p className="text-sm text-red-700">{progress.error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDownload(zim)}>
              Tekrar Dene
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div key={zim.id} className={`border border-has-border rounded-lg bg-white overflow-hidden ${loaded ? 'ring-2 ring-green-500' : ''}`}>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-3 bg-has-blue/10 rounded-lg flex-shrink-0">
                <Package className="w-6 h-6 text-has-blue" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-has-text truncate">{zim.title}</h3>
                  {loaded && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                      <CheckCircle className="w-3 h-3 inline mr-1" /> Yüklü
                    </span>
                  )}
                  {downloading[zim.id]?.status === 'downloading' && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full animate-pulse">
                      <Loader2 className="w-3 h-3 inline mr-1" /> İndiriliyor
                    </span>
                  )}
                  {progress && progress.status === 'processing' && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      <Loader2 className="w-3 h-3 inline mr-1" /> İşleniyor
                    </span>
                  )}
                  {progress && progress.status === 'error' && (
                    <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                      <AlertCircle className="w-3 h-3 inline mr-1" /> Hata
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-has-textMuted flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="px-2 py-0.5 bg-has-cardBg rounded">{zim.language.toUpperCase()}</span>
                  </span>
                  <span>{formatBytes(zim.size)}</span>
                  <span>{zim.date}</span>
                </div>
                <p className="mt-1 text-sm text-has-textMuted line-clamp-2">{zim.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {progress && progress.status === 'downloading' && (
                <Button variant="ghost" size="sm" onClick={() => handleCancelDownload(zim.id)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
              {!loaded && !downloading[zim.id]?.status && (
                <Button size="sm" onClick={() => handleDownload(zim)}>
                  <Download className="w-4 h-4 mr-1" />
                  İndir
                </Button>
              )}
              {loaded && (
                <Button variant="secondary" size="sm" onClick={() => setShowDetails(zim.id)}>
                  Detaylar
                </Button>
              )}
              <a
                href={zim.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-has-textMuted hover:text-has-blue rounded transition-colors"
                title="Kaynak sayfası"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {progressContent}
          {loaded && showDetails === zim.id && (
            <div className="p-4 border-t border-has-border bg-has-bg">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-has-textMuted">Kiwix ID</p>
                    <p className="font-mono text-sm">{zim.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-has-textMuted">Dil</p>
                    <p className="font-medium">{zim.language.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-has-textMuted">Boyut</p>
                    <p className="font-medium">{formatBytes(zim.size)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-has-textMuted">Tarih</p>
                    <p className="font-medium">{zim.date}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-has-textMuted">Açıklama</p>
                    <p className="text-has-text">{zim.description}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-has-textMuted">Etiketler</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {zim.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-has-cardBg rounded text-sm">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-has-border flex gap-2 justify-end">
                  <a
                    href={zim.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-has-blue border border-has-blue rounded hover:bg-has-blue/10 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Kiwix Sayfasını Aç
                  </a>
                  <button
                    onClick={() => setShowDetails(null)}
                    className="px-3 py-2 text-sm font-medium text-has-text bg-has-cardBg border border-has-border rounded hover:bg-has-cardBg2 transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-has-blue animate-spin" />
        <span className="ml-3 text-has-textMuted">Katalog yükleniyor...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-has-blue text-2xl font-bold">ZIM İndirici</h1>
          <p className="text-has-textMuted mt-1">Kiwix kataloğundan ZIM dosyalarını otomatik indirin ve yükleyin</p>
        </div>
        <Button variant="secondary" onClick={loadCatalog} loading={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="ZIM ara (başlık, açıklama, dil)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                selectedCategory === cat
                  ? 'bg-has-blue text-white'
                  : 'bg-has-cardBg text-has-text hover:bg-has-cardBg2'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredCatalog.length === 0 ? (
        <div className="border border-has-border rounded-lg bg-white p-12 text-center">
          <Search className="w-12 h-12 text-has-textMuted mx-auto mb-4" />
          <h3 className="font-heading text-has-blue text-xl font-bold mb-2">Sonuç bulunamadı</h3>
          <p className="text-has-textMuted">Arama kriterlerinizi değiştirin veya kategoriyi genişletin.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCatalog.map(zim => renderZIMCard(zim))}
        </div>
      )}

      {showConfirmCancel && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setShowConfirmCancel(null)}
          onConfirm={() => { if (showConfirmCancel) handleCancelDownload(showConfirmCancel); setShowConfirmCancel(null); }}
          title="İndirmeyi İptal Et"
          message="Bu indirmeyi iptal etmek istediğinizden emin misiniz? İndirilen veriler silinecek."
          confirmText="İptal Et"
          variant="danger"
        />
      )}
    </div>
  );
};