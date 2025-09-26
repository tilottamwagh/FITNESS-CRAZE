import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { supabase } from '../services/supabaseClient';
import { notificationService } from '../services/notificationService';

interface AuthContextType {
    user: User | null;
    login: (loginIdentifier: string, password_param: string) => Promise<boolean>;
    logout: () => void;
    signUp: (name: string, email: string, password_param: string, mobile: string, membershipDetails: string) => Promise<boolean>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Set loading to true on mount. It will be set to false when the initial
        // session check from onAuthStateChange is complete.
        setIsLoading(true);
        
        // onAuthStateChange handles the initial session ('INITIAL_SESSION' event)
        // and all subsequent auth events (SIGNED_IN, SIGNED_OUT, etc).
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
                if (session) {
                    // A session exists, so fetch the user's profile from our public table.
                    const profile = await apiService.getUser(session.user.id);
                    
                    if (profile) {
                        // Profile found, set the user in our context.
                        setUser(profile);
                        // On any successful sign-in, set the flag for the dashboard to show confetti.
                        if (event === 'SIGNED_IN') {
                            sessionStorage.setItem('justLoggedIn', 'true');
                        }
                    } else {
                        // This is an important edge case: the user is authenticated with Supabase,
                        // but we don't have a corresponding profile in our 'FITNESS CRAZE' table.
                        // This indicates an inconsistent state, so we should sign the user out.
                        await supabase.auth.signOut();
                        setUser(null);
                        // Avoid showing an error for a stale session on initial page load.
                        if (event !== 'INITIAL_SESSION') {
                             notificationService.error("Your user profile could not be found. Logging out.");
                        }
                    }
                } else {
                    // No session means the user is logged out.
                    setUser(null);
                    sessionStorage.removeItem('justLoggedIn');
                }
            } catch (e) {
                console.error("Error during auth state change:", e);
                // On any unexpected error, ensure we're in a safe, logged-out state.
                setUser(null);
            } finally {
                // The 'INITIAL_SESSION' event fires once on page load.
                // We can safely stop the initial loading spinner after this event has been processed.
                // For all subsequent events (like SIGNED_IN), isLoading will already be false.
                if (event === 'INITIAL_SESSION') {
                    setIsLoading(false);
                }
            }
        });

        return () => {
            // Clean up the subscription when the component unmounts.
            subscription.unsubscribe();
        };
    }, []);

    const login = useCallback(async (loginIdentifier: string, password_param: string): Promise<boolean> => {
        const { data: email, error: rpcError } = await supabase.rpc('get_email_for_login', {
            login_identifier: loginIdentifier
        });

        if (rpcError) {
            console.error('Error resolving email:', rpcError);
            notificationService.error('An unexpected error occurred. Please try again.');
            return false;
        }

        if (!email) {
            notificationService.error('Invalid credentials provided.');
            return false;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: password_param,
        });

        if (error) {
            notificationService.error(error.message || 'Invalid login credentials.');
            return false;
        }
        return true;
    }, []);

    const logout = useCallback(async () => {
        // Immediately set the user to null for a responsive UI,
        // effectively logging them out from the application's perspective.
        setUser(null);

        // Then, attempt to sign out from the Supabase server.
        const { error } = await supabase.auth.signOut();
        
        // If there was an error, log it for debugging. The user is already
        // logged out on the client, so the primary goal is achieved.
        if (error) {
            console.error('Error during Supabase sign out:', error);
            notificationService.error('A server error occurred during logout.');
        }
    }, [setUser]);

    const signUp = useCallback(async (name: string, email: string, password_param: string, mobile: string, membershipDetails: string): Promise<boolean> => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: password_param,
            options: {
                data: {
                    name: name,
                    mobile: mobile,
                    membership_details: membershipDetails
                }
            }
        });

        if (authError) {
            notificationService.error(authError.message || 'Failed to sign up.');
            return false;
        }

        if (!authData.user) {
            notificationService.error('Sign up successful, but no user data returned. Please try logging in.');
            return false;
        }
        
        notificationService.success('Sign up successful! Please check your email to verify your account.');
        return true;
    }, []);


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <AuthContext.Provider value={{ user, login, logout, signUp, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};