export interface ZIMContentItem {
  name: string;
  desc: string;
  lang: string;
  size: string;
  zim?: string;
  url?: string;
  search?: boolean;
}

export interface ZIMCategory {
  title: string;
  items: ZIMContentItem[];
}

export interface ZIMFileInfo {
  id: string;
  name: string;
  size: number;
  path: string;
  zimData?: ZIMArchiveData;
  addedAt: number;
  lastAccessed: number;
}

export interface ZIMArchiveData {
  entryCount: number;
  mainEntryPath: string;
  metadata: Record<string, string>;
}

export interface ZIMEntry {
  path: string;
  title: string;
  isRedirect: boolean;
  mimetype: string;
  data: Uint8Array;
}

export interface ZIMSearchResult {
  path: string;
  title: string;
  snippet?: string;
  score: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  autoUpdate: boolean;
  cacheSize: number; // MB
  showInstallPrompt: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface InstallPromptState {
  show: boolean;
  dismissed: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

// Default content categories matching the original project
export const DEFAULT_CATEGORIES: ZIMCategory[] = [
  {
    title: 'Ansiklopedi',
    items: [
      { name: 'Vikipedi (Türkçe)', desc: "Türkçe Vikipedi'nin resimli tam kopyası.", lang: 'TR', size: '~9 GB', zim: 'wikipedia_tr_all_maxi', search: true },
      { name: 'Wikipedia (English)', desc: 'Tüm İngilizce Wikipedia, resimleriyle birlikte.', lang: 'EN', size: '~120 GB', zim: 'wikipedia_en_all_maxi', search: true },
    ],
  },
  {
    title: 'Türkçe Kitaplık',
    items: [
      { name: 'Vikisözlük', desc: 'Türkçe sözlük, köken bilgisi ve çeviriler.', lang: 'TR', size: '~810 MB', zim: 'wiktionary_tr_all', search: true },
      { name: 'Vikikitap', desc: 'Açık ders kitapları ve el kitapları.', lang: 'TR', size: '~27 MB', zim: 'wikibooks_tr_all' },
      { name: 'Vikikaynak', desc: 'Telifsiz metinler, kanunlar, klasikler.', lang: 'TR', size: '~68 MB', zim: 'wikisource_tr_all' },
      { name: 'Vikisöz', desc: 'Özlü sözler ve alıntılar.', lang: 'TR', size: '~59 MB', zim: 'wikiquote_tr_all' },
      { name: 'iFixit (Türkçe)', desc: 'Cihaz ve araç tamiri için Türkçe adım adım rehberler.', lang: 'TR', size: '~3,6 GB', zim: 'ifixit_tr_all', search: true },
      { name: 'PhET Simülasyonları', desc: 'Fizik, kimya ve matematik etkileşimli deneyleri.', lang: 'TR', size: '~107 MB', zim: 'phet_tr_all' },
    ],
  },
  {
    title: 'Haritalar ve Navigasyon',
    items: [
      { name: 'Dünya Haritası', desc: 'Avrupa ve Orta Doğu sokak seviyesinde, dünyanın geri kalanı şehir seviyesinde.', lang: '—', size: '~40 GB', url: '/maps' },
    ],
  },
  {
    title: 'Hayatta Kalma ve Hazırlık',
    items: [
      { name: 'Afet Sonrası Kitaplığı', desc: 'Barınak, enerji, tarım ve yeniden yapılanma üzerine kitaplar.', lang: 'EN', size: '~615 MB', zim: 'zimgit-post-disaster_en', search: true },
      { name: 'Su Arıtma', desc: 'İçme suyu bulma, arıtma ve saklama.', lang: 'EN', size: '~20 MB', zim: 'zimgit-water_en' },
      { name: 'Gıda Hazırlama ve Saklama', desc: 'Konserve, kurutma ve uzun süreli gıda saklama.', lang: 'EN', size: '~93 MB', zim: 'zimgit-food-preparation_en' },
      { name: 'Düğümler Kitaplığı', desc: 'Düğüm çeşitleri ve kullanım alanları.', lang: 'EN', size: '~27 MB', zim: 'zimgit-knots_en' },
      { name: 'Ready.gov', desc: 'ABD resmi afet hazırlık rehberleri: deprem, sel, yangın.', lang: 'EN', size: '~1,9 GB', zim: 'ready.gov_en_all', search: true },
      { name: 'Low-tech Magazine', desc: 'Elektriksiz ve düşük teknolojili pratik çözümler.', lang: 'EN', size: '~670 MB', zim: 'solar.lowtechmagazine.com_mul_all' },
      { name: 'Appropedia', desc: 'Uygun teknoloji wiki\'si: su, güneş enerjisi, tarım, barınak.', lang: 'EN', size: '~580 MB', zim: 'appropedia_en_all', search: true },
    ],
  },
  {
    title: 'Sağlık ve İlk Yardım',
    items: [
      { name: 'WikiMed', desc: "Wikipedia'nın tıp maddeleri: hastalıklar, ilaçlar, anatomi.", lang: 'EN', size: '~2 GB', zim: 'wikipedia_en_medicine_maxi', search: true },
      { name: 'MDWiki', desc: 'Doktorlar tarafından düzenlenen tıp ansiklopedisi.', lang: 'EN', size: '~2 GB', zim: 'mdwiki_en_all_maxi', search: true },
      { name: 'MedlinePlus', desc: 'ABD Ulusal Tıp Kütüphanesi hasta bilgilendirme sayfaları.', lang: 'EN', size: '~1,9 GB', zim: 'medlineplus.gov_en_all', search: true },
      { name: 'Tıp Kitaplığı', desc: 'Temel tıp ve sağlık kitapları.', lang: 'EN', size: '~67 MB', zim: 'zimgit-medicine_en' },
      { name: 'Askeri Sahra Tıbbı', desc: 'Sahada travma ve yaralı bakımı (FAS).', lang: 'EN', size: '~65 MB', zim: 'irp.fas.org_en_military-medicine' },
      { name: 'NHS İlaç Rehberi', desc: 'İlaçların kullanımı, dozları ve yan etkileri.', lang: 'EN', size: '~15 MB', zim: 'nhs.uk_en_medicines' },
    ],
  },
  {
    title: 'Tamir ve Beceriler',
    items: [
      { name: 'iFixit', desc: 'Cihaz ve araç tamiri için adım adım rehberler.', lang: 'EN', size: '~3 GB', zim: 'ifixit_en_all', search: true },
      { name: 'Ev Tamiri (DIY)', desc: 'Elektrik, tesisat ve yapı soruları.', lang: 'EN', size: '—', zim: 'diy.stackexchange.com_en_all' },
      { name: 'Bahçecilik', desc: 'Sebze yetiştirme, toprak ve bitki hastalıkları.', lang: 'EN', size: '—', zim: 'gardening.stackexchange.com_en_all' },
      { name: 'Yemek Pişirme', desc: 'Pişirme teknikleri ve gıda güvenliği.', lang: 'EN', size: '—', zim: 'cooking.stackexchange.com_en_all' },
      { name: 'Amatör Telsiz', desc: 'Telsiz kurulumu, anten ve haberleşme.', lang: 'EN', size: '—', zim: 'ham.stackexchange.com_en_all' },
      { name: 'Araç Bakımı', desc: 'Motor, fren ve araç arızaları.', lang: 'EN', size: '—', zim: 'mechanics.stackexchange.com_en_all' },
      { name: 'Doğa ve Kamp', desc: 'Kamp, yürüyüş ve doğada hayatta kalma.', lang: 'EN', size: '—', zim: 'outdoors.stackexchange.com_en_all' },
      { name: 'Sürdürülebilirlik', desc: 'Enerji, su ve kaynak tasarrufu.', lang: 'EN', size: '—', zim: 'sustainability.stackexchange.com_en_all' },
    ],
  },
  {
    title: 'Eğitim',
    items: [
      { name: 'Kolibri', desc: 'Çevrimdışı dersler ve eğitim videoları.', lang: '—', size: '—', url: '/kolibri' },
    ],
  },
];

// Emergency page content
export const EMERGENCY_SECTIONS = [
  {
    id: 'an',
    title: 'Deprem anında',
    items: [
      '<b>Çök, kapan, tutun:</b> güvenli bir yerde diz üstü çök, başını ve enseni koruyarak kapan, düşmemek için sabit bir yere tutun.',
      'Merdivenlere ya da çıkışlara koşma. Balkona çıkma, balkondan ya da pencereden atlama.',
      'Asansör kullanma.',
      'Kibrit, çakmak yakma; elektrik düğmelerine dokunma.',
      'Sabitlenmemiş dolap, raf ve pencerelerden uzak dur.',
      '<b>Açık alandaysan:</b> binalardan, ağaçlardan, direklerden ve enerji hatlarından uzak, boş bir yerde çök. Yamaç altlarından ve deniz kıyısından uzaklaş.',
      '<b>Araçtaysan:</b> yer güvenliyse yolu kapatmadan sağa yanaşıp dur, sarsıntı bitene kadar araçta bekle. Köprü üstü, ağaç ya da direk yanı gibi güvensiz bir yerdeysen aracı durdur, kontak anahtarını üzerinde bırakıp açık alana git.',
    ],
    source: 'Kaynak: AFAD Bursa İl Müdürlüğü, "Deprem" (bursa.afad.gov.tr/deprem); AFAD İstanbul İl Müdürlüğü, "Deprem Sonrası İlk 6 Saate Dikkat", 02.03.2021.',
  },
  {
    id: 'enkaz',
    title: 'Enkaz altında kaldıysan',
    items: [
      'Panik yapmadan durumunu kontrol et.',
      'Hareket edemiyorsan çıkmak için hayatını riske atacak hareketlere kalkışma. Kurtarma ekipleri sana ulaşmaya çalışacak.',
      'Enerjini korumak için hareketlerini kontrol altında tut.',
      'Ellerini ya da ayaklarını kullanabiliyorsan su, kalorifer ve gaz borularına ya da zemine vurarak varlığını duyur.',
      'Sesini kullanabiliyorsan kurtarma ekiplerinin seslerini dinle ve onlara seslen; ama enerjini kontrollü kullan.',
      'Kibrit ya da çakmak yakma.',
    ],
    source: 'Kaynak: AFAD Bursa İl Müdürlüğü, "Deprem" — "Yıkıntı altında mahsur kaldıysanız".',
  },
  {
    id: 'sonra',
    title: 'Deprem sonrasında',
    items: [
      'Önce kendi güvenliğinden emin ol, sonra çevrende yardım edebileceğin biri var mı bak.',
      'Ayakkabını giy. Kendinin ve aileninin yaralanıp yaralanmadığını kontrol et.',
      'Ocağı ve su vanasını kapat. Gaz kokusu <b>yoksa</b> elektrik şalterini kapat. Gaz kokusu alırsan gaz vanasını kapat, camları ve kapıları aç, binayı hemen terk et.',
      'Afet çantanı al, binayı terk et ve en yakın toplanma alanına <b>yürüyerek</b> git. Yetkililer çağırana kadar orada kal.',
      'Büyük depremlerden sonra artçı depremler olur. Sarsıntılar tamamen bitene kadar hasarlı binalara girme. Artçı sırasında da çök, kapan, tutun.',
      'Acil yardım araçları geçebilsin diye ilk 6 saat aracını kullanma, yolları boş bırak.',
      'Hasarlı binalardan ve enerji hatlarından uzak dur. Yaşlılara, bebeklere ve engellilere yardım et.',
    ],
    source: 'Kaynak: AFAD İstanbul İl Müdürlüğü, "Deprem Sonrası İlk 6 Saate Dikkat"; AFAD Bursa İl Müdürlüğü, "Deprem" ve "Afete Hazır Aile".',
  },
  {
    id: 'su',
    title: 'İçme suyu',
    items: [
      'Temizliğinden emin olmadığın suyu içmeden önce kaynat ya da dezenfekte et.',
      'Su bulanıksa önce dinlendir, sonra temiz bir bez, kağıt havlu ya da kahve filtresinden süz.',
      '<b>Kaynatma:</b> suyu en az 1 dakika fokur fokur kaynat. Yaklaşık 2000 metrenin (6500 feet) üstündeki yerlerde 3 dakika kaynat.',
      '<b>Çamaşır suyu:</b> yalnızca düz, kokusuz, katkısız çamaşır suyu kullan (parfümlü, renk koruyucu ya da temizlik katkılı olanlar kullanılmaz). Etiketinde sodyum hipoklorit oranı %6 yazıyorsa <b>litre başına 2 damla</b> damlat. Su bulanık, renkli ya da çok soğuksa miktarı iki katına çıkar. Karıştır ve 30 dakika beklet. Hafif klor kokusu yoksa aynı miktarı tekrar ekle ve 15 dakika daha beklet.',
      'Etikette oran yazmıyorsa çamaşır suyuyla tahmine dayalı doz verme, suyu kaynat.',
      'Kaynatma ve çamaşır suyu ağır metalleri, tuzları ve çoğu kimyasalı <b>temizlemez</b>. Üstünde yüzen madde olan, koyu renkli ya da kötü kokan suyu kullanma.',
    ],
    source: 'Kaynak: kaynatma süresi ABD Hastalık Kontrol Merkezi (CDC), "How to Make Water Safe in an Emergency"; çamaşır suyu ABD Çevre Koruma Ajansı (EPA), "Emergency Disinfection of Drinking Water" — galon (3,8 litre) başına %6\'lık çamaşır suyundan 8 damla; litre başına 2 damla buradan hesaplanmıştır.',
  },
  {
    id: 'haber',
    title: 'Haberleşme',
    items: [
      'Hatlar kilitlenmesin diye operatör üzerinden arama yapma; SMS ve internet tabanlı uygulamaları tercih et.',
      'Telefonu acil durumları ve yangınları bildirmek dışında kullanma.',
      'Radyo gibi kitle iletişim araçlarından yapılan uyarıları dinle.',
      'Bölge dışında bağlantı kuracağın bir kişiyi önceden belirle; ailecek ona haber verin.',
    ],
    source: 'Kaynak: AFAD İstanbul İl Müdürlüğü, "Deprem Sonrası İlk 6 Saate Dikkat"; AFAD Bursa İl Müdürlüğü, "Deprem" ve "Afete Hazır Aile".',
  },
  {
    id: 'canta',
    title: 'Afet ve acil durum çantası (ilk 72 saat)',
    items: [
      'Yiyecek ve su',
      'İlk yardım malzemeleri',
      'Fener ve düdük',
      'Önemli evrakların kopyaları (bir kopyası da bölge dışındaki bağlantı kişinde dursun)',
      'Yatağının yanında: su, düdük, fener ve ayakkabı',
    ],
    source: 'Kaynak: AFAD Bursa İl Müdürlüğü, "Afete Hazır Aile".',
  },
];