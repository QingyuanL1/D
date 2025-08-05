<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">边际贡献率分析</h1>
        <p class="text-gray-600 mt-2">主营业务边际贡献率结构与质量分析</p>
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



      <!-- 月度趋势图表 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年边际贡献率月度趋势</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">实际贡献率</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">计划目标线</span>
            </div>
          </div>
        </div>
        <div class="h-[400px]" ref="chartRef"></div>
      </div>

      <!-- 板块分析 -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">各板块贡献率分析</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="segment in segmentData" :key="segment.name" 
               class="p-4 border border-gray-200 rounded-lg">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium text-gray-900">{{ segment.name }}</h4>
              <span class="text-sm font-semibold" :class="getSegmentColor(segment.rate)">
                {{ segment.rate }}%
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                class="h-2 rounded-full transition-all duration-300" 
                :class="getSegmentBarColor(segment.rate)"
                :style="`width: ${Math.min(Math.abs(segment.rate), 100)}%`"
              ></div>
            </div>
            <p class="text-xs text-gray-600">
              计划: {{ segment.plan }}% | 实际: {{ segment.actual }}%
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const selectedYear = ref(new Date().getFullYear().toString())
const availableYears = ref<string[]>([])
const loading = ref(true)

// 图表引用
const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)

// 数据
const targetRate = ref(21.98) // 计划目标值
const currentRate = ref(0)
const months = ref<string[]>([])
const monthlyData = ref<number[]>([])

// 板块数据
const segmentData = ref([
  { name: '设备', plan: 25.5, actual: 0, rate: 0 },
  { name: '元件', plan: 15.0, actual: 0, rate: 0 },
  { name: '工程', plan: 22.8, actual: 0, rate: 0 }
])

// 工具函数
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}



const getSegmentColor = (rate: number) => {
  if (rate >= 20) return 'text-green-600'
  if (rate >= 15) return 'text-blue-600'
  if (rate >= 10) return 'text-yellow-600'
  return 'text-red-600'
}

const getSegmentBarColor = (rate: number) => {
  if (rate >= 20) return 'bg-green-500'
  if (rate >= 15) return 'bg-blue-500'
  if (rate >= 10) return 'bg-yellow-500'
  return 'bg-red-500'
}

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
    await fetchContributionRateData()
    updateChart()
  } catch (error) {
    console.error('获取数据失败:', error)
    setDefaultData()
  } finally {
    loading.value = false
  }
}



// 获取边际贡献率数据
const fetchContributionRateData = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/analytics/contribution-rate/${selectedYear.value}`)

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        if (result.data.hasData === false) {
          // 没有数据的情况
          months.value = []
          monthlyData.value = []
          currentRate.value = 0
          segmentData.value = result.data.segmentData || [
            { name: '设备', plan: 25.5, actual: 0, rate: 0 },
            { name: '元件', plan: 15.0, actual: 0, rate: 0 },
            { name: '工程', plan: 22.8, actual: 0, rate: 0 }
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
          { name: '设备', plan: 25.5, actual: 0, rate: 0 },
          { name: '元件', plan: 15.0, actual: 0, rate: 0 },
          { name: '工程', plan: 22.8, actual: 0, rate: 0 }
        ]
      }
    } else {
      // 请求失败，显示无数据状态
      months.value = []
      monthlyData.value = []
      currentRate.value = 0
      segmentData.value = [
        { name: '设备', plan: 25.5, actual: 0, rate: 0 },
        { name: '元件', plan: 15.0, actual: 0, rate: 0 },
        { name: '工程', plan: 22.8, actual: 0, rate: 0 }
      ]
    }
  } catch (error) {
    console.error('获取边际贡献率数据失败:', error)
    // 发生错误，显示无数据状态
    months.value = []
    monthlyData.value = []
    currentRate.value = 0
    segmentData.value = [
      { name: '设备', plan: 25.5, actual: 0, rate: 0 },
      { name: '元件', plan: 15.0, actual: 0, rate: 0 },
      { name: '工程', plan: 22.8, actual: 0, rate: 0 }
    ]
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

  // 如果没有数据，显示暂无数据
  if (months.value.length === 0 || monthlyData.value.length === 0) {
    const option = {
      title: {
        text: `${selectedYear.value}年暂无边际贡献率数据`,
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
    chartInstance.value.setOption(option, true)
    return
  }

  const targetData = months.value.map(() => targetRate.value)

  const option = {
    title: {
      text: `${selectedYear.value}年边际贡献率趋势分析`,
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
          result += `${param.seriesName}: ${formatNumber(param.value)}%<br/>`
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
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '百分比(%)',
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
        formatter: function(value: number) {
          return formatNumber(value) + '%'
        },
        fontSize: 12
      }
    },
    series: [
      {
        name: '实际贡献率',
        type: 'line',
        data: monthlyData.value,
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
            { offset: 0, color: '#3B82F640' },
            { offset: 1, color: '#3B82F610' }
          ])
        }
      },
      {
        name: '计划目标线',
        type: 'line',
        data: targetData,
        lineStyle: {
          color: '#EF4444',
          width: 2,
          type: 'dashed'
        },
        itemStyle: {
          color: '#EF4444'
        },
        symbol: 'none'
      }
    ]
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
