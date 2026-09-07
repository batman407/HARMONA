export interface TranslationDictionary {
  appName: string;
  tagline: string;
  loadingStudio: string;
  skipIntro: string;
  tabs: {
    explore: string;
    disassemble: string;
    activate: string;
    visualize: string;
    soundLab: string;
    compare: string;
    experiment: string;
  };
  actions: {
    resetCamera: string;
    autoRotate: string;
    searchInstruments: string;
    explode: string;
    isolate: string;
    ghostMode: string;
    reassemble: string;
    playNote: string;
    pluckString: string;
    strikeKey: string;
    strikeDrum: string;
    pressValve: string;
    compareWith: string;
    selectPart: string;
    followTheSound: string;
  };
  soundDNA: {
    title: string;
    exciter: string;
    resonator: string;
    harmonics: string;
    attackDecay: string;
    timbreProfile: string;
    acousticRadiance: string;
  };
  experiment: {
    title: string;
    subtitle: string;
    formula: string;
    length: string;
    tension: string;
    linearDensity: string;
    calculatedFreq: string;
    nearestNote: string;
    pluckPrompt: string;
    standingWave: string;
    nodes: string;
    harmonicsCount: string;
  };
  soundLab: {
    title: string;
    waveform: string;
    spectrum: string;
    fundamental: string;
    harmonics: string;
    selectNote: string;
    playSameNote: string;
    timbreExplanation: string;
  };
  families: {
    strings: string;
    keyboards: string;
    percussion: string;
    brass: string;
  };
  theme: {
    dark: string;
    light: string;
    system: string;
  };
}

export const RTL_LANGUAGES = ['ar', 'fa', 'ur', 'he'];

export const SUPPORTED_LOCALES: Record<string, { name: string; nativeName: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', dir: 'ltr' },
  de: { name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  it: { name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr' },
  sv: { name: 'Swedish', nativeName: 'Svenska', dir: 'ltr' },
  pl: { name: 'Polish', nativeName: 'Polski', dir: 'ltr' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
  'pt-BR': { name: 'Portuguese (BR)', nativeName: 'Português (BR)', dir: 'ltr' },
  'pt-PT': { name: 'Portuguese (PT)', nativeName: 'Português (PT)', dir: 'ltr' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr' },
  sw: { name: 'Swahili', nativeName: 'Kiswahili', dir: 'ltr' },
  ru: { name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  uk: { name: 'Ukrainian', nativeName: 'Українська', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  fa: { name: 'Persian', nativeName: 'فارسی', dir: 'rtl' },
  ur: { name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  he: { name: 'Hebrew', nativeName: 'עברית', dir: 'rtl' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  th: { name: 'Thai', nativeName: 'ไทย', dir: 'ltr' },
  ja: { name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  ko: { name: 'Korean', nativeName: '한국어', dir: 'ltr' },
  'zh-Hans': { name: 'Chinese (Simplified)', nativeName: '简体中文', dir: 'ltr' },
  'zh-Hant': { name: 'Chinese (Traditional)', nativeName: '繁體中文', dir: 'ltr' },
};

export const enTranslations: TranslationDictionary = {
  appName: 'HARMONA',
  tagline: 'Explore the World of Sound',
  loadingStudio: 'Loading Acoustic Studio...',
  skipIntro: 'Skip Intro',
  tabs: {
    explore: 'Explore',
    disassemble: 'Disassemble',
    activate: 'Activate',
    visualize: 'Visualize',
    soundLab: 'Sound Lab',
    compare: 'Compare',
    experiment: 'Experiment',
  },
  actions: {
    resetCamera: 'Reset View',
    autoRotate: 'Auto-Rotate',
    searchInstruments: 'Search instruments or parts...',
    explode: 'Explode Model',
    isolate: 'Isolate Part',
    ghostMode: 'Ghost X-Ray',
    reassemble: 'Reassemble',
    playNote: 'Play Note',
    pluckString: 'Pluck String',
    strikeKey: 'Strike Key',
    strikeDrum: 'Strike Drum',
    pressValve: 'Press Valve',
    compareWith: 'Compare with...',
    selectPart: 'Select a part in 3D to inspect its acoustic function',
    followTheSound: 'Follow the Sound Path',
  },
  soundDNA: {
    title: 'Acoustic Sound DNA',
    exciter: 'Exciter Mechanism',
    resonator: 'Resonance Body',
    harmonics: 'Harmonic Profile',
    attackDecay: 'Attack & Decay Envelope',
    timbreProfile: 'Timbre Characteristics',
    acousticRadiance: 'Acoustic Radiance',
  },
  experiment: {
    title: 'Mersenne’s String Acoustics Lab',
    subtitle: 'Manipulate physical parameters to observe the fundamental frequency relationship in real time.',
    formula: 'f = (1 / 2L) · √(T / μ)',
    length: 'String Length (L)',
    tension: 'Tension (T)',
    linearDensity: 'Linear Mass Density (μ)',
    calculatedFreq: 'Calculated Frequency (f₀)',
    nearestNote: 'Nearest Chromatic Pitch',
    pluckPrompt: 'Pluck the interactive string to hear physical synthesis',
    standingWave: 'Standing Wave Simulation',
    nodes: 'Nodal Points',
    harmonicsCount: 'Harmonic Modes',
  },
  soundLab: {
    title: 'Timbre & Harmonics Spectrum Lab',
    waveform: 'Real-time Oscilloscope (Time Domain)',
    spectrum: 'FFT Frequency Spectrum & Harmonics',
    fundamental: 'Fundamental f₀',
    harmonics: 'Overtones & Harmonics',
    selectNote: 'Select Concert Pitch',
    playSameNote: 'Play Note Across Instruments',
    timbreExplanation: 'Every instrument playing the exact same note sounds distinct due to its unique harmonic overtone distribution and resonance peaks.',
  },
  families: {
    strings: 'Chordophones (Strings)',
    keyboards: 'Keyboards',
    percussion: 'Membranophones & Idiophones',
    brass: 'Aerophones (Brass & Wind)',
  },
  theme: {
    dark: 'Dark Studio',
    light: 'Light Studio',
    system: 'System Theme',
  },
};

// Localized overrides with fallback to English
export const translationsMap: Record<string, TranslationDictionary> = {
  en: enTranslations,
  es: {
    ...enTranslations,
    tagline: 'Explora el Mundo del Sonido',
    loadingStudio: 'Cargando Estudio Acústico...',
    skipIntro: 'Omitir Intro',
    tabs: {
      explore: 'Explorar',
      disassemble: 'Desarmar',
      activate: 'Activar',
      visualize: 'Visualizar',
      soundLab: 'Lab de Sonido',
      compare: 'Comparar',
      experiment: 'Experimento',
    },
    actions: {
      ...enTranslations.actions,
      resetCamera: 'Reiniciar Vista',
      autoRotate: 'Auto-rotación',
      explode: 'Despiezar Modelo',
      isolate: 'Aislar Pieza',
      ghostMode: 'Modo Rayos X',
      reassemble: 'Ensamblar',
    },
    soundDNA: {
      ...enTranslations.soundDNA,
      title: 'ADN Sonoro Acústico',
      exciter: 'Mecanismo Excitador',
      resonator: 'Cuerpo Resonador',
      harmonics: 'Perfil de Armónicos',
    },
  },
  fr: {
    ...enTranslations,
    tagline: 'Explorez le Monde du Son',
    loadingStudio: 'Chargement du Studio Acoustique...',
    skipIntro: 'Passer l’intro',
    tabs: {
      explore: 'Explorer',
      disassemble: 'Désassembler',
      activate: 'Activer',
      visualize: 'Visualiser',
      soundLab: 'Labo Sonore',
      compare: 'Comparer',
      experiment: 'Expérience',
    },
    actions: {
      ...enTranslations.actions,
      resetCamera: 'Réinitialiser la Vue',
      autoRotate: 'Rotation Auto',
      explode: 'Vue éclatée',
      isolate: 'Isoler la pièce',
      ghostMode: 'Mode Rayons X',
      reassemble: 'Réassembler',
    },
  },
  de: {
    ...enTranslations,
    tagline: 'Erkunde die Welt des Klangs',
    loadingStudio: 'Akustik-Studio wird geladen...',
    skipIntro: 'Intro überspringen',
    tabs: {
      explore: 'Erkunden',
      disassemble: 'Zerlegen',
      activate: 'Aktivieren',
      visualize: 'Visualisieren',
      soundLab: 'Klanglabor',
      compare: 'Vergleichen',
      experiment: 'Experiment',
    },
  },
  ar: {
    ...enTranslations,
    tagline: 'استكشف عالم الصوت',
    loadingStudio: 'جاري تحميل الأستوديو الصوتي...',
    skipIntro: 'تخطي المقدمة',
    tabs: {
      explore: 'استكشاف',
      disassemble: 'تفكيك',
      activate: 'تفعيل',
      visualize: 'تصور الموجات',
      soundLab: 'مختبر الصوت',
      compare: 'مقارنة',
      experiment: 'تجربة فيزيائية',
    },
    actions: {
      ...enTranslations.actions,
      resetCamera: 'إعادة ضبط الكاميرا',
      autoRotate: 'تدوير تلقائي',
      searchInstruments: 'البحث عن الآلات أو الأجزاء...',
      explode: 'تفكيك الأجزاء',
      isolate: 'عزل الجزء',
      ghostMode: 'وضع الأشعة السينية',
      reassemble: 'إعادة التجميع',
    },
  },
  fa: {
    ...enTranslations,
    tagline: 'جهان صدا را کاوش کنید',
    loadingStudio: 'در حال بارگذاری استودیوی صوتی...',
    skipIntro: 'رد کردن مقدمه',
    tabs: {
      explore: 'کاوش',
      disassemble: 'تفکیک اجزا',
      activate: 'نواختن',
      visualize: 'بصری‌سازی',
      soundLab: 'آزمایشگاه صدا',
      compare: 'مقایسه',
      experiment: 'آزمایش فیزیک',
    },
  },
  ur: {
    ...enTranslations,
    tagline: 'آواز کی دنیا کو دریافت کریں',
    loadingStudio: 'صوتی اسٹوڈیو لوڈ ہو رہا ہے...',
    skipIntro: 'اسکپ کریں',
    tabs: {
      explore: 'دریافت',
      disassemble: 'علیحدگی',
      activate: 'بجانا',
      visualize: 'لہریں دیکھیں',
      soundLab: 'ساؤنڈ لیب',
      compare: 'موازنہ',
      experiment: 'تجربہ',
    },
  },
  he: {
    ...enTranslations,
    tagline: 'חקור את עולם הצליל',
    loadingStudio: 'טוען אולפן אקוסטי...',
    skipIntro: 'דלג על הפתיח',
    tabs: {
      explore: 'חקירה',
      disassemble: 'פירוק חלקים',
      activate: 'הפעלה',
      visualize: 'הדמיית גלים',
      soundLab: 'מעבדת צליל',
      compare: 'השוואה',
      experiment: 'ניסוי פיזיקלי',
    },
  },
  ja: {
    ...enTranslations,
    tagline: '音の世界を探検する',
    loadingStudio: '音響スタジオを読み込み中...',
    skipIntro: 'スキップ',
    tabs: {
      explore: '探検',
      disassemble: '分解',
      activate: '演奏・作動',
      visualize: '振動可視化',
      soundLab: 'サウンドラボ',
      compare: '比較',
      experiment: '物理実験',
    },
  },
  ko: {
    ...enTranslations,
    tagline: '소리의 세계를 탐험하세요',
    loadingStudio: '사운드 스튜디오 불러오는 중...',
    skipIntro: '건너뛰기',
    tabs: {
      explore: '탐색',
      disassemble: '분해',
      activate: '연주/작동',
      visualize: '진동 시각화',
      soundLab: '사운드 랩',
      compare: '비교',
      experiment: '음향 실험',
    },
  },
  'zh-Hans': {
    ...enTranslations,
    tagline: '探索声音的世界',
    loadingStudio: '正在加载声音实验室...',
    skipIntro: '跳过开场',
    tabs: {
      explore: '探索',
      disassemble: '分解结构',
      activate: '交互激发',
      visualize: '声波可视化',
      soundLab: '声学实验室',
      compare: '音色对比',
      experiment: '物理实验',
    },
  },
  'zh-Hant': {
    ...enTranslations,
    tagline: '探索聲音的世界',
    loadingStudio: '正在加載聲音實驗室...',
    skipIntro: '跳過開場',
    tabs: {
      explore: '探索',
      disassemble: '分解結構',
      activate: '互動激發',
      visualize: '聲波可視化',
      soundLab: '聲學實驗室',
      compare: '音色對比',
      experiment: '物理實驗',
    },
  },
  hi: {
    ...enTranslations,
    tagline: 'ध्वनि की दुनिया की खोज करें',
    loadingStudio: 'ध्वनिक स्टूडियो लोड हो रहा है...',
    skipIntro: 'छोड़ें',
    tabs: {
      explore: 'खोजें',
      disassemble: 'अलग करें',
      activate: 'बजाएं',
      visualize: 'तरंगें देखें',
      soundLab: 'साउंड लैब',
      compare: 'तुलना करें',
      experiment: 'प्रयोग',
    },
  },
  ru: {
    ...enTranslations,
    tagline: 'Исследуйте мир звука',
    loadingStudio: 'Загрузка акустической студии...',
    skipIntro: 'Пропустить',
    tabs: {
      explore: 'Обзор',
      disassemble: 'Разборка',
      activate: 'Звучание',
      visualize: 'Вибрация',
      soundLab: 'Лаборатория',
      compare: 'Сравнение',
      experiment: 'Эксперимент',
    },
  },
  it: {
    ...enTranslations,
    tagline: 'Esplora il Mondo del Suono',
    loadingStudio: 'Caricamento dello Studio Acustico...',
    skipIntro: 'Salta Intro',
    tabs: {
      explore: 'Esplora',
      disassemble: 'Smonta',
      activate: 'Attiva',
      visualize: 'Visualizza',
      soundLab: 'Laboratorio Suono',
      compare: 'Confronta',
      experiment: 'Esperimento',
    },
  },
  'pt-BR': {
    ...enTranslations,
    tagline: 'Explore o Mundo do Som',
    loadingStudio: 'Carregando Estúdio Acústico...',
    skipIntro: 'Pular',
    tabs: {
      explore: 'Explorar',
      disassemble: 'Desmontar',
      activate: 'Ativar',
      visualize: 'Visualizar',
      soundLab: 'Lab de Som',
      compare: 'Comparar',
      experiment: 'Experimento',
    },
  },
  tr: {
    ...enTranslations,
    tagline: 'Ses Dünyasını Keşfedin',
    loadingStudio: 'Akustik Stüdyo Yükleniyor...',
    skipIntro: 'Atla',
    tabs: {
      explore: 'Keşfet',
      disassemble: 'Parçala',
      activate: 'Çal & Etkileşim',
      visualize: 'Titreşim Görseli',
      soundLab: 'Ses Laboratuvarı',
      compare: 'Karşılaştır',
      experiment: 'Fizik Deneyi',
    },
  }
};

export const getTranslation = (locale: string): TranslationDictionary => {
  return translationsMap[locale] || translationsMap[locale.split('-')[0]] || enTranslations;
};
