
import { User } from '../types';

export interface UserNotification {
    id: number;
    title: string;
    message: string;
    read: boolean;
    date: string; // Storing as ISO string for JSON compatibility
}

type UserNotifications = Record<string, UserNotification[]>; // key is userId (string UUID)

const NOTIFICATION_STORAGE_KEY = 'fitness_craze_notifications';
const NOTIFICATION_CHANNEL_NAME = 'fitness_craze_notification_channel';

// Use a BroadcastChannel for real-time updates across tabs.
const channel = new BroadcastChannel(NOTIFICATION_CHANNEL_NAME);

type Listener = (notifications: UserNotification[]) => void;

// In-memory map of listeners for each user ID.
const listeners: Map<string, Listener[]> = new Map();

const getStoredNotifications = (): UserNotifications => {
    try {
        const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error("Failed to parse notifications from localStorage", error);
        return {};
    }
};

const saveStoredNotifications = (allNotifications: UserNotifications) => {
    try {
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(allNotifications));
    } catch (error) {
        console.error("Failed to save notifications to localStorage", error);
    }
};

const notifyListeners = (userId: string) => {
    const userListeners = listeners.get(userId);
    if (userListeners) {
        const allNotifications = getStoredNotifications();
        const userNotifications = allNotifications[userId] || [];
        userListeners.forEach(listener => listener(userNotifications));
    }
};

// Listen for messages from other tabs
channel.onmessage = (event) => {
    const { userId } = event.data;
    if (userId) {
        notifyListeners(userId);
    }
};

export const userNotificationService = {
    subscribe: (userId: string, listener: Listener): (() => void) => {
        const userListeners = listeners.get(userId) || [];
        listeners.set(userId, [...userListeners, listener]);
        
        // Immediately provide current notifications
        const allNotifications = getStoredNotifications();
        listener(allNotifications[userId] || []);

        return () => {
            const updatedListeners = (listeners.get(userId) || []).filter(l => l !== listener);
            listeners.set(userId, updatedListeners);
        };
    },

    sendNotification: (userId: string, title: string, message: string) => {
        const allNotifications = getStoredNotifications();
        const userNotifications = allNotifications[userId] || [];

        const newNotification: UserNotification = {
            id: Date.now(), // Simple unique ID
            title,
            message,
            read: false,
            date: new Date().toISOString(),
        };

        allNotifications[userId] = [newNotification, ...userNotifications];
        saveStoredNotifications(allNotifications);

        // Notify local listeners and broadcast to other tabs
        notifyListeners(userId);
        channel.postMessage({ userId });
    },

    markAllAsRead: (userId: string) => {
        const allNotifications = getStoredNotifications();
        if (allNotifications[userId]) {
            allNotifications[userId] = allNotifications[userId].map(n => ({ ...n, read: true }));
            saveStoredNotifications(allNotifications);
            notifyListeners(userId);
            channel.postMessage({ userId });
        }
    },

    clearAll: (userId: string) => {
        const allNotifications = getStoredNotifications();
        if (allNotifications[userId]) {
            delete allNotifications[userId];
            saveStoredNotifications(allNotifications);
            notifyListeners(userId);
            channel.postMessage({ userId });
        }
    },

    // Used when an admin deletes a user
    clearAllForUser: (userId: string) => {
        const allNotifications = getStoredNotifications();
        if (allNotifications[userId]) {
            delete allNotifications[userId];
            saveStoredNotifications(allNotifications);
        }
    }
};