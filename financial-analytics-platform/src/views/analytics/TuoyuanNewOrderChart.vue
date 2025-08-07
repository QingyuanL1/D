<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">拓源新签订单数据分析</h1>
        <p class="text-gray-600 mt-2">年度计划与当期累计对比分析</p>
      </div>

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

      <div v-if="totalYearlyPlan > 0" class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ selectedYear }}年度计划完成情况</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ formatNumber(totalYearlyPlan) }} 万元</div>
            <div class="text-sm text-gray-600">年度计划</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ formatNumber(totalCumulative) }} 万元</div>
            <div class="text-sm text-gray-600">累计完成</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold" :class="getCompletionRateColor(completionRate)">{{ completionRate }}%</div>
            <div class="text-sm text-gray-600">完成率</div>
          </div>
        </div>
        <div class="mt-4">
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                 :style="`width: ${Math.min(completionRate, 100)}%`"></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">设备类别</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">年度计划:</span>
              <span class="font-medium text-blue-600">{{ formatNumber(summary['设备']?.yearly_plan || 0) }} 万元</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">当期累计:</span>
              <span class="font-medium text-green-600">{{ formatNumber(summary['设备']?.current_total || 0) }} 万元</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">完成率:</span>
              <span class="font-medium" :class="getCompletionRateColor(summary['设备']?.completion_rate || 0)">
                {{ summary['设备']?.completion_rate || 0 }}%
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                   :style="`width: ${Math.min(summary['设备']?.completion_rate || 0, 100)}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年月度趋势对比</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">累计新签订单</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">当月新签订单</span>
            </div>
          </div>
        </div>
        <div class="h-[500px]" ref="chartRef"></div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">{{ selectedYear }}年各客户订单占比分析</h3>
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'

const selectedYear = ref(new Date().getFullYear().toString())
const availableYears = ref<string[]>([])
const loading = ref(true)

const chartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)

const chartInstance = ref<echarts.ECharts | null>(null)
const pieChartInstance = ref<echarts.ECharts | null>(null)

const months = ref<string[]>([])
const monthlyData = ref<any>({})
const summary = ref<any>({})
const pieData = ref<any[]>([])

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#84CC16']

const totalYearlyPlan = computed(() => {
  return summary.value['设备']?.yearly_plan || 0
})

const totalCumulative = computed(() => {
  return summary.value['设备']?.current_total || 0
})

const completionRate = computed(() => {
  return summary.value['设备']?.completion_rate || 0
})

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

const initAvailableYears = () => {
  const currentYear = new Date().getFullYear()
  const years: string[] = []
  for (let i = 0; i < 5; i++) {
    years.push((currentYear - i).toString())
  }
  availableYears.value = years
}

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

const fetchNewOrdersData = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/analytics/tuoyuan-new-orders/${selectedYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        months.value = result.data.months || []
        monthlyData.value = result.data.monthlyData || {}
        summary.value = result.data.summary || {}
      } else {
        resetDataToDefault()
      }
    } else {
      resetDataToDefault()
    }
  } catch (error) {
    console.error('获取拓源新签订单数据失败:', error)
    resetDataToDefault()
  }
}

const resetDataToDefault = () => {
  months.value = []
  monthlyData.value = {}
  summary.value = {}
  pieData.value = []
}

const fetchPieData = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/analytics/tuoyuan-new-orders-breakdown/${selectedYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        pieData.value = result.data
      } else {
        pieData.value = []
      }
    } else {
      pieData.value = []
    }
  } catch (error) {
    console.error('获取饼图数据失败:', error)
    pieData.value = []
  }
}

const initCharts = () => {
  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }
  if (pieChartRef.value) {
    pieChartInstance.value = echarts.init(pieChartRef.value)
  }
}

const updateCharts = () => {
  updateTrendChart()
  updatePieChart()
}

const updateTrendChart = () => {
  if (!chartInstance.value) return

  const hasData = months.value.length > 0 && Object.keys(monthlyData.value).length > 0
  const series: any[] = []
  
  if (hasData && monthlyData.value['设备']) {
    const equipmentData = monthlyData.value['设备']
    
    series.push({
      name: '累计新签订单',
      type: 'line',
      data: equipmentData.cumulative || [],
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
    })

    series.push({
      name: '当月新签订单',
      type: 'bar',
      data: equipmentData.current_total || [],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#10B981' },
          { offset: 1, color: '#10B981' + '80' }
        ])
      },
      barWidth: '30%'
    })
  }

  const option = {
    title: {
      text: `${selectedYear.value}年拓源新签订单趋势分析`,
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
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any[]) {
        if (!hasData) return '暂无数据'
        let result = `${params[0].name}<br/>`
        params.forEach(param => {
          result += `${param.seriesName}: ${formatNumber(param.value)} 万元<br/>`
        })
        return result
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
    series: hasData ? series : [],
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

const updatePieChart = () => {
  if (!pieChartInstance.value) return

  const hasData = pieData.value.length > 0

  const option = {
    title: {
      text: '客户占比',
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
      formatter: function(params: any) {
        if (!hasData) return '暂无数据'
        return `${params.name}<br/>数值: ${formatNumber(params.value)} 万元<br/>占比: ${params.percent}%`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 12
      },
      show: hasData
    },
    series: [
      {
        name: '客户占比',
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
        data: hasData ? pieData.value.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: getColor(index)
          }
        })) : []
      }
    ],
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

  pieChartInstance.value.setOption(option, true)
}

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
</style> 