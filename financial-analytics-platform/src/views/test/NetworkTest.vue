<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">网络连接测试</h1>
      
      <!-- 测试结果显示 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">测试结果</h2>
        <div class="space-y-4">
          <div v-for="test in testResults" :key="test.name" 
               class="flex items-center justify-between p-4 border rounded-lg"
               :class="getTestStatusClass(test.status)">
            <div>
              <h3 class="font-medium">{{ test.name }}</h3>
              <p class="text-sm text-gray-600">{{ test.url }}</p>
              <p v-if="test.error" class="text-sm text-red-600 mt-1">{{ test.error }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-1 text-xs rounded-full"
                    :class="getStatusBadgeClass(test.status)">
                {{ getStatusText(test.status) }}
              </span>
              <span v-if="test.duration" class="text-sm text-gray-500">
                {{ test.duration }}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试控制 -->
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">测试控制</h2>
        <div class="flex space-x-4">
          <button 
            @click="runAllTests"
            :disabled="testing"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ testing ? '测试中...' : '运行所有测试' }}
          </button>
          <button 
            @click="clearResults"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            清除结果
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { safeFetch, handleApiError } from '@/utils/errorHandler'
import { useUserStore } from '@/stores/user'

interface TestResult {
  name: string
  url: string
  status: 'pending' | 'success' | 'error' | 'timeout'
  error?: string
  duration?: number
}

const userStore = useUserStore()
const testing = ref(false)
const testResults = ref<TestResult[]>([])

// 测试配置
const testConfigs = [
  {
    name: '仪表板数据',
    url: 'http://127.0.0.1:3000/dashboard/company/1/南华公司'
  },
  {
    name: '系统公告',
    url: 'http://127.0.0.1:3000/notifications/unread/1?limit=5'
  },
  {
    name: 'ROE数据',
    url: 'http://127.0.0.1:3000/analytics/roe/2025'
  },
  {
    name: '资产负债表数据',
    url: 'http://127.0.0.1:3000/financial-reports/nanhua/balance-sheet/2025-08'
  },
  {
    name: '表单提交记录',
    url: 'http://127.0.0.1:3000/forms/submission/1/2025-08'
  }
]

const runAllTests = async () => {
  testing.value = true
  testResults.value = testConfigs.map(config => ({
    ...config,
    status: 'pending' as const
  }))

  for (let i = 0; i < testConfigs.length; i++) {
    const config = testConfigs[i]
    const startTime = Date.now()
    
    try {
      const response = await safeFetch(config.url, {
        method: 'GET'
      }, config.name)
      
      const duration = Date.now() - startTime
      testResults.value[i] = {
        ...config,
        status: 'success',
        duration
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const apiError = handleApiError(error, config.name)
      
      testResults.value[i] = {
        ...config,
        status: error.name === 'AbortError' ? 'timeout' : 'error',
        error: apiError.message,
        duration
      }
    }
  }

  testing.value = false
}

const clearResults = () => {
  testResults.value = []
}

const getTestStatusClass = (status: string) => {
  switch (status) {
    case 'success':
      return 'border-green-200 bg-green-50'
    case 'error':
      return 'border-red-200 bg-red-50'
    case 'timeout':
      return 'border-yellow-200 bg-yellow-50'
    case 'pending':
      return 'border-blue-200 bg-blue-50'
    default:
      return 'border-gray-200 bg-gray-50'
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    case 'timeout':
      return 'bg-yellow-100 text-yellow-800'
    case 'pending':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'success':
      return '成功'
    case 'error':
      return '失败'
    case 'timeout':
      return '超时'
    case 'pending':
      return '测试中'
    default:
      return '未知'
  }
}
</script>
</template>
