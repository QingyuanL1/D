<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">南华营业收入结构分析</h1>
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
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">主营业务收入</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">年度计划:</span>
              <span class="font-medium text-blue-600">{{ formatNumber(summary.yearlyPlan || 0) }} 万元</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">当期累计:</span>
              <span class="font-medium text-green-600">{{ formatNumber(summary.currentTotal || 0) }} 万元</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">执行率:</span>
              <span class="font-medium" :class="getCompletionRateColor(summary.completion_rate || 0)">
                {{ summary.completion_rate || 0 }}%
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500 bg-blue-600"
                   :style="`width: ${Math.min(summary.completion_rate || 0, 100)}%`"></div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">数据统计</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">客户数量:</span>
              <span class="font-medium text-gray-900">{{ customerCount }} 个</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">最后更新:</span>
              <span class="font-medium text-gray-600 text-sm">{{ lastUpdated }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">数据来源:</span>
              <span class="font-medium text-gray-600 text-sm">订单转收入</span>
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

      <!-- 当期收入柱状图 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年各客户当期收入对比分析</h3>
          <div class="flex items-center space-x-6">
            <div class="text-xs text-gray-500">
              当期收入 = 当月订单转收入 + 存量订单转收入
            </div>
            <div class="text-xs text-gray-500">
              鼠标悬停查看详细数据和占比
            </div>
          </div>
        </div>
        <div class="h-[500px]" ref="monthlyChartRef"></div>
      </div>

      <!-- 客户分类占比图表 -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">{{ selectedYear }}年客户收入结构占比分析</h3>
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
const monthlyChartRef = ref<HTMLElement | null>(null)

// 图表实例
const chartInstance = ref<echarts.ECharts | null>(null)
const pieChartInstance = ref<echarts.ECharts | null>(null)
const monthlyChartInstance = ref<echarts.ECharts | null>(null)

// 数据
const months = ref<string[]>([])
const monthlyData = ref<any>({})
const businessIncomeData = ref<any>({})
const pieData = ref<any[]>([])

// 颜色配置 - 使用更多颜色支持南华的客户类型
const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#EC4899']

// 计算汇总数据
const summary = computed(() => {
  if (!businessIncomeData.value.customers) {
    return { yearlyPlan: 0, currentTotal: 0, completion_rate: 0 }
  }
  
  const totalYearlyPlan = businessIncomeData.value.customers.reduce((sum: number, item: any) => sum + (item.yearlyPlan || 0), 0)
  const totalCurrent = businessIncomeData.value.customers.reduce((sum: number, item: any) => sum + (item.accumulated || 0), 0)
  const completionRate = totalYearlyPlan > 0 ? Math.round((totalCurrent / totalYearlyPlan) * 100) : 0
  
  return {
    yearlyPlan: totalYearlyPlan,
    currentTotal: totalCurrent,
    completion_rate: completionRate
  }
})

// 客户数量
const customerCount = computed(() => {
  return businessIncomeData.value.customers ? businessIncomeData.value.customers.length : 0
})

// 最后更新时间
const lastUpdated = computed(() => {
  return new Date().toLocaleString('zh-CN')
})

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
    await fetchBusinessIncomeData()
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
  businessIncomeData.value = {}
  pieData.value = []
}

// 获取南华营业收入数据
const fetchBusinessIncomeData = async () => {
  try {
    months.value = []
    monthlyData.value = {}
    
    for (let month = 1; month <= 12; month++) {
      const period = `${selectedYear.value}-${month.toString().padStart(2, '0')}`
      const response = await fetch(`http://127.0.0.1:3000/nanhua-business-income/${period}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          months.value.push(`${month}月`)
          
          if (!monthlyData.value.customers) {
            monthlyData.value.customers = {}
            businessIncomeData.value = result.data
          }
          
          // 为每个客户创建月度数据数组
          result.data.customers.forEach((customer: any) => {
            if (!monthlyData.value.customers[customer.customerName]) {
              monthlyData.value.customers[customer.customerName] = {
                accumulated: new Array(12).fill(0),
                current: new Array(12).fill(0)
              }
            }
            // 累计收入用于趋势线
            monthlyData.value.customers[customer.customerName].accumulated[month - 1] = customer.accumulated || 0
            // 当期收入用于柱状图分析
            monthlyData.value.customers[customer.customerName].current[month - 1] = customer.current || 0
          })
        }
      }
    }
    
    // 如果没有数据，重置为默认值
    if (months.value.length === 0) {
      resetDataToDefault()
    }
  } catch (error) {
    console.error('获取南华营业收入数据失败:', error)
    resetDataToDefault()
  }
}



// 获取饼图数据
const fetchPieData = async () => {
  try {
    const data: any[] = []
    let total = 0
    
    if (businessIncomeData.value.customers) {
      businessIncomeData.value.customers.forEach((customer: any) => {
        if (customer.accumulated > 0) {
          data.push({
            name: customer.customerName,
            value: customer.accumulated
          })
          total += customer.accumulated
        }
      })
    }
    
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
  const hasData = months.value.length > 0 && Object.keys(monthlyData.value).length > 0
  
  if (hasData && monthlyData.value.customers) {
    // 为每个客户创建累计趋势线（只显示前6个主要客户）
    const sortedCustomers = Object.keys(monthlyData.value.customers)
      .map(customerName => ({
        name: customerName,
        data: monthlyData.value.customers[customerName].accumulated,
        totalValue: monthlyData.value.customers[customerName].accumulated.reduce((sum: number, val: number) => sum + val, 0)
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 6)
    
    sortedCustomers.forEach((customer, index) => {
      series.push({
        name: customer.name,
        type: 'line',
        data: customer.data,
        smooth: true,
        connectNulls: false,
        lineStyle: {
          color: getColor(index),
          width: 3
        },
        itemStyle: {
          color: getColor(index)
        }
      })
    })
  }

  const option = {
    title: {
      text: `${selectedYear.value}年南华营业收入趋势分析`,
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
  const hasData = months.value.length > 0 && Object.keys(monthlyData.value).length > 0

  if (hasData && monthlyData.value.customers) {
    // 为每个客户创建并排柱状图，使用当期收入数据（只显示前6个主要客户）
    const sortedCustomers = Object.keys(monthlyData.value.customers)
      .map(customerName => ({
        name: customerName,
        data: monthlyData.value.customers[customerName].current, // 使用当期收入数据
        totalValue: monthlyData.value.customers[customerName].current.reduce((sum: number, val: number) => sum + val, 0)
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 6)

    sortedCustomers.forEach((customer, index) => {
      series.push({
        name: customer.name,
        type: 'bar',
        data: customer.data,
        itemStyle: {
          color: getColor(index)
        },
        barWidth: '10%',
        emphasis: {
          focus: 'series'
        }
      })
    })
  }

  const option = {
    title: {
      text: `${selectedYear.value}年南华各客户当期收入对比分析`,
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
        if (!params || params.length === 0) return '暂无数据'

        let result = `${params[0].name}<br/>`
        let total = 0

        params.forEach(param => {
          if (param.value !== null) {
            const value = Number(param.value || 0)
            total += value
          }
        })

        params.forEach(param => {
          const value = param.value === null ? 0 : Number(param.value || 0)
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'

          if (param.value === null) {
            result += `${param.seriesName}: 暂无数据<br/>`
          } else {
            result += `${param.seriesName}: ${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 万元 (${percentage}%)<br/>`
          }
        })

        if (total > 0) {
          result += `<br/>总计: ${total.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 万元`
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

  monthlyChartInstance.value.setOption(option, true)
}

// 更新饼图
const updatePieChart = () => {
  if (!pieChartInstance.value) return

  const hasData = pieData.value.length > 0

  const option = {
    title: {
      text: '客户收入结构占比',
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
        name: '客户收入结构占比',
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