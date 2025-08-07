<template>
  <div class="bg-gray-50 p-4 rounded">
    <h4 class="font-semibold mb-2">{{ title }}</h4>
    <p class="text-sm" v-if="type === 'basic'">
      年度计划为 {{ formatNumber(data.yearlyPlan) }} 万元；当期累计为 {{ formatNumber(data.cumulative) }} 万元，计划完成率为 {{ data.completionRate }}%
    </p>
    <div class="text-sm" v-else-if="type === 'new-orders'">
      <p class="mb-2">
        年度计划为 {{ formatNumber(data.yearlyPlan) }} 万元；累计新签为 {{ formatNumber(data.cumulative) }} 万元；当月新增为 {{ formatNumber(data.currentPeriod) }} 万元，计划完成率为 {{ data.completionRate }}%
      </p>
      <div class="grid grid-cols-3 gap-2 mt-2 text-xs">
        <div class="bg-blue-50 p-2 rounded">
          <div class="font-medium text-blue-700">设备类</div>
          <div>计划: {{ formatNumber(data.categories?.equipment?.yearlyPlan || 0) }}</div>
          <div>累计: {{ formatNumber(data.categories?.equipment?.cumulative || 0) }}</div>
          <div>当月: {{ formatNumber(data.categories?.equipment?.currentPeriod || 0) }}</div>
          <div class="text-xs text-blue-600 mt-1">完成率: {{ data.categories?.equipment?.completionRate || 0 }}%</div>
        </div>
        <div class="bg-green-50 p-2 rounded">
          <div class="font-medium text-green-700">元件类</div>
          <div>计划: {{ formatNumber(data.categories?.components?.yearlyPlan || 0) }}</div>
          <div>累计: {{ formatNumber(data.categories?.components?.cumulative || 0) }}</div>
          <div>当月: {{ formatNumber(data.categories?.components?.currentPeriod || 0) }}</div>
          <div class="text-xs text-green-600 mt-1">完成率: {{ data.categories?.components?.completionRate || 0 }}%</div>
        </div>
        <div class="bg-purple-50 p-2 rounded">
          <div class="font-medium text-purple-700">工程类</div>
          <div>计划: {{ formatNumber(data.categories?.engineering?.yearlyPlan || 0) }}</div>
          <div>累计: {{ formatNumber(data.categories?.engineering?.cumulative || 0) }}</div>
          <div>当月: {{ formatNumber(data.categories?.engineering?.currentPeriod || 0) }}</div>
          <div class="text-xs text-purple-600 mt-1">完成率: {{ data.categories?.engineering?.completionRate || 0 }}%</div>
        </div>
      </div>
    </div>
    <div class="text-sm" v-else-if="type === 'main-revenue'">
      <p class="mb-2">
        年度计划为 {{ formatNumber(data.yearlyPlan) }} 万元；累计收入为 {{ formatNumber(data.cumulative) }} 万元；当月收入为 {{ formatNumber(data.currentPeriod) }} 万元，计划完成率为 {{ data.completionRate }}%
      </p>
      <div class="grid grid-cols-3 gap-2 mt-2 text-xs">
        <div class="bg-blue-50 p-2 rounded">
          <div class="font-medium text-blue-700">设备类</div>
          <div>计划: {{ formatNumber(data.categories?.equipment?.yearlyPlan || 0) }}</div>
          <div>累计: {{ formatNumber(data.categories?.equipment?.accumulated || 0) }}</div>
          <div>当月: {{ formatNumber(data.categories?.equipment?.currentMonth || 0) }}</div>
          <div class="text-xs text-blue-600 mt-1">完成率: {{ data.categories?.equipment?.completionRate || 0 }}%</div>
        </div>
        <div class="bg-green-50 p-2 rounded">
          <div class="font-medium text-green-700">元件类</div>
          <div>计划: {{ formatNumber(data.categories?.components?.yearlyPlan || 0) }}</div>
          <div>累计: {{ formatNumber(data.categories?.components?.accumulated || 0) }}</div>
          <div>当月: {{ formatNumber(data.categories?.components?.currentMonth || 0) }}</div>
          <div class="text-xs text-green-600 mt-1">完成率: {{ data.categories?.components?.completionRate || 0 }}%</div>
        </div>
        <div class="bg-purple-50 p-2 rounded">
          <div class="font-medium text-purple-700">工程类</div>
          <div>计划: {{ formatNumber(data.categories?.engineering?.yearlyPlan || 0) }}</div>
          <div>累计: {{ formatNumber(data.categories?.engineering?.accumulated || 0) }}</div>
          <div>当月: {{ formatNumber(data.categories?.engineering?.currentMonth || 0) }}</div>
          <div class="text-xs text-purple-600 mt-1">完成率: {{ data.categories?.engineering?.completionRate || 0 }}%</div>
        </div>
      </div>
    </div>
    <div class="text-sm" v-else-if="type === 'net-profit'">
      <p class="mb-2">
        年度计划为 {{ formatNumber(data.yearlyPlan) }} 万元；累计净利润为 {{ formatNumber(data.cumulative) }} 万元；当月净利润为 {{ formatNumber(data.currentPeriod) }} 万元，计划完成率为 {{ data.completionRate }}%
      </p>
      <div class="grid grid-cols-2 gap-2 mt-2 text-xs">
        <div class="bg-blue-50 p-2 rounded">
          <div class="font-medium text-blue-700">主营业务</div>
          <div>计划: {{ formatNumber(data.categories?.mainBusiness?.yearlyPlan || 0) }}</div>
          <div>累计: {{ formatNumber(data.categories?.mainBusiness?.cumulative || 0) }}</div>
          <div>当月: {{ formatNumber(data.categories?.mainBusiness?.currentPeriod || 0) }}</div>
          <div class="text-xs text-blue-600 mt-1">完成率: {{ data.categories?.mainBusiness?.completionRate || 0 }}%</div>
        </div>
        <div class="bg-green-50 p-2 rounded">
          <div class="font-medium text-green-700">非主营业务</div>
          <div>计划: {{ formatNumber(data.categories?.nonMainBusiness?.yearlyPlan || 0) }}</div>
          <div>累计: {{ formatNumber(data.categories?.nonMainBusiness?.cumulative || 0) }}</div>
          <div>当月: {{ formatNumber(data.categories?.nonMainBusiness?.currentPeriod || 0) }}</div>
          <div class="text-xs text-green-600 mt-1">完成率: {{ data.categories?.nonMainBusiness?.completionRate || 0 }}%</div>
        </div>
      </div>
    </div>
    <p class="text-sm" v-else-if="type === 'cost-center'">
      年度计划为 {{ formatNumber(data.yearlyPlan) }} 万元；当期累计为 {{ formatNumber(data.cumulative) }} 万元，占主营业务比率为 {{ data.ratio }}%，计划执行率为 {{ data.executionRate }}%
    </p>
    <p class="text-sm" v-else-if="type === 'percentage'">
      年度计划为 {{ data.yearlyPlan }}%；当期为 {{ data.current }}%；
    </p>
    <p class="text-sm" v-else-if="type === 'amount-with-fluctuation'">
      年度期初为 {{ formatNumber(data.initial) }} 万元；当期为 {{ formatNumber(data.current) }} 万元，波动率为 {{ data.fluctuation }}%；
    </p>
    <p class="text-sm" v-else>
      <slot></slot>
    </p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    default: 'basic',
    validator: (value) => ['basic', 'new-orders', 'main-revenue', 'net-profit', 'cost-center', 'percentage', 'amount-with-fluctuation', 'custom'].includes(value)
  }
})

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toFixed(2)
}
</script>
