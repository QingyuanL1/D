<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年月度趋势对比</h3>
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span class="text-sm text-gray-600">主营业务</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span class="text-sm text-gray-600">非主营业务</span>
        </div>
        <router-link v-if="showDetailLink" to="/analytics/business-income-chart"
          class="text-blue-600 hover:text-blue-800 text-sm">
          查看详情 →
        </router-link>
      </div>
    </div>
    <div :class="chartHeight" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'

// Props
interface Props {
  showDetailLink?: boolean
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  showDetailLink: false,
  height: 'h-[500px]'
})

// 计算属性
const chartHeight = computed(() => props.height)

// 响应式数据
const selectedYear = ref(new Date().getFullYear().toString())
const loading = ref(true)

// 图表引用
const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)

// 数据
const categories = {
  main: { name: '主营业务', color: '#3B82F6' },
  nonMain: { name: '非主营业务', color: '#10B981' }
}

const months = ref<string[]>([])
const monthlyData = ref<any>({})
const monthlyCurrentData = ref<any>({})

// 工具函数
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}



// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    await fetchBusinessIncomeData()
    await fetchMonthlyCurrentData()
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
  monthlyData.value = {}
  monthlyCurrentData.value = {}
}

// 获取营业收入数据
const fetchBusinessIncomeData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/analytics/business-income/${selectedYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        months.value = result.data.months || []
        monthlyData.value = result.data.monthlyData || {}

        // 使用固定的年度计划值
        const hardcodedPlans = {
          main: 59400,
          nonMain: 600
        }

        // 更新monthlyData中的yearlyPlan
        if (monthlyData.value.main) monthlyData.value.main.yearlyPlan = hardcodedPlans.main
        if (monthlyData.value.nonMain) monthlyData.value.nonMain.yearlyPlan = hardcodedPlans.nonMain
      } else {
        resetDataToDefault()
      }
    } else {
      resetDataToDefault()
    }
  } catch (error) {
    console.error('获取营业收入数据失败:', error)
    resetDataToDefault()
  }
}

// 获取当月营业收入数据
const fetchMonthlyCurrentData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/analytics/business-income-monthly/${selectedYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        monthlyCurrentData.value = result.data.monthlyData || {}
      } else {
        monthlyCurrentData.value = {}
      }
    } else {
      monthlyCurrentData.value = {}
    }
  } catch (error) {
    console.error('获取当月营业收入数据失败:', error)
    monthlyCurrentData.value = {}
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

  const series: any[] = []

  // 检查是否有数据
  const hasData = months.value.length > 0 && Object.keys(monthlyData.value).length > 0

  if (hasData) {
    // 为每个类别创建月度变化趋势线
    Object.keys(categories).forEach((key) => {
      const categoryData = monthlyData.value[key]
      const categoryInfo = categories[key as keyof typeof categories]

      if (categoryData) {
        // 当期累计线
        series.push({
          name: `${categoryInfo.name}`,
          type: 'line',
          data: categoryData.currentTotal,
          smooth: true,
          connectNulls: false,
          lineStyle: {
            color: categoryInfo.color,
            width: 3
          },
          itemStyle: {
            color: categoryInfo.color
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: categoryInfo.color + '40' },
              { offset: 1, color: categoryInfo.color + '10' }
            ])
          }
        })
      }
    })
  }

  const option = {
    title: {
      text: `${selectedYear.value}年营业收入趋势分析`,
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
        const monthIndex = months.value.indexOf(monthName)
        const seriesName = params.seriesName
        const cumulativeValue = params.value

        let result = `<div style="font-weight: bold; margin-bottom: 8px;">${monthName} - ${seriesName}</div>`

        // 显示累计数据
        result += `<div>累计收入: ${formatNumber(cumulativeValue)} 万元</div>`

        // 显示当月数据
        if (monthIndex !== -1 && Object.keys(monthlyCurrentData.value).length > 0) {
          const categoryKey = seriesName === '主营业务' ? 'main' : 'nonMain'
          const currentData = monthlyCurrentData.value[categoryKey]

          if (currentData && currentData.currentMonth && Array.isArray(currentData.currentMonth)) {
            const currentValue = currentData.currentMonth[monthIndex]

            if (currentValue !== null && currentValue !== undefined) {
              result += `<div style="margin-top: 4px;">当月收入: ${formatNumber(currentValue)} 万元</div>`
            }
          }
        }

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
        formatter: function (value: number) {
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

// 处理窗口大小变化
const handleResize = () => {
  chartInstance.value?.resize()
}

onMounted(async () => {
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
