<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">南华边际贡献率分析</h1>
        <p class="text-gray-600 mt-2">南华公司边际贡献率月度趋势分析</p>
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
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年南华边际贡献率月度趋势</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const selectedYear = ref(new Date().getFullYear().toString())
const availableYears = ref<string[]>([])
const loading = ref(true)

// 图表引用
const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)

// 数据
const targetRate = ref(25.0) // 计划目标值
const currentRate = ref(0)
const months = ref<string[]>([])
const monthlyData = ref<number[]>([])

// 工具函数
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
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

// 获取南华边际贡献率数据
const fetchContributionRateData = async () => {
  try {
    const monthsArray: string[] = []
    const monthlyDataArray: number[] = []

    // 获取一整年的数据
    for (let month = 1; month <= 12; month++) {
      const period = `${selectedYear.value}-${month.toString().padStart(2, '0')}`

      try {
        const response = await fetch(`http://47.111.95.19:3000/nanhua-business-contribution-with-self-built/${period}`)

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data && result.data.customers) {
            // 计算当月加权平均边际贡献率
            const validCustomers = result.data.customers.filter((customer: any) => {
              const rate = customer.current
              // 允许负值（成本超过收入的情况），只过滤掉明显异常的数据
              // 边际贡献率可以是负值，这是正常的业务情况
              return typeof rate === 'number' && rate >= -1000 && rate <= 1000
            })

            if (validCustomers.length > 0) {
              // 计算加权平均（如果有年度计划数据作为权重）
              let totalWeightedRate = 0
              let totalWeight = 0

              validCustomers.forEach((customer: any) => {
                const rate = customer.current || 0
                const weight = customer.yearlyPlan || 1 // 使用年度计划作为权重，默认权重为1
                totalWeightedRate += rate * weight
                totalWeight += weight
              })

              const avgRate = totalWeight > 0 ? totalWeightedRate / totalWeight :
                validCustomers.reduce((sum: number, customer: any) => sum + customer.current, 0) / validCustomers.length

              monthlyDataArray.push(Math.round(avgRate * 100) / 100)

              console.log(`${period}月南华边际贡献率: ${avgRate.toFixed(2)}% (有效客户数: ${validCustomers.length})`)
            } else {
              monthlyDataArray.push(0)
            }
          } else {
            monthlyDataArray.push(0)
          }
        } else {
          monthlyDataArray.push(0)
        }
      } catch (error) {
        console.error(`获取${period}数据失败:`, error)
        monthlyDataArray.push(0)
      }

      monthsArray.push(`${month}月`)
    }

    months.value = monthsArray
    monthlyData.value = monthlyDataArray

    // 计算当前月份的数据作为当前值
    const currentMonth = new Date().getMonth()
    if (monthlyDataArray[currentMonth] > 0) {
      currentRate.value = monthlyDataArray[currentMonth]
    }

    console.log('南华边际贡献率月度数据:', monthlyDataArray)

  } catch (error) {
    console.error('获取南华边际贡献率数据失败:', error)
    setDefaultData()
  }
}

// 设置默认数据
const setDefaultData = () => {
  months.value = []
  monthlyData.value = []
  currentRate.value = 0
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
        text: `${selectedYear.value}年暂无南华边际贡献率数据`,
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
      text: `${selectedYear.value}年南华边际贡献率趋势分析`,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any[]) {
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
        formatter: function (value: number) {
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
          color: '#16A34A',
          width: 3
        },
        itemStyle: {
          color: '#16A34A'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#16A34A40' },
            { offset: 1, color: '#16A34A10' }
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