<template>
  <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
    <div class="flex items-center justify-between mb-4">
      <div class="p-2 bg-blue-100 rounded-md">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      </div>
      <div class="text-right">
        <div class="text-sm font-semibold text-blue-600">
          {{ currentRate > 0 ? currentRate.toFixed(2) + '%' : '暂无' }}
        </div>
        <div class="text-xs text-gray-500">毛利率</div>
      </div>
    </div>
    <h4 class="text-lg font-medium text-gray-900 mb-2">毛利率分析</h4>
    <p class="text-sm text-gray-600 mb-3 h-12">分析主营业务毛利率结构与趋势</p>
    <div class="mb-4">
      <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
        <div
          style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
          :style="`width: ${currentRate > 0 ? Math.min(currentRate, 100) : 0}%;`"
        ></div>
      </div>
    </div>
    <router-link
      to="/analytics/profit-margin-chart"
      class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      质量情况
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const currentRate = ref(0)

// 获取毛利率数据
const fetchProfitMarginData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`http://47.111.95.19:3000/analytics/profit-margin/${currentYear}`)

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        // 使用API数据，如果没有数据则显示0
        currentRate.value = result.data.currentRate || 0
      } else {
        // 如果API返回失败，显示0
        currentRate.value = 0
      }
    } else {
      // 如果API请求失败，显示0
      currentRate.value = 0
    }
  } catch (error) {
    console.error('获取毛利率数据失败:', error)
    // 如果发生错误，显示0
    currentRate.value = 0
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchProfitMarginData()
})
</script>


