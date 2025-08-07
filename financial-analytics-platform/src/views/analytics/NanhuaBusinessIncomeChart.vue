<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">南华营业收入结构分析</h1>
        <p class="text-gray-600 mt-2">主营业务与非主营业务当期收入趋势对比</p>
      </div>

      <!-- 年份选择器 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">数据年份选择</h3>
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-600">选择年份:</span>
            <select v-model="selectedYear" @change="fetchData"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}年</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 汇总数据卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">主营业务收入</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">当期累计:</span>
              <span class="font-medium text-blue-600">{{ formatNumber(mainBusinessTotal) }} 万元</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">数据来源:</span>
              <span class="font-medium text-gray-600 text-sm">订单转收入</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">非主营业务收入</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">当期累计:</span>
              <span class="font-medium text-green-600">{{ formatNumber(nonMainBusinessTotal) }} 万元</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">最后更新:</span>
              <span class="font-medium text-gray-600 text-sm">{{ lastUpdated }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 当期收入趋势图表 -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年主营/非主营业务当期收入趋势</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">主营业务</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">非主营业务</span>
            </div>
            <div class="text-xs text-gray-500">
              当期收入 = 当月订单转收入 + 存量订单转收入
            </div>
          </div>
        </div>
        <div class="h-[500px]" ref="chartRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const selectedYear = ref(new Date().getFullYear().toString())
const availableYears = ref<string[]>([])
const loading = ref(true)

// 图表引用
const chartRef = ref<HTMLElement | null>(null)

// 图表实例
const chartInstance = ref<echarts.ECharts | null>(null)

// 数据
const months = ref<string[]>([])
const mainBusinessData = ref<number[]>([])
const nonMainBusinessData = ref<number[]>([])

// 工具函数
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

// 计算汇总数据
const mainBusinessTotal = computed(() => {
  return mainBusinessData.value.reduce((sum, val) => sum + val, 0)
})

const nonMainBusinessTotal = computed(() => {
  return nonMainBusinessData.value.reduce((sum, val) => sum + val, 0)
})

// 最后更新时间
const lastUpdated = computed(() => {
  return new Date().toLocaleString('zh-CN')
})

// 初始化年份选项
const initAvailableYears = () => {
  const currentYear = new Date().getFullYear()
  const years: string[] = []
  for (let i = 0; i < 5; i++) {
    years.push((currentYear - i).toString())
  }
  availableYears.value = years
}

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    await fetchBusinessIncomeData()
    await fetchNonMainBusinessData()
    updateChart()
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 重置数据为默认值
const resetDataToDefault = () => {
  months.value = []
  mainBusinessData.value = []
  nonMainBusinessData.value = []
}

// 获取主营业务收入数据
const fetchBusinessIncomeData = async () => {
  try {
    months.value = []
    mainBusinessData.value = []
    
    for (let month = 1; month <= 12; month++) {
      const period = `${selectedYear.value}-${month.toString().padStart(2, '0')}`
      const response = await fetch(`http://127.0.0.1:3000/nanhua-business-income/${period}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data && result.data.customers) {
          if (months.value.length < 12) {
            months.value.push(`${month}月`)
          }
          
          // 计算主营业务当期收入总和
          const totalCurrent = result.data.customers.reduce((sum: number, customer: any) => {
            return sum + (customer.current || 0)
          }, 0)
          
          mainBusinessData.value.push(totalCurrent)
        } else {
          if (months.value.length < 12) {
            months.value.push(`${month}月`)
          }
          mainBusinessData.value.push(0)
        }
      } else {
        if (months.value.length < 12) {
          months.value.push(`${month}月`)
        }
        mainBusinessData.value.push(0)
      }
    }
    
    // 如果没有数据，填充默认月份
    if (months.value.length === 0) {
      for (let month = 1; month <= 12; month++) {
        months.value.push(`${month}月`)
        mainBusinessData.value.push(0)
      }
    }
  } catch (error) {
    console.error('获取主营业务收入数据失败:', error)
    resetDataToDefault()
  }
}

// 获取非主营业务收入数据
const fetchNonMainBusinessData = async () => {
  try {
    nonMainBusinessData.value = []
    
    for (let month = 1; month <= 12; month++) {
      const period = `${selectedYear.value}-${month.toString().padStart(2, '0')}`
      const response = await fetch(`http://127.0.0.1:3000/nanhua-non-main-business/${period}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data && result.data.items) {
          // 计算非主营业务当期收入总和
          const totalCurrent = result.data.items.reduce((sum: number, item: any) => {
            return sum + (item.current || 0)
          }, 0)
          
          nonMainBusinessData.value.push(totalCurrent)
        } else {
          nonMainBusinessData.value.push(0)
        }
      } else {
        nonMainBusinessData.value.push(0)
      }
    }
    
    // 如果没有数据，填充0
    if (nonMainBusinessData.value.length === 0) {
      for (let month = 1; month <= 12; month++) {
        nonMainBusinessData.value.push(0)
      }
    }
  } catch (error) {
    console.error('获取非主营业务收入数据失败:', error)
    for (let month = 1; month <= 12; month++) {
      nonMainBusinessData.value.push(0)
    }
  }
}

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }
}

// 更新图表
const updateChart = () => {
  if (!chartInstance.value) return

  const hasData = months.value.length > 0

  const option = {
    title: {
      text: `${selectedYear.value}年南华营业收入结构趋势分析`,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any[]) {
        if (!hasData) return '暂无数据'
        let result = `${params[0].name}<br/>`
        let total = 0
        
        params.forEach(param => {
          const value = param.value || 0
          total += value
          result += `${param.seriesName}: ${formatNumber(value)} 万元<br/>`
        })
        
        result += `<br/>总计: ${formatNumber(total)} 万元`
        return result
      }
    },
    legend: {
      top: 50,
      data: ['主营业务', '非主营业务']
    },
    grid: {
      left: '8%',
      right: '5%',
      bottom: '15%',
      top: '25%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hasData ? months.value : [],
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '万元',
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
        formatter: function(value: number) {
          return formatNumber(value)
        },
        fontSize: 12
      }
    },
    series: hasData ? [
      {
        name: '主营业务',
        type: 'line',
        data: mainBusinessData.value,
        smooth: true,
        lineStyle: {
          color: '#3B82F6',
          width: 3
        },
        itemStyle: {
          color: '#3B82F6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3B82F6' + '40' },
            { offset: 1, color: '#3B82F6' + '10' }
          ])
        }
      },
      {
        name: '非主营业务',
        type: 'line',
        data: nonMainBusinessData.value,
        smooth: true,
        lineStyle: {
          color: '#10B981',
          width: 3
        },
        itemStyle: {
          color: '#10B981'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#10B981' + '40' },
            { offset: 1, color: '#10B981' + '10' }
          ])
        }
      }
    ] : [],
    graphic: hasData ? [] : [{
      type: 'text',
      left: 'center',
      top: 'middle',
      style: {
        text: '暂无数据',
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#999'
      }
    }]
  }

  chartInstance.value.setOption(option, true)
}

// 处理窗口大小变化
const handleResize = () => {
  chartInstance.value?.resize()
}

onMounted(async () => {
  initAvailableYears()
  initChart()
  await fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance.value?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 组件样式 */
</style> 