import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

const NotificationDisplay: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const unsubscribe = notificationService.subscribe(setNotifications);
        return () => unsubscribe();
    }, []);

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'info':
                 return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };
    
    const getColors = (type: Notification['type']) => {
        switch (type) {
            case 'success': return 'bg-green-600 border-green-500';
            case 'error': return 'bg-red-600 border-red-500';
            case 'info': return 'bg-blue-600 border-blue-500';
        }
    }

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-5 right-5 z-50 space-y-3">
            {notifications.map(notif => (
                <div
                    key={notif.id}
                    className={`flex items-center gap-4 text-white p-4 rounded-lg shadow-2xl border-l-4 ${getColors(notif.type)} w-80 animate-fade-in-right`}
                >
                    <div>{getIcon(notif.type)}</div>
                    <div className="flex-1 text-sm font-medium">{notif.message}</div>
                    <button onClick={() => notificationService.remove(notif.id)} className="p-1 rounded-full hover:bg-white/20">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
             <style>
                {`
                @keyframes fade-in-right {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-fade-in-right {
                    animation: fade-in-right 0.3s ease-out forwards;
                }
                `}
            </style>
        </div>
    );
};

export default NotificationDisplay;
