import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types/userProfile';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
  hasProfile: boolean;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('useUserProfile - Starting fetchProfile');

      // Obtener el usuario actual
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('useUserProfile - Supabase user:', user);
      
      if (authError || !user) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener el email del usuario
      const userEmail = user.email;
      if (!userEmail) {
        throw new Error('Email de usuario no disponible');
      }

      // Obtener el ID del usuario desde la tabla "Inicio Sesion"
      console.log('useUserProfile - Fetching user by email:', userEmail);
      const userResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/get-user-by-email`,
        {
          params: { email: userEmail }
        }
      );
      console.log('useUserProfile - User response:', userResponse.data);

      if (!userResponse.data || !userResponse.data.idusuario) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      const userId = userResponse.data.idusuario;
      console.log('useUserProfile - User ID:', userId);

      // Obtener el perfil del usuario
      console.log('useUserProfile - Fetching profile for user:', userId);
      const profileResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile/${userId}`
      );
      console.log('useUserProfile - Profile response:', profileResponse.data);

      if (profileResponse.data.success && profileResponse.data.profile) {
        console.log('useUserProfile - Profile found:', profileResponse.data.profile);
        setProfile(profileResponse.data.profile);
        // Guardar perfil en localStorage para uso offline
        localStorage.setItem('userProfile', JSON.stringify(profileResponse.data.profile));
      } else {
        // Si el usuario está autenticado y existe pero no hay perfil, log de advertencia
        console.warn('useUserProfile - Usuario autenticado y encontrado pero sin perfil. Esto no debería ocurrir si el usuario tiene perfil.');
        setProfile(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al obtener el perfil');
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refetchProfile = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetchProfile,
    hasProfile: profile !== null && Boolean(profile.profile_completed)
  };
};

export default useUserProfile; 