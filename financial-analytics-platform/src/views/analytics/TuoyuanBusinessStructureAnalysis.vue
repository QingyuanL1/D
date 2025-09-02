<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">拓源营业结构分析</h1>
        <p class="text-gray-600 mt-2">主营业务与非主营业务当期收入趋势</p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">数据年份选择</h3>
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-600">选择年份:</span>
            <select v-model="selectedYear" @change="fetchYearData"
              class="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}年</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年当期收入趋势对比</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">设备板块</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">其他板块</span>
            </div>
          </div>
        </div>
        <div class="h-[500px]" ref="chartRef"></div>
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

const months = ref<string[]>([])
const equipmentData = ref<number[]>([])
const otherData = ref<number[]>([])

const initAvailableYears = () => {
  const currentYear = new Date().getFullYear()
  const years: string[] = []
  for (let i = 0; i < 5; i++) {
    years.push((currentYear - i).toString())
  }
  availableYears.value = years
}

const fetchYearData = async () => {
  try {
    loading.value = true
    months.value = []
    equipmentData.value = []
    otherData.value = []

    for (let month = 1; month <= 12; month++) {
      const period = `${selectedYear.value}-${month.toString().padStart(2, '0')}`

      try {
        const response = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-income-breakdown/${period}`)

        if (response.ok) {
          const result = await response.json()

          months.value.push(`${month}月`)

          let equipmentTotal = 0
          let otherTotal = 0

          if (result.success && result.data && result.data.items) {
            result.data.items.forEach((item: any) => {
              if (item.segmentAttribute === '设备') {
                equipmentTotal += item.currentPeriod || 0
              } else if (item.segmentAttribute === '其他') {
                otherTotal += item.currentPeriod || 0
              }
            })
          }

          equipmentData.value.push(equipmentTotal)
          otherData.value.push(otherTotal)
        } else {
          months.value.push(`${month}月`)
          equipmentData.value.push(0)
          otherData.value.push(0)
        }
      } catch (error) {
        console.error(`获取${period}数据失败:`, error)
        if (months.value.length === month - 1) {
          months.value.push(`${month}月`)
          equipmentData.value.push(0)
          otherData.value.push(0)
        }
      }
    }

    updateChart()
  } catch (error) {
    console.error('获取年度数据失败:', error)
  } finally {
    loading.value = false
  }
}

const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const initChart = () => {
  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }
}

const updateChart = () => {
  if (!chartInstance.value) return

  const option = {
    title: {
      text: `${selectedYear.value}年拓源营业收入结构趋势`,
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
      formatter: function (params: any[]) {
        let result = `${params[0].name}<br/>`
        let total = 0

        params.forEach(param => {
          const value = Number(param.value || 0)
          total += value
          result += `${param.seriesName}: ${formatNumber(value)} 万元<br/>`
        })

        result += `<br/>总计: ${formatNumber(total)} 万元`
        return result
      }
    },
    legend: {
      top: 50,
      data: ['设备板块', '其他板块']
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
      data: months.value,
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
    series: [
      {
        name: '设备板块',
        type: 'line',
        data: equipmentData.value,
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
        name: '其他板块',
        type: 'line',
        data: otherData.value,
        smooth: true,
        lineStyle: {
          color: '#10B981',
          width: 3
        },
        itemStyle: {
          color: '#10B981'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#10B98140' },
            { offset: 1, color: '#10B98110' }
          ])
        }
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
  await fetchYearData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance.value?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped></style>