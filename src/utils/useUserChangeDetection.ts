/**
 * Hook para detectar cambios de usuario y limpiar caché automáticamente
 */

import { useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { CacheManager } from './cacheManager';

export const useUserChangeDetection = (currentUser: User | null) => {
  const previousUserRef = useRef<string | null>(null);
  
  useEffect(() => {
    const currentUserId = currentUser?.id || null;
    const previousUserId = previousUserRef.current;
    
    // Si hay un cambio de usuario (de uno a otro, no null -> user o user -> null)
    if (previousUserId && currentUserId && previousUserId !== currentUserId) {
      console.log('[UserChangeDetection] Cambio de usuario detectado, limpiando caché...');
      CacheManager.quickClearUserData().catch(error => {
        console.error('[UserChangeDetection] Error limpiando caché:', error);
      });
    }
    
    previousUserRef.current = currentUserId;
  }, [currentUser]);
};
