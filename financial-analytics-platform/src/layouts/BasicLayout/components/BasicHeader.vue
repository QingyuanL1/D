<template>
  <header class="h-16 px-6 bg-white border-b border-gray-200 flex justify-between items-center">
    <div class="flex items-center">
      <h1 class="text-xl font-medium text-gray-800">财务管理系统</h1>

      <!-- 更新导航菜单 -->
      <nav class="ml-8">
        <ul class="flex space-x-6">
          <li>
            <router-link to="/example" class="text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition-colors"
              :class="{ 'text-blue-600': currentRoute === '/example' }">
              资产负债表
            </router-link>
          </li>
          <li>
            <router-link to="/cashflow" class="text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition-colors"
              :class="{ 'text-blue-600': currentRoute === '/cashflow' }">
              现金流量表
            </router-link>
          </li>
          <li>
            <router-link to="/incomestatement"
              class="text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition-colors"
              :class="{ 'text-blue-600': currentRoute === '/incomestatement' }">
              利润表
            </router-link>
          </li>
          <li>
            <router-link to="/salesanalysis"
              class="text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition-colors"
              :class="{ 'text-blue-600': currentRoute === '/salesanalysis' }">
              销售分析表
            </router-link>
          </li>
          <li>
            <router-link to="/reports" class="text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition-colors"
              :class="{ 'text-blue-600': currentRoute === '/reports' }">
              报表管理
            </router-link>
          </li>
          <li>
            <router-link to="/costcenter" class="text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition-colors"
              :class="{ 'text-blue-600': currentRoute === '/costcenter' }">
              成本中心结构
            </router-link>
          </li>
          <li>
            <router-link to="/inventory" class="text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition-colors"
              :class="{ 'text-blue-600': currentRoute === '/inventory' }">
              存货明细
            </router-link>
          </li>
          <li>
            <router-link to="/orderinventory"
              class="text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition-colors"
              :class="{ 'text-blue-600': currentRoute === '/orderinventory' }">
              订单存量情况
            </router-link>
          </li>
          <li>
            <router-link to="/export-report"
              class="text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition-colors"
              :class="{ 'text-blue-600': currentRoute === '/export-report' }">
              导出报表
            </router-link>
          </li>
        </ul>
      </nav>
    </div>

    <div class="relative">
      <div @click="toggleDropdown"
        class="dropdown-trigger flex items-center cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2">
        <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </div>
        <span class="mx-3 text-gray-700">{{ userStore.userInfo?.username || '管理员' }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd" />
        </svg>
      </div>

      <!-- 下拉菜单 -->
      <div v-if="isDropdownOpen" class="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
        <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-100" @click.prevent="handleCommand('profile')">
          个人信息
        </a>
        <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-100" @click.prevent="handleCommand('logout')">
          退出登录
        </a>
      </div>
    </div>

    <!-- 在适当的位置添加导出按钮 -->
    <button @click="handleExport"
      class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
      导出月度对比报表
    </button>
  </header>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const currentRoute = computed(() => route.path)
const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      // 清除用户信息和token
      userStore.clearUserInfo()
      // 关闭下拉菜单
      isDropdownOpen.value = false
      // 跳转到登录页
      await router.push('/user/login')
      // 可以添加提示
      alert('已成功退出登录')
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }
  isDropdownOpen.value = false
}

// 点击其他地方关闭下拉菜单
const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  // 如果点击的不是下拉菜单内的元素，则关闭下拉菜单
  if (!target.closest('.dropdown-menu') && !target.closest('.dropdown-trigger')) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

const handleExport = () => {
  const period = '2024-12'; // 可以从状态管理或路由参数获取
  const company = '南华';    // 可以从状态管理获取

  // 使用原生方式下载 PDF
  window.open(`http://47.111.95.19:3000/export-monthly-report/${period}?company=${company}`, '_blank');
};
</script>
