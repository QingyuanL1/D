<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">资产负债率分析</h1>
        <p class="text-gray-600 mt-2">资产负债率分析与趋势监控</p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h3 class="text-lg font-semibold text-gray-900">数据筛选</h3>
            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10V9a1 1 0 011-1h4a1 1 0 011 1v12M9 7h1m-1 4h1"></path>
              </svg>
              当前公司：{{ getSelectedCompanyName() }}
            </div>
          </div>
          <div class="flex items-center space-x-6">
            <div class="flex items-center space-x-3">
              <span class="text-sm text-gray-600">选择年份:</span>
              <select v-model="selectedYear" @change="fetchData"
                      class="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}年</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ getSelectedCompanyName() }} {{ selectedYear }}年资产负债率月度趋势</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">实际资产负债率</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">目标线</span>
            </div>
          </div>
        </div>
        <div class="h-[400px]" ref="chartRef"></div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">{{ getSelectedCompanyName() }}当前资产负债率概况</h3>
        <div class="grid grid-cols-1 gap-6">
          <div class="p-4 border border-gray-200 rounded-lg">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium text-gray-900">当前资产负债率</h4>
              <span class="text-2xl font-bold" :class="getRateColor(currentRate)">
                {{ formatNumber(currentRate) }}%
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                class="h-3 rounded-full transition-all duration-300" 
                :class="getRateBarColor(currentRate)"
                :style="`width: ${Math.min(Math.abs(currentRate / targetRate * 100), 100)}%`"
              ></div>
            </div>
            <p class="text-xs text-gray-600">
              目标: {{ targetRate }}%
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'

const selectedYear = ref(new Date().getFullYear().toString())
const selectedCompany = ref('main')
const availableYears = ref<string[]>([])
const availableCompanies = ref([
  { key: 'main', name: '电气公司', table: 'balance_sheet' },
  { key: 'nanhua', name: '南华公司', table: 'nanhua_balance_sheet' },
  { key: 'tuoyuan', name: '拓元公司', table: 'tuoyuan_balance_sheet' }
])
const loading = ref(true)

const initializeCompany = () => {
  const selectedCompanyName = localStorage.getItem('selectedCompany') || ''
  
  const companyMapping: { [key: string]: string } = {
    '常州拓源电气集团有限公司': 'tuoyuan',
    '上海南华兰陵电气有限公司': 'main',
    '上海南华兰陵实业有限公司': 'nanhua'
  }
  
  selectedCompany.value = companyMapping[selectedCompanyName] || 'main'
}

const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)

const targetRate = ref(74.00)
const currentRate = ref(0)
const months = ref<string[]>([])
const monthlyData = ref<number[]>([])



const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const getRateColor = (rate: number) => {
  if (rate <= 60) return 'text-green-600'
  if (rate <= 70) return 'text-blue-600'
  if (rate <= 80) return 'text-yellow-600'
  return 'text-red-600'
}

const getRateBarColor = (rate: number) => {
  if (rate <= 60) return 'bg-green-500'
  if (rate <= 70) return 'bg-blue-500'
  if (rate <= 80) return 'bg-yellow-500'
  return 'bg-red-500'
}



const getSelectedCompanyName = () => {
  const company = availableCompanies.value.find(c => c.key === selectedCompany.value)
  return company ? company.name : '电气公司'
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
    await fetchAssetLiabilityRatioData()
    updateChart()
  } catch (error) {
    console.error('获取数据失败:', error)
    setDefaultData()
  } finally {
    loading.value = false
  }
}

const fetchAssetLiabilityRatioData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/analytics/asset-liability-ratio/${selectedYear.value}?company=${selectedCompany.value}`)

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        if (result.data.hasData === false) {
          setDefaultData()
        } else {
          months.value = result.data.months || []
          monthlyData.value = result.data.monthlyData || []
          currentRate.value = result.data.currentRate || 0
          targetRate.value = result.data.targetRate || 74.00
        }
      } else {
        setDefaultData()
      }
    } else {
      setDefaultData()
    }
  } catch (error) {
    console.error('获取资产负债率数据失败:', error)
    setDefaultData()
  }
}

const setDefaultData = () => {
  months.value = []
  monthlyData.value = []
  currentRate.value = 0
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
        text: `${getSelectedCompanyName()}${selectedYear.value}年暂无资产负债率数据`,
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
          text: '请选择其他公司或年份查看数据',
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
      text: `${getSelectedCompanyName()}${selectedYear.value}年资产负债率趋势分析`,
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
        name: '实际资产负债率',
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
        name: '目标线',
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
  initializeCompany()
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