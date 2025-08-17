<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">拓源公司毛利率分析</h1>
        <p class="mt-2 text-gray-600">拓源公司主营业务毛利率趋势分析与板块对比</p>
      </div>

      <!-- 年份选择 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">分析年份</h3>
          <select 
            v-model="selectedYear" 
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="2024">2024年</option>
            <option value="2025">2025年</option>
            <option value="2023">2023年</option>
          </select>
        </div>
      </div>

      <!-- 月度趋势图表 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年月度毛利率趋势</h3>
          <div class="text-sm text-gray-500">
            当前毛利率: {{ currentRate.toFixed(2) }}% | 目标: {{ targetRate }}%
          </div>
        </div>
        <div ref="chartContainer" class="w-full h-96"></div>
      </div>

      <!-- 板块分析 -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">各板块毛利率分析</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="segment in segmentData" 
            :key="segment.name"
            class="bg-gray-50 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-gray-900">{{ segment.name }}板块</h4>
              <span class="text-lg font-bold text-blue-600">{{ segment.rate }}%</span>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">计划值</span>
                <span class="font-medium">{{ segment.plan }}%</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">实际值</span>
                <span class="font-medium">{{ segment.actual }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  :style="`width: ${Math.min((segment.actual / Math.max(segment.plan, segment.actual)) * 100, 100)}%`"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const selectedYear = ref('2025')
const chartContainer = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 数据
const targetRate = ref(24.99) // 计划目标值
const currentRate = ref(0)
const months = ref<string[]>([])
const monthlyData = ref<number[]>([])

// 板块数据
const segmentData = ref([
  { name: '设备', plan: 8.25, actual: 0, rate: 0 },
  { name: '其他', plan: 50.0, actual: 0, rate: 0 }
])

// 格式化数字
const formatNumber = (num: number) => {
  return num.toFixed(2)
}

// 获取拓源毛利率数据
const fetchTuoyuanProfitMarginData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/analytics/tuoyuan-profit-margin/${selectedYear.value}`)

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        if (result.data.hasData === false) {
          // 没有数据的情况
          months.value = []
          monthlyData.value = []
          currentRate.value = 0
          segmentData.value = result.data.segmentData || [
            { name: '设备', plan: 8.25, actual: 0, rate: 0 },
            { name: '其他', plan: 50.0, actual: 0, rate: 0 }
          ]
        } else {
          // 有数据的情况
          months.value = result.data.months || []
          monthlyData.value = result.data.monthlyData || []
          currentRate.value = result.data.currentRate || 0

          if (result.data.segmentData) {
            segmentData.value = result.data.segmentData.map(segment => ({
              name: segment.name,
              plan: segment.plan,
              actual: segment.actual,
              rate: segment.rate
            }))
          }
        }
      } else {
        // API返回失败，显示无数据状态
        months.value = []
        monthlyData.value = []
        currentRate.value = 0
        segmentData.value = [
          { name: '设备', plan: 8.25, actual: 0, rate: 0 },
          { name: '其他', plan: 50.0, actual: 0, rate: 0 }
        ]
      }
    } else {
      // 请求失败，显示无数据状态
      months.value = []
      monthlyData.value = []
      currentRate.value = 0
      segmentData.value = [
        { name: '设备', plan: 8.25, actual: 0, rate: 0 },
        { name: '其他', plan: 50.0, actual: 0, rate: 0 }
      ]
    }
  } catch (error) {
    console.error('获取拓源毛利率数据失败:', error)
    // 发生错误，显示无数据状态
    months.value = []
    monthlyData.value = []
    currentRate.value = 0
    segmentData.value = [
      { name: '设备', plan: 8.25, actual: 0, rate: 0 },
      { name: '其他', plan: 50.0, actual: 0, rate: 0 }
    ]
  }
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartContainer.value)

  // 如果没有数据，显示暂无数据
  if (months.value.length === 0 || monthlyData.value.length === 0) {
    const option = {
      title: {
        text: `${selectedYear.value}年暂无拓源毛利率数据`,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#9CA3AF'
        },
        left: 'center',
        top: 'middle'
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: '60%',
        style: {
          text: '请选择其他年份查看数据',
          fontSize: 14,
          fill: '#9CA3AF'
        }
      }
    }
    chartInstance.setOption(option)
    return
  }

  const option = {
    title: {
      text: `${selectedYear.value}年拓源毛利率趋势`,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any[]) {
        let result = `${params[0].name}<br/>`
        params.forEach(param => {
          if (param.value !== null && param.value !== undefined) {
            result += `${param.seriesName}: ${formatNumber(param.value)}%<br/>`
          }
        })
        return result
      }
    },
    legend: {
      top: 40,
      type: 'scroll'
    },
    grid: {
      left: '8%',
      right: '5%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months.value,
      axisLabel: {
        rotate: 0,
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '毛利率 (%)',
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '实际毛利率',
        type: 'line',
        data: monthlyData.value,
        smooth: true,
        connectNulls: false,
        lineStyle: {
          width: 3,
          color: '#3B82F6'
        },
        itemStyle: {
          color: '#3B82F6',
          borderWidth: 2,
          borderColor: '#ffffff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        }
      },
      {
        name: '目标毛利率',
        type: 'line',
        data: new Array(months.value.length).fill(targetRate.value),
        lineStyle: {
          width: 2,
          color: '#EF4444',
          type: 'dashed'
        },
        itemStyle: {
          color: '#EF4444'
        },
        symbol: 'none'
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 监听年份变化
watch(selectedYear, () => {
  fetchTuoyuanProfitMarginData()
})

// 监听数据变化，更新图表
watch([months, monthlyData], () => {
  nextTick(() => {
    initChart()
  })
})

// 组件挂载
onMounted(async () => {
  await fetchTuoyuanProfitMarginData()
  await nextTick()
  initChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
})
</script>

<style scoped>
/* 图表容器样式 */
.chart-container {
  width: 100%;
  height: 400px;
}
</style> 