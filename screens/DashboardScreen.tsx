
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { User, Role } from '../types';
import FitnessForm from '../components/FitnessForm';
import CreateUserForm from '../components/CreateUserForm';
import ResetPasswordModal from '../components/ResetPasswordModal';
import { Logo } from '../components/Logo';
import Confetti from '../components/Confetti';
import { userNotificationService } from '../services/userNotificationService';
import UserNotificationBell from '../components/UserNotificationBell';
import { notificationService } from '../services/notificationService';


const DashboardScreen: React.FC = () => {
    const { user, logout, isLoading: isAuthLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isScreenLoading, setScreenLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');


    const isAdmin = user?.role?.toUpperCase() === Role.Admin;

    const fetchUsers = useCallback(async () => {
        setScreenLoading(true);
        if (isAdmin) {
            try {
                const fetchedUsers = await apiService.getUsers();
                setUsers(fetchedUsers);
                // After fetching, default to selecting the first user if any exist.
                if (fetchedUsers.length > 0) {
                    setSelectedUser(fetchedUsers[0]);
                } else {
                    setSelectedUser(null);
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        } else if (user) {
            setSelectedUser(user);
        }
        setScreenLoading(false);
    }, [isAdmin, user]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        const justLoggedIn = sessionStorage.getItem('justLoggedIn');
        if (justLoggedIn) {
            setShowConfetti(true);
            sessionStorage.removeItem('justLoggedIn');
        }
    }, []);

    const handleSaveUser = async (updatedUser: User) => {
        setIsLoading(true);
        try {
            const savedUser = await apiService.updateUser(updatedUser);
            if (savedUser) {
                if (isAdmin) {
                    setUsers(prevUsers => prevUsers.map(u => u.id === savedUser.id ? savedUser : u));
                }
                setSelectedUser(savedUser);
                setShowConfetti(true); // Trigger confetti on successful save
                if (isAdmin && user?.id !== savedUser.id) {
                    userNotificationService.sendNotification(
                        savedUser.id,
                        'Data Updated',
                        'Your fitness data has been updated by the admin.'
                    );
                }
            }
        } catch (error) {
            console.error("Failed to save user", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCreateUser = async (newUser: Omit<User, 'id'>, password_param: string) => {
        setIsLoading(true);
        try {
            // apiService.createUser now returns a boolean and handles notifications.
            const success = await apiService.createUser(newUser, password_param);
            if (success) {
                setShowCreateForm(false);
                setShowConfetti(true);
                // After successful creation, refetch the user list to get the new member.
                await fetchUsers();
            }
        } catch (error) {
            console.error("An unexpected error occurred in handleCreateUser:", error);
            notificationService.error("An unexpected error occurred while creating the user.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (password: string) => {
        if (userToResetPassword) {
            setIsLoading(true);
            await apiService.resetUserPassword(userToResetPassword.id, password);
            setIsLoading(false);
            setUserToResetPassword(null);
        }
    };
    
    if (isScreenLoading || isAuthLoading) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const filteredUsers = users.filter(u =>
        u.role !== Role.Admin &&
        (
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const UserListItem: React.FC<{ u: User }> = ({ u }) => (
        <li
            onClick={() => {
                setSelectedUser(u);
                setShowCreateForm(false);
            }}
            className={`cursor-pointer p-3 rounded-md transition-colors ${
                selectedUser?.id === u.id && !showCreateForm ? 'bg-yellow-500 text-gray-900 font-bold' : 'hover:bg-gray-700'
            }`}
        >
            {u.name}
        </li>
    );

    return (
        <>
        {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
        <div className="flex h-screen bg-gray-900 text-white">
            {isAdmin && (
                <aside className="w-64 bg-gray-800 p-4 flex flex-col border-r border-gray-700">
                    <div className="mb-6">
                        <Logo className="h-16 w-auto" />
                    </div>
                    <div className="mb-4">
                        <input
                            type="search"
                            placeholder="Find by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                    </div>
                    <button
                        onClick={() => {
                           setShowCreateForm(true);
                           setSelectedUser(null);
                        }}
                        className={`w-full text-left p-3 rounded-md transition-colors mb-4 font-semibold ${showCreateForm ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        + Create New Member
                    </button>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Members</h2>
                    <nav className="flex-1 overflow-y-auto pr-2">
                         {filteredUsers.length > 0 ? (
                            <ul className="space-y-1">
                                {filteredUsers.map(u => <UserListItem key={u.id} u={u} />)}
                            </ul>
                        ) : (
                             <p className="px-3 text-sm text-gray-500 italic">
                                {searchTerm ? 'No members match your search.' : 'No members have been added yet.'}
                            </p>
                        )}
                    </nav>
                </aside>
            )}
            <main className="flex-1 flex flex-col">
                <header className="flex items-center justify-between bg-gray-800 p-4 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        {!isAdmin && <Logo className="h-12 w-auto" />}
                         <h1 className="text-xl font-semibold">
                            {isAdmin ? "Admin Dashboard" : "My Fitness Dashboard"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && <UserNotificationBell user={user}/>}
                        <span className="font-semibold">{user?.name}</span>
                        <button
                            onClick={logout}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </header>
                <div className="flex-1 p-6 overflow-y-auto">
                    {showCreateForm ? (
                        <CreateUserForm 
                            onSave={handleCreateUser} 
                            onCancel={() => {
                                setShowCreateForm(false);
                                if (users.length > 0) setSelectedUser(users[0]);
                            }} 
                            isLoading={isLoading} 
                        />
                    ) : selectedUser ? (
                        <FitnessForm
                            user={selectedUser}
                            onSave={handleSaveUser}
                            onResetPassword={isAdmin ? (user) => setUserToResetPassword(user) : undefined}
                            isEditable={isAdmin}
                            isLoading={isLoading}
                            isEditingSelf={user?.id === selectedUser.id}
                        />
                    ) : (
                         <div className="text-center text-gray-400 pt-20">
                            {isAdmin ? (users.length === 0 ? 'No members found. Use the button to create one.' : 'Select a member from the list.') : 'No fitness data available.'}
                        </div>
                    )}
                </div>
            </main>
        </div>
        {userToResetPassword && (
            <ResetPasswordModal 
                user={userToResetPassword} 
                onClose={() => setUserToResetPassword(null)} 
                onSave={handleResetPassword}
                isLoading={isLoading}
            />
        )}
        </>
    );
};

export default DashboardScreen;
