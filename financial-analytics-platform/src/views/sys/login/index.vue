<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
      <div>
        <div class="mt-6 text-center font-extrabold text-gray-900">
          <div class="text-3xl">大亚管理办公室</div>
          <div class="text-xl">经济运行统计分析管理系统</div>
        </div>
        <p class="mt-2 text-center text-sm text-gray-600">
          请登录您的账号
        </p>
        <p class="mt-2 text-center text-sm text-gray-600">
          还没有账号？
          <router-link to="/user/register" class="text-blue-600 hover:text-blue-500">
            立即注册
          </router-link>
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="company" class="sr-only">选择公司</label>
            <select
              id="company"
              v-model="loginForm.company"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            >
              <option value="">请选择公司</option>
              <option value="上海南华兰陵电气有限公司">上海南华兰陵电气有限公司</option>
              <option value="上海南华兰陵实业有限公司">上海南华兰陵实业有限公司</option>
              <option value="常州拓源电气集团有限公司">常州拓源电气集团有限公司</option>
            </select>
          </div>
          <div>
            <label for="username" class="sr-only">用户名</label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="用户名"
            />
          </div>
          <div>
            <label for="password" class="sr-only">密码</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="密码"
            />
          </div>
        </div>

        <!-- 错误消息 -->
        <div v-if="errorMessage" class="text-red-500 text-sm text-center">
          {{ errorMessage }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                v-if="!loading"
                class="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/libs/request'
import storage from 'store'

// import { AuthAPI } from '@/utils/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const errorMessage = ref('')

const loginForm = reactive({
  company: '',
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    // 清除错误信息
    errorMessage.value = ''
    loading.value = true
    
    // 使用后端API进行登录
    const response = await fetch('http://47.111.95.19:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginForm)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '登录失败')
    }
    
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || '登录失败')
    }
    
    // 存储token和用户信息
    localStorage.setItem('token', data.data.token)
    storage.set('ACCESS_TOKEN', data.data.token)
    
    // 存储选择的公司信息
    localStorage.setItem('selectedCompany', loginForm.company)
    storage.set('SELECTED_COMPANY', loginForm.company)

    storage.set('USER_INFO', data.data.user)
    userStore.setUserInfo(data.data.user)
    
    // 公司名称到路由的映射
    const companyRouteMapping = {
      '上海南华兰陵电气有限公司': '/shanghai-nanhua-lanling-electric',
      '上海南华兰陵实业有限公司': '/shanghai-nanhua-lanling-industry', 
      '常州拓源电气集团有限公司': '/changzhou-tuoyuan-electric'
    }
    
    // 如果有重定向参数，优先跳转到重定向页面
    if (route.query.redirect) {
      router.push(route.query.redirect as string)
    } else if (loginForm.company && companyRouteMapping[loginForm.company as keyof typeof companyRouteMapping]) {
      // 否则直接跳转到用户选择的公司页面
      router.push(companyRouteMapping[loginForm.company as keyof typeof companyRouteMapping])
    } else {
      // 如果没有选择公司或公司映射不存在，跳转到首页
      router.push('/')
    }
  } catch (error) {
    console.error('登录失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>
