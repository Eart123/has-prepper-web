import type { ZIMFileInfo, ZIMEntry, ZIMSearchResult } from './types';

export class ZIMReaderService {
  private zimFiles: Map<string, ZIMFileInfo> = new Map();
  private fileHandles: Map<string, FileSystemFileHandle> = new Map();

  async loadZIMFromFile(file: File): Promise<ZIMFileInfo> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const zimFileInfo: ZIMFileInfo = {
      id: this.generateId(),
      name: file.name.replace(/\.zimx?$/i, ''),
      size: file.size,
      path: file.name,
      zimData: {
        entryCount: Math.floor(Math.random() * 100000) + 10000,
        mainEntryPath: '/',
        metadata: {
          format: 'OpenZIM',
          creator: 'Kiwix',
        },
      },
      addedAt: Date.now(),
      lastAccessed: Date.now(),
    };

    this.zimFiles.set(zimFileInfo.id, zimFileInfo);
    return zimFileInfo;
  }

  async loadZIMFromHandle(handle: FileSystemFileHandle): Promise<ZIMFileInfo> {
    const file = await handle.getFile();
    const zimFileInfo = await this.loadZIMFromFile(file);
    this.fileHandles.set(zimFileInfo.id, handle);
    return zimFileInfo;
  }

  async listEntries(zimId: string, path: string = '/'): Promise<string[]> {
    const zimFile = this.zimFiles.get(zimId);
    if (!zimFile) return [];

    if (path === '/') {
      return [
        'A/', 'B/', 'C/', 'D/', 'E/', 'F/', 'G/', 'H/', 'I/', 'J/',
        'K/', 'L/', 'M/', 'N/', 'O/', 'P/', 'Q/', 'R/', 'S/', 'T/',
        'U/', 'V/', 'W/', 'X/', 'Y/', 'Z/',
        'Main_Page.html',
        'favicon.ico',
      ];
    }

    const prefix = path.replace('/', '');
    const letter = prefix.charAt(0).toUpperCase();
    if (/^[A-Z]$/.test(letter) && path.endsWith('/')) {
      return [
        `${letter}Article_1.html`,
        `${letter}Article_2.html`,
        `${letter}Subdir/`,
      ];
    }

    return [];
  }

  async getEntry(zimId: string, path: string): Promise<ZIMEntry | null> {
    const zimFile = this.zimFiles.get(zimId);
    if (!zimFile) return null;

    if (path.endsWith('.html')) {
      const title = path.split('/').pop()?.replace('.html', '').replace(/_/g, ' ') || path;
      const html = this.generateMockArticle(title);
      return {
        path,
        title,
        isRedirect: false,
        mimetype: 'text/html',
        data: new TextEncoder().encode(html),
      };
    }

    if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return {
        path,
        title: path.split('/').pop() || path,
        isRedirect: false,
        mimetype: `image/${path.split('.').pop()}`,
        data: new Uint8Array(100),
      };
    }

    return null;
  }

  async search(zimId: string, query: string, limit = 20): Promise<ZIMSearchResult[]> {
    const zimFile = this.zimFiles.get(zimId);
    if (!zimFile) return [];

    const results: ZIMSearchResult[] = [];
    for (let i = 0; i < Math.min(limit, 10); i++) {
      results.push({
        path: `${query.charAt(0).toUpperCase()}/${query}_${i}.html`,
        title: `${query} - Article ${i + 1}`,
        snippet: `This is a snippet for ${query}...`,
        score: 1 - i * 0.1,
      });
    }

    return results;
  }

  async getArticleHTML(zimId: string, path: string): Promise<string | null> {
    const entry = await this.getEntry(zimId, path);
    if (!entry || !entry.mimetype.startsWith('text/html')) return null;

    return new TextDecoder('utf-8').decode(entry.data);
  }

  async getImageBlob(zimId: string, path: string): Promise<Blob | null> {
    const entry = await this.getEntry(zimId, path);
    if (!entry || !entry.mimetype.startsWith('image/')) return null;

    return new Blob([entry.data as unknown as BlobPart], { type: entry.mimetype });
  }

  hasZIM(zimId: string): boolean {
    return this.zimFiles.has(zimId);
  }

  getZIMFile(zimId: string): ZIMFileInfo | undefined {
    return this.zimFiles.get(zimId);
  }

  removeZIM(zimId: string): void {
    this.zimFiles.delete(zimId);
    this.fileHandles.delete(zimId);
  }

  getLoadedZIMIds(): string[] {
    return Array.from(this.zimFiles.keys());
  }

  private generateMockArticle(title: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #006699; border-bottom: 2px solid #DD6900; padding-bottom: 10px; }
          h2 { color: #3F7FAD; margin-top: 30px; }
          p { margin: 15px 0; }
          .infobox { float: right; width: 300px; border: 1px solid #aaa; background: #f9f9f9; padding: 10px; margin: 0 0 10px 20px; }
          .infobox th { background: #006699; color: white; }
          .toc { background: #f9f9f9; border: 1px solid #aaa; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p><strong>${title}</strong> bir konu hakkında bilgi içeren bir makaledir.</p>
        
        <div class="toc">
          <strong>İçindekiler</strong>
          <ul>
            <li><a href="#giris">Giriş</a></li>
            <li><a href="#tarihce">Tarihçe</a></li>
            <li><a href="#detaylar">Detaylar</a></li>
            <li><a href="#kaynakca">Kaynakça</a></li>
          </ul>
        </div>

        <h2 id="giris">Giriş</h2>
        <p>Bu makale, ${title.toLowerCase()} konusuna giriş niteliğindedir. Daha detaylı bilgi için ilgili kaynaklara başvurulabilir.</p>

        <h2 id="tarihce">Tarihçe</h2>
        <p>${title} konusunun tarihçesi, antik çağlardan günümüze uzanmaktadır. Çeşitli kültürlerde farklı şekillerde gelişmiştir.</p>

        <h2 id="detaylar">Detaylar</h2>
        <p>Teknik detaylar ve uygulamalar konusunda aşağıdaki bilgiler yer almaktadır:</p>
        <ul>
          <li>Temel prensipler ve kavramlar</li>
          <li>Yaygın kullanım alanları</li>
          <li>İlgili standartlar ve protokoller</li>
          <li>En iyi uygulamalar</li>
        </ul>

        <h2 id="kaynakca">Kaynakça</h2>
        <ol>
          <li>Kaynak 1: Temel kitap</li>
          <li>Kaynak 2: Akademik makale</li>
          <li>Kaynak 3: Resmi dokümantasyon</li>
        </ol>

        <hr>
        <p><small>Bu içerik HAS Prepper Disk çevrimdışı arşivinden sunulmaktadır. Gerçek ZIM dosyaları için Kiwix JS veya libzim-wasm entegrasyonu gereklidir.</small></p>
      </body>
      </html>
    `;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
}

export const zimReader = new ZIMReaderService();