// 权限验证工具
import { apiRequest } from './api';
import { useUserStore } from '@/stores/user';
import { ref } from 'vue';

// 权限缓存，避免频繁请求
const permissionCache = new Map<string, { can_view: boolean, can_edit: boolean, timestamp: number }>();
// 缓存有效期（毫秒）
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

/**
 * 检查用户是否有权限访问特定报表
 * @param reportCode 报表代码
 * @returns 包含查看和编辑权限的对象
 */
export async function checkPermission(reportCode: string) {
  const userStore = useUserStore();
  
  // 如果用户未登录，则没有任何权限
  if (!userStore.isLoggedIn) {
    return { can_view: false, can_edit: false };
  }
  
  // 如果用户是管理员，则有所有权限
  if (userStore.userInfo?.role === 'admin') {
    return { can_view: true, can_edit: true };
  }
  
  // 检查缓存
  const cacheKey = `${userStore.userInfo?.id}-${reportCode}`;
  const cachedPermission = permissionCache.get(cacheKey);
  const now = Date.now();
  
  if (cachedPermission && (now - cachedPermission.timestamp) < CACHE_TTL) {
    return { 
      can_view: cachedPermission.can_view, 
      can_edit: cachedPermission.can_edit 
    };
  }
  
  try {
    // 请求权限
    const result = await apiRequest<{ can_view: boolean, can_edit: boolean }>(
      `/v1/permissions/check-permission?report_code=${encodeURIComponent(reportCode)}`,
      'GET'
    );
    
    // 更新缓存
    permissionCache.set(cacheKey, { 
      ...result, 
      timestamp: now 
    });
    
    return result;
  } catch (error) {
    console.error('检查权限失败:', error);
    // 出错时默认没有权限
    return { can_view: false, can_edit: false };
  }
}

/**
 * Vue组合式API，用于在组件中检查权限
 * @param reportCode 报表代码
 */
export function usePermission(reportCode: string) {
  const canView = ref(false);
  const canEdit = ref(false);
  const loading = ref(true);
  const error = ref<Error | null>(null);
  
  // 立即检查权限
  checkPermission(reportCode)
    .then(result => {
      canView.value = result.can_view;
      canEdit.value = result.can_edit;
    })
    .catch(err => {
      error.value = err;
    })
    .finally(() => {
      loading.value = false;
    });
  
  return {
    canView,
    canEdit,
    loading,
    error,
    // 提供刷新方法
    refresh: async () => {
      loading.value = true;
      error.value = null;
      try {
        const result = await checkPermission(reportCode);
        canView.value = result.can_view;
        canEdit.value = result.can_edit;
      } catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err));
      } finally {
        loading.value = false;
      }
    }
  };
}

/**
 * 清除权限缓存
 */
export function clearPermissionCache() {
  permissionCache.clear();
}

/**
 * 创建路由守卫，用于保护需要特定权限的路由
 * @param router Vue Router实例
 */
export function setupPermissionGuard(router: any) {
  router.beforeEach(async (to: any, from: any, next: any) => {
    const userStore = useUserStore();
    
    // 如果路由不需要权限检查，直接通过
    if (!to.meta.requiresAuth) {
      return next();
    }
    
    // 如果用户未登录，重定向到登录页
    if (!userStore.isLoggedIn) {
      return next({ 
        path: '/user/login', 
        query: { redirect: to.fullPath } 
      });
    }
    
    // 如果是管理员，直接通过
    if (userStore.userInfo?.role === 'admin') {
      return next();
    }
    
    // 如果路由指定了报表代码，检查权限
    if (to.meta.reportCode) {
      const { can_view } = await checkPermission(to.meta.reportCode);
      
      if (can_view) {
        return next();
      } else {
        // 没有权限，显示403页面
        return next({ path: '/403' });
      }
    }
    
    // 默认通过
    next();
  });
} 