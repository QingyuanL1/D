<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">成本中心结构分析</h1>
        <p class="text-gray-600 mt-2">按年度计划口径分解 - 计入损益结构分析</p>
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

      <!-- 年度计划进度卡片 -->
      <div v-if="yearlyPlan > 0" class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ selectedYear }}年度计划完成情况</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ formatNumber(yearlyPlan) }} 万元</div>
            <div class="text-sm text-gray-600">年度计划</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ formatNumber(totalStats.totalCumulativeIncome) }} 万元</div>
            <div class="text-sm text-gray-600">计入损益</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold" :class="getCompletionRateColor(totalStats.completionRate)">{{ totalStats.completionRate }}%</div>
            <div class="text-sm text-gray-600">执行率</div>
          </div>
        </div>
        <div class="mt-4">
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                 :style="`width: ${Math.min(totalStats.completionRate, 100)}%`"></div>
          </div>
        </div>
      </div>

      <!-- 汇总数据卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div v-for="(category, key) in categories" :key="key" class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ category.name }}</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">计入损益:</span>
              <span class="font-medium text-blue-600">{{ formatNumber(summary[key]?.cumulativeIncome || 0) }} 万元</span>
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
              <span class="text-sm text-gray-600">累计计入损益</span>
            </div>
            <div v-if="selectedYear !== '2025'" class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">当月计入损益</span>
            </div>
          </div>
        </div>
        <div class="h-[500px]" ref="chartRef"></div>
      </div>

      <!-- 当月实际柱状图 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年各板块当月计入损益对比</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">当月计入损益</span>
            </div>
          </div>
        </div>
        <div class="h-[400px]" ref="barChartRef"></div>
      </div>

      <!-- 分类占比图表 -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">{{ selectedYear }}年各板块计入损益占比分析</h3>
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

// 响应式数据
const selectedYear = ref(new Date().getFullYear().toString())
const availableYears = ref<string[]>([])
const loading = ref(true)

// 图表引用
const chartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
const barChartRef = ref<HTMLElement | null>(null)

// 图表实例
const chartInstance = ref<echarts.ECharts | null>(null)
const pieChartInstance = ref<echarts.ECharts | null>(null)
const barChartInstance = ref<echarts.ECharts | null>(null)

// 数据
const categories = {
  equipment: { name: '设备', color: '#3B82F6' },
  component: { name: '元件', color: '#10B981' },
  engineering: { name: '工程', color: '#F59E0B' },
  nonMainBusiness: { name: '非主营业务', color: '#EF4444' }
}

const months = ref<string[]>([])
const monthlyData = ref<any>({})
const summary = ref<any>({})
const pieData = ref<any[]>([])
const yearlyPlan = ref<number>(0)

// 颜色配置
const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

// 计算汇总数据，包括损益比率和年度计划完成率
const summaryWithRatio = computed(() => {
  const result: any = {}
  Object.keys(categories).forEach(key => {
    const data = summary.value[key] || { cumulativeIncome: 0, currentPeriodTotal: 0 }
    result[key] = {
      ...data,
      ratio: data.cumulativeIncome > 0 ?
        Number(((data.currentPeriodTotal / data.cumulativeIncome) * 100).toFixed(2)) : 0
    }
  })
  return result
})

// 计算总累计收入和年度计划完成率
const totalStats = computed(() => {
  const totalCumulativeIncome = Object.keys(categories).reduce((sum, key) => {
    return sum + (summary.value[key]?.cumulativeIncome || 0)
  }, 0)
  
  const completionRate = yearlyPlan.value > 0 ? 
    Number(((totalCumulativeIncome / yearlyPlan.value) * 100).toFixed(2)) : 0
    
  return {
    totalCumulativeIncome,
    yearlyPlan: yearlyPlan.value,
    completionRate
  }
})

// 工具函数
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const getColor = (index: number) => {
  return colors[index % colors.length]
}

const getRatioColor = (ratio: number) => {
  if (ratio >= 50) return 'text-red-600'
  if (ratio >= 30) return 'text-yellow-600'
  if (ratio >= 15) return 'text-green-600'
  return 'text-blue-600'
}

const getCompletionRateColor = (rate: number) => {
  if (rate >= 90) return 'text-green-600'
  if (rate >= 70) return 'text-blue-600'
  if (rate >= 50) return 'text-yellow-600'
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
    // 先获取成本中心数据，再基于summary生成饼图数据
    await fetchCostCenterData()
    await fetchPieData()
    updateCharts()
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取成本中心数据
const fetchCostCenterData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/analytics/cost-center/${selectedYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        months.value = result.data.months || []
        monthlyData.value = result.data.monthlyData || {}
        summary.value = result.data.summary || {}
        yearlyPlan.value = result.data.yearlyPlan || 0
      } else {
        // 没有数据时重置为默认值
        resetDataToDefault()
      }
    } else {
      // 请求失败时重置为默认值
      resetDataToDefault()
    }
  } catch (error) {
    console.error('获取成本中心数据失败:', error)
    // 出错时重置为默认值
    resetDataToDefault()
  }
}

// 重置数据为默认值
const resetDataToDefault = () => {
  months.value = []
  monthlyData.value = {}
  summary.value = {}
  yearlyPlan.value = 0
  pieData.value = []
}

// 获取饼图数据 - 基于计入损益
const fetchPieData = async () => {
  try {
    // 基于summary数据生成饼图数据，使用计入损益
    const data: any[] = []
    let total = 0

    Object.keys(categories).forEach(key => {
      const categoryData = summary.value[key]
      const categoryInfo = categories[key as keyof typeof categories]
      if (categoryData && categoryData.cumulativeIncome > 0) {
        data.push({
          name: categoryInfo.name,
          value: categoryData.cumulativeIncome
        })
        total += categoryData.cumulativeIncome
      }
    })

    // 计算百分比
    pieData.value = data.map(item => ({
      ...item,
      percentage: total > 0 ? Number(((item.value / total) * 100).toFixed(2)) : 0
    }))
  } catch (error) {
    console.error('生成饼图数据失败:', error)
    pieData.value = []
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
  if (barChartRef.value) {
    barChartInstance.value = echarts.init(barChartRef.value)
  }
}

// 更新所有图表
const updateCharts = () => {
  updateTrendChart()
  updateBarChart()
  updatePieChart()
}

// 更新趋势图
const updateTrendChart = () => {
  if (!chartInstance.value) return

  const series: any[] = []
  
  // 检查是否有数据
  const hasData = months.value.length > 0 && Object.keys(monthlyData.value).length > 0
  
  if (hasData) {
    // 为每个类别创建累计趋势线
    Object.keys(categories).forEach((key, index) => {
      const categoryData = monthlyData.value[key]
      const categoryInfo = categories[key as keyof typeof categories]

      if (categoryData) {
        // 累计计入损益趋势线
        series.push({
          name: `${categoryInfo.name}(累计)`,
          type: 'line',
          data: categoryData.cumulativeIncome,
          smooth: true,
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

        // 当月计入损益柱状图 - 分组显示 (2025年不显示)
        if (selectedYear.value !== '2025') {
          series.push({
            name: `${categoryInfo.name}(当月)`,
            type: 'bar',
            data: categoryData.currentPeriodTotal,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: categoryInfo.color + 'CC' },
                { offset: 1, color: categoryInfo.color + '66' }
              ])
            },
            barWidth: '15%', // 减小单个柱子宽度以便分组显示
            barGap: '10%', // 设置柱子间距
            barCategoryGap: '20%' // 设置分类间距
          })
        }
      }
    })
  }

  const option = {
    title: {
      text: `${selectedYear.value}年成本中心月度趋势分析`,
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
        let result = `<strong>${params[0].name}</strong><br/>`
        
        // 分别显示累计和当月数据
        const cumulativeData = params.filter(p => p.seriesName.includes('累计'))
        const currentData = params.filter(p => p.seriesName.includes('当月'))
        
        if (cumulativeData.length > 0) {
          result += '<br/><span style="color: #666;">累计计入损益:</span><br/>'
          cumulativeData.forEach(param => {
            result += `• ${param.seriesName}: ${formatNumber(param.value)} 万元<br/>`
          })
        }
        
        // 2025年不显示当月数据
        if (currentData.length > 0 && selectedYear.value !== '2025') {
          result += '<br/><span style="color: #666;">当月计入损益:</span><br/>'
          currentData.forEach(param => {
            result += `• ${param.seriesName}: ${formatNumber(param.value)} 万元<br/>`
          })
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

// 更新当月柱状图
const updateBarChart = () => {
  if (!barChartInstance.value) return

  const hasData = months.value.length > 0 && Object.keys(monthlyData.value).length > 0
  const series: any[] = []

  if (hasData) {
    // 为每个类别创建当月柱状图
    Object.keys(categories).forEach((key, index) => {
      const categoryData = monthlyData.value[key]
      const categoryInfo = categories[key as keyof typeof categories]

      if (categoryData && categoryData.currentPeriodTotal) {
        series.push({
          name: categoryInfo.name,
          type: 'bar',
          data: categoryData.currentPeriodTotal,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: categoryInfo.color },
              { offset: 1, color: categoryInfo.color + '80' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: categoryInfo.color
            }
          }
        })
      }
    })
  }

  const option = {
    title: {
      text: `${selectedYear.value}年各板块当月计入损益对比`,
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

  barChartInstance.value.setOption(option, true)
}

// 更新饼图
const updatePieChart = () => {
  if (!pieChartInstance.value) return

  const hasData = pieData.value.length > 0

  const option = {
    title: {
      text: '板块占比',
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
        name: '板块占比',
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

// 处理窗口大小变化
const handleResize = () => {
  chartInstance.value?.resize()
  barChartInstance.value?.resize()
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
  barChartInstance.value?.dispose()
  pieChartInstance.value?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 组件样式 */
</style>