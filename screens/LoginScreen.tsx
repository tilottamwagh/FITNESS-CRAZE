
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppIcon } from '../components/Logo';

interface LoginScreenProps {
    onShowSignUp: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onShowSignUp }) => {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const success = await login(loginIdentifier, password);
        if (!success) {
            // A generic error is shown now, as specific errors are handled in AuthContext
            setError('Invalid credentials.');
        }
        setLoading(false);
    };

    const backgroundImageUrl = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop';

    return (
        <div 
            className="min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
            <div className="flex items-center justify-center min-h-screen p-4 bg-black bg-opacity-70">
                <div className="w-full max-w-sm mx-auto">
                    <div className="flex justify-center mb-8">
                        <AppIcon className="w-48 h-48" />
                    </div>
                    
                    <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
                        <h1 className="text-2xl font-bold text-center text-yellow-400 mb-6">MEMBER LOGIN</h1>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="login_identifier" className="block text-sm font-medium text-gray-300">Email or Username</label>
                                <input
                                    id="login_identifier"
                                    type="text"
                                    value={loginIdentifier}
                                    onChange={(e) => setLoginIdentifier(e.target.value)}
                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="e.g. john@example.com or john_doe"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password_field" className="block text-sm font-medium text-gray-300">Password</label>
                                <input
                                    id="password_field"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="e.g. password"
                                    required
                                />
                            </div>
                            
                            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'LOG IN'
                                    )}
                                </button>
                            </div>
                        </form>
                        <div className="mt-6 text-center text-sm">
                            <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); onShowSignUp(); }} 
                                className="font-medium text-yellow-400 hover:text-yellow-300"
                            >
                                Don't have an account? Sign up
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;