
import { User } from '../types';
import { notificationService } from './notificationService';
import { supabase } from './supabaseClient';
import { userNotificationService } from './userNotificationService';

// A helper to log Supabase errors more informatively
const logSupabaseError = (context: string, error: any) => {
    console.error(`${context}:`, JSON.stringify(error, null, 2));
};


export const apiService = {
    getUser: async (userId: string): Promise<User | null> => {
        const { data, error } = await supabase
            .from('FITNESS CRAZE')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            logSupabaseError('Error fetching user profile', error);
            if (error.code === 'PGRST116') {
                 console.error("User profile not found. Ensure the database trigger and RLS policies are correctly set up.");
            } else {
                notificationService.error('Could not fetch user profile due to a database error.');
            }
            return null;
        }
        return data as User | null;
    },

    getUsers: async (): Promise<User[]> => {
        const { data, error } = await supabase
            .from('FITNESS CRAZE')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            logSupabaseError('Error fetching users', error);
            notificationService.error('Failed to fetch member list. This might be due to a missing security policy on the database.');
            return [];
        }
        return data || [];
    },

    updateUser: async (updatedUser: User): Promise<User | null> => {
        const { data, error } = await supabase
            .from('FITNESS CRAZE')
            .update({
                name: updatedUser.name,
                mobile: updatedUser.mobile,
                membershipDetails: updatedUser.membershipDetails,
                fitnessData: updatedUser.fitnessData,
                role: updatedUser.role,
            })
            .eq('id', updatedUser.id)
            .select()
            .single();

        if (error) {
            logSupabaseError('Error updating user', error);
            notificationService.error(`Failed to update ${updatedUser.name}'s data. This might be due to a missing security policy.`);
            return null;
        }

        notificationService.success(`Successfully updated ${updatedUser.name}'s data.`);
        return data as User | null;
    },

    createUser: async (newUser: Omit<User, 'id'>, password_param: string): Promise<boolean> => {
        // The error log provided by the user ("function auth.signup(text, text) does not exist")
        // indicates the custom RPC 'create_new_user' is using a deprecated or incorrect function on the backend.
        // We will replace it with the standard, client-side supabase.auth.signUp method.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: newUser.email,
            password: password_param,
            options: {
                // This metadata will be available to a backend trigger that creates the user's public profile.
                data: {
                    name: newUser.name,
                    mobile: newUser.mobile,
                    membership_details: newUser.membershipDetails,
                    role: newUser.role,
                }
            }
        });

        if (authError) {
            logSupabaseError('Error creating user via auth.signUp', authError);
            notificationService.error(authError.message || 'Failed to create new member.');
            return false;
        }

        if (!authData.user) {
            notificationService.error('User creation was not fully completed. Please refresh the member list.');
            return false;
        }
        
        notificationService.success(`Successfully created member: ${newUser.name}. They will need to confirm their email address.`);
        return true;
    },

    deleteUser: async (userId: string): Promise<boolean> => {
        const { error } = await supabase.rpc('delete_user_by_id', {
            user_id_to_delete: userId
        });

        if (error) {
            logSupabaseError('Error deleting user', error);
            notificationService.error(error.message || 'Failed to delete user.');
            return false;
        }

        notificationService.success('User has been successfully deleted.');
        userNotificationService.clearAllForUser(userId);
        return true;
    },

    resetUserPassword: async (userId: string, newPassword_param: string): Promise<boolean> => {
        const { error } = await supabase.rpc('reset_user_password', {
            user_id_to_reset: userId,
            new_password: newPassword_param
        });
        
        if (error) {
            logSupabaseError('Error resetting password', error);
            notificationService.error(error.message || 'Failed to reset password.');
            return false;
        }

        notificationService.success("Password has been successfully reset.");
        return true;
    },
};
