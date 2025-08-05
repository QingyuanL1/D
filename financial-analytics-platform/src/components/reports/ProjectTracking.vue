<template>
  <div class="mb-6">
    <h4 class="text-lg font-semibold mb-3">项目跟踪情况：(单位：万元)</h4>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr class="bg-gray-50">
            <th class="border border-gray-300 px-4 py-2 text-center font-semibold">板块</th>
            <th class="border border-gray-300 px-4 py-2 text-center font-semibold">客户属性</th>
            <th class="border border-gray-300 px-4 py-2 text-center font-semibold">年度计划</th>
            <th class="border border-gray-300 px-4 py-2 text-center font-semibold">当期</th>
            <th class="border border-gray-300 px-4 py-2 text-center font-semibold">当期累计</th>
            <th class="border border-gray-300 px-4 py-2 text-center font-semibold">执行进度</th>
          </tr>
        </thead>
        <tbody>
          <!-- 设备板块 -->
          <template v-for="(item, index) in equipmentData" :key="`equipment-${index}`">
            <tr>
              <td
                v-if="index === 0"
                :rowspan="equipmentData.length"
                class="border border-gray-300 px-4 py-2 text-center font-medium bg-blue-50"
              >
                设备
              </td>
              <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
              <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                {{ formatNumber(item.yearlyPlan) }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right">
                {{ formatNumber(item.currentPeriod) }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                {{ formatNumber(item.currentTotal || item.currentPeriod) }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right">
                {{ calculateProgress(item.currentTotal || item.currentPeriod, item.yearlyPlan) }}
              </td>
            </tr>
          </template>

          <!-- 元件板块 -->
          <template v-for="(item, index) in componentData" :key="`component-${index}`">
            <tr>
              <td
                v-if="index === 0"
                :rowspan="componentData.length"
                class="border border-gray-300 px-4 py-2 text-center font-medium bg-green-50"
              >
                元件
              </td>
              <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
              <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                {{ formatNumber(item.yearlyPlan) }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right">
                {{ formatNumber(item.currentPeriod) }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                {{ formatNumber(item.currentTotal || item.currentPeriod) }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right">
                {{ calculateProgress(item.currentTotal || item.currentPeriod, item.yearlyPlan) }}
              </td>
            </tr>
          </template>

          <!-- 工程板块 -->
          <template v-for="(item, index) in engineeringData" :key="`engineering-${index}`">
            <tr>
              <td
                v-if="index === 0"
                :rowspan="engineeringData.length"
                class="border border-gray-300 px-4 py-2 text-center font-medium bg-yellow-50"
              >
                工程
              </td>
              <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
              <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                {{ formatNumber(item.yearlyPlan) }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right">
                {{ formatNumber(item.currentPeriod) }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                {{ formatNumber(item.currentTotal || item.currentPeriod) }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right">
                {{ calculateProgress(item.currentTotal || item.currentPeriod, item.yearlyPlan) }}
              </td>
            </tr>
          </template>

          <!-- 合计行 -->
          <tr class="bg-gray-50 font-bold">
            <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
            <td class="border border-gray-300 px-4 py-2 text-right">
              {{ formatNumber(totalYearlyPlan) }}
            </td>
            <td class="border border-gray-300 px-4 py-2 text-right">
              {{ formatNumber(totalCurrentPeriod) }}
            </td>
            <td class="border border-gray-300 px-4 py-2 text-right">
              {{ formatNumber(totalCurrentTotal) }}
            </td>
            <td class="border border-gray-300 px-4 py-2 text-right">
              {{ calculateProgress(totalCurrentTotal, totalYearlyPlan) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      equipment: [],
      component: [],
      engineering: []
    })
  }
})

// 从 props 中获取数据
const equipmentData = computed(() => props.data.equipment || [])
const componentData = computed(() => props.data.component || [])
const engineeringData = computed(() => props.data.engineering || [])

// 计算总计
const totalYearlyPlan = computed(() => {
  return [...equipmentData.value, ...componentData.value, ...engineeringData.value]
    .reduce((sum, item) => sum + (item.yearlyPlan || 0), 0)
})

const totalCurrentPeriod = computed(() => {
  return [...equipmentData.value, ...componentData.value, ...engineeringData.value]
    .reduce((sum, item) => sum + (item.currentPeriod || 0), 0)
})

const totalCurrentTotal = computed(() => {
  return [...equipmentData.value, ...componentData.value, ...engineeringData.value]
    .reduce((sum, item) => sum + (item.currentTotal || item.currentPeriod || 0), 0)
})

// 计算执行进度
const calculateProgress = (current, plan) => {
  if (!plan || plan === 0) return '0.00%'
  const percentage = (current / plan) * 100
  return `${percentage.toFixed(2)}%`
}

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>
