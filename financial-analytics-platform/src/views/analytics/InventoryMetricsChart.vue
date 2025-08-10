<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">存量指标分析</h1>
        <p class="text-gray-600 mt-2">预中标+在产+库存综合分析</p>
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

      <!-- 当前存量总量 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">当前存量总量</h3>
        <div class="text-center">
          <div class="text-4xl font-bold text-blue-600">
            {{ formatNumber(currentTotal) }}
          </div>
          <div class="text-sm text-gray-600 mt-2">万元</div>
        </div>
      </div>

      <!-- 存量变化趋势图表 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年存量变化趋势</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">预中标</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">在产</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-purple-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">库存</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-purple-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">总计</span>
            </div>
          </div>
        </div>
        <div class="h-[400px]" ref="trendChartRef"></div>
      </div>

      <!-- 存量构成分布饼图 -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">当前存量构成分布</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="h-[300px]" ref="pieChartRef"></div>
          
          <!-- 构成详情 -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900">构成详情</h4>
            <div v-if="compositionData.length > 0" class="space-y-3">
              <div v-for="item in compositionData" :key="item.name" 
                   class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded mr-3" :class="getColorClass(item.name)"></div>
                  <span class="font-medium text-gray-900">{{ item.name }}</span>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-gray-900">{{ formatNumber(item.value) }}万元</div>
                  <div class="text-sm text-gray-600">{{ item.percentage }}%</div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-gray-500 py-8">
              暂无构成数据
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
const trendChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
const trendChartInstance = ref<echarts.ECharts | null>(null)
const pieChartInstance = ref<echarts.ECharts | null>(null)

// 数据
const currentTotal = ref(0)
const months = ref<string[]>([])
const monthlyData = ref<any[]>([])
const compositionData = ref<any[]>([])

// 工具函数
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const getColorClass = (name: string) => {
  switch (name) {
    case '预中标': return 'bg-green-500'
    case '在产': return 'bg-blue-500' 
    case '库存': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
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
    await fetchInventoryMetricsData()
    updateCharts()
  } catch (error) {
    console.error('获取数据失败:', error)
    setDefaultData()
  } finally {
    loading.value = false
  }
}

// 获取存量指标数据
const fetchInventoryMetricsData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/analytics/inventory-metrics/${selectedYear.value}`)

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        months.value = result.data.months || []
        monthlyData.value = result.data.monthlyData || []
        compositionData.value = result.data.compositionData || []
        currentTotal.value = result.data.currentTotal || 0
      } else {
        setDefaultData()
      }
    } else {
      setDefaultData()
    }
  } catch (error) {
    console.error('获取存量指标数据失败:', error)
    setDefaultData()
  }
}

const setDefaultData = () => {
  months.value = []
  monthlyData.value = []
  compositionData.value = []
  currentTotal.value = 0
}

// 初始化图表
const initCharts = () => {
  if (trendChartRef.value) {
    trendChartInstance.value = echarts.init(trendChartRef.value)
  }
  if (pieChartRef.value) {
    pieChartInstance.value = echarts.init(pieChartRef.value)
  }
}

// 更新图表
const updateCharts = () => {
  updateTrendChart()
  updatePieChart()
}

// 更新趋势图表
const updateTrendChart = () => {
  if (!trendChartInstance.value) return

  // 如果没有数据，显示暂无数据
  if (months.value.length === 0 || monthlyData.value.length === 0) {
    const option = {
      title: {
        text: `${selectedYear.value}年暂无存量数据`,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#9CA3AF'
        },
        left: 'center',
        top: 'middle'
      }
    }
    trendChartInstance.value.setOption(option, true)
    return
  }

  // 准备数据
  const preBidData = monthlyData.value.map(item => item.preBid)
  const inProgressData = monthlyData.value.map(item => item.inProgress)
  const inventoryData = monthlyData.value.map(item => item.inventory)
  const totalData = monthlyData.value.map(item => item.total)

  const option = {
    title: {
      text: `${selectedYear.value}年存量变化趋势`,
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
          result += `${param.seriesName}: ${formatNumber(param.value)}万元<br/>`
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
      name: '金额(万元)',
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
    series: [
      {
        name: '预中标',
        type: 'line',
        data: preBidData,
        smooth: true,
        lineStyle: {
          color: '#10B981',
          width: 2
        },
        itemStyle: {
          color: '#10B981'
        }
      },
      {
        name: '在产',
        type: 'line',
        data: inProgressData,
        smooth: true,
        lineStyle: {
          color: '#3B82F6',
          width: 2
        },
        itemStyle: {
          color: '#3B82F6'
        }
      },
      {
        name: '库存',
        type: 'line',
        data: inventoryData,
        smooth: true,
        lineStyle: {
          color: '#8B5CF6',
          width: 2
        },
        itemStyle: {
          color: '#8B5CF6'
        }
      },
      {
        name: '总计',
        type: 'line',
        data: totalData,
        smooth: true,
        lineStyle: {
          color: '#8B5CF6',
          width: 3
        },
        itemStyle: {
          color: '#8B5CF6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8B5CF640' },
            { offset: 1, color: '#8B5CF610' }
          ])
        }
      }
    ]
  }

  trendChartInstance.value.setOption(option, true)
}

// 更新饼图
const updatePieChart = () => {
  if (!pieChartInstance.value) return

  if (compositionData.value.length === 0) {
    const option = {
      title: {
        text: '暂无构成数据',
        textStyle: {
          fontSize: 14,
          color: '#9CA3AF'
        },
        left: 'center',
        top: 'middle'
      }
    }
    pieChartInstance.value.setOption(option, true)
    return
  }

  const option = {
    title: {
      text: '存量构成分布',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        return `${params.name}<br/>金额: ${formatNumber(params.value)}万元<br/>占比: ${params.percent}%`
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '60%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: compositionData.value.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: ['#10B981', '#3B82F6', '#8B5CF6'][index]
          }
        }))
      }
    ]
  }

  pieChartInstance.value.setOption(option, true)
}

// 处理窗口大小变化
const handleResize = () => {
  trendChartInstance.value?.resize()
  pieChartInstance.value?.resize()
}

onMounted(async () => {
  initAvailableYears()
  initCharts()
  await fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  trendChartInstance.value?.dispose()
  pieChartInstance.value?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 组件样式 */
</style>