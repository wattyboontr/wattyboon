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

export const INITIAL_STORIES: Story[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_MESSAGES: DirectMessage[] = [];
