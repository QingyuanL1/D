<template>
  <div class="max-w-[1600px] mx-auto bg-white rounded-lg shadow-lg p-6">
    <!-- 报表头部组件 -->
    <ReportHeader
      :title="`${companyName} - 月度经济运行报表`"
      :period="selectedPeriod"
      :is-generating="false"
      @period-change="handlePeriodChange"
      @generate-pdf="generatePDF"
    />

    <div id="report-content" class="space-y-8">
      <!-- 报表标题和基本信息 -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold mb-2">香港大亚管理办公室 2025</h2>
        <h3 class="text-xl font-semibold mb-2">经济运行统计分析报告</h3>
        <p class="text-lg">{{ companyName }}</p>
        <p class="text-md text-gray-600">{{ formatPeriod(selectedPeriod) }}</p>
      </div>

      <!-- 一、经济运行关键指标进度情况概述 -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold border-b-2 border-blue-500 pb-2">一、经济运行关键指标进度情况概述（单位：万元）</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IndicatorCard
            title="●新签订单："
            :data="keyIndicators.newOrders"
            type="basic"
          />
          <IndicatorCard
            title="●主营业务收入："
            :data="keyIndicators.mainRevenue"
            type="basic"
          />
          <IndicatorCard
            title="●净利润指标："
            :data="keyIndicators.netProfit"
            type="basic"
          />
          <IndicatorCard
            title="●成本中心（计入损益）："
            :data="keyIndicators.costCenter"
            type="cost-center"
          />
        </div>
      </div>

      <!-- 二、经济运行关键指标质量情况概述 -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold border-b-2 border-blue-500 pb-2">二、经济运行关键指标质量情况概述（金额单位：万元）</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IndicatorCard
            title="●边际贡献率指标："
            :data="qualityIndicators.marginContribution"
            type="percentage"
          />
          <IndicatorCard
            title="●毛利率指标："
            :data="qualityIndicators.grossMargin"
            type="percentage"
          />
          <IndicatorCard
            title="●净利率指标："
            :data="qualityIndicators.netMargin"
            type="percentage"
          />
          <IndicatorCard
            title="●净资产收益率指标（年化）："
            :data="qualityIndicators.roe"
            type="percentage"
          />
          <IndicatorCard
            title="●资产负债率指标："
            :data="qualityIndicators.assetLiabilityRatio"
            type="percentage"
          />
          <IndicatorCard
            title="●应收账款指标："
            :data="qualityIndicators.receivables"
            type="amount-with-fluctuation"
          />
          <IndicatorCard
            title="●存量指标："
            :data="qualityIndicators.inventory"
            type="amount-with-fluctuation"
          />
        </div>
      </div>

      <!-- 三、经济运行风险提示 -->
      <div class="mb-8">
        <h3 class="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">三、经济运行风险提示</h3>
        <RiskAlert :risks="riskAlertsArray" />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>正在加载数据...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// 导入组件
import ReportHeader from '@/components/reports/ReportHeader.vue'
import IndicatorCard from '@/components/reports/IndicatorCard.vue'
import RiskAlert from '@/components/reports/RiskAlert.vue'

// Props
const props = defineProps({
  companyKey: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  selectedPeriod: {
    type: String,
    required: true
  }
})

// 事件
const emit = defineEmits(['period-change'])
const isLoading = ref(false)

// 关键指标数据 - 使用静态数据
const keyIndicators = ref({
  newOrders: { yearlyPlan: 40000, cumulative: 2500, completionRate: 6.25 },
  mainRevenue: { yearlyPlan: 30000, cumulative: 1000, completionRate: 3.33 },
  netProfit: { yearlyPlan: 2000, cumulative: 5, completionRate: 0.25 },
  costCenter: { yearlyPlan: 4500, cumulative: 250, ratio: 25.00, executionRate: 5.55 }
})

// 质量指标数据 - 使用静态数据
const qualityIndicators = ref({
  marginContribution: { yearlyPlan: 20.00, current: 18.50 },
  grossMargin: { yearlyPlan: 22.00, current: 19.00 },
  netMargin: { yearlyPlan: 6.00, current: 0.02 },
  roe: { yearlyPlan: 20.00, current: 0.05 },
  assetLiabilityRatio: { yearlyPlan: 75.00, current: 79.00 },
  receivables: { initial: 18000, current: 22000, fluctuation: 22.22 },
  inventory: { initial: 120000, current: 125000, fluctuation: 4.17 }
})

// 风险提示数据
const riskAlerts = ref({
  financial: '当期无风险披露。',
  marketing: '当期无风险披露。',
  production: '当期无风险披露。',
  management: '当期无风险披露。',
  research: '当期无风险披露。',
  others: '当期无风险披露。'
})

// 风险提示数组（用于组件）
const riskAlertsArray = computed(() => [
  { type: 'financial', title: '1、财务风险披露情况：', content: riskAlerts.value.financial },
  { type: 'marketing', title: '2、营销风险披露情况：', content: riskAlerts.value.marketing },
  { type: 'production', title: '3、生产/施工风险披露情况：', content: riskAlerts.value.production },
  { type: 'management', title: '4、管理风险披露情况：', content: riskAlerts.value.management },
  { type: 'research', title: '5、研发风险披露情况：', content: riskAlerts.value.research },
  { type: 'others', title: '6、其他风险披露情况：', content: riskAlerts.value.others }
])

// 日期格式化函数
const formatPeriod = (period) => {
  const [year, month] = period.split('-')
  return `${year}年${month}月`
}

// 处理时间周期变化
const handlePeriodChange = (newPeriod) => {
  emit('period-change', newPeriod)
  console.log('简化版报表期间已更改:', newPeriod)
}

// 生成PDF
const generatePDF = async () => {
  const element = document.getElementById('report-content')
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${props.companyName}-月度经济运行报表-${props.selectedPeriod}.pdf`)
  } catch (error) {
    console.error('生成PDF失败:', error)
  }
}

onMounted(() => {
  console.log(`简化版月度报表已加载，公司: ${props.companyName}，期间: ${props.selectedPeriod}`)
})
</script> 