<template>
  <div class="bg-gray-50 p-4 rounded">
    <h4 class="font-semibold mb-2">{{ title }}</h4>
    <p class="text-sm" v-if="type === 'basic'">
      年度计划为 {{ formatNumber(data.yearlyPlan) }} 万元；当期累计为 {{ formatNumber(data.cumulative) }} 万元，计划完成率为 {{ data.completionRate }}%
    </p>
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
    validator: (value) => ['basic', 'cost-center', 'percentage', 'amount-with-fluctuation', 'custom'].includes(value)
  }
})

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toFixed(2)
}
</script>
