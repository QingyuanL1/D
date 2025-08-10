<template>
    <aside class="w-64 bg-white h-full shadow-lg flex flex-col">
        <div class="p-6 border-b border-gray-200">
            <div class="font-bold text-gray-800">
                <div class="text-xl">大亚管理办公室</div>
                <div class="text-m">经济运行统计分析管理系统</div>
            </div>
        </div>
        <div class="flex-1 overflow-y-auto">
            <div class="py-4">
                <div class="px-6 py-3">
                    <ul class="mt-3 space-y-2">
                        <li>
                            <router-link to="/home"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute === '/home' }">
                                <span class="ml-2">首页</span>
                            </router-link>
                        </li>
                        <li v-if="shouldShowCompanyMenu('上海南华兰陵电气有限公司')">
                            <router-link to="/shanghai-nanhua-lanling-electric"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute.startsWith('/shanghai-nanhua-lanling-electric') }">
                                <span class="ml-2">上海南华兰陵电气有限公司</span>
                            </router-link>
                        </li>
                        <li v-if="shouldShowCompanyMenu('上海南华兰陵实业有限公司')">
                            <router-link to="/shanghai-nanhua-lanling-industry"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute.startsWith('/shanghai-nanhua-lanling-industry') }">
                                <span class="ml-2">上海南华兰陵实业有限公司</span>
                            </router-link>
                        </li>
                        <li v-if="shouldShowCompanyMenu('常州拓源电气集团有限公司')">
                            <router-link to="/changzhou-tuoyuan-electric"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute.startsWith('/changzhou-tuoyuan-electric') }">
                                <span class="ml-2">常州拓源电气有限公司</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/view"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute === '/view' }">
                                <span class="ml-2">审阅</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/submit"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute === '/submit' }">
                                <span class="ml-2">管理分析</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/key-tasks"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute === '/key-tasks' }">
                                <span class="ml-2">重点工作布置</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/budget-planning"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute === '/budget-planning' }">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span class="ml-2">年度预算计划</span>
                            </router-link>
                        </li>
                        <li v-if="canAccessAnalytics">
                            <router-link to="/analytics"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute === '/analytics' || currentRoute.startsWith('/analytics/') }">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span class="ml-2">数据分析中心</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/reports/monthly"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute === '/reports/monthly' }">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span class="ml-2">月度报表查看</span>
                            </router-link>
                        </li>
                        <li v-if="isAdmin">
                            <router-link to="/admin/users"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute.startsWith('/admin/users') }">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span class="ml-2">用户管理</span>
                            </router-link>
                        </li>
                        <li v-if="isAdmin">
                            <router-link to="/admin/permissions"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute.startsWith('/admin/permissions') }">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span class="ml-2">权限管理</span>
                            </router-link>
                        </li>
                        <li v-if="isAdmin">
                            <router-link to="/admin/notifications"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                :class="{ 'bg-blue-50 text-blue-600': currentRoute.startsWith('/admin/notifications') }">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                                </svg>
                                <span class="ml-2">通知管理</span>
                            </router-link>
                        </li>
                    </ul>
                </div>

                <div class="px-6 py-3 mt-4 hidden" >
                    <h2 class="text-xs font-semibold text-gray-600 uppercase tracking-wide">财务</h2>
                    <ul class="mt-3 space-y-2">
                        <li>
                            <router-link to="/example"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                                <span class="ml-2">资产负债表</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/cashflow"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                                <span class="ml-2">现金流量表</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/incomestatement"
                                class="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                                <span class="ml-2">利润表</span>
                            </router-link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="border-t border-gray-200 bg-white">
            <div class="p-4">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-700">{{ userStore.userInfo?.username || '管理员' }}</p>
                        <button @click="handleLogout"
                            class="text-xs text-gray-500 hover:text-red-500 transition-colors">退出登录</button>
                    </div>
                </div>
            </div>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import storage from 'store'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const currentRoute = computed(() => route.path)

// 公司名称到路由的映射
const companyRouteMapping = {
    '上海南华兰陵电气有限公司': '/shanghai-nanhua-lanling-electric',
    '上海南华兰陵实业有限公司': '/shanghai-nanhua-lanling-industry', 
    '常州拓源电气集团有限公司': '/changzhou-tuoyuan-electric'
}

// 获取当前用户选择的公司
const selectedCompany = ref('')

// 自动跳转到用户选择的公司页面
const navigateToSelectedCompany = () => {
    const company = localStorage.getItem('selectedCompany') || storage.get('SELECTED_COMPANY')
    if (company && companyRouteMapping[company as keyof typeof companyRouteMapping]) {
        selectedCompany.value = company
        const targetRoute = companyRouteMapping[company as keyof typeof companyRouteMapping]
        // 只在当前不在公司页面时才跳转
        if (route.path === '/' || route.path === '/home') {
            router.push(targetRoute)
        }
    }
}

// 检查是否显示某个公司菜单
const shouldShowCompanyMenu = (companyName: string) => {
    return selectedCompany.value === companyName
}

// 用户权限信息
const userPermissions = ref<any>(null)

// Check if current user has admin privileges
const isAdmin = computed(() => {
    const userInfo = userStore.userInfo
    if (!userInfo) return false
    return userInfo.role_name === 'super_admin' || userInfo.role_name === 'admin'
})

// Check if current user can access analytics center
const canAccessAnalytics = computed(() => {
    const userInfo = userStore.userInfo
    if (!userInfo) return false

    // 管理员可以访问所有功能
    if (userInfo.role_name === 'super_admin' || userInfo.role_name === 'admin') {
        return true
    }

    // 检查用户是否有数据分析中心的权限
    if (userPermissions.value && userPermissions.value.accessible_modules) {
        return userPermissions.value.accessible_modules.some((module: any) =>
            module.module_key === 'analytics_center'
        )
    }

    return false
})

// 获取用户权限信息
const fetchUserPermissions = async () => {
    const userInfo = userStore.userInfo
    if (!userInfo) return

    try {
        const response = await fetch(`http://47.111.95.19:3000/permissions/user/${userInfo.id}`)
        if (response.ok) {
            const result = await response.json()
            if (result.success) {
                userPermissions.value = result.data
                console.log('用户权限信息:', result.data)
            }
        }
    } catch (error) {
        console.error('获取用户权限失败:', error)
    }
}

// Initialize user info from localStorage if store is empty
onMounted(async () => {
    if (!userStore.userInfo) {
        const storedUserInfo = storage.get('USER_INFO')
        console.log(storedUserInfo)
        if (storedUserInfo) {
            console.log(storedUserInfo)
            userStore.setUserInfo(storedUserInfo)
        }
    }

    // 设置选中的公司
    const company = localStorage.getItem('selectedCompany') || storage.get('SELECTED_COMPANY')
    if (company) {
        selectedCompany.value = company
    }

    // 获取用户权限信息
    await fetchUserPermissions()
    
    // 自动跳转到用户选择的公司页面
    navigateToSelectedCompany()
})

const handleLogout = () => {
    try {
        userStore.clearUserInfo()
        storage.remove('USER_INFO')
        storage.remove('ACCESS_TOKEN')
        localStorage.removeItem('token') // Clear token from localStorage that router.beforeEach checks
        
        // Force page reload and navigation to login
        window.location.href = '/#/user/login'
        alert('已成功退出登录')
    } catch (error) {
        console.error('退出登录失败:', error)
    }
}
</script>

<style scoped>
aside {
    min-height: 100vh;
    border-right: 1px solid #e5e7eb;
}

.router-link-active {
    @apply bg-blue-50 text-blue-600;
}

.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>