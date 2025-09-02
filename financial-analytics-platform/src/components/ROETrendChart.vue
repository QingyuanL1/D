<template>
  <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900">{{ currentYear }}年ROE月度趋势</h3>
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span class="text-sm text-gray-600">实际ROE</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span class="text-sm text-gray-600">目标线</span>
        </div>
        <router-link to="/analytics/roe-chart" class="text-blue-600 hover:text-blue-800 text-sm">
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

// ROE数据
const roeMonths = ref<string[]>([])
const roeMonthlyData = ref<any>({})
const roeSummary = ref<any>({})

// 工具函数
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toLocaleString('zh-CN', { maximumFractionDigits: 1 }) + '万'
  }
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

// 获取ROE数据
const fetchROEData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/analytics/roe/${currentYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        roeMonths.value = result.data.months || []
        roeMonthlyData.value = result.data.monthlyData || { roe: [] }

        const latestROE = result.data.monthlyData?.roe && result.data.monthlyData.roe.length > 0 ?
          result.data.monthlyData.roe[result.data.monthlyData.roe.length - 1] : 0

        roeSummary.value = {
          currentROE: latestROE,
          completion_rate: result.data.summary?.completion_rate || (latestROE / 21.18 * 100),
          targetROE: result.data.summary?.targetROE || 21.18
        }
      } else {
        resetROEData()
      }
    } else {
      resetROEData()
    }
  } catch (error) {
    console.error('获取ROE数据失败:', error)
    resetROEData()
  }
}

const resetROEData = () => {
  roeMonths.value = []
  roeMonthlyData.value = { roe: [] }
  roeSummary.value = { currentROE: 0, completion_rate: 0, targetROE: 20 }
}

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }
}

// 更新ROE图表
const updateChart = () => {
  if (!chartInstance.value) return

  const hasData = roeMonths.value.length > 0 && roeMonthlyData.value.roe && roeMonthlyData.value.roe.length > 0
  const series: any[] = []

  if (hasData) {
    const roeData = roeMonthlyData.value.roe.map((value: number) => value)
    const targetData = roeMonths.value.map(() => roeSummary.value.targetROE || 21.18)

    series.push({
      name: '实际ROE',
      type: 'line',
      data: roeData,
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

    series.push({
      name: '目标线',
      type: 'line',
      data: targetData,
      lineStyle: { color: '#EF4444', width: 2, type: 'dashed' },
      itemStyle: { color: '#EF4444' },
      symbol: 'none'
    })
  }

  const option = {
    title: { text: `${currentYear.value}年ROE月度趋势`, textStyle: { fontSize: 16, fontWeight: 'bold', color: '#374151' }, left: 'center', top: 10 },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        if (!hasData || !params) return '暂无数据'
        if (params.value === null || params.value === undefined) return '暂无数据'
        return `${params.name}<br/>${params.seriesName}: ${formatNumber(params.value)}%`
      }
    },
    legend: { top: 40, type: 'scroll' },
    grid: { left: '8%', right: '5%', bottom: '15%', top: '20%', containLabel: true },
    xAxis: { type: 'category', data: hasData ? roeMonths.value : [], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '百分比(%)', nameTextStyle: { fontSize: 12 }, axisLabel: { formatter: function (value: number) { return formatNumber(value) + '%' }, fontSize: 12 } },
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
  await fetchROEData()
  updateChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance.value?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
