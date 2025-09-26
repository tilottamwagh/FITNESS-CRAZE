
import React, { useState } from 'react';
import { User } from '../types';

interface ResetPasswordModalProps {
    user: User;
    onClose: () => void;
    onSave: (password: string) => Promise<void>;
    isLoading: boolean;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ user, onClose, onSave, isLoading }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        onSave(password);
    };
    
    const inputClasses = "mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500";
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-md w-full"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-yellow-400 mb-2">Reset Password</h2>
                <p className="text-gray-400 mb-6">Set a new password for <span className="font-semibold text-white">{user.name}</span>.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-300">New Password</label>
                        <input id="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                        <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClasses} required />
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div className="flex justify-end items-center gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="text-sm bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                             {isLoading ? (
                                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            ) : (
                                'Save New Password'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordModal;
