import { Story, User, AppNotification, DirectMessage } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_elif_kaya',
    name: 'Elif Kaya',
    username: 'elifkaya',
    email: 'elif.kaya@wattyboon.com',
    role: 'author',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    bio: 'Karanlık kurgular, kadim efsaneler ve gizem dolu geceler. Kelimelerin büyüsüne inanan bir yazar. ✨',
    joinedDate: '2024-01-15',
    followers: ['user_can_arslan', 'user_zeynep_demir'],
    following: ['user_can_arslan'],
    library: [],
    readingProgress: [],
    customLists: [],
  },
  {
    id: 'user_can_arslan',
    name: 'Can Arslan',
    username: 'canarslan',
    email: 'can.arslan@wattyboon.com',
    role: 'author',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    bio: 'Bilim kurgu, siberpunk ve alternatif evren meraklısı. Geleceği bugünden yazıyorum. 🚀',
    joinedDate: '2024-02-10',
    followers: ['user_elif_kaya'],
    following: ['user_elif_kaya', 'user_zeynep_demir'],
    library: [],
    readingProgress: [],
    customLists: [],
  },
  {
    id: 'user_zeynep_demir',
    name: 'Zeynep Demir',
    username: 'zeynepdemir',
    email: 'zeynep.demir@wattyboon.com',
    role: 'author',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    bio: 'Aşkın, nostaljinin ve insan ruhunun derinliklerine yolculuk eden samimi hikayeler. 🌸',
    joinedDate: '2024-03-01',
    followers: ['user_elif_kaya', 'user_can_arslan'],
    following: ['user_elif_kaya'],
    library: [],
    readingProgress: [],
    customLists: [],
  }
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story_gecenin_fisiltisi',
    title: 'Gecenin Fısıltısı',
    summary: 'Eski bir konağın gizemli odalarında saklanan kadim bir mühür ve sırlarla dolu geçmişin karanlık gölgeleri. Yağmurlu bir gecede başlayan kehanet...',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    authorId: 'user_elif_kaya',
    authorName: 'Elif Kaya',
    authorUsername: 'elifkaya',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    category: 'Gizem / Gerilim',
    tags: ['Gizem', 'Karanlık Kurgu', 'Efsane', 'Gerilim'],
    visibility: 'public',
    status: 'ongoing',
    isCompleted: false,
    likes: 142,
    likedBy: ['user_can_arslan', 'user_zeynep_demir'],
    reads: 1250,
    chapters: [
      {
        id: 'chap_gf_1',
        title: '1. Bölüm: Yağmurlu Gece',
        content: `Sokak lambalarının cılız ışığı altında, ıslak kaldırımlara yansıyan gölgeler dans ediyordu. Rüzgar, eski ahşap pencere pervazlarını zorlarken konağın gıcırtıları gecenin sessizliğini bölüyordu.

Lara, elindeki mumla uzun koridorda ilerledi. Duvarlardaki portrelerin gözleri sanki onu takip ediyordu. Koridorun sonundaki kilitli kapıya vardığında, cebinden çıkardığı bronz anahtarı kilide yerleştirdi.

Kilit tık sesiyle açıldı. İçeriden gelen küf ve eski kağıt kokusu yüzüne çarptı. Masanın üzerinde duran deri kaplı defter, tam da büyükbabasının bahsettiği o günlüktü...`,
        order: 1,
        readCount: 1250,
        createdAt: '2024-01-16T10:00:00Z',
        likes: 85,
        likedBy: ['user_can_arslan']
      },
      {
        id: 'chap_gf_2',
        title: '2. Bölüm: Kadim Mühür',
        content: `Defterin sayfalarını sararmış kağıtların hışırtısı eşliğinde çevirdi. Sayfalarda yazılı garip semboller ve çizimler, sıradan bir günlük olmadığını kanıtlıyordu.

'Gecenin fısıltısını duyanlar, ışığın son demlerini unutmalıdır.'

Tam bu cümleyi okuduğu anda, odadaki mum aniden söndü. Karanlık, üzerini bir örtü gibi kapladı. Arka taraftan gelen hafif ayak sesleri, yalnız olmadığını hatırlattı...`,
        order: 2,
        readCount: 980,
        createdAt: '2024-01-20T14:30:00Z',
        likes: 62,
        likedBy: ['user_zeynep_demir']
      }
    ],
    comments: [],
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    readingTimeMinutes: 6
  },
  {
    id: 'story_yildizlarin_otesinde',
    title: 'Yıldızların Ötesinde',
    summary: '2184 yılında, Orion galaksisindeki terk edilmiş bir uzay istasyonunda keşfedilen gizemli sinyal. İnsanlığın kaderini değiştirecek yolculuk.',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    authorId: 'user_can_arslan',
    authorName: 'Can Arslan',
    authorUsername: 'canarslan',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    category: 'Bilim Kurgu',
    tags: ['BilimKurgu', 'Uzay', 'Siberpunk', 'Maceracı'],
    visibility: 'public',
    status: 'ongoing',
    isCompleted: false,
    likes: 210,
    likedBy: ['user_elif_kaya'],
    reads: 1890,
    chapters: [
      {
        id: 'chap_yo_1',
        title: '1. Bölüm: Derin Derin Uykudan Uyanış',
        content: `Kriyojenik kapsülün camı buğulanmıştı. Kapsülün kapağı tıslayarak açıldığında Kaptan Aren ilk derin nefesini aldı. Akciğerlerini yakan soğuk hava, uzayın derinliklerinde olduklarını hatırlatıyordu.

İstasyon yapay zekası AURA'nın sesi yankılandı:
'Günaydın Kaptan. Orion-7 istasyonuna yaklaşmaktayız. Sinyal kaynağı 12 dakika uzaklıkta.'

Aren gözlerini ovuşturup kontrol paneline yöneldi. Radardaki mavi nokta ritmik bir şekilde yanıp sönüyordu. Bu insan yapımı bir sinyal değildi...`,
        order: 1,
        readCount: 1890,
        createdAt: '2024-02-11T09:15:00Z',
        likes: 110,
        likedBy: ['user_elif_kaya']
      }
    ],
    comments: [],
    createdAt: '2024-02-11T09:15:00Z',
    updatedAt: '2024-02-11T09:15:00Z',
    readingTimeMinutes: 5
  },
  {
    id: 'story_sonbahar_ezgisi',
    title: 'Sonbahar Ezgisi',
    summary: 'İstanbul’un dar sokaklarında eski bir plakçıda kesişen iki hayat. Yağmurun, kahve kokusunun ve nostaljik şarkıların eşlik ettiği samimi bir aşk hikayesi.',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    authorId: 'user_zeynep_demir',
    authorName: 'Zeynep Demir',
    authorUsername: 'zeynepdemir',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    category: 'Romantik',
    tags: ['Romantik', 'Aşk', 'İstanbul', 'Dram'],
    visibility: 'public',
    status: 'completed',
    isCompleted: true,
    likes: 340,
    likedBy: ['user_elif_kaya', 'user_can_arslan'],
    reads: 3120,
    chapters: [
      {
        id: 'chap_se_1',
        title: '1. Bölüm: Yağmur ve Şarkı',
        content: `Kadıköy'ün taş sokağında aniden bastıran sonbahar yağmuru, Melis'i en yakındaki dükkanın tentesinin altına sığınmaya zorladı. Başını kaldırdığında ahşap tabeladaki yazıyı gördü: 'Zamanın Şarkıları Plakçısı'.

Dükkanın kapısını çaldığında içeride hafif bir caz melodisi çalıyordu. Kapı açıldı ve içeri girdi. Tezgahın arkasındaki genç adam gülümseyerek ona baktı.

'Hoş geldiniz. Yağmura yakalandınız galiba?'`,
        order: 1,
        readCount: 3120,
        createdAt: '2024-03-02T11:00:00Z',
        likes: 180,
        likedBy: ['user_can_arslan']
      }
    ],
    comments: [],
    createdAt: '2024-03-02T11:00:00Z',
    updatedAt: '2024-03-02T11:00:00Z',
    readingTimeMinutes: 4
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_MESSAGES: DirectMessage[] = [];
