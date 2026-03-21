/**
 * Utilidades para gestionar la limpieza de caché durante el logout
 * y cambios de usuario
 */

export class CacheManager {
  /**
   * Limpia completamente todos los datos relacionados con el usuario actual
   */
  static async clearUserCache(): Promise<void> {
    try {
      console.log('[CacheManager] Iniciando limpieza completa de caché de usuario...');
      
      // 1. Limpiar datos de autenticación en caché offline
      if (typeof window !== 'undefined' && 'offlineSyncManager' in window) {
        await (window as any).offlineSyncManager.clearAuthData();
        console.log('[CacheManager] ✓ Datos offline limpiados');
      }
      
      // 2. Notificar al service worker para limpiar caché
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_AUTH_CACHE'
        });
        console.log('[CacheManager] ✓ Service worker notificado');
        
        // Esperar confirmación del service worker
        await new Promise<void>((resolve) => {
          const messageHandler = (event: MessageEvent) => {
            if (event.data && event.data.type === 'AUTH_CACHE_CLEARED') {
              navigator.serviceWorker.removeEventListener('message', messageHandler);
              console.log('[CacheManager] ✓ Service worker confirmó limpieza');
              resolve();
            }
          };
          
          navigator.serviceWorker.addEventListener('message', messageHandler);
          
          // Timeout de seguridad
          setTimeout(() => {
            navigator.serviceWorker.removeEventListener('message', messageHandler);
            resolve();
          }, 2000);
        });
      }
      
      // 3. Limpiar localStorage y sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      console.log('[CacheManager] ✓ Local y session storage limpiados');
      
      // 4. Limpiar cookies relacionadas con autenticación
      this.clearAuthCookies();
      console.log('[CacheManager] ✓ Cookies de autenticación limpiadas');
      
      // 5. Limpiar caché del navegador específica de la aplicación
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const appCaches = cacheNames.filter(name => 
          name.includes('all-in-one-fitness') || 
          name.includes('auth') || 
          name.includes('user')
        );
        
        await Promise.all(
          appCaches.map(async (cacheName) => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            const userKeys = keys.filter(request => 
              request.url.includes('/api/profile') ||
              request.url.includes('/api/dashboard') ||
              request.url.includes('/api/foods/user') ||
              request.url.includes('/api/water/user') ||
              request.url.includes('/api/routines') ||
              request.url.includes('/api/1rm') ||
              request.url.includes('/api/get-calorie-goal') ||
              request.url.includes('dashboard') ||
              request.url.includes('profile') ||
              request.url.includes('settings')
            );
            
            await Promise.all(userKeys.map(key => cache.delete(key)));
          })
        );
        console.log('[CacheManager] ✓ Caché del navegador limpiada');
      }
      
      console.log('[CacheManager] ✅ Limpieza completa de caché finalizada');
    } catch (error) {
      console.error('[CacheManager] ❌ Error durante la limpieza de caché:', error);
      throw error;
    }
  }
  
  /**
   * Limpia las cookies relacionadas con autenticación
   */
  private static clearAuthCookies(): void {
    // Lista de cookies comunes de autenticación
    const authCookies = [
      'supabase-auth-token',
      'sb-access-token',
      'sb-refresh-token',
      'session',
      'auth',
      'user-session',
      'login'
    ];
    
    // Limpiar cookies específicas
    authCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
    
    // Limpiar todas las cookies del dominio actual como fallback
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }
  
  /**
   * Realiza una limpieza rápida solo de datos críticos
   */
  static async quickClearUserData(): Promise<void> {
    try {
      // Limpieza rápida para casos donde se necesita velocidad
      localStorage.clear();
      sessionStorage.clear();
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_AUTH_CACHE'
        });
      }
      
      console.log('[CacheManager] ✓ Limpieza rápida completada');
    } catch (error) {
      console.error('[CacheManager] ❌ Error en limpieza rápida:', error);
    }
  }
  
  /**
   * Verifica si hay datos de usuario en caché
   */
  static hasUserDataInCache(): boolean {
    try {
      // Verificar localStorage
      const hasLocalStorageData = Object.keys(localStorage).some(key => 
        key.includes('user') || 
        key.includes('auth') || 
        key.includes('session') ||
        key.includes('profile') ||
        key.includes('supabase')
      );
      
      // Verificar sessionStorage
      const hasSessionStorageData = Object.keys(sessionStorage).some(key => 
        key.includes('user') || 
        key.includes('auth') || 
        key.includes('session') ||
        key.includes('profile')
      );
      
      return hasLocalStorageData || hasSessionStorageData;
    } catch (error) {
      console.error('[CacheManager] Error verificando caché:', error);
      return false;
    }
  }
}

// Función de conveniencia para uso directo
export const clearUserCache = () => CacheManager.clearUserCache();
export const quickClearUserData = () => CacheManager.quickClearUserData();
export const hasUserDataInCache = () => CacheManager.hasUserDataInCache();
