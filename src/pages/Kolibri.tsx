import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowLeft, Play, Video, Users, GraduationCap, Wifi, AlertCircle } from 'lucide-react';

export const Kolibri: React.FC = () => {

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-has-blue hover:text-has-orange mb-4">
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>
        <h1 className="font-heading text-has-blue text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6" />
          Kolibri - Çevrimdışı Eğitim Platformu
        </h1>
        <p className="text-has-textMuted mt-2">
          Kolibri, internet bağlantısı olmadan çalışan açık kaynaklı bir eğitim platformudur.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-has-border rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-has-blue/10 rounded-lg">
              <Video className="w-6 h-6 text-has-blue" />
            </div>
            <div>
              <h3 className="font-medium text-has-text">Video Dersler</h3>
              <p className="text-sm text-has-textMuted">Matematik, fen bilimleri, programlama ve daha fazlası</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-has-textMuted">
            <li>• Matematik: Aritmetik, cebir, geometri, istatistik</li>
            <li>• Fen Bilimleri: Fizik, kimya, biyoloji</li>
            <li>• Programlama: Python, JavaScript, Scratch</li>
            <li>• İnsanlık Bilimleri: Tarih, coğrafya, edebiyat</li>
          </ul>
        </div>

        <div className="border border-has-border rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-has-orange/10 rounded-lg">
              <Play className="w-6 h-6 text-has-orange" />
            </div>
            <div>
              <h3 className="font-medium text-has-text">İnteraktif Egzersizler</h3>
              <p className="text-sm text-has-textMuted">Anında geri bildirimli alıştırmalar ve quizler</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-has-textMuted">
            <li>• Çoktan seçmeli sorular</li>
            <li>• Boşluk doldurma egzersizleri</li>
            <li>• Sürükle-bırak etkinlikleri</li>
            <li>• Kod yazma pratiği</li>
          </ul>
        </div>

        <div className="border border-has-border rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-has-text">Sınıf Yönetimi</h3>
              <p className="text-sm text-has-textMuted">Öğrenci takibi ve ilerleme raporları</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-has-textMuted">
            <li>• Öğrenci profilleri ve gruplar</li>
            <li>• İlerleme takibi ve raporlar</li>
            <li>• Ödev atama ve takip</li>
            <li>• Sınıf analitiği</li>
          </ul>
        </div>

        <div className="border border-has-border rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-has-blue/10 rounded-lg">
              <Wifi className="w-6 h-6 text-has-blue" />
            </div>
            <div>
              <h3 className="font-medium text-has-text">Tamamen Çevrimdışı</h3>
              <p className="text-sm text-has-textMuted">İnternet bağlantısı gerektirmez</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-has-textMuted">
            <li>• İçerik cihazınıza indirilir</li>
            <li>• Yerel ağda paylaşılabilir</li>
            <li>• Cihazlar arası senkronizasyon</li>
            <li>• Düşük donanım gereksinimleri</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-4 border border-has-border rounded-lg bg-has-bg">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-has-orange" />
          <h3 className="font-medium text-has-text">Kurulum Bilgisi</h3>
        </div>
        <div className="space-y-3 text-sm text-has-textMuted">
          <p><strong>Kolibri</strong>, bu PWA içinde doğrudan çalıştırılamayan ayrı bir sunucu uygulamasıdır.</p>
          <p>Kendi cihazınızda veya Raspberry Pi'nizde çalıştırmak için:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><a href="https://learningequality.org/kolibri/" target="_blank" rel="noopener noreferrer" className="text-has-blue hover:text-has-orange">Kolibri resmi sitesinden indirin</a></li>
            <li>Windows, macOS, Linux veya Raspberry Pi OS için kurun</li>
            <li>Tarayıcıdan <code>http://localhost:8080</code> adresine gidin</li>
            <li>İçerik kanallarını (Khan Academy, PhET, vb.) ekleyin</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <a
          href="https://learningequality.org/kolibri/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-has-blue text-white rounded-lg hover:bg-[#00527a] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Resmi Web Sitesi
        </a>
        <a
          href="https://github.com/learningequality/kolibri"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-has-cardBg border border-has-border text-has-text rounded-lg hover:bg-has-cardBg2 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          GitHub
        </a>
      </div>
    </div>
  );
};