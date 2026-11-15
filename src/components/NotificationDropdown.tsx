import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  ShieldAlert,
  Trash2,
  CheckCheck,
  Volume2
} from 'lucide-react';
import { audioService } from '../services/audioService';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    setActiveTab
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const displayed = filter === 'all' ? notifications : notifications.filter(n => !n.read);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setBrowserPerm(result);
        if (result === 'granted') {
          audioService.playSuccessChime();
          new Notification('ElderCare AI Alerts Enabled', {
            body: 'You will receive desktop dose reminders and appointment alerts.',
            icon: '/vite.svg'
          });
        }
      } catch (e) {
        console.warn('Browser notification permission error:', e);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'dose_reminder':
        return <Clock className="w-4 h-4 text-cyan-400" />;
      case 'missed_dose':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'sos_alert':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'refill_alert':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div
      role="region"
      aria-label="Notifications Panel"
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-navy-900 border border-navy-750 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
    >
      {/* Header */}
      <div className="p-4 bg-navy-850 border-b border-navy-750 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-teal-400" aria-hidden="true" />
          <h3 className="font-bold text-white text-base">Notifications</h3>
          {notifications.some(n => !n.read) && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-teal-500/20 text-teal-300">
              {notifications.filter(n => !n.read).length} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={markAllNotificationsRead}
            title="Mark all as read"
            aria-label="Mark all notifications as read"
            className="p-1.5 text-slate-400 hover:text-teal-300 rounded hover:bg-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <CheckCheck className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={clearAllNotifications}
            title="Clear all notifications"
            aria-label="Clear all notifications"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Browser Notification Banner */}
      {typeof window !== 'undefined' && 'Notification' in window && browserPerm !== 'granted' && (
        <div className="bg-navy-800/80 px-4 py-2 border-b border-navy-750 flex items-center justify-between text-xs">
          <span className="text-slate-300">Enable desktop dose alerts?</span>
          <button
            type="button"
            onClick={requestNotificationPermission}
            className="text-xs font-bold text-teal-300 hover:text-teal-200 bg-teal-500/20 px-2 py-0.5 rounded border border-teal-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            Allow
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div role="tablist" aria-label="Filter notifications" className="flex items-center border-b border-navy-800 px-4 py-2 text-xs font-semibold gap-3 bg-navy-900">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          onClick={() => setFilter('all')}
          className={`pb-1 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-t ${filter === 'all' ? 'text-teal-300 border-b-2 border-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'unread'}
          onClick={() => setFilter('unread')}
          className={`pb-1 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-t ${filter === 'unread' ? 'text-teal-300 border-b-2 border-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto divide-y divide-navy-800 flex-1" role="list">
        {displayed.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" aria-hidden="true" />
            No notifications in this view.
          </div>
        ) : (
          displayed.map((item) => (
            <button
              type="button"
              key={item.id}
              role="listitem"
              aria-label={`Notification: ${item.title}. ${item.message}. ${item.read ? 'Read' : 'Unread'}`}
              onClick={() => {
                markNotificationRead(item.id);
                if (item.actionUrl === '#medications') {
                  setActiveTab('medications');
                  onClose();
                } else if (item.actionUrl === '#appointments') {
                  setActiveTab('appointments');
                  onClose();
                }
              }}
              className={`w-full text-left p-3.5 hover:bg-navy-850 transition-colors flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-inset ${
                !item.read ? 'bg-navy-850/40' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-navy-800 border border-navy-750 shrink-0 mt-0.5" aria-hidden="true">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs font-bold truncate ${!item.read ? 'text-white' : 'text-slate-300'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
                {item.type === 'sos_alert' && (
                  <span className="inline-block mt-1 text-[10px] uppercase font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.2 rounded border border-rose-500/30">
                    SIMULATED ALERT
                  </span>
                )}
              </div>
              {!item.read && (
                <div className="w-2 h-2 rounded-full bg-teal-400 shrink-0 mt-1.5" aria-hidden="true" />
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-navy-850 border-t border-navy-750 text-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Notifications Panel"
          className="text-xs text-slate-400 hover:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 px-3 py-1 rounded"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
};
