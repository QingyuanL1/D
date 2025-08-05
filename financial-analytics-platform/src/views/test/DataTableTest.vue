<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">DataTable 组件测试</h1>
    
    <div class="mb-8">
      <h2 class="text-lg font-semibold mb-3">营业收入结构与质量（按年度计划口径分解）(单位：万元)</h2>
      <DataTable 
        :columns="businessIncomeColumns"
        :data="businessIncomeData"
      />
    </div>

    <div class="mb-8">
      <h2 class="text-lg font-semibold mb-3">数据内容</h2>
      <pre class="bg-gray-100 p-4 rounded text-sm">{{ JSON.stringify(businessIncomeData, null, 2) }}</pre>
    </div>

    <div class="mb-8">
      <h2 class="text-lg font-semibold mb-3">列配置</h2>
      <pre class="bg-gray-100 p-4 rounded text-sm">{{ JSON.stringify(businessIncomeColumns, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from '@/components/reports/DataTable.vue'

// 营业收入数据
const businessIncomeData = ref([
  { id: 1, category: '主营业务', yearlyPlan: 55000, currentMonthIncome: 1949.57, accumulatedIncome: 1949.57, progress: 3.28 },
  { id: 2, category: '非主营业务', yearlyPlan: 600, currentMonthIncome: 49.61, accumulatedIncome: 49.61, progress: 8.27 }
])

// 列配置
const businessIncomeColumns = [
  { key: 'id', title: '序号', align: 'center' },
  { key: 'category', title: '财务科目' },
  { key: 'yearlyPlan', title: '年度计划', type: 'number', align: 'right' },
  { key: 'currentMonthIncome', title: '当月收入', type: 'number', align: 'right' },
  { key: 'accumulatedIncome', title: '累计收入', type: 'number', align: 'right' },
  { key: 'progress', title: '执行进度', type: 'percentage', align: 'right' }
]
</script>
