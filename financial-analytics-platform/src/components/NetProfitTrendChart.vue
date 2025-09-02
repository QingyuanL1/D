<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900">{{ getSelectedCompanyName() }}{{ selectedYear }}年月度趋势对比</h3>
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span class="text-sm text-gray-600">月度变化趋势</span>
        </div>
        <router-link v-if="showDetailLink" to="/analytics/net-profit-chart"
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
const selectedCompany = ref('main') // 默认主公司
const loading = ref(true)

// 图表引用
const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)

// 数据
const months = ref<string[]>([])
const monthlyData = ref<any>({})
const summary = ref<any>({})

// 公司名称映射
const companyNames: { [key: string]: string } = {
  main: '电气公司',
  subsidiary1: '子公司1',
  subsidiary2: '子公司2'
}

// 工具函数
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const getSelectedCompanyName = () => {
  return companyNames[selectedCompany.value] || '电气公司'
}

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    await fetchNetProfitData()
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
  summary.value = {
    yearlyPlan: 0,
    currentTotal: 0,
    completion_rate: 0,
    growth_rate: 0,
    growth_amount: 0
  }
}

// 获取净利润数据
const fetchNetProfitData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/analytics/net-profit/${selectedYear.value}?company=${selectedCompany.value}`)

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
    console.error('获取净利润数据失败:', error)
    resetDataToDefault()
  }
}

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }
}

// 更新图表 - 使用柱状图
const updateChart = () => {
  if (!chartInstance.value) return

  try {
    // 检查是否有数据
    const hasData = months.value.length > 0 && monthlyData.value && Object.keys(monthlyData.value).length > 0

    // 准备安全的数据
    const monthsData = hasData ? months.value : []
    const currentTotal = hasData && monthlyData.value.currentTotal ? monthlyData.value.currentTotal : []

    const option = {
      title: {
        text: `${getSelectedCompanyName()}${selectedYear.value}年净利润趋势分析`,
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
          if (!hasData) return '暂无数据'

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
        top: 40,
        type: 'scroll'
      },
      grid: {
        left: '8%',
        right: '5%',
        bottom: '10%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: monthsData,
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
      series: hasData ? [{
        name: '净利润',
        type: 'bar',
        data: currentTotal,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3B82F6' },
            { offset: 1, color: '#1E40AF' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2563EB' },
              { offset: 1, color: '#1D4ED8' }
            ])
          }
        }
      }] : [],
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
  } catch (error) {
    console.error('更新趋势图表失败:', error)
  }
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
