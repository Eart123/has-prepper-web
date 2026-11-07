import Dexie, { type Table } from 'dexie';
import type { ZIMFileInfo, AppSettings, ToastMessage } from './types';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'tr',
  autoUpdate: true,
  cacheSize: 500,
  showInstallPrompt: true,
};

export class HASPrepperDB extends Dexie {
  zimFiles!: Table<ZIMFileInfo>;
  settings!: Table<AppSettings & { id: string }>;
  toasts!: Table<ToastMessage>;

  constructor() {
    super('HASPrepperDB');
    this.version(1).stores({
      zimFiles: 'id, name, addedAt, lastAccessed',
      settings: 'id',
      toasts: 'id',
    });

    this.settings.get('main').then((settings) => {
      if (!settings) {
        this.settings.put({ id: 'main', ...DEFAULT_SETTINGS });
      }
    });
  }

  async addZIMFile(file: ZIMFileInfo): Promise<string> {
    return await this.zimFiles.add(file);
  }

  async getZIMFiles(): Promise<ZIMFileInfo[]> {
    return await this.zimFiles.orderBy('addedAt').reverse().toArray();
  }

  async getZIMFile(id: string): Promise<ZIMFileInfo | undefined> {
    return await this.zimFiles.get(id);
  }

  async updateZIMFile(id: string, updates: Partial<ZIMFileInfo>): Promise<number> {
    return await this.zimFiles.update(id, { ...updates, lastAccessed: Date.now() });
  }

  async deleteZIMFile(id: string): Promise<void> {
    await this.zimFiles.delete(id);
  }

  async updateLastAccessed(id: string): Promise<void> {
    await this.zimFiles.update(id, { lastAccessed: Date.now() });
  }

  async getSettings(): Promise<AppSettings> {
    const settings = await this.settings.get('main');
    if (!settings) return DEFAULT_SETTINGS;
    const { id, ...rest } = settings;
    return rest;
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings();
    await this.settings.put({ id: 'main', ...current, ...updates });
  }

  async addToast(toast: ToastMessage): Promise<string> {
    return await this.toasts.add(toast);
  }

  async getToasts(): Promise<ToastMessage[]> {
    return await this.toasts.orderBy('id').toArray();
  }

  async removeToast(id: string): Promise<void> {
    await this.toasts.delete(id);
  }

  async clearToasts(): Promise<void> {
    await this.toasts.clear();
  }
}

export const db = new HASPrepperDB();
export const database = db;