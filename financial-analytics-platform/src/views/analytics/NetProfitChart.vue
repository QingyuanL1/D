<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">净利润数据分析</h1>
        <p class="text-gray-600 mt-2">年度计划与当期累计对比分析</p>
      </div>

      <!-- 选择器区域 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h3 class="text-lg font-semibold text-gray-900">数据筛选</h3>
            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10V9a1 1 0 011-1h4a1 1 0 011 1v12M9 7h1m-1 4h1">
                </path>
              </svg>
              当前公司：{{ getSelectedCompanyName() }}
            </div>
          </div>
          <div class="flex items-center space-x-6">
            <!-- 年份选择器 -->
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

      <!-- 表一：利润总额指标进度条 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ getSelectedCompanyName() }}净利润指标</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ formatNumber(summary.yearlyPlan || 0) }} 万元</div>
            <div class="text-sm text-gray-600">年度计划</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ formatNumber(summary.currentTotal || 0) }} 万元</div>
            <div class="text-sm text-gray-600">当期累计</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold" :class="getCompletionRateColor(summary.completion_rate || 0)">{{
              summary.completion_rate || 0 }}%</div>
            <div class="text-sm text-gray-600">执行率</div>
          </div>
        </div>
        <div class="mt-4">
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-blue-600 h-3 rounded-full transition-all duration-500"
              :style="`width: ${Math.min(summary.completion_rate || 0, 100)}%`"></div>
          </div>
        </div>
      </div>

      <!-- 表二：月度趋势图表 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ getSelectedCompanyName() }}{{ selectedYear }}年月度趋势对比</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">月度变化趋势</span>
            </div>
          </div>
        </div>
        <div class="h-[500px]" ref="chartRef"></div>
      </div>

      <!-- 表三：标准利润表净利润曲线 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedYear }}年净利润月度趋势（标准利润表）</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">月度净利润</span>
            </div>
            <div class="text-sm text-gray-600">
              当月：{{ formatNumber(curveSummary.currentNetProfit || 0) }} 万元
            </div>
          </div>
        </div>
        <div class="h-[400px]" ref="curveChartRef"></div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const selectedYear = ref(new Date().getFullYear().toString())
const selectedCompany = ref('main')
const availableYears = ref<string[]>([])
const availableCompanies = ref([
  { key: 'main', name: '电气公司', table: 'income_statement' },
  { key: 'nanhua', name: '南华公司', table: 'nanhua_income_statement' },
  { key: 'tuoyuan', name: '拓源公司', table: 'tuoyuan_income_statement' }
])
const loading = ref(true)

// 根据登录公司初始化选择的公司
const initializeCompany = () => {
  const selectedCompanyName = localStorage.getItem('selectedCompany') || ''

  // 公司名称映射
  const companyMapping: { [key: string]: string } = {
    '常州拓源电气集团有限公司': 'tuoyuan',
    '上海南华兰陵电气有限公司': 'main',
    '上海南华兰陵实业有限公司': 'nanhua'
  }

  selectedCompany.value = companyMapping[selectedCompanyName] || 'main'
}

// 图表引用
const chartRef = ref<HTMLElement | null>(null)
const curveChartRef = ref<HTMLElement | null>(null)

// 图表实例
const chartInstance = ref<echarts.ECharts | null>(null)
const curveChartInstance = ref<echarts.ECharts | null>(null)

// 数据
const months = ref<string[]>([])
const monthlyData = ref<any>({})
const summary = ref<any>({
  yearlyPlan: 0,
  currentTotal: 0,
  completion_rate: 0,
  previousYearSame: 0,
  growth_rate: 0,
  growth_amount: 0
})

// 曲线图数据
const curveMonths = ref<string[]>([])
const curveData = ref<number[]>([])
const curveSummary = ref<any>({
  currentNetProfit: 0,
  monthlyGrowth: 0,
  totalMonths: 0
})
// 工具函数
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const getCompletionRateColor = (rate: number) => {
  if (rate >= 90) return 'text-green-600'
  if (rate >= 70) return 'text-blue-600'
  if (rate >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

// 获取选中公司名称
const getSelectedCompanyName = () => {
  const company = availableCompanies.value.find(c => c.key === selectedCompany.value)
  return company ? company.name : '电气公司'
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
    await Promise.all([
      fetchNetProfitData(),
      fetchNetProfitCurveData()
    ])
    updateTrendChart()
    updateCurveChart()
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
    previousYearSame: 0,
    growth_rate: 0,
    growth_amount: 0
  }
}

// 获取净利润数据
const fetchNetProfitData = async () => {
  try {
    console.log('Fetching net profit data for year:', selectedYear.value, 'company:', selectedCompany.value);
    const response = await fetch(`http://47.111.95.19:3000/analytics/net-profit/${selectedYear.value}?company=${selectedCompany.value}`);

    if (response.ok) {
      const result = await response.json();
      console.log('Net profit data response:', result);

      if (result.success && result.data) {
        months.value = result.data.months || [];
        monthlyData.value = result.data.monthlyData || {};
        summary.value = result.data.summary || {
          yearlyPlan: 0,
          currentTotal: 0,
          completion_rate: 0,
          previousYearSame: 0,
          growth_rate: 0,
          growth_amount: 0
        };
      } else {
        // 没有数据时重置为默认值
        resetDataToDefault()
      }
    } else {
      // 请求失败时重置为默认值
      resetDataToDefault()
    }
  } catch (error) {
    console.error('获取净利润数据失败:', error);
    // 出错时重置为默认值
    resetDataToDefault()
  }
}

// 获取净利润曲线数据（从标准利润表）
const fetchNetProfitCurveData = async () => {
  try {
    console.log('Fetching net profit curve data for year:', selectedYear.value);
    const response = await fetch(`http://47.111.95.19:3000/analytics/net-profit-curve/${selectedYear.value}`);

    if (response.ok) {
      const result = await response.json();
      console.log('Net profit curve data response:', result);

      if (result.success && result.data && result.data.hasData) {
        curveMonths.value = result.data.months || [];
        curveData.value = result.data.monthlyData || [];
        curveSummary.value = result.data.summary || {
          currentNetProfit: 0,
          monthlyGrowth: 0,
          totalMonths: 0
        };
      } else {
        // 没有数据时重置为默认值
        curveMonths.value = [];
        curveData.value = [];
        curveSummary.value = {
          currentNetProfit: 0,
          monthlyGrowth: 0,
          totalMonths: 0
        };
      }
    } else {
      // 请求失败时重置为默认值
      curveMonths.value = [];
      curveData.value = [];
      curveSummary.value = {
        currentNetProfit: 0,
        monthlyGrowth: 0,
        totalMonths: 0
      };
    }
  } catch (error) {
    console.error('获取净利润曲线数据失败:', error);
    // 出错时重置为默认值
    curveMonths.value = [];
    curveData.value = [];
    curveSummary.value = {
      currentNetProfit: 0,
      monthlyGrowth: 0,
      totalMonths: 0
    };
  }
}


// 初始化图表
const initCharts = () => {
  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }
  if (curveChartRef.value) {
    curveChartInstance.value = echarts.init(curveChartRef.value)
  }
}

// 更新趋势图
const updateTrendChart = () => {
  if (!chartInstance.value) return

  try {
    // 检查是否有数据
    const hasData = months.value.length > 0 && monthlyData.value && Object.keys(monthlyData.value).length > 0

    // 准备安全的数据
    const monthsData = hasData ? months.value : []
    const currentTotal = hasData && monthlyData.value.currentTotal ? monthlyData.value.currentTotal : []

    console.log('Chart data:', { monthsData, currentTotal, hasData });

    // 基本配置
    const option = {
      title: {
        text: `${selectedYear.value}年净利润趋势分析`,
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
        formatter: function (params: any[]) {
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
      series: hasData ? [
        {
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
        }
      ] : [],
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
    };

    chartInstance.value.setOption(option, true);
  } catch (error) {
    console.error('更新趋势图表失败:', error);
  }
}

// 更新净利润曲线图
const updateCurveChart = () => {
  if (!curveChartInstance.value) return

  try {
    // 检查是否有数据
    const hasData = curveMonths.value.length > 0 && curveData.value.length > 0

    console.log('Curve chart data:', { curveMonths: curveMonths.value, curveData: curveData.value, hasData });

    // 基本配置
    const option = {
      title: {
        text: `${selectedYear.value}年净利润月度趋势`,
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
        formatter: function (params: any[]) {
          if (!hasData) return '暂无数据'
          let result = `${params[0].name}<br/>`
          params.forEach(param => {
            result += `${param.seriesName}: ${formatNumber(param.value)} 万元<br/>`
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
        data: hasData ? curveMonths.value : [],
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
      series: hasData ? [
        {
          name: '月度净利润',
          type: 'line',
          data: curveData.value,
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
      ] : [],
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
    };

    curveChartInstance.value.setOption(option, true);
  } catch (error) {
    console.error('更新曲线图表失败:', error);
  }
}


// 处理窗口大小变化
const handleResize = () => {
  chartInstance.value?.resize()
  curveChartInstance.value?.resize()
}

onMounted(async () => {
  initializeCompany()
  initAvailableYears()
  initCharts()
  await fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance.value?.dispose()
  curveChartInstance.value?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 组件样式 */
</style>