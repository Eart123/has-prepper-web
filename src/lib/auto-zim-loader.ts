import type { ZIMFileInfo } from './types';
import { zimReader } from './zim-reader';
import { database } from './database';

/**
 * Auto ZIM Loader - Otomatik ZIM dosyası indirme ve yükleme
 * 
 * Bu servis:
 * 1. Kiwix kataloğundan ZIM dosyalarını listeler
 * 2. Seçilen ZIM dosyalarını indirir (Range istekleri ile)
 * 3. IndexedDB'ye kaydeder
 * 4. İlerleme durumu bildirir
 */

export interface ZIMCatalogEntry {
  id: string;
  name: string;
  title: string;
  description: string;
  language: string;
  size: number;
  sizeHuman: string;
  date: string;
  url: string;
  homepage: string;
  tags: string[];
}

export interface DownloadProgress {
  zimId: string;
  loaded: number;
  total: number;
  percentage: number;
  status: 'pending' | 'downloading' | 'processing' | 'complete' | 'error';
  error?: string;
}

type ProgressCallback = (progress: DownloadProgress) => void;

export class AutoZIMLoader {
  private static instance: AutoZIMLoader;
  private downloadQueue: Map<string, AbortController> = new Map();
  private progressCallbacks: Set<ProgressCallback> = new Set();
  private catalogCache: ZIMCatalogEntry[] | null = null;

  static getInstance(): AutoZIMLoader {
    if (!AutoZIMLoader.instance) {
      AutoZIMLoader.instance = new AutoZIMLoader();
    }
    return AutoZIMLoader.instance;
  }

  // Kiwix kataloğunu yükle
  async fetchCatalog(): Promise<ZIMCatalogEntry[]> {
    if (this.catalogCache) return this.catalogCache;

    try {
      // Kiwix library API
      const response = await fetch('https://library.kiwix.org/catalog/latest.json');
      if (!response.ok) throw new Error('Katalog yüklenemedi');
      
      const data = await response.json();
      const catalog = data.zims || data.entries || [];
      this.catalogCache = catalog;
      return catalog;
    } catch (error) {
      console.error('Katalog yükleme hatası:', error);
      // Fallback: Sabit liste
      return this.getFallbackCatalog();
    }
  }

  // Kategorilere göre filtrele
  async getZIMsByCategory(category: string): Promise<ZIMCatalogEntry[]> {
    const catalog = await this.fetchCatalog();
    const categoryMap: Record<string, string[]> = {
      'Ansiklopedi': ['wikipedia', 'wiktionary', 'wikibooks', 'wikisource', 'wikiquote'],
      'Türkçe Kitaplık': ['_tr_', 'turkish'],
      'Haritalar': ['osm', 'openstreetmap', 'map'],
      'Sağlık': ['medical', 'medicine', 'health', 'wikimed', 'mdwiki'],
      'Hayatta Kalma': ['survival', 'disaster', 'emergency', 'water', 'food'],
      'Tamir': ['ifixit', 'repair', 'diy', 'mechanics'],
      'Eğitim': ['education', 'khan', 'phet', 'kolibri'],
    };

    const keywords = categoryMap[category] || [];
    return catalog.filter(zim => 
      keywords.some(kw => zim.id.toLowerCase().includes(kw.toLowerCase()) || 
        zim.title.toLowerCase().includes(kw.toLowerCase()))
    );
  }

  // ZIM dosyasını indir ve yükle
  async downloadAndLoadZIM(
    zimEntry: ZIMCatalogEntry,
    onProgress?: ProgressCallback
  ): Promise<ZIMFileInfo | null> {
    const zimId = zimEntry.id;
    const abortController = new AbortController();
    this.downloadQueue.set(zimId, abortController);

    const updateProgress = (progress: DownloadProgress) => {
      this.progressCallbacks.forEach(cb => cb(progress));
      onProgress?.(progress);
    };

    try {
      updateProgress({
        zimId,
        loaded: 0,
        total: zimEntry.size,
        percentage: 0,
        status: 'downloading'
      });

      // Dosyayı parçalar halinde indir (Range requests)
      const chunks = [];
      const chunkSize = 10 * 1024 * 1024; // 10MB chunks
      let loaded = 0;

      for (let start = 0; start < zimEntry.size; start += chunkSize) {
        if (abortController.signal.aborted) throw new Error('İndirme iptal edildi');
        
        const end = Math.min(start + chunkSize - 1, zimEntry.size - 1);
        
        const response = await fetch(zimEntry.url, {
          headers: { Range: `bytes=${start}-${end}` },
          signal: abortController.signal
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const chunk = await response.arrayBuffer();
        chunks.push(chunk);
        loaded += chunk.byteLength;

        updateProgress({
          zimId,
          loaded,
          total: zimEntry.size,
          percentage: Math.round((loaded / zimEntry.size) * 100),
          status: 'downloading'
        });
      }

      updateProgress({
        zimId,
        loaded: zimEntry.size,
        total: zimEntry.size,
        percentage: 100,
        status: 'processing'
      });

      // Blob oluştur
      const blob = new Blob(chunks);
      const file = new File([blob], zimEntry.id + '.zim', { type: 'application/zim' });

      // ZIM reader'a yükle
      const zimFileInfo = await zimReader.loadZIMFromFile(file);
      
      // Metadata güncelle
      zimFileInfo.name = zimEntry.title;
      zimFileInfo.path = zimEntry.id + '.zim';
      zimFileInfo.zimData = {
        ...(zimFileInfo.zimData || {}),
        entryCount: zimFileInfo.zimData?.entryCount || 0,
        mainEntryPath: zimFileInfo.zimData?.mainEntryPath || '/',
        metadata: {
          ...(zimFileInfo.zimData?.metadata || {}),
          kiwixId: zimEntry.id,
          language: zimEntry.language,
          description: zimEntry.description,
          date: zimEntry.date,
        }
      };

      // Veritabanına kaydet
      await database.addZIMFile(zimFileInfo);

      updateProgress({
        zimId,
        loaded: zimEntry.size,
        total: zimEntry.size,
        percentage: 100,
        status: 'complete'
      });

      return zimFileInfo;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      updateProgress({
        zimId,
        loaded: 0,
        total: zimEntry.size,
        percentage: 0,
        status: 'error',
        error: errorMessage
      });
      return null;
    } finally {
      this.downloadQueue.delete(zimId);
    }
  }

  // İndirmeyi iptal et
  cancelDownload(zimId: string) {
    const controller = this.downloadQueue.get(zimId);
    if (controller) {
      controller.abort();
      this.downloadQueue.delete(zimId);
    }
  }

  // Tüm indirmeleri iptal et
  cancelAllDownloads() {
    this.downloadQueue.forEach(controller => controller.abort());
    this.downloadQueue.clear();
  }

  // İlerleme takibi
  onProgress(callback: ProgressCallback) {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  // Fallback katalog (offline/backup)
  private getFallbackCatalog(): ZIMCatalogEntry[] {
    return [
      {
        id: 'wikipedia_tr_all_maxi',
        name: 'wikipedia_tr_all_maxi',
        title: 'Vikipedi (Türkçe)',
        description: 'Türkçe Vikipedi tam kopyası, resimlerle birlikte',
        language: 'tr',
        size: 9 * 1024 * 1024 * 1024, // ~9GB
        sizeHuman: '9 GB',
        date: '2024-01',
        url: 'https://download.kiwix.org/zim/wikipedia_tr_all_maxi.zim',
        homepage: 'https://tr.wikipedia.org',
        tags: ['wikipedia', 'turkish', 'encyclopedia']
      },
      {
        id: 'wikipedia_en_all_maxi',
        name: 'wikipedia_en_all_maxi',
        title: 'Wikipedia (English)',
        description: 'Full English Wikipedia with images',
        language: 'en',
        size: 120 * 1024 * 1024 * 1024, // ~120GB
        sizeHuman: '120 GB',
        date: '2024-01',
        url: 'https://download.kiwix.org/zim/wikipedia_en_all_maxi.zim',
        homepage: 'https://en.wikipedia.org',
        tags: ['wikipedia', 'english', 'encyclopedia']
      },
      {
        id: 'wikivoyage_tr_all',
        name: 'wikivoyage_tr_all',
        title: 'Wikivoyage (Türkçe)',
        description: 'Seyahat rehberi',
        language: 'tr',
        size: 500 * 1024 * 1024,
        sizeHuman: '500 MB',
        date: '2024-01',
        url: 'https://download.kiwix.org/zim/wikivoyage_tr_all.zim',
        homepage: 'https://tr.wikivoyage.org',
        tags: ['travel', 'turkish']
      },
      {
        id: 'wikihow_tr_all',
        name: 'wikihow_tr_all',
        title: 'wikiHow (Türkçe)',
        description: 'Nasıl yapılır rehberleri',
        language: 'tr',
        size: 1 * 1024 * 1024 * 1024,
        sizeHuman: '1 GB',
        date: '2024-01',
        url: 'https://download.kiwix.org/zim/wikihow_tr_all.zim',
        homepage: 'https://tr.wikihow.com',
        tags: ['howto', 'turkish']
      },
      {
        id: 'wikimedia_commons_all',
        name: 'wikimedia_commons_all',
        title: 'Wikimedia Commons',
        description: 'Serbest lisanslı medya dosyaları',
        language: 'mul',
        size: 50 * 1024 * 1024 * 1024,
        sizeHuman: '50 GB',
        date: '2024-01',
        url: 'https://download.kiwix.org/zim/wikimedia_commons_all.zim',
        homepage: 'https://commons.wikimedia.org',
        tags: ['images', 'media']
      }
    ];
  }

  // Format bytes
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const autoZimLoader = AutoZIMLoader.getInstance();