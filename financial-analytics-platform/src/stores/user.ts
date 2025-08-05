import { defineStore } from 'pinia';

// 用户信息类型
interface UserInfo {
  id: number;
  username: string;
  role: string;
}

// 用户状态类型
interface UserState {
  userInfo: UserInfo | null;
}

// 定义用户store
export const useUserStore = defineStore('user', {
  // 状态
  state: (): UserState => ({
    userInfo: null
  }),
  
  // getters
  getters: {
    // 用户是否已登录
    isLoggedIn: (state) => !!state.userInfo,
    
    // 用户是否是管理员
    isAdmin: (state) => state.userInfo?.role === 'admin',
    
    // 获取用户角色
    userRole: (state) => state.userInfo?.role
  },
  
  // actions
  actions: {
    // 设置用户信息
    setUserInfo(userInfo: UserInfo | null) {
      this.userInfo = userInfo;
    },
    
    // 清除用户信息
    clearUserInfo() {
      this.userInfo = null;
      localStorage.removeItem('token');
    }
  }
  
  // 注意：如果需要持久化存储，需要安装pinia-plugin-persist插件
  // persist: {
  //   enabled: true,
  //   strategies: [
  //     {
  //       key: 'user',
  //       storage: localStorage
  //     }
  //   ]
  // }
});
