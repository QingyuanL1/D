<template>
  <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900">{{ currentYear }}年存量指标月度趋势</h3>
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span class="text-sm text-gray-600">存量总计</span>
        </div>
        <router-link to="/analytics/inventory-metrics-chart" class="text-blue-600 hover:text-blue-800 text-sm">
          查看详情 →
        </router-link>
      </div>
    </div>
    <div class="h-[400px]" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 图表引用和实例
const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)

// 当前年份
const currentYear = ref(new Date().getFullYear().toString())

// 存量指标数据
const inventoryMonths = ref<string[]>([])
const inventoryMonthlyData = ref<any[]>([])

// 工具函数
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toLocaleString('zh-CN', { maximumFractionDigits: 1 }) + '万'
  }
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

// 获取存量指标数据
const fetchInventoryData = async () => {
  try {
    console.log('Fetching inventory data for year:', currentYear.value)
    const response = await fetch(`http://47.111.95.19:3000/analytics/inventory-metrics/${currentYear.value}`)
    if (response.ok) {
      const result = await response.json()
      console.log('Inventory data response:', result)
      if (result.success && result.data) {
        inventoryMonths.value = result.data.months || []
        inventoryMonthlyData.value = result.data.monthlyData || []
        console.log('Inventory chart data:', {
          months: inventoryMonths.value,
          monthlyData: inventoryMonthlyData.value,
          hasData: inventoryMonths.value.length > 0 && inventoryMonthlyData.value.length > 0
        })
      } else {
        console.log('No inventory data available')
        resetInventoryData()
      }
    } else {
      console.log('Inventory API request failed')
      resetInventoryData()
    }
  } catch (error) {
    console.error('获取存量指标数据失败:', error)
    resetInventoryData()
  }
}

const resetInventoryData = () => {
  inventoryMonths.value = []
  inventoryMonthlyData.value = []
}

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }
}

// 更新存量指标图表
const updateChart = () => {
  if (!chartInstance.value) {
    console.log('Inventory chart instance not available')
    return
  }

  const hasData = inventoryMonths.value.length > 0 && inventoryMonthlyData.value.length > 0
  console.log('Inventory chart update:', {
    hasMonths: inventoryMonths.value.length > 0,
    hasMonthlyData: inventoryMonthlyData.value.length > 0,
    hasData,
    months: inventoryMonths.value,
    monthlyData: inventoryMonthlyData.value
  })
  const series: any[] = []

  if (hasData) {
    // 从monthlyData中提取total数据
    const totalData = inventoryMonthlyData.value.map(item => item.total || 0)

    series.push({
      name: '存量总计',
      type: 'line',
      data: totalData,
      smooth: true,
      lineStyle: { color: '#3B82F6', width: 3 },
      itemStyle: { color: '#3B82F6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#3B82F640' },
          { offset: 1, color: '#3B82F610' }
        ])
      }
    })
  }

  const option = {
    title: { text: `${currentYear.value}年存量指标月度趋势`, textStyle: { fontSize: 16, fontWeight: 'bold', color: '#374151' }, left: 'center', top: 10 },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        if (!hasData || !params) return '暂无数据'
        if (params.value === null || params.value === undefined) return '暂无数据'
        return `${params.name}<br/>${params.seriesName}: ${formatNumber(params.value)} 万元`
      }
    },
    legend: { top: 40, type: 'scroll' },
    grid: { left: '8%', right: '5%', bottom: '15%', top: '20%', containLabel: true },
    xAxis: { type: 'category', data: hasData ? inventoryMonths.value : [], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '万元', nameTextStyle: { fontSize: 12 }, axisLabel: { formatter: function (value: number) { return formatNumber(value) }, fontSize: 12 } },
    series: hasData ? series : [],
    graphic: hasData ? [] : [{ type: 'text', left: 'center', top: 'middle', style: { text: '暂无数据', fontSize: 16, fontWeight: 'bold', fill: '#999' } }]
  }

  chartInstance.value.setOption(option, true)
}

// 响应式处理
const handleResize = () => {
  chartInstance.value?.resize()
}

onMounted(async () => {
  initChart()
  await fetchInventoryData()
  updateChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance.value?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
