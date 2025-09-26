
import React, { useState, useEffect } from 'react';
import { User, MonthlyData, FitnessData, Role } from '../types';
import { MONTHS, TEST_FIELDS, MEASUREMENT_FIELDS, OTHER_FIELDS, FIELD_LABELS, createEmptyFitnessData } from '../constants';
import { notificationService } from '../services/notificationService';

interface FitnessFormProps {
    user: User;
    onSave: (updatedUser: User) => Promise<void>;
    onResetPassword?: (user: User) => void;
    isEditable: boolean;
    isLoading: boolean;
    isEditingSelf?: boolean;
}

const NUMERIC_FIELDS: (keyof MonthlyData)[] = [
    ...TEST_FIELDS,
    ...MEASUREMENT_FIELDS,
    ...OTHER_FIELDS,
];

const FitnessForm: React.FC<FitnessFormProps> = ({ user, onSave, onResetPassword, isEditable, isLoading, isEditingSelf = false }) => {
    const [currentMonth, setCurrentMonth] = useState(MONTHS[new Date().getMonth()]);
    const [profileData, setProfileData] = useState({
        name: user.name,
        mobile: user.mobile,
        membershipDetails: user.membershipDetails,
        role: user.role,
    });
    const [formData, setFormData] = useState<FitnessData>(user.fitnessData || createEmptyFitnessData());
    const [errors, setErrors] = useState<Partial<Record<keyof MonthlyData, string>>>({});

    useEffect(() => {
        setProfileData({
            name: user.name,
            mobile: user.mobile,
            membershipDetails: user.membershipDetails,
            role: user.role,
        });
        setFormData(user.fitnessData || createEmptyFitnessData());
        setCurrentMonth(MONTHS[new Date().getMonth()]);
        setErrors({}); // Clear errors when user changes
    }, [user]);
    
    const validateField = (field: keyof MonthlyData, value: string): string | null => {
        if (!value || value.trim() === '') return null; // No error for empty fields

        if (field === 'date') {
            const day = Number(value);
            if (!Number.isInteger(day) || day < 1 || day > 31) {
                return 'Day must be 1-31';
            }
            return null;
        }

        // For all other fields that should have a numeric component.
        if (!NUMERIC_FIELDS.includes(field)) return null;

        const numericValue = parseFloat(value);
        const isParsableAsNumber = !isNaN(numericValue);

        if (!isParsableAsNumber) {
            return 'Must be a valid number or start with one.';
        }

        if (numericValue < 0) {
            return 'Value cannot be negative.';
        }
        
        // Specific range checks
        switch (field) {
            case 'bmi':
                if (numericValue < 10 || numericValue > 60) {
                    return 'Enter a valid BMI (10-60)';
                }
                break;
            case 'bmr':
                 if (numericValue < 500 || numericValue > 5000) {
                    return 'Enter a valid BMR (500-5000)';
                }
                break;
            case 'visceralFatLevel':
                if (numericValue < 1 || numericValue > 60) {
                    return 'Enter a valid level (1-60)';
                }
                break;
            case 'fatPercentage':
                if (numericValue > 100) {
                    return 'Must not exceed 100';
                }
                break;
            default:
                // No other specific range checks for now
                break;
        }

        return null; // No error
    };


    const handleInputChange = (field: keyof MonthlyData, value: string) => {
        setFormData(prevData => ({
            ...prevData,
            [currentMonth]: {
                ...prevData[currentMonth],
                [field]: value,
            },
        }));

        const errorMessage = validateField(field, value);
        setErrors(prevErrors => ({
            ...prevErrors,
            [field]: errorMessage || undefined,
        }));
    };
    
    const handleProfileChange = (field: 'name' | 'mobile' | 'membershipDetails' | 'role', value: string) => {
        setProfileData(prev => ({ ...prev, [field]: value as Role }));
    };

    const handleExportCSV = () => {
        if (!user.fitnessData) {
            notificationService.info("No fitness data available to export.");
            return;
        }
    
        const fitnessData = user.fitnessData;
        const orderedFields: (keyof MonthlyData)[] = ['date', ...TEST_FIELDS, ...MEASUREMENT_FIELDS, ...OTHER_FIELDS];
        const headers = ['Month', ...orderedFields.map(field => FIELD_LABELS[field])];
        
        const escapeCsvCell = (cell: string) => {
            if (cell === null || cell === undefined) {
                return '';
            }
            const strCell = String(cell);
            if (strCell.includes(',') || strCell.includes('"') || strCell.includes('\n')) {
                return `"${strCell.replace(/"/g, '""')}"`;
            }
            return strCell;
        };
    
        const csvRows = [headers.map(escapeCsvCell).join(',')];
    
        MONTHS.forEach(month => {
            const monthData = fitnessData[month];
            if (monthData) {
                const hasData = Object.values(monthData).some(val => val && String(val).trim() !== '');
                if (hasData) {
                    const row = [
                        month,
                        ...orderedFields.map(field => monthData[field] || '')
                    ];
                    csvRows.push(row.map(escapeCsvCell).join(','));
                }
            }
        });
    
        if (csvRows.length <= 1) {
            notificationService.info("No fitness data has been recorded to export.");
            return;
        }
    
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        const sanitizedUserName = user.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.setAttribute('download', `${sanitizedUserName}_fitness_data.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Final validation check on all fields for the current month
        const currentMonthData = formData[currentMonth];
        let hasErrors = false;
        const newErrors: Partial<Record<keyof MonthlyData, string>> = {};

        for (const key in currentMonthData) {
            const field = key as keyof MonthlyData;
            const error = validateField(field, currentMonthData[field]);
            if (error) {
                hasErrors = true;
                newErrors[field] = error;
            }
        }
        
        setErrors(newErrors);

        if (!hasErrors) {
            onSave({ 
                ...user, 
                ...profileData, 
                fitnessData: formData 
            });
        }
    };
    
    const renderField = (field: keyof MonthlyData) => {
        const error = errors[field];
        const hasError = !!error;

        return (
            <div key={field}>
                <label htmlFor={`${field}-${currentMonth}`} className="block text-xs font-medium text-gray-400 mb-1">
                    {FIELD_LABELS[field]}
                </label>
                <input
                    id={`${field}-${currentMonth}`}
                    type={NUMERIC_FIELDS.includes(field) || field === 'date' ? 'text' : 'text'}
                    inputMode={NUMERIC_FIELDS.includes(field) || field === 'date' ? 'numeric' : 'text'}
                    value={formData[currentMonth]?.[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className={`w-full bg-gray-700 border rounded-md py-1.5 px-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed ${
                        hasError
                            ? 'border-red-500 ring-1 ring-red-500'
                            : 'border-gray-600 focus:ring-yellow-500'
                    }`}
                    disabled={!isEditable}
                />
                {hasError && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        );
    };
    
    const renderSection = (title: string, fields: (keyof MonthlyData)[]) => (
        <section>
            <h3 className="text-md font-semibold text-yellow-400 border-b border-gray-700 pb-2 mb-4">{title}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {fields.map(renderField)}
            </div>
        </section>
    );

    const inputClasses = "w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed";
    const hasActiveErrors = Object.values(errors).some(Boolean);

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-6 gap-6">
                 {isEditable ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                        <div>
                            <label htmlFor="userName" className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                            <input
                                id="userName"
                                type="text"
                                value={profileData.name}
                                onChange={(e) => handleProfileChange('name', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-xl font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="userMembership" className="block text-xs font-medium text-gray-400 mb-1">Membership</label>
                                <input
                                    id="userMembership"
                                    type="text"
                                    value={profileData.membershipDetails}
                                    onChange={(e) => handleProfileChange('membershipDetails', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label htmlFor="userMobile" className="block text-xs font-medium text-gray-400 mb-1">Mobile</label>
                                <input
                                    id="userMobile"
                                    type="text"
                                    value={profileData.mobile}
                                    onChange={(e) => handleProfileChange('mobile', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label htmlFor="userRole" className="block text-xs font-medium text-gray-400 mb-1">Role</label>
                                <select
                                    id="userRole"
                                    value={profileData.role}
                                    onChange={(e) => handleProfileChange('role', e.target.value)}
                                    disabled={isEditingSelf}
                                    className={inputClasses}
                                >
                                    <option value={Role.User}>USER</option>
                                    <option value={Role.Admin}>ADMIN</option>
                                </select>
                                {isEditingSelf && <p className="text-xs text-gray-500 mt-1">Cannot change your own role.</p>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                            <p className="text-sm text-gray-400">{user.membershipDetails} | {user.mobile}</p>
                        </div>
                         <button
                            onClick={handleExportCSV}
                            className="text-sm bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Export CSV
                        </button>
                    </div>
                )}
                
                 {isEditable && onResetPassword && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={handleExportCSV}
                            className="text-sm bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Export CSV
                        </button>
                         <button
                            onClick={() => onResetPassword(user)}
                            disabled={isLoading}
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reset Password
                        </button>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <div className="flex flex-wrap border-b border-gray-700">
                    {MONTHS.map(month => (
                        <button
                            key={month}
                            onClick={() => setCurrentMonth(month)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                currentMonth === month
                                    ? 'border-b-2 border-yellow-400 text-yellow-400'
                                    : 'text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {month}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Fitness Record for <span className="text-yellow-400">{currentMonth}</span></h3>
                    <div className="w-24">{renderField('date')}</div>
                </div>

                {renderSection("Fitness Tests", TEST_FIELDS)}
                {renderSection("Measurements", MEASUREMENT_FIELDS)}
                {renderSection("Body Composition Analysis", OTHER_FIELDS)}
                
                {isEditable && (
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading || hasActiveErrors}
                            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default FitnessForm;
