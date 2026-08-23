import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCheck, Heart, MessageSquare, UserPlus, BookOpen, UserCheck, ShieldCheck, Check, X } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    openStoryReader, 
    openAuthorProfile, 
    unreadNotificationCount,
    acceptFollowRequest,
    rejectFollowRequest,
  } = useApp();

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markAsRead(notif.id);
    const storyId = notif.targetStoryId || notif.storyId;
    const chapterIdx = notif.targetChapterIndex !== undefined ? notif.targetChapterIndex : (notif.chapterIndex || 0);
    
    if (storyId) {
      openStoryReader(storyId, chapterIdx);
    } else if (notif.targetUserId || notif.senderId) {
      openAuthorProfile(notif.targetUserId || notif.senderId || '');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-current" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'follow_request':
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'follow_accept':
        return <UserCheck className="w-4 h-4 text-emerald-500" />;
      case 'new_chapter':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in pb-24 md:pb-12">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Uygulama İçi Bildirimler
            {unreadNotificationCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-bold">
                {unreadNotificationCount} Yeni
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hikayeleriniz, takipçileriniz, takip istekleri ve etkileşimler hakkında bildirimler.
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                !notif.isRead
                  ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/80 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Sender Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={notif.senderAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=WattyBoon'}
                  alt="Sender"
                  className="w-11 h-11 rounded-xl object-cover ring-2 ring-purple-500/20"
                />
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-slate-900 shadow-sm">
                  {getIcon(notif.type)}
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(notif.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {notif.message}
                </p>

                {/* If it's a follow request, show quick Accept / Reject buttons */}
                {notif.type === 'follow_request' && notif.senderId && (
                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptFollowRequest(notif.senderId!);
                        markAsRead(notif.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> İsteği Onayla
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectFollowRequest(notif.senderId!);
                        markAsRead(notif.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Reddet
                    </button>
                  </div>
                )}
              </div>

              {/* Unread Indicator */}
              {!notif.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 flex-shrink-0 self-center hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
          <Bell className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Henüz bildiriminiz yok.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Yeni bir hikaye yayınlayın, yazar takip edin veya profilinizi güncelleyin!
          </p>
        </div>
      )}

    </div>
  );
};
