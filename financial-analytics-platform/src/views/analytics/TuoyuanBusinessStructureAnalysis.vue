<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">拓源营业结构分析</h1>
        <p class="text-gray-600 mt-2">主营业务收入分解与占比分析</p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">数据期间选择</h3>
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-600">选择期间:</span>
            <input v-model="selectedPeriod" @change="fetchData" type="month"
                   class="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">年度计划</h3>
          <div class="text-3xl font-bold text-blue-600">{{ formatNumber(summary.annualPlan) }}</div>
          <div class="text-sm text-gray-500">万元</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">当期累计</h3>
          <div class="text-3xl font-bold text-green-600">{{ formatNumber(summary.currentCumulative) }}</div>
          <div class="text-sm text-gray-500">万元</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">执行进度</h3>
          <div class="text-3xl font-bold" :class="getProgressColor(summary.executionProgress)">
            {{ formatPercentage(summary.executionProgress) }}%
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500" 
                 :style="`width: ${Math.min(summary.executionProgress || 0, 100)}%`"></div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">收入结构分析</h3>
          <div class="text-xs text-gray-500">当期 = 当年订单转收入 + 存量订单转收入</div>
        </div>
        <div class="h-[500px]" ref="structureChartRef"></div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">营业收入结构占比</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="h-[350px]" ref="pieChartRef"></div>
          <div class="space-y-4">
            <h4 class="text-md font-medium text-gray-800">板块占比详情</h4>
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

      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">详细数据表格</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th class="border border-gray-300 px-4 py-2">板块</th>
                <th class="border border-gray-300 px-4 py-2">客户属性</th>
                <th class="border border-gray-300 px-4 py-2">年度计划</th>
                <th class="border border-gray-300 px-4 py-2">当期</th>
                <th class="border border-gray-300 px-4 py-2">当期累计</th>
                <th class="border border-gray-300 px-4 py-2">执行进度</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(item, index) in businessData.items" :key="index">
                <tr class="hover:bg-gray-50">
                  <td v-if="isFirstInSegment(index)" 
                      :rowspan="getSegmentRowspan(item.segmentAttribute)" 
                      class="border border-gray-300 px-4 py-2 font-medium text-center bg-blue-50">
                    {{ item.segmentAttribute }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2">{{ item.customerAttribute }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.annualPlan) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="text-blue-600 font-medium">{{ formatNumber(item.currentPeriod) }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentCumulative) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="font-medium" :class="getProgressColor(item.executionProgress)">
                      {{ formatPercentage(item.executionProgress) }}%
                    </span>
                  </td>
                </tr>
              </template>
              <tr class="bg-gray-100 font-bold">
                <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(summary.annualPlan) }}</td>
                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(summary.currentPeriod) }}</td>
                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(summary.currentCumulative) }}</td>
                <td class="border border-gray-300 px-4 py-2 text-right">
                  <span class="font-bold" :class="getProgressColor(summary.executionProgress)">
                    {{ formatPercentage(summary.executionProgress) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="orderToIncomeData" class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">当年订单转收入明细</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead class="bg-blue-50">
              <tr>
                <th class="border border-gray-300 px-4 py-2">板块</th>
                <th class="border border-gray-300 px-4 py-2">客户属性</th>
                <th class="border border-gray-300 px-4 py-2">当年新订单累计</th>
                <th class="border border-gray-300 px-4 py-2">当期转收入</th>
                <th class="border border-gray-300 px-4 py-2">当期转收入累计</th>
                <th class="border border-gray-300 px-4 py-2">订单转收入率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in orderToIncomeData.items" :key="index" class="hover:bg-gray-50">
                <td class="border border-gray-300 px-4 py-2">{{ item.segmentAttribute }}</td>
                <td class="border border-gray-300 px-4 py-2">{{ item.customerAttribute }}</td>
                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.annualNewOrderCumulative) }}</td>
                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentPeriodIncome) }}</td>
                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentPeriodIncomeCumulative) }}</td>
                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatPercentage(item.orderToIncomeRatio) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="stockOrderData" class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">存量订单转收入明细</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead class="bg-green-50">
              <tr>
                <th class="border border-gray-300 px-4 py-2">板块</th>
                <th class="border border-gray-300 px-4 py-2">客户属性</th>
                <th class="border border-gray-300 px-4 py-2">期初存量订单余额</th>
                <th class="border border-gray-300 px-4 py-2">当期转收入</th>
                <th class="border border-gray-300 px-4 py-2">当期转收入累计</th>
                <th class="border border-gray-300 px-4 py-2">存量订单转收入率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in stockOrderData.items" :key="index" class="hover:bg-gray-50">
                <td class="border border-gray-300 px-4 py-2">{{ item.segmentAttribute }}</td>
                <td class="border border-gray-300 px-4 py-2">{{ item.customerAttribute }}</td>
                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.initialStockOrderBalance) }}</td>
                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentPeriodIncome) }}</td>
                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentIncomeCumulative) }}</td>
                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatPercentage(item.stockOrderIncomeRatio) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'

const selectedPeriod = ref(new Date().toISOString().substring(0, 7))
const loading = ref(true)

const structureChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)

const structureChartInstance = ref<echarts.ECharts | null>(null)
const pieChartInstance = ref<echarts.ECharts | null>(null)

const businessData = ref<any>({ items: [] })
const orderToIncomeData = ref<any>(null)
const stockOrderData = ref<any>(null)

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

const summary = computed(() => {
  const items = businessData.value.items || []
  return {
    annualPlan: items.reduce((sum: number, item: any) => sum + (item.annualPlan || 0), 0),
    currentPeriod: items.reduce((sum: number, item: any) => sum + (item.currentPeriod || 0), 0),
    currentCumulative: items.reduce((sum: number, item: any) => sum + (item.currentCumulative || 0), 0),
    executionProgress: items.length > 0 ? 
      (items.reduce((sum: number, item: any) => sum + (item.currentCumulative || 0), 0) / 
       items.reduce((sum: number, item: any) => sum + (item.annualPlan || 0), 0)) * 100 : 0
  }
})

const pieData = computed(() => {
  const segmentTotals: { [key: string]: number } = {}
  
  businessData.value.items?.forEach((item: any) => {
    if (!segmentTotals[item.segmentAttribute]) {
      segmentTotals[item.segmentAttribute] = 0
    }
    segmentTotals[item.segmentAttribute] += item.currentCumulative || 0
  })
  
  const total = Object.values(segmentTotals).reduce((sum: number, value: number) => sum + value, 0)
  
  return Object.entries(segmentTotals).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0
  }))
})

const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const formatPercentage = (num: number) => {
  return Number(num || 0).toFixed(1)
}

const getColor = (index: number) => {
  return colors[index % colors.length]
}

const getProgressColor = (rate: number) => {
  if (rate >= 90) return 'text-green-600'
  if (rate >= 70) return 'text-blue-600'
  if (rate >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

const isFirstInSegment = (index: number) => {
  if (index === 0) return true
  const items = businessData.value.items || []
  return items[index].segmentAttribute !== items[index - 1].segmentAttribute
}

const getSegmentRowspan = (segmentAttribute: string) => {
  const items = businessData.value.items || []
  return items.filter((item: any) => item.segmentAttribute === segmentAttribute).length
}

const fetchData = async () => {
  try {
    loading.value = true
    const response = await fetch(`http://127.0.0.1:3000/tuoyuan-main-business-income-breakdown/${selectedPeriod.value}`)
    
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        businessData.value = result.data
        orderToIncomeData.value = result.orderToIncomeData
        stockOrderData.value = result.stockOrderData
        updateCharts()
      }
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

const initCharts = () => {
  if (structureChartRef.value) {
    structureChartInstance.value = echarts.init(structureChartRef.value)
  }
  if (pieChartRef.value) {
    pieChartInstance.value = echarts.init(pieChartRef.value)
  }
}

const updateCharts = () => {
  updateStructureChart()
  updatePieChart()
}

const updateStructureChart = () => {
  if (!structureChartInstance.value) return

  const items = businessData.value.items || []
  const categories = [...new Set(items.map((item: any) => item.customerAttribute))]
  const segments = [...new Set(items.map((item: any) => item.segmentAttribute))]

  const series = segments.map((segment, index) => {
    const data = categories.map(category => {
      const item = items.find((item: any) => 
        item.segmentAttribute === segment && item.customerAttribute === category
      )
      return item ? item.currentCumulative || 0 : 0
    })

    return {
      name: segment,
      type: 'bar',
      data: data,
      itemStyle: {
        color: getColor(index)
      }
    }
  })

  const option = {
    title: {
      text: '营业收入结构分析',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151'
      },
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any[]) {
        let result = `${params[0].name}<br/>`
        let total = 0
        params.forEach(param => {
          total += param.value
        })
        params.forEach(param => {
          const percentage = total > 0 ? ((param.value / total) * 100).toFixed(1) : '0.0'
          result += `${param.seriesName}: ${formatNumber(param.value)} 万元 (${percentage}%)<br/>`
        })
        result += `<br/>总计: ${formatNumber(total)} 万元`
        return result
      }
    },
    legend: {
      top: 40,
      data: segments
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        fontSize: 12,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '万元',
      axisLabel: {
        formatter: function(value: number) {
          return formatNumber(value)
        }
      }
    },
    series: series
  }

  structureChartInstance.value.setOption(option, true)
}

const updatePieChart = () => {
  if (!pieChartInstance.value) return

  const hasData = pieData.value.length > 0

  const option = {
    title: {
      text: '板块收入占比',
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
        return `${params.name}<br/>数值: ${formatNumber(params.value)} 万元<br/>占比: ${params.percent}%`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
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
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: hasData ? pieData.value.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: getColor(index)
          }
        })) : []
      }
    ]
  }

  pieChartInstance.value.setOption(option, true)
}

const handleResize = () => {
  structureChartInstance.value?.resize()
  pieChartInstance.value?.resize()
}

onMounted(async () => {
  initCharts()
  await fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  structureChartInstance.value?.dispose()
  pieChartInstance.value?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
</style> 