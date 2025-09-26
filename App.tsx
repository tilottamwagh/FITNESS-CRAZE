
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import SignUpScreen from './screens/SignUpScreen';
import NotificationDisplay from './components/NotificationDisplay';

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const [showSignUp, setShowSignUp] = useState(false);

    if (user) {
        return <DashboardScreen />;
    }

    return showSignUp 
        ? <SignUpScreen onShowLogin={() => setShowSignUp(false)} />
        : <LoginScreen onShowSignUp={() => setShowSignUp(true)} />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
            <NotificationDisplay />
        </AuthProvider>
    );
};

export default App;