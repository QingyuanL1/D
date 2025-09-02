<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">新签订单数据分析</h1>
        <p class="text-gray-600 mt-2">年度计划与当期累计对比分析</p>
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div v-for="category in categories" :key="category" class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ category }}</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">年度计划:</span>
              <span class="font-medium text-blue-600">{{ formatNumber(summary[category]?.yearly_plan || 0) }} 万元</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">当期累计:</span>
              <span class="font-medium text-green-600">{{ formatNumber(summary[category]?.current_total || 0) }}
                万元</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">完成率:</span>
              <span class="font-medium" :class="getCompletionRateColor(summary[category]?.completion_rate || 0)">
                {{ summary[category]?.completion_rate || 0 }}%
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                :style="`width: ${Math.min(summary[category]?.completion_rate || 0, 100)}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 月度趋势图表 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年月度趋势对比</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">月度变化趋势</span>
            </div>
          </div>
        </div>
        <div class="h-[500px]" ref="chartRef"></div>
      </div>

      <!-- 分类占比图表 -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">{{ selectedYear }}年各类别占比分析</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="h-[350px]" ref="pieChartRef"></div>
          <div class="space-y-4">
            <h4 class="text-md font-medium text-gray-800">占比详情</h4>
            <div class="space-y-2">
              <div v-for="(item, index) in pieData" :key="index"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-3" :style="`background-color: ${getColor(index)}`"></div>
                  <span class="text-sm font-medium text-gray-900">{{ item.name }}</span>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">{{ formatNumber(item.value) }} 万元</div>
                  <div class="text-xs text-gray-500">{{ item.percentage }}%</div>
                </div>
              </div>
            </div>
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
const pieChartRef = ref<HTMLElement | null>(null)

// 图表实例
const chartInstance = ref<echarts.ECharts | null>(null)
const pieChartInstance = ref<echarts.ECharts | null>(null)

// 数据
const categories = ref<string[]>(['设备', '元件', '工程'])
const months = ref<string[]>([])
const monthlyData = ref<any>({})
const summary = ref<any>({})
const pieData = ref<any[]>([])

// 颜色配置
const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

// 工具函数
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const getColor = (index: number) => {
  return colors[index % colors.length]
}

const getCompletionRateColor = (rate: number) => {
  if (rate >= 80) return 'text-green-600'
  if (rate >= 60) return 'text-yellow-600'
  return 'text-red-600'
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
    await Promise.all([
      fetchNewOrdersData(),
      fetchPieData()
    ])
    updateCharts()
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取新签订单数据
const fetchNewOrdersData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/analytics/new-orders/${selectedYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        months.value = result.data.months
        monthlyData.value = result.data.monthlyData
        summary.value = result.data.summary
      }
    }
  } catch (error) {
    console.error('获取新签订单数据失败:', error)
  }
}

// 获取饼图数据
const fetchPieData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/analytics/new-orders-breakdown/${selectedYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        pieData.value = result.data
      }
    }
  } catch (error) {
    console.error('获取饼图数据失败:', error)
  }
}

// 初始化图表
const initCharts = () => {
  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }
  if (pieChartRef.value) {
    pieChartInstance.value = echarts.init(pieChartRef.value)
  }
}

// 更新所有图表
const updateCharts = () => {
  updateTrendChart()
  updatePieChart()
}

// 更新趋势图
const updateTrendChart = () => {
  if (!chartInstance.value) return

  const series: any[] = []
  const markLines: any[] = []

  // 为每个类别创建月度变化趋势线
  categories.value.forEach((category, index) => {
    const categoryData = monthlyData.value[category]
    if (categoryData) {
      // 当期累计线
      series.push({
        name: `${category}`,
        type: 'line',
        data: categoryData.current_total,
        smooth: true,
        lineStyle: {
          color: colors[index],
          width: 3
        },
        itemStyle: {
          color: colors[index]
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors[index] + '40' },
            { offset: 1, color: colors[index] + '10' }
          ])
        }
      })
    }
  })

  const option = {
    title: {
      text: `${selectedYear.value}年新签订单趋势分析`,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        const monthName = params.name
        const seriesName = params.seriesName
        const value = params.value

        if (value === null || value === undefined) {
          return `${monthName}<br/>${seriesName}: 暂无数据`
        }

        return `${monthName}<br/>${seriesName}: ${formatNumber(value)} 万元`
      }
    },
    legend: {
      top: 50,
      type: 'scroll'
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
      data: months.value,
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
        formatter: function (value: number) {
          return formatNumber(value)
        },
        fontSize: 12
      }
    },
    series
  }

  chartInstance.value.setOption(option)
}

// 更新饼图
const updatePieChart = () => {
  if (!pieChartInstance.value) return

  const option = {
    title: {
      text: '类别占比',
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
      formatter: function (params: any) {
        return `${params.name}<br/>数值: ${formatNumber(params.value)} 万元<br/>占比: ${params.percent}%`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '类别占比',
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData.value.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: getColor(index)
          }
        }))
      }
    ]
  }

  pieChartInstance.value.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  chartInstance.value?.resize()
  pieChartInstance.value?.resize()
}

onMounted(async () => {
  initAvailableYears()
  initCharts()
  await fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance.value?.dispose()
  pieChartInstance.value?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 组件样式 */
</style>