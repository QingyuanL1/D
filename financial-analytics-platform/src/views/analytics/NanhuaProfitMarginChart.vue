<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">毛利率分析</h1>
        <p class="mt-2 text-gray-600">主营业务毛利率趋势分析与板块对比（含自接项目）</p>
      </div>

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

      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年月度毛利率趋势</h3>
          <div class="text-sm text-gray-500">
            当前毛利率: {{ currentRate.toFixed(2) }}% | 目标: {{ targetRate }}%
          </div>
        </div>
        <div ref="chartContainer" class="w-full h-96"></div>
      </div>


    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const selectedYear = ref('2025')
const chartContainer = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const targetRate = ref(24.00)
const currentRate = ref(0)
const months = ref<string[]>([])
const monthlyData = ref<number[]>([])

const customerData = ref([
  { name: '一包项目', plan: 14.54, actual: 0, rate: 0 },
  { name: '二包项目', plan: 15.50, actual: 0, rate: 0 },
  { name: '域内合作项目', plan: 8.00, actual: 0, rate: 0 },
  { name: '域外合作项目', plan: 5.48, actual: 0, rate: 0 },
  { name: '新能源项目', plan: 17.25, actual: 0, rate: 0 },
  { name: '苏州项目', plan: 6.00, actual: 0, rate: 0 },
  { name: '抢修', plan: 33.52, actual: 0, rate: 0 },
  { name: '运检项目', plan: 13.60, actual: 0, rate: 0 },
  { name: '自接项目', plan: 0, actual: 0, rate: 0 }
])

const formatNumber = (num: number) => {
  return num.toFixed(2)
}

const fetchNanhuaProfitMarginData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/analytics/nanhua-profit-margin/${selectedYear.value}`)

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        if (result.data.hasData === false) {
          months.value = []
          monthlyData.value = []
          currentRate.value = 0
          customerData.value = [
            { name: '一包项目', plan: 14.54, actual: 0, rate: 0 },
            { name: '二包项目', plan: 15.50, actual: 0, rate: 0 },
            { name: '域内合作项目', plan: 8.00, actual: 0, rate: 0 },
            { name: '域外合作项目', plan: 5.48, actual: 0, rate: 0 },
            { name: '新能源项目', plan: 17.25, actual: 0, rate: 0 },
            { name: '苏州项目', plan: 6.00, actual: 0, rate: 0 },
            { name: '抢修', plan: 33.52, actual: 0, rate: 0 },
            { name: '运检项目', plan: 13.60, actual: 0, rate: 0 },
            { name: '自接项目', plan: 0, actual: 0, rate: 0 }
          ]
        } else {
          months.value = result.data.months || []
          monthlyData.value = result.data.monthlyData || []
          currentRate.value = result.data.currentRate || 0

          if (result.data.customerData) {
            customerData.value = result.data.customerData.map(customer => ({
              name: customer.name,
              plan: customer.plan,
              actual: customer.actual,
              rate: customer.rate
            }))
          }
        }
      } else {
        months.value = []
        monthlyData.value = []
        currentRate.value = 0
        customerData.value = [
          { name: '一包项目', plan: 14.54, actual: 0, rate: 0 },
          { name: '二包项目', plan: 15.50, actual: 0, rate: 0 },
          { name: '域内合作项目', plan: 8.00, actual: 0, rate: 0 },
          { name: '域外合作项目', plan: 5.48, actual: 0, rate: 0 },
          { name: '新能源项目', plan: 17.25, actual: 0, rate: 0 },
          { name: '苏州项目', plan: 6.00, actual: 0, rate: 0 },
          { name: '抢修', plan: 33.52, actual: 0, rate: 0 },
          { name: '运检项目', plan: 13.60, actual: 0, rate: 0 },
          { name: '自接项目', plan: 0, actual: 0, rate: 0 }
        ]
      }
    } else {
      months.value = []
      monthlyData.value = []
      currentRate.value = 0
      customerData.value = [
        { name: '一包项目', plan: 14.54, actual: 0, rate: 0 },
        { name: '二包项目', plan: 15.50, actual: 0, rate: 0 },
        { name: '域内合作项目', plan: 8.00, actual: 0, rate: 0 },
        { name: '域外合作项目', plan: 5.48, actual: 0, rate: 0 },
        { name: '新能源项目', plan: 17.25, actual: 0, rate: 0 },
        { name: '苏州项目', plan: 6.00, actual: 0, rate: 0 },
        { name: '抢修', plan: 33.52, actual: 0, rate: 0 },
        { name: '运检项目', plan: 13.60, actual: 0, rate: 0 },
        { name: '自接项目', plan: 0, actual: 0, rate: 0 }
      ]
    }
  } catch (error) {
    console.error('获取南华毛利率数据失败:', error)
    months.value = []
    monthlyData.value = []
    currentRate.value = 0
    customerData.value = [
      { name: '一包项目', plan: 14.54, actual: 0, rate: 0 },
      { name: '二包项目', plan: 15.50, actual: 0, rate: 0 },
      { name: '域内合作项目', plan: 8.00, actual: 0, rate: 0 },
      { name: '域外合作项目', plan: 5.48, actual: 0, rate: 0 },
      { name: '新能源项目', plan: 17.25, actual: 0, rate: 0 },
      { name: '苏州项目', plan: 6.00, actual: 0, rate: 0 },
      { name: '抢修', plan: 33.52, actual: 0, rate: 0 },
      { name: '运检项目', plan: 13.60, actual: 0, rate: 0 },
      { name: '自接项目', plan: 0, actual: 0, rate: 0 }
    ]
  }
}

const initChart = () => {
  if (!chartContainer.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartContainer.value)

  if (months.value.length === 0 || monthlyData.value.length === 0) {
    const option = {
      title: {
        text: `${selectedYear.value}年暂无南华毛利率数据`,
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
      text: `${selectedYear.value}年南华毛利率趋势`,
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

watch(selectedYear, () => {
  fetchNanhuaProfitMarginData()
})

watch([months, monthlyData], () => {
  nextTick(() => {
    initChart()
  })
})

onMounted(async () => {
  await fetchNanhuaProfitMarginData()
  await nextTick()
  initChart()
  
  window.addEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
})

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
.chart-container {
  width: 100%;
  height: 400px;
}
</style> 