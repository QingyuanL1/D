<template>
  <div class="max-w-[1600px] mx-auto bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-6">
    <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
      <h1 class="text-xl font-bold text-gray-800">财务数据可视化</h1>
      <div class="flex items-center space-x-3">
        <span class="text-sm text-gray-600">选择年份:</span>
        <select v-model="selectedYear"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          @change="fetchData">
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}年</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
      <div class="bg-white p-4 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
        <div class="h-[350px]" ref="revenueChartRef"></div>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
        <div class="h-[350px]" ref="profitChartRef"></div>
        没事
      </div>
    </div>

    <div class="text-xs text-gray-500 text-center mt-2">
      <p>数据来源: 利润表 | 最后更新时间: {{ new Date().toLocaleDateString() }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

interface IncomeStatementItem {
  period: string;
  data: string | {
    main_business_revenue?: {
      current_amount: number | null;
      year_amount: number | null;
    };
    net_profit?: {
      current_amount: number | null;
      year_amount: number | null;
    };
  };
}

interface ChartDataType {
  periods: string[];
  mainBusinessRevenue: number[];
  netProfit: number[];
}

const revenueChartRef = ref<HTMLElement | null>(null)
const profitChartRef = ref<HTMLElement | null>(null)
const selectedYear = ref(new Date().getFullYear().toString())
const availableYears = ref<string[]>([])
const revenueChartInstance = ref<echarts.ECharts | null>(null)
const profitChartInstance = ref<echarts.ECharts | null>(null)
const chartData = ref<ChartDataType>({
  periods: [],
  mainBusinessRevenue: [],
  netProfit: []
})

const initCharts = () => {
  initRevenueChart()
  initProfitChart()
}

const initRevenueChart = () => {
  if (!revenueChartRef.value) return

  revenueChartInstance.value = echarts.init(revenueChartRef.value)

  const option = {
    title: {
      text: '主营收入趋势',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
      },
      left: 'center',
      top: 5,
      subtext: selectedYear.value + '年',
      subtextStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 12
      },
      formatter: function (params: any[]) {
        const value = params[0].value;
        return `<div class="font-semibold text-xs">${params[0].name}</div>
                <div class="flex items-center mt-1">
                  <span style="display:inline-block;margin-right:5px;border-radius:50%;width:8px;height:8px;background-color:${params[0].color};"></span>
                  <span>${params[0].seriesName}: ${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 元</span>
                </div>`;
      },
      extraCssText: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-radius: 4px; padding: 8px;'
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
      data: chartData.value.periods,
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 10,
        color: '#555',
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      axisTick: {
        alignWithLabel: true,
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: '万元',
      nameTextStyle: {
        padding: [0, 0, 0, 0],
        color: '#666',
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: 10
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f5f5f5',
          type: 'dashed'
        }
      },
      axisLabel: {
        formatter: function (value: number) {
          return value > 0 ? value.toLocaleString('zh-CN', { maximumFractionDigits: 0 }) : 0;
        },
        fontSize: 10,
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
      }
    },
    series: [
      {
        name: '主营收入',
        type: 'bar',
        data: chartData.value.mainBusinessRevenue,
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#5470c6' },
              { offset: 0.7, color: '#1062d0' },
              { offset: 1, color: '#0d55b0' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            formatter: function (params: { value: number }) {
              return params.value.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
            },
            fontSize: 10
          }
        },
        label: {
          show: false,
          position: 'top',
          formatter: function (params: { value: number }) {
            return params.value.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
          },
          fontSize: 10,
          fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
          color: '#666',
          distance: 4
        },
        animation: true,
        animationDuration: 1200,
        animationEasing: 'elasticOut'
      }
    ],
    animation: true
  }

  revenueChartInstance.value.setOption(option)
}

const initProfitChart = () => {
  if (!profitChartRef.value) return

  profitChartInstance.value = echarts.init(profitChartRef.value)

  const option = {
    title: {
      text: '净利润趋势',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
      },
      left: 'center',
      top: 5,
      subtext: selectedYear.value + '年',
      subtextStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 12
      },
      formatter: function (params: any[]) {
        const value = params[0].value;
        return `<div class="font-semibold text-xs">${params[0].name}</div>
                <div class="flex items-center mt-1">
                  <span style="display:inline-block;margin-right:5px;border-radius:50%;width:8px;height:8px;background-color:${params[0].color};"></span>
                  <span>${params[0].seriesName}: ${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 元</span>
                </div>`;
      },
      extraCssText: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-radius: 4px; padding: 8px;'
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
      data: chartData.value.periods,
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 10,
        color: '#555',
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      axisTick: {
        alignWithLabel: true,
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: '万元',
      nameTextStyle: {
        padding: [0, 0, 0, 0],
        color: '#666',
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: 10
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f5f5f5',
          type: 'dashed'
        }
      },
      axisLabel: {
        formatter: function (value: number) {
          return value > 0 ? value.toLocaleString('zh-CN', { maximumFractionDigits: 0 }) : 0;
        },
        fontSize: 10,
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
      }
    },
    series: [
      {
        name: '净利润',
        type: 'bar',
        data: chartData.value.netProfit,
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#91cc75' },
            { offset: 0.5, color: '#4ca636' },
            { offset: 1, color: '#4ca636' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#79bb5e' },
              { offset: 0.7, color: '#3d8a29' },
              { offset: 1, color: '#2f7016' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            formatter: function (params: { value: number }) {
              return params.value.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
            },
            fontSize: 10
          }
        },
        label: {
          show: false,
          position: 'top',
          formatter: function (params: { value: number }) {
            return params.value.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
          },
          fontSize: 10,
          fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
          color: '#666',
          distance: 4
        },
        animation: true,
        animationDuration: 1200,
        animationEasing: 'elasticOut'
      }
    ],
    animation: true
  }

  profitChartInstance.value.setOption(option)
}

const updateCharts = () => {
  if (revenueChartInstance.value) {
    revenueChartInstance.value.setOption({
      xAxis: {
        data: chartData.value.periods
      },
      series: [
        {
          data: chartData.value.mainBusinessRevenue
        }
      ]
    })
  }

  if (profitChartInstance.value) {
    profitChartInstance.value.setOption({
      xAxis: {
        data: chartData.value.periods
      },
      series: [
        {
          data: chartData.value.netProfit
        }
      ]
    })
  }
}

const fetchData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/income-statement/annual/${selectedYear.value}`)
    if (!response.ok) {
      throw new Error('获取数据失败')
    }

    const result = await response.json()

    const periods: string[] = []
    const mainBusinessRevenue: number[] = []
    const netProfit: number[] = []

    if (result.data && Array.isArray(result.data)) {
      result.data.forEach((item: IncomeStatementItem) => {
        // 从period中提取月份
        const month = item.period.split('-')[1]
        periods.push(`${month}月`)

        // 解析JSON字符串中的数据
        const itemData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data

        // 提取主营收入和净利润数据
        mainBusinessRevenue.push(itemData.main_business_revenue?.current_amount || 0)
        netProfit.push(itemData.net_profit?.current_amount || 0)
      })
    }

    chartData.value.periods = periods
    chartData.value.mainBusinessRevenue = mainBusinessRevenue
    chartData.value.netProfit = netProfit

    updateCharts()

    // 更新可选年份列表
    if (result.year && !availableYears.value.includes(result.year)) {
      availableYears.value.push(result.year)
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

// 获取可用年份列表
const fetchAvailableYears = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const years: string[] = []

    // 默认提供近5年选项
    for (let i = 0; i < 5; i++) {
      years.push((currentYear - i).toString())
    }

    availableYears.value = years
  } catch (error) {
    console.error('获取年份列表失败:', error)
  }
}

onMounted(async () => {
  await fetchAvailableYears()
  await fetchData()
  initCharts()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (revenueChartInstance.value) {
    revenueChartInstance.value.dispose()
  }

  if (profitChartInstance.value) {
    profitChartInstance.value.dispose()
  }

  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (revenueChartInstance.value) {
    revenueChartInstance.value.resize()
  }

  if (profitChartInstance.value) {
    profitChartInstance.value.resize()
  }
}
</script>