
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppIcon } from '../components/Logo';

interface SignUpScreenProps {
    onShowLogin: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onShowLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [membershipDetails, setMembershipDetails] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setError('');
        setLoading(true);
        const success = await signUp(name, email, password, mobile, membershipDetails);
        setLoading(false);
        if (success) {
            onShowLogin();
        }
    };
    
    const inputClasses = "mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500";
    const labelClasses = "block text-sm font-medium text-gray-300";
    
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
                        <h1 className="text-2xl font-bold text-center text-yellow-400 mb-6">CREATE ACCOUNT</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name-signup" className={labelClasses}>Full Name *</label>
                                <input
                                    id="name-signup"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={inputClasses}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="mobile-signup" className={labelClasses}>Mobile Number</label>
                                <input
                                    id="mobile-signup"
                                    type="text"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className={inputClasses}
                                    placeholder="e.g., 123-456-7890"
                                />
                            </div>
                             <div>
                                <label htmlFor="membership-signup" className={labelClasses}>Membership Details</label>
                                <input
                                    id="membership-signup"
                                    type="text"
                                    value={membershipDetails}
                                    onChange={(e) => setMembershipDetails(e.target.value)}
                                    className={inputClasses}
                                    placeholder="e.g., Gold Member"
                                />
                            </div>

                             <hr className="border-gray-600 !mt-6" />

                            <div>
                                <label htmlFor="email-signup" className={labelClasses}>Email *</label>
                                <input
                                    id="email-signup"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClasses}
                                    placeholder="e.g. john@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password-signup" className={labelClasses}>Password *</label>
                                <input
                                    id="password-signup"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputClasses}
                                    placeholder="Min. 6 characters"
                                    required
                                />
                            </div>
                            
                            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                            <div className="!mt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'SIGN UP'
                                    )}
                                </button>
                            </div>
                        </form>
                        <div className="mt-6 text-center text-sm">
                            <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); onShowLogin(); }} 
                                className="font-medium text-yellow-400 hover:text-yellow-300"
                            >
                                Already have an account? Log in
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpScreen;