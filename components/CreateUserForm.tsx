import React, { useState } from 'react';
import { User, Role } from '../types';
import { createEmptyFitnessData } from '../constants';

interface CreateUserFormProps {
    onSave: (newUser: Omit<User, 'id'>, password_param: string) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSave, onCancel, isLoading }) => {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [membershipDetails, setMembershipDetails] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('Name, Email, and Password are required.');
            return;
        }
         if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setError('');
        
        const newUser: Omit<User, 'id'> = {
            name,
            mobile,
            membershipDetails,
            email,
            role: Role.User,
            fitnessData: createEmptyFitnessData(),
        };
        onSave(newUser, password);
    };

    const inputClasses = "mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500";
    const labelClasses = "block text-sm font-medium text-gray-300";

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-yellow-400 mb-6">Create New Member</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className={labelClasses}>Full Name *</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="mobile" className={labelClasses}>Mobile Number</label>
                        <input id="mobile" type="text" value={mobile} onChange={e => setMobile(e.target.value)} className={inputClasses} placeholder="e.g., 123-456-7890" />
                    </div>
                </div>
                <div>
                    <label htmlFor="membershipDetails" className={labelClasses}>Membership Details</label>
                    <input id="membershipDetails" type="text" value={membershipDetails} onChange={e => setMembershipDetails(e.target.value)} className={inputClasses} placeholder="e.g., Gold Member" />
                </div>
                <hr className="border-gray-600 my-4" />
                <h3 className="text-lg font-semibold text-yellow-400">Login Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="email-create" className={labelClasses}>Email *</label>
                        <input id="email-create" type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="password-create" className={labelClasses}>Password *</label>
                        <input id="password-create" type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} placeholder="Min. 6 characters" required />
                    </div>
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                <div className="flex justify-end items-center gap-4 pt-4">
                    <button type="button" onClick={onCancel} className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">
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
                            'Create User'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateUserForm;
