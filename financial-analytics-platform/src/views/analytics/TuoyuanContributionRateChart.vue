<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">拓源公司边际贡献率月度趋势</h1>
        <p class="text-gray-600 mt-2">拓源公司主营业务边际贡献率月度趋势分析</p>
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

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年边际贡献率月度趋势</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">实际贡献率</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">计划目标线</span>
            </div>
          </div>
        </div>
        <div class="h-[400px]" ref="chartRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const selectedYear = ref(new Date().getFullYear().toString())
const availableYears = ref<string[]>([])
const loading = ref(true)

const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)

const targetRate = ref(21.98)
const months = ref<string[]>([])
const monthlyData = ref<number[]>([])

const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
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
    await fetchContributionRateData()
    updateChart()
  } catch (error) {
    console.error('获取数据失败:', error)
    setDefaultData()
  } finally {
    loading.value = false
  }
}

const fetchContributionRateData = async () => {
  try {
    const monthlyContributionRates = []
    const monthLabels = []
    
    for (let month = 1; month <= 12; month++) {
      const period = `${selectedYear.value}-${month.toString().padStart(2, '0')}`
      const response = await fetch(`http://127.0.0.1:3000/tuoyuan-main-business-contribution-rate/${period}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data && result.data.items) {
          let totalActual = 0
          let count = 0
          
          result.data.items.forEach((item: any) => {
            if (item.currentActual > 0) {
              totalActual += item.currentActual
              count++
            }
          })
          
          const averageRate = count > 0 ? totalActual / count : 0
          monthlyContributionRates.push(averageRate)
        } else {
          monthlyContributionRates.push(0)
        }
      } else {
        try {
          const calculateResponse = await fetch(`http://127.0.0.1:3000/tuoyuan-main-business-contribution-rate/calculate/${period}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          if (calculateResponse.ok) {
            const calculateResult = await calculateResponse.json()
            if (calculateResult.success && calculateResult.data && calculateResult.data.items) {
              let totalActual = 0
              let count = 0
              
              calculateResult.data.items.forEach((item: any) => {
                if (item.currentActual > 0) {
                  totalActual += item.currentActual
                  count++
                }
              })
              
              const averageRate = count > 0 ? totalActual / count : 0
              monthlyContributionRates.push(averageRate)
            } else {
              monthlyContributionRates.push(0)
            }
          } else {
            monthlyContributionRates.push(0)
          }
        } catch (calcError) {
          monthlyContributionRates.push(0)
        }
      }
      
      monthLabels.push(`${month}月`)
    }
    
    months.value = monthLabels
    monthlyData.value = monthlyContributionRates
  } catch (error) {
    console.error('获取边际贡献率数据失败:', error)
    setDefaultData()
  }
}

const setDefaultData = () => {
  months.value = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  monthlyData.value = Array(12).fill(0)
}

const initChart = () => {
  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }
}

const updateChart = () => {
  if (!chartInstance.value) return

  if (months.value.length === 0 || monthlyData.value.length === 0) {
    const option = {
      title: {
        text: `${selectedYear.value}年暂无边际贡献率数据`,
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
    chartInstance.value.setOption(option, true)
    return
  }

  const targetData = months.value.map(() => targetRate.value)

  const option = {
    title: {
      text: `${selectedYear.value}年拓源公司边际贡献率趋势分析`,
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
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '百分比(%)',
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
        formatter: function(value: number) {
          return formatNumber(value) + '%'
        },
        fontSize: 12
      }
    },
    series: [
      {
        name: '实际贡献率',
        type: 'line',
        data: monthlyData.value,
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
            { offset: 0, color: '#3B82F640' },
            { offset: 1, color: '#3B82F610' }
          ])
        }
      },
      {
        name: '计划目标线',
        type: 'line',
        data: targetData,
        lineStyle: {
          color: '#EF4444',
          width: 2,
          type: 'dashed'
        },
        itemStyle: {
          color: '#EF4444'
        },
        symbol: 'none'
      }
    ]
  }

  chartInstance.value.setOption(option, true)
}

const handleResize = () => {
  chartInstance.value?.resize()
}

onMounted(async () => {
  initAvailableYears()
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
</style> 