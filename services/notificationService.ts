// FIX: Create notificationService to manage and broadcast notifications.
type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

type Listener = (notifications: Notification[]) => void;

let notifications: Notification[] = [];
let listeners: Listener[] = [];
let nextId = 0;

const broadcast = () => {
    listeners.forEach(listener => listener(notifications));
};

const addNotification = (message: string, type: NotificationType) => {
    const newNotification: Notification = {
        id: nextId++,
        message,
        type,
    };
    notifications = [...notifications, newNotification];
    broadcast();

    setTimeout(() => {
        removeNotification(newNotification.id);
    }, 5000); // Auto-dismiss after 5 seconds
};

const removeNotification = (id: number) => {
    notifications = notifications.filter(n => n.id !== id);
    broadcast();
};

export const notificationService = {
    subscribe: (listener: Listener): (() => void) => {
        listeners.push(listener);
        listener(notifications); // Immediately notify with current state
        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    },
    success: (message: string) => {
        addNotification(message, 'success');
    },
    error: (message: string) => {
        addNotification(message, 'error');
    },
    info: (message: string) => {
        addNotification(message, 'info');
    },
    remove: removeNotification,
};
