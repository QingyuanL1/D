<template>
  <div class="bg-gray-100 p-8">
    <div class="max-w-[1600px] mx-auto bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold text-center mb-6">资产负债表(主表)（单位：万元）</h1>
      <!-- 添加期间输入 -->
      <div class="mb-4">
        <label class="block text-gray-700">期间：</label>
        <input type="month" v-model="period" class="w-full px-2 py-1 border rounded" />
      </div>
      <div class="grid grid-cols-2 gap-6">
        <!-- 左侧：资产部分 -->
        <div class="overflow-y-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead class="sticky top-0 bg-white">
              <tr class="bg-gray-50">
                <th class="border border-gray-300 px-4 py-2">资产</th>
                <th class="border border-gray-300 px-4 py-2 w-40">期末余额</th>
                <th class="border border-gray-300 px-4 py-2 w-40">期初余额</th>
              </tr>
            </thead>
            <tbody>
              <!-- 流动资产部分 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-bold">
                  流动资产：
                </td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr v-for="(item, index) in data.assets.current" :key="`current-asset-${index}`">
                <td class="border border-gray-300 px-4 py-2" :class="item.indent ? 'pl-8' : ''">
                  {{ item.name }}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
              </tr>
              <!-- 流动资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">流动资产合计</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.assets.currentTotal.endBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.assets.currentTotal.beginBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
              </tr>
              <!-- 非流动资产部分 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-bold">
                  非流动资产：
                </td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr v-for="(item, index) in data.assets.nonCurrent" :key="`noncurrent-asset-${index}`">
                <td class="border border-gray-300 px-4 py-2" :class="[
                  item.indent ? 'pl-8' : '',
                  item.highlight ? 'bg-gray-100' : '',
                ]">
                  {{ item.name }}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
              </tr>
              <!-- 非流动资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">非流动资产合计</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.assets.nonCurrentTotal.endBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.assets.nonCurrentTotal.beginBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 右侧：负债和所有者权益部分 -->
        <div class="overflow-y-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead class="sticky top-0 bg-white">
              <tr class="bg-gray-50">
                <th class="border border-gray-300 px-4 py-2">
                  负债和所有者权益
                </th>
                <th class="border border-gray-300 px-4 py-2 w-40">期末余额</th>
                <th class="border border-gray-300 px-4 py-2 w-40">期初余额</th>
              </tr>
            </thead>
            <tbody>
              <!-- 流动负债部分 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-bold">
                  流动负债：
                </td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr v-for="(item, index) in data.liabilities.current" :key="`current-liability-${index}`">
                <td class="border border-gray-300 px-4 py-2" :class="[
                  item.indent ? 'pl-8' : '',
                  item.highlight ? 'bg-gray-100' : '',
                ]">
                  {{ item.name }}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
              </tr>
              <!-- 流动负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">流动负债合计</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.currentTotal.endBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.currentTotal.beginBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
              </tr>
              <!-- 非流动负债部分 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-bold">
                  非流动负债：
                </td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr v-for="(item, index) in data.liabilities.nonCurrent" :key="`noncurrent-liability-${index}`">
                <td class="border border-gray-300 px-4 py-2" :class="[
                  item.indent ? 'pl-8' : '',
                  item.highlight ? 'bg-gray-100' : '',
                ]">
                  {{ item.name }}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
              </tr>
              <!-- 非流动负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">非流动负债合计</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.nonCurrentTotal.endBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.nonCurrentTotal.beginBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
              </tr>
              <!-- 所有者权益部分 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-bold">
                  所有者权益（或股东权益）：
                </td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr v-for="(item, index) in data.equity" :key="`equity-${index}`">
                <td class="border border-gray-300 px-4 py-2" :class="[
                  item.indent ? 'pl-8' : '',
                  item.highlight ? 'bg-gray-100' : '',
                ]">
                  {{ item.name }}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" :class="item.total ? 'bg-yellow-50 font-bold' : ''" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" :class="item.total ? 'bg-yellow-50 font-bold' : ''" />
                </td>
              </tr>
              <!-- 所有者权益合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">所有者权益合计</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.equityTotal.endBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.equityTotal.beginBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
              </tr>
              <!-- 负债和所有者权益总计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">
                  负债和所有者权益总计
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.total.endBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.total.beginBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-4 flex justify-end space-x-4">
        <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="save">
          保存
        </button>
        <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" @click="reset">
          重置
        </button>
      </div>

      <!-- 附件和备注组件 -->
      <FormAttachmentAndRemarks
        :module-id="moduleId"
        :period="period"
        v-model:remarks="remarks"
        v-model:suggestions="suggestions"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const moduleId = MODULE_IDS.BALANCE_SHEET
const remarks = ref('')
const suggestions = ref('')

const data = ref({
        assets: {
          current: [
            { name: '货币资金', endBalance: 0, beginBalance: 0 },
            { name: '交易性金融资产', endBalance: 0, beginBalance: 0 },
            { name: '衍生金融资产', endBalance: 0, beginBalance: 0 },
            { name: '应收票据', endBalance: 0, beginBalance: 0 },
            { name: '应收账款', endBalance: 0, beginBalance: 0 },
            { name: '应收款项融资', endBalance: 0, beginBalance: 0 },
            { name: '预付款项', endBalance: 0, beginBalance: 0 },
            { name: '其他应收款', endBalance: 0, beginBalance: 0 },
            {
              name: '其中：应收股利',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            {
              name: '应收利息',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            { name: '存货', endBalance: 0, beginBalance: 0 },
            {
              name: '其中：原材料',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            {
              name: '库存商品(产成品)',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            { name: '合同资产', endBalance: 0, beginBalance: 0 },
            { name: '持有待售资产', endBalance: 0, beginBalance: 0 },
            { name: '一年内到期的非流动资产', endBalance: 0, beginBalance: 0 },
            { name: '其他流动资产', endBalance: 0, beginBalance: 0 },
          ],
          currentTotal: {
            endBalance: 0,
            beginBalance: 0,
          },
          nonCurrent: [
            {
              name: '△发放贷款和垫款',
              endBalance: 0,
              beginBalance: 0,
              highlight: true,
            },
            { name: '债权投资', endBalance: 0, beginBalance: 0 },
            {
              name: '☆可供出售金融资产',
              endBalance: 0,
              beginBalance: 0,
              highlight: true,
            },
            { name: '其他债权投资', endBalance: 0, beginBalance: 0 },
            { name: '长期应收款', endBalance: 0, beginBalance: 0 },
            { name: '长期股权投资', endBalance: 0, beginBalance: 0 },
            { name: '其他权益工具投资', endBalance: 0, beginBalance: 0 },
            { name: '其他非流动金融资产', endBalance: 0, beginBalance: 0 },
            { name: '投资性房地产', endBalance: 0, beginBalance: 0 },
            { name: '固定资产', endBalance: 0, beginBalance: 0 },
            {
              name: '其中：固定资产原价',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            {
              name: '累计折旧',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            {
              name: '固定资产减值准备',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            { name: '在建工程', endBalance: 0, beginBalance: 0 },
            {
              name: '生性生物资产',
              endBalance: 0,
              beginBalance: 0,
              highlight: true,
            },
            {
              name: '油气资产',
              endBalance: 0,
              beginBalance: 0,
              highlight: true,
            },
            { name: '使用权资产', endBalance: 0, beginBalance: 0 },
            { name: '无形资产', endBalance: 0, beginBalance: 0 },
            { name: '开发支出', endBalance: 0, beginBalance: 0 },
            { name: '商誉', endBalance: 0, beginBalance: 0 },
            { name: '长期待摊费用', endBalance: 0, beginBalance: 0 },
            { name: '递延所得税资产', endBalance: 0, beginBalance: 0 },
            { name: '其他非流动资产', endBalance: 0, beginBalance: 0 },
            {
              name: '其中：特准储备物资',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
          ],
          nonCurrentTotal: {
            endBalance: 0,
            beginBalance: 0,
          },
        },
        liabilities: {
          current: [
            { name: '短期借款', endBalance: 0, beginBalance: 0 },
            { name: '交易性金融负债', endBalance: 0, beginBalance: 0 },
            { name: '衍生金融负债', endBalance: 0, beginBalance: 0 },
            { name: '应付票据', endBalance: 0, beginBalance: 0 },
            { name: '应付账款', endBalance: 0, beginBalance: 0 },
            { name: '预收款项', endBalance: 0, beginBalance: 0 },
            { name: '合同负债', endBalance: 0, beginBalance: 0 },
            { name: '应付职工薪酬', endBalance: 0, beginBalance: 0 },
            {
              name: '其中：应付工资',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            {
              name: '应付福利费',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            {
              name: '#其中：职工奖励及福利基金',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
              highlight: true,
            },
            { name: '应交税费', endBalance: 0, beginBalance: 0 },
            {
              name: '其中：应交税金',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            { name: '其他应付款', endBalance: 0, beginBalance: 0 },
            {
              name: '其中：应付股利',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            {
              name: '应付利息',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            {
              name: '△应付分保账款',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            { name: '持有待售负债', endBalance: 0, beginBalance: 0 },
            { name: '一年内到期的非流动负债', endBalance: 0, beginBalance: 0 },
            { name: '其他流动负债', endBalance: 0, beginBalance: 0 },
          ],
          currentTotal: {
            endBalance: 0,
            beginBalance: 0,
          },
          nonCurrent: [
            {
              name: '△保险合同准备金',
              endBalance: 0,
              beginBalance: 0,
              highlight: true,
            },
            { name: '长期借款', endBalance: 0, beginBalance: 0 },
            { name: '应付债券', endBalance: 0, beginBalance: 0 },
            {
              name: '其中：优先股',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            {
              name: '永续债',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
            { name: '租赁负债', endBalance: 0, beginBalance: 0 },
            { name: '长期应付款', endBalance: 0, beginBalance: 0 },
            { name: '长期应付职工薪酬', endBalance: 0, beginBalance: 0 },
            { name: '预计负债', endBalance: 0, beginBalance: 0 },
            { name: '递延收益', endBalance: 0, beginBalance: 0 },
            { name: '递延所得税负债', endBalance: 0, beginBalance: 0 },
            { name: '其他非流动负债', endBalance: 0, beginBalance: 0 },
            {
              name: '其中：特准储备基金',
              endBalance: 0,
              beginBalance: 0,
              indent: true,
            },
          ],
          nonCurrentTotal: {
            endBalance: 0,
            beginBalance: 0,
          },
        },
        equity: [
          { name: '实收资本（或股本）', endBalance: 0, beginBalance: 0 },
          { name: '国家资本', endBalance: 0, beginBalance: 0 },
          { name: '国有法人资本', endBalance: 0, beginBalance: 0 },
          { name: '集体资本', endBalance: 0, beginBalance: 0 },
          { name: '民营资本', endBalance: 0, beginBalance: 0 },
          { name: '外商资本', endBalance: 0, beginBalance: 0 },
          {
            name: '#减：已归还投资',
            endBalance: 0,
            beginBalance: 0,
            highlight: true,
          },
          { name: '实收资本（或股本）净额', endBalance: 0, beginBalance: 0 },
          { name: '其他权益工具', endBalance: 0, beginBalance: 0 },
          {
            name: '其中：优先股',
            endBalance: 0,
            beginBalance: 0,
            indent: true,
          },
          {
            name: '永续债',
            endBalance: 0,
            beginBalance: 0,
            indent: true,
          },
          { name: '资本公积', endBalance: 0, beginBalance: 0 },
          { name: '减：库存股', endBalance: 0, beginBalance: 0 },
          { name: '其他综合收益', endBalance: 0, beginBalance: 0 },
          {
            name: '其中：外币报表折算差额',
            endBalance: 0,
            beginBalance: 0,
            indent: true,
          },
          { name: '专项储备', endBalance: 0, beginBalance: 0 },
          { name: '盈余公积', endBalance: 0, beginBalance: 0 },
          {
            name: '其中：法定公积金',
            endBalance: 0,
            beginBalance: 0,
            indent: true,
          },
          {
            name: '任意公积金',
            endBalance: 0,
            beginBalance: 0,
            indent: true,
          },
          {
            name: '#储备基金',
            endBalance: 0,
            beginBalance: 0,
            highlight: true,
          },
          {
            name: '#企业发展基金',
            endBalance: 0,
            beginBalance: 0,
            highlight: true,
          },
          {
            name: '#利润归还投资',
            endBalance: 0,
            beginBalance: 0,
            highlight: true,
          },
          {
            name: '△一般风险准备',
            endBalance: 0,
            beginBalance: 0,
            highlight: true,
          },
          { name: '未分配利润', endBalance: 0, beginBalance: 0 },
          {
            name: '其中：本年利润',
            endBalance: 0,
            beginBalance: 0,
            indent: true,
          },
          {
            name: '归属于母公司所有者权益（或股东权益）合计',
            endBalance: 0,
            beginBalance: 0,
            total: true,
          },
          {
            name: '*少数股东权益',
            endBalance: 0,
            beginBalance: 0,
            special: true,
          },
        ],
        equityTotal: {
          endBalance: 0,
          beginBalance: 0,
        },
        total: {
          endBalance: 0,
          beginBalance: 0,
        },
    })

// 定义函数（需要在watch之前定义）
const loadData = async () => {
  try {
    console.log(`正在加载资产负债表数据，期间: ${period.value.slice(0, 7)}`)
    
    const response = await fetch(
      `http://127.0.0.1:3000/balance-sheet/${period.value.slice(0, 7)}`
    )
    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无数据，使用初始模板')
        return
      }
      throw new Error('加载数据失败')
    }
    
    const result = await response.json()
    console.log('API返回数据:', result)
    
    if (result.success && result.data) {
      console.log('成功获取数据，开始加载...')
      // 解析JSON字符串并直接赋值
      const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data
      // 直接替换整个 data 对象
      data.value = parsedData
      console.log('数据加载完成')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 加载备注和建议
const loadRemarksData = async () => {
  const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(moduleId, period.value)
  remarks.value = loadedRemarks
  suggestions.value = loadedSuggestions
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
  if (newPeriod) {
    period.value = newPeriod.toString()
    loadData()
    loadRemarksData()
  }
}, { immediate: true })

// 监听期间变化
watch(period, (newPeriod) => {
  if (newPeriod) {
    loadData()
    loadRemarksData()
  }
})

const save = async () => {
  try {
    console.log('保存资产负债表数据:', { period: period.value.slice(0, 7), data: data.value })
    
    const response = await fetch('http://127.0.0.1:3000/balance-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        period: period.value.slice(0, 7),
        data: data.value,
      }),
    })
    
    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || '保存失败')
    }
    
    // 记录表单提交
    await recordFormSubmission(moduleId, period.value, data.value, remarks.value, suggestions.value)
    alert('数据保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败: ' + (error instanceof Error ? error.message : '网络错误'))
  }
}

const reset = () => {
  // 重置所有数据
  const resetItems = (items) => {
    items.forEach((item) => {
      item.endBalance = 0
      item.beginBalance = 0
    })
  }
  resetItems(data.value.assets.current)
  resetItems(data.value.assets.nonCurrent)
  resetItems(data.value.liabilities.current)
  resetItems(data.value.liabilities.nonCurrent)
  resetItems(data.value.equity)
  data.value.assets.currentTotal.endBalance = 0
  data.value.assets.currentTotal.beginBalance = 0
  data.value.assets.nonCurrentTotal.endBalance = 0
  data.value.assets.nonCurrentTotal.beginBalance = 0
  data.value.liabilities.currentTotal.endBalance = 0
  data.value.liabilities.currentTotal.beginBalance = 0
  data.value.liabilities.nonCurrentTotal.endBalance = 0
  data.value.liabilities.nonCurrentTotal.beginBalance = 0
  data.value.equityTotal.endBalance = 0
  data.value.equityTotal.beginBalance = 0
  data.value.total.endBalance = 0
  data.value.total.beginBalance = 0
  remarks.value = ''
  suggestions.value = ''
  console.log('已重置为初始数据')
}

onMounted(() => {
  console.log('资产负债表组件挂载，当前期间:', period.value)
  // 组件挂载时，加载数据
  if (route.query.period) {
    loadData()
  } else if (period.value) {
    loadData()
  }
  loadRemarksData()
})
</script>

<style scoped>
/* 根据需要添加样式 */
</style>
