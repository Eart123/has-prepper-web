import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FolderOpen, Download, Trash2, Search, Eye, ChevronDown, ChevronUp, FileText, ExternalLink, BookOpen, Map, HeartPulse, Wrench, GraduationCap, Package } from 'lucide-react';
import { cn, formatBytes, escapeHtml } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { zimReader } from '../lib/zim-reader';
import { database } from '../lib/database';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { DEFAULT_CATEGORIES, type ZIMFileInfo, type ZIMContentItem } from '../lib/types';

export const Library: React.FC = () => {
  const { state, dispatch, addToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [showAddZIM, setShowAddZIM] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category') || '');
    }
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const handleFileDrop = async (files: FileList) => {
    for (const file of Array.from(files)) {
      if (file.name.endsWith('.zim') || file.name.endsWith('.zimx')) {
        await addZIMFile(file);
      } else {
        addToast({ type: 'error', title: 'Geçersiz dosya', message: `${file.name} bir ZIM dosyası değil` });
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleFileDrop(e.target.files);
      e.target.value = '';
    }
  };

  const addZIMFile = async (file: File) => {
    try {
      const zimFileInfo = await zimReader.loadZIMFromFile(file);
      await database.addZIMFile(zimFileInfo);
      dispatch({ type: 'ADD_ZIM_FILE', payload: zimFileInfo });
      addToast({ type: 'success', title: 'ZIM dosyası eklendi', message: `${file.name} başarıyla yüklendi` });
    } catch (error) {
      console.error('Failed to add ZIM file:', error);
      addToast({ type: 'error', title: 'Yükleme hatası', message: `${file.name} yüklenemedi` });
    }
  };

  const removeZIMFile = async (id: string) => {
    try {
      const zimFile = state.zimFiles.find(f => f.id === id);
      if (zimFile) {
        zimReader.removeZIM(id);
        await database.deleteZIMFile(id);
        dispatch({ type: 'REMOVE_ZIM_FILE', payload: id });
        addToast({ type: 'success', title: 'Silindi', message: `${zimFile.name} kaldırıldı` });
      }
    } catch (error) {
      console.error('Failed to remove ZIM file:', error);
      addToast({ type: 'error', title: 'Silme hatası', message: 'Dosya silinemedi' });
    }
    setShowConfirmDelete(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCategories = DEFAULT_CATEGORIES.filter(cat =>
    !selectedCategory || cat.title === selectedCategory
  );

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

  const isItemReady = (item: ZIMContentItem): boolean => {
    if (item.url) return true;
    if (!item.zim) return false;
    return state.zimFiles.some(f => f.name.includes(item.zim!));
  };

  const getItemZIMFile = (item: ZIMContentItem): ZIMFileInfo | undefined => {
    if (!item.zim) return undefined;
    return state.zimFiles.find(f => f.name.includes(item.zim!));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileDrop(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn('relative', dragging && 'bg-has-blue/5')}
    >
      {dragging && (
        <div className="fixed inset-0 bg-has-blue/10 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center border-2 border-has-blue border-dashed">
            <Download className="w-16 h-16 text-has-blue mx-auto mb-4" />
            <p className="text-lg font-medium text-has-text">ZIM dosyalarını buraya bırakın</p>
            <p className="text-sm text-has-textMuted mt-1">Desteklenen formatlar: .zim, .zimx</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-has-blue text-2xl font-bold">Kütüphane</h1>
          <p className="text-has-textMuted mt-1">Yüklü ZIM dosyalarını yönetin ve içeriğe göz atın</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Dosya Seç
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zim,.zimx"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            aria-label="ZIM dosyası seç"
          />
          <Button onClick={() => setShowAddZIM(true)}>
            <Download className="w-4 h-4 mr-2" />
            ZIM Ekle
          </Button>
          <Link to="/download">
            <Button>
              <Package className="w-4 h-4 mr-2" />
              Otomatik İndir
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleCategoryChange('')}
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium transition-colors',
            !selectedCategory
              ? 'bg-has-blue text-white'
              : 'bg-has-cardBg text-has-text hover:bg-has-cardBg2'
          )}
        >
          Tümü
        </button>
        {DEFAULT_CATEGORIES.map((cat) => (
          <button
            key={cat.title}
            onClick={() => handleCategoryChange(cat.title)}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              selectedCategory === cat.title
                ? 'bg-has-blue text-white'
                : 'bg-has-cardBg text-has-text hover:bg-has-cardBg2'
            )}
          >
            {cat.title}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <Input
          placeholder="Kategoriler içinde ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {state.zimFiles.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading text-has-blue text-lg font-bold mb-4">Yüklü ZIM Dosyaları</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {state.zimFiles.map((zimFile) => (
              <Card key={zimFile.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-has-blue/10 rounded-lg">
                        <FileText className="w-5 h-5 text-has-blue" />
                      </div>
                      <div>
                        <h3 className="font-medium text-has-text">{zimFile.name}</h3>
                        <p className="text-sm text-has-textMuted">{formatBytes(zimFile.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(zimFile.id)}
                        aria-label={expandedItems[zimFile.id] ? 'Daralt' : 'Genişlet'}
                      >
                        {expandedItems[zimFile.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmDelete(zimFile.id)}
                        className="text-has-red hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedItems[zimFile.id] && (
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Eklendi:</strong> {new Date(zimFile.addedAt).toLocaleDateString('tr-TR')}</p>
                      <p><strong>Son erişim:</strong> {zimFile.lastAccessed ? new Date(zimFile.lastAccessed).toLocaleDateString('tr-TR') : 'Hiç'}</p>
                      {zimFile.zimData && (
                        <>
                          <p><strong>Maddeler:</strong> {zimFile.zimData.entryCount.toLocaleString()}</p>
                          <p><strong>Ana giriş:</strong> {zimFile.zimData.mainEntryPath}</p>
                        </>
                      )}
                      <div className="flex gap-2 pt-2 border-t border-has-border">
                        <Button variant="secondary" size="sm" onClick={() => openZIMReader(zimFile.id)}>
                          <Eye className="w-3 h-3 mr-1" />
                          Göz At
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => searchInZIM(zimFile.id)}>
                          <Search className="w-3 h-3 mr-1" />
                          Ara
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {filteredCategories.map((category) => {
          const filteredItems = category.items.filter(item =>
            !searchQuery ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.desc.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={category.title}>
              <h2 className="font-heading text-has-blue text-lg font-bold mb-3 flex items-center gap-2">
                {getCategoryIcon(category.title)}
                {category.title}
              </h2>
              <div className="has-scroll">
                <table className="has-table">
                  <thead>
                    <tr>
                      <th> </th>
                      <th>İçerik</th>
                      <th className="hide-s">Dil</th>
                      <th>Boyut</th>
                      <th className="hide-s">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const ready = isItemReady(item);
                      const zimFile = getItemZIMFile(item);
                      const status = ready
                        ? zimFile
                          ? `${zimFile.zimData?.entryCount || '?'} madde`
                          : 'Kurulu'
                        : 'Henüz yüklenmedi';
                      const iconClass = ready ? 'has-fold' : 'has-fold has-fold-gray';

                      return (
                        <tr key={item.zim || item.url || item.name} className={ready ? '' : 'has-off'}>
                          <td className="has-row1 has-td-center" width="40">
                            <i className={iconClass} />
                          </td>
                          <td className="has-row1">
                            <div className="has-fname">{escapeHtml(item.name)}</div>
                            <div className="has-fdesc">{escapeHtml(item.desc)}</div>
                          </td>
                          <td className="has-row2 has-td-center hide-s">{escapeHtml(item.lang)}</td>
                          <td className="has-row2 has-td-center">{escapeHtml(item.size)}</td>
                          <td className="has-row3 has-td-center hide-s has-small">{escapeHtml(status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {state.zimFiles.length === 0 && filteredCategories.every(c => c.items.length === 0) && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="p-3 bg-has-blue/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Download className="w-8 h-8 text-has-blue" />
            </div>
            <h3 className="font-heading text-has-blue text-xl font-bold mb-2">Henüz ZIM dosyası yok</h3>
            <p className="text-has-textMuted mb-6">
              Wikipedia, haritalar ve hayatta kalma kaynakları için ZIM dosyalarını indirin ve buraya ekleyin.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowAddZIM(true)}>
                <Download className="w-4 h-4 mr-2" />
                ZIM Dosyası Ekle
              </Button>
              <a
                href="https://download.kiwix.org/zim/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-has-blue border border-has-blue rounded hover:bg-has-blue/10 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Kiwix'ten İndir
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showAddZIM}
        onClose={() => setShowAddZIM(false)}
        title="ZIM Dosyası Ekle"
        description="Cihazınızdan bir ZIM dosyası seçin veya sürükleyip bırakın"
        size="md"
      >
        <div className="border-2 border-dashed border-has-border rounded-lg p-8 text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zim,.zimx"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Download className="w-12 h-12 text-has-textMuted mx-auto mb-4" />
          <p className="text-has-text mb-2">Dosyaları buraya sürükleyin veya tıklayarak seçin</p>
          <p className="text-sm text-has-textMuted">Desteklenen formatlar: .zim, .zimx</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Dosya Seç
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!showConfirmDelete}
        onClose={() => setShowConfirmDelete(null)}
        onConfirm={() => showConfirmDelete && removeZIMFile(showConfirmDelete)}
        title="ZIM Dosyasını Sil"
        message={showConfirmDelete
          ? `"${state.zimFiles.find(f => f.id === showConfirmDelete)?.name}" dosyasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
          : 'Dosyayı silmek istediğinizden emin misiniz?'}
        confirmText="Sil"
        variant="danger"
      />
    </div>
  );
};

const openZIMReader = (zimId: string) => {
  window.location.hash = `#/reader/${zimId}`;
};

const searchInZIM = (zimId: string) => {
  window.location.hash = `#/reader/${zimId}?search=true`;
};