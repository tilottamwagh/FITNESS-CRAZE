import React, { useState, useEffect, useRef } from 'react';
import { userNotificationService, UserNotification } from '../services/userNotificationService';
import { User } from '../types';

interface UserNotificationBellProps {
    user: User;
}

const UserNotificationBell: React.FC<UserNotificationBellProps> = ({ user }) => {
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = userNotificationService.subscribe(user.id, setNotifications);
        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const timeSince = (dateString: string) => {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };
    
    const handleMarkAllAsRead = () => {
        userNotificationService.markAllAsRead(user.id);
    };

    const handleClearAll = () => {
        userNotificationService.clearAll(user.id);
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative p-2 rounded-full text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                aria-label={`Notifications (${unreadCount} unread)`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-400 items-center justify-center text-xs font-bold text-gray-900">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
                    <div className="p-3 flex justify-between items-center border-b border-gray-700">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-xs text-yellow-400 hover:underline">Mark all as read</button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-gray-400 text-center py-8 text-sm">You have no notifications.</p>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`p-3 border-b border-gray-700 last:border-b-0 flex items-start gap-3 ${!notif.read ? 'bg-gray-700/50' : ''}`}>
                                    {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>}
                                    <div className={`flex-1 ${notif.read && 'pl-5'}`}>
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-semibold text-white text-sm">{notif.title}</p>
                                            <p className="text-xs text-gray-500">{timeSince(notif.date)}</p>
                                        </div>
                                        <p className="text-sm text-gray-400 whitespace-pre-wrap">{notif.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="p-2 border-t border-gray-700 text-center">
                            <button onClick={handleClearAll} className="text-xs text-gray-400 hover:text-white">Clear All</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserNotificationBell;