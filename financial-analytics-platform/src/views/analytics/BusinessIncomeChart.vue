<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">营业收入数据分析</h1>
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div v-for="(category, key) in categories" :key="key" class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ category.name }}</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">年度计划:</span>
              <span class="font-medium text-blue-600">{{ formatNumber(summary[key]?.yearlyPlan || 0) }} 万元</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">当期累计:</span>
              <span class="font-medium text-green-600">{{ formatNumber(summary[key]?.currentTotal || 0) }} 万元</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">执行率:</span>
              <span class="font-medium" :class="getCompletionRateColor(summary[key]?.completion_rate || 0)">
                {{ summary[key]?.completion_rate || 0 }}%
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500" 
                   :class="category.progressColor"
                   :style="`width: ${Math.min(summary[key]?.completion_rate || 0, 100)}%`"></div>
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
              <span class="text-sm text-gray-600">累计趋势</span>
            </div>
          </div>
        </div>
        <div class="h-[500px]" ref="chartRef"></div>
      </div>

      <!-- 当月数据柱状图 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年当月实际数据对比分析</h3>
          <div class="flex items-center space-x-6">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">主营业务</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">非主营业务</span>
            </div>
            <div class="text-xs text-gray-500">
              鼠标悬停查看详细数据和占比
            </div>
          </div>
        </div>
        <div class="h-[500px]" ref="monthlyChartRef"></div>
      </div>

      <!-- 分类占比图表 -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">{{ selectedYear }}年营业收入结构占比分析</h3>
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
const monthlyChartRef = ref<HTMLElement | null>(null)

// 图表实例
const chartInstance = ref<echarts.ECharts | null>(null)
const pieChartInstance = ref<echarts.ECharts | null>(null)
const monthlyChartInstance = ref<echarts.ECharts | null>(null)

// 数据
const categories = {
  main: { name: '主营业务', color: '#3B82F6', progressColor: 'bg-blue-600' },
  nonMain: { name: '非主营业务', color: '#10B981', progressColor: 'bg-green-600' }
}

const months = ref<string[]>([])
const monthlyData = ref<any>({})
const monthlyCurrentData = ref<any>({})
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
    // 先获取营业收入数据，再基于summary生成饼图数据
    await fetchBusinessIncomeData()
    await fetchMonthlyCurrentData()
    await fetchPieData()
    updateCharts()
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
  summary.value = {}
  pieData.value = []
}

// 获取营业收入数据
const fetchBusinessIncomeData = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/analytics/business-income/${selectedYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        months.value = result.data.months || []
        monthlyData.value = result.data.monthlyData || {}

        // 使用固定的年度计划值，但使用API返回的当期累计数据
        const hardcodedPlans = {
          main: 59400,
          nonMain: 600
        }

        // 使用API返回的汇总数据，但覆盖年度计划值
        summary.value = {
          main: {
            yearlyPlan: hardcodedPlans.main,
            currentTotal: result.data.summary?.main?.currentTotal || 0,
            completion_rate: result.data.summary?.main?.currentTotal ? Math.round((result.data.summary.main.currentTotal / hardcodedPlans.main) * 100) : 0
          },
          nonMain: {
            yearlyPlan: hardcodedPlans.nonMain,
            currentTotal: result.data.summary?.nonMain?.currentTotal || 0,
            completion_rate: result.data.summary?.nonMain?.currentTotal ? Math.round((result.data.summary.nonMain.currentTotal / hardcodedPlans.nonMain) * 100) : 0
          }
        }

        // 更新monthlyData中的yearlyPlan
        if (monthlyData.value.main) monthlyData.value.main.yearlyPlan = hardcodedPlans.main
        if (monthlyData.value.nonMain) monthlyData.value.nonMain.yearlyPlan = hardcodedPlans.nonMain
      } else {
        // 没有数据时重置为默认值
        resetDataToDefault()
      }
    } else {
      // 请求失败时重置为默认值
      resetDataToDefault()
    }
  } catch (error) {
    console.error('获取营业收入数据失败:', error)
    // 出错时重置为默认值
    resetDataToDefault()
  }
}

// 获取当月营业收入数据
const fetchMonthlyCurrentData = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/analytics/business-income-monthly/${selectedYear.value}`)
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

// 获取饼图数据
const fetchPieData = async () => {
  try {
    // 基于summary数据生成饼图数据，使用当期累计值
    const data: any[] = []
    let total = 0
    
    Object.keys(categories).forEach(key => {
      const categoryData = summary.value[key]
      const categoryInfo = categories[key as keyof typeof categories]
      if (categoryData && categoryData.currentTotal > 0) {
        data.push({
          name: categoryInfo.name,
          value: categoryData.currentTotal
        })
        total += categoryData.currentTotal
      }
    })
    
    // 计算百分比
    pieData.value = data.map(item => ({
      ...item,
      percentage: total > 0 ? Number(((item.value / total) * 100).toFixed(1)) : 0
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
  if (monthlyChartRef.value) {
    monthlyChartInstance.value = echarts.init(monthlyChartRef.value)
  }
}

// 更新所有图表
const updateCharts = () => {
  updateTrendChart()
  updateMonthlyChart()
  updatePieChart()
}

// 更新趋势图
const updateTrendChart = () => {
  if (!chartInstance.value) return

  const series: any[] = []
  
  // 检查是否有数据
  const hasData = months.value.length > 0 && Object.keys(monthlyData.value).length > 0
  
  if (hasData) {
    // 为每个类别创建月度变化趋势线
    Object.keys(categories).forEach((key, index) => {
      const categoryData = monthlyData.value[key]
      const categoryInfo = categories[key as keyof typeof categories]
      
      if (categoryData) {
        // 当期累计线
        series.push({
          name: `${categoryInfo.name}`,
          type: 'line',
          data: categoryData.currentTotal,
          smooth: true,
          connectNulls: false, // 不连接null值，让曲线在无数据处断开
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
      trigger: 'axis',
      formatter: function(params: any[]) {
        if (!hasData) return '暂无数据'
        let result = `${params[0].name}<br/>`
        params.forEach(param => {
          if (param.value === null) {
            result += `${param.seriesName}: 暂无数据<br/>`
          } else {
            result += `${param.seriesName}: ${formatNumber(param.value)} 万元<br/>`
          }
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

// 更新当月数据柱状图
const updateMonthlyChart = () => {
  if (!monthlyChartInstance.value) return

  const series: any[] = []

  // 检查是否有数据
  const hasData = months.value.length > 0 && Object.keys(monthlyCurrentData.value).length > 0

  if (hasData) {
    // 为每个类别创建并排柱状图
    Object.keys(categories).forEach((key, index) => {
      const categoryData = monthlyCurrentData.value[key]
      const categoryInfo = categories[key as keyof typeof categories]

      console.log(`处理类别 ${key}:`, categoryData) // 调试信息

      if (categoryData && categoryData.currentMonth) {
        console.log(`${categoryInfo.name} 数据:`, categoryData.currentMonth) // 调试信息
        series.push({
          name: `${categoryInfo.name}`,
          type: 'bar',
          data: categoryData.currentMonth,
          itemStyle: {
            color: categoryInfo.color
          },
          barWidth: '30%', // 设置柱子宽度
          emphasis: {
            focus: 'series'
          }
        })
      }
    })
    console.log('最终series数据:', series) // 调试信息
  }

  const option = {
    title: {
      text: `${selectedYear.value}年当月实际收入对比分析`,
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
        console.log('Tooltip params:', params) // 调试信息
        if (!params || params.length === 0) return '暂无数据'

        let result = `${params[0].name}<br/>`
        let total = 0

        // 计算总额
        params.forEach(param => {
          if (param.value !== null) {
            const value = Number(param.value || 0)
            total += value
            console.log(`${param.seriesName}: ${value}`) // 调试信息
          }
        })

        // 显示各部分数据和占比
        params.forEach(param => {
          const value = param.value === null ? 0 : Number(param.value || 0)
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'

          if (param.value === null) {
            result += `${param.seriesName}: 暂无数据<br/>`
          } else {
            result += `${param.seriesName}: ${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 万元 (${percentage}%)<br/>`
          }
        })

        // 显示总计
        if (total > 0) {
          result += `<br/>总计: ${total.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 万元`
        }

        return result
      }
    },
    legend: {
      top: 50,
      type: 'scroll',
      data: hasData ? Object.keys(categories).map(key => categories[key as keyof typeof categories].name) : []
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

  monthlyChartInstance.value.setOption(option, true)
}

// 更新饼图
const updatePieChart = () => {
  if (!pieChartInstance.value) return

  const hasData = pieData.value.length > 0

  const option = {
    title: {
      text: '收入结构占比',
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
        name: '收入结构占比',
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
  monthlyChartInstance.value?.resize()
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
  monthlyChartInstance.value?.dispose()
  pieChartInstance.value?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 组件样式 */
</style>