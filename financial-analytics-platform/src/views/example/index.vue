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
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance"
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.beginBalance || 0 }}</span>
                </td>
              </tr>
              <!-- 流动资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">流动资产合计 <span class="text-blue-600 text-xs">[自动计算]</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.assets.currentTotal.endBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold text-blue-700" step="0.01" readonly />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    data.assets.currentTotal.beginBalance || 0 }}</span>
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
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance"
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.beginBalance || 0 }}</span>
                </td>
              </tr>
              <!-- 非流动资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">非流动资产合计 <span class="text-blue-600 text-xs">[自动计算]</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.assets.nonCurrentTotal.endBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold text-blue-700" step="0.01" readonly />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    data.assets.nonCurrentTotal.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 空行用于对齐 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>

              <!-- 资产合计 -->
              <tr class="bg-blue-50 font-bold text-lg">
                <td class="border border-gray-300 px-4 py-2">资产合计 <span class="text-blue-600 text-xs">[自动计算]</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.assets.total.endBalance"
                    class="w-full px-2 py-1 border rounded bg-blue-50 font-bold text-blue-800" step="0.01" readonly />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-blue-50 font-bold text-blue-800">{{
                    data.assets.total.beginBalance || 0 }}</span>
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
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance"
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.beginBalance || 0 }}</span>
                </td>
              </tr>
              <!-- 流动负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">流动负债合计 <span class="text-blue-600 text-xs">[自动计算]</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.currentTotal.endBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold text-blue-700" step="0.01" readonly />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    data.liabilities.currentTotal.beginBalance || 0 }}</span>
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
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance"
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.beginBalance || 0 }}</span>
                </td>
              </tr>
              <!-- 非流动负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">非流动负债合计 <span class="text-blue-600 text-xs">[自动计算]</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.nonCurrentTotal.endBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold text-blue-700" step="0.01" readonly />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    data.liabilities.nonCurrentTotal.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 负债合计 -->
              <tr class="bg-orange-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">负债合计 <span class="text-blue-600 text-xs">[自动计算]</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.total.endBalance"
                    class="w-full px-2 py-1 border rounded bg-orange-50 font-bold text-orange-800" step="0.01"
                    readonly />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-orange-50 font-bold text-orange-800">{{
                    data.liabilities.total.beginBalance || 0 }}</span>
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
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance"
                    class="w-full px-2 py-1 border rounded" step="0.01"
                    :class="item.total ? 'bg-yellow-50 font-bold' : ''" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700"
                    :class="item.total ? 'bg-yellow-50 font-bold' : ''">{{ item.beginBalance || 0 }}</span>
                </td>
              </tr>
              <!-- 所有者权益合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">所有者权益合计 <span class="text-blue-600 text-xs">[自动计算]</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.equityTotal.endBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold text-blue-700" step="0.01" readonly />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    data.equityTotal.beginBalance || 0 }}</span>
                </td>
              </tr>
              <!-- 负债和所有者权益总计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">
                  负债和所有者权益总计 <span class="text-blue-600 text-xs">[自动计算]</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.total.endBalance"
                    class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold text-blue-700" step="0.01" readonly />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{ data.total.beginBalance
                    || 0 }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-4 flex justify-end items-center">
        <div class="space-x-4">
          <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            @click="() => setBeginBalanceFromPreviousMonth(period.slice(0, 7))">
            从一月设置期初余额
          </button>
          <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="save">
            保存
          </button>
          <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" @click="reset">
            重置
          </button>
        </div>
      </div>

      <!-- 附件和备注组件 -->
      <FormAttachmentAndRemarks :module-id="moduleId" :period="period" v-model:remarks="remarks"
        v-model:suggestions="suggestions" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const moduleId = MODULE_IDS.BALANCE_SHEET
const remarks = ref('')
const suggestions = ref('')

// 设置测试用户信息（如果没有用户信息的话）
if (!userStore.userInfo) {
  userStore.setUserInfo({
    id: 1,
    username: 'test_user',
    role: 'user'
  })
}

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
    total: {
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
    total: {
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

// 计算函数 - 使用computed实现自动计算
const calculateCurrentAssets = () => {
  // 计算流动资产合计（排除子项）
  const total = data.value.assets.current
    .filter(item => !item.indent) // 只计算主项，不包括子项
    .reduce((sum, item) => ({
      endBalance: sum.endBalance + (item.endBalance || 0),
      beginBalance: sum.beginBalance + (item.beginBalance || 0)
    }), { endBalance: 0, beginBalance: 0 })

  data.value.assets.currentTotal = total
}

const calculateNonCurrentAssets = () => {
  // 计算非流动资产合计（排除子项）
  const total = data.value.assets.nonCurrent
    .filter(item => !item.indent) // 只计算主项，不包括子项
    .reduce((sum, item) => ({
      endBalance: sum.endBalance + (item.endBalance || 0),
      beginBalance: sum.beginBalance + (item.beginBalance || 0)
    }), { endBalance: 0, beginBalance: 0 })

  data.value.assets.nonCurrentTotal = total
}

const calculateCurrentLiabilities = () => {
  // 计算流动负债合计（排除子项）
  const total = data.value.liabilities.current
    .filter(item => !item.indent) // 只计算主项，不包括子项
    .reduce((sum, item) => ({
      endBalance: sum.endBalance + (item.endBalance || 0),
      beginBalance: sum.beginBalance + (item.beginBalance || 0)
    }), { endBalance: 0, beginBalance: 0 })

  data.value.liabilities.currentTotal = total
}

const calculateNonCurrentLiabilities = () => {
  // 计算非流动负债合计（排除子项）
  const total = data.value.liabilities.nonCurrent
    .filter(item => !item.indent) // 只计算主项，不包括子项
    .reduce((sum, item) => ({
      endBalance: sum.endBalance + (item.endBalance || 0),
      beginBalance: sum.beginBalance + (item.beginBalance || 0)
    }), { endBalance: 0, beginBalance: 0 })

  data.value.liabilities.nonCurrentTotal = total
}

const calculateEquityTotal = () => {
  const parentCompanyEquity = data.value.equity
    .filter(item => !item.indent && !item.special && !item.total)
    .reduce((sum, item) => ({
      endBalance: sum.endBalance + (item.endBalance || 0),
      beginBalance: sum.beginBalance + (item.beginBalance || 0)
    }), { endBalance: 0, beginBalance: 0 })

  const minorityInterest = data.value.equity.find(item => item.special)
  const minorityBalance = {
    endBalance: minorityInterest ? (minorityInterest.endBalance || 0) : 0,
    beginBalance: minorityInterest ? (minorityInterest.beginBalance || 0) : 0
  }

  data.value.equityTotal = {
    endBalance: parentCompanyEquity.endBalance + minorityBalance.endBalance,
    beginBalance: parentCompanyEquity.beginBalance + minorityBalance.beginBalance
  }
}

const calculateAssetsTotal = () => {
  // 计算资产合计
  data.value.assets.total = {
    endBalance: (data.value.assets.currentTotal.endBalance || 0) + (data.value.assets.nonCurrentTotal.endBalance || 0),
    beginBalance: (data.value.assets.currentTotal.beginBalance || 0) + (data.value.assets.nonCurrentTotal.beginBalance || 0)
  }
}

const calculateLiabilitiesTotal = () => {
  // 计算负债合计
  data.value.liabilities.total = {
    endBalance: (data.value.liabilities.currentTotal.endBalance || 0) + (data.value.liabilities.nonCurrentTotal.endBalance || 0),
    beginBalance: (data.value.liabilities.currentTotal.beginBalance || 0) + (data.value.liabilities.nonCurrentTotal.beginBalance || 0)
  }
}

const calculateGrandTotal = () => {
  // 计算负债和所有者权益总计
  data.value.total = {
    endBalance: (data.value.liabilities.total.endBalance || 0) + (data.value.equityTotal.endBalance || 0),
    beginBalance: (data.value.liabilities.total.beginBalance || 0) + (data.value.equityTotal.beginBalance || 0)
  }
}

// 统一的重新计算函数
const recalculateAll = () => {
  calculateCurrentAssets()
  calculateNonCurrentAssets()
  calculateCurrentLiabilities()
  calculateNonCurrentLiabilities()
  calculateEquityTotal()
  calculateAssetsTotal()
  calculateLiabilitiesTotal()
  calculateGrandTotal()
}

// 使用标志位防止无限循环
let isCalculating = false

// 深度监听data变化，自动重新计算
watch(data, () => {
  if (!isCalculating) {
    isCalculating = true
    recalculateAll()
    // 使用nextTick确保DOM更新完成后再重置标志位
    nextTick(() => {
      isCalculating = false
    })
  }
}, { deep: true })

const setBeginBalanceFromJanuary = async (currentPeriod) => {
  try {
    console.log(`正在获取一月份的期初余额作为${currentPeriod}的期初余额`)

    const januaryPeriod = `${currentPeriod.slice(0, 4)}-01`
    const response = await fetch(`http://47.111.95.19:3000/balance-sheet/${januaryPeriod}`)

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`一月份(${januaryPeriod})暂无数据，期初余额保持为0`)
        return
      }
      throw new Error('获取一月份数据失败')
    }

    const result = await response.json()
    if (result.success && result.data) {
      const januaryData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data
      console.log(`获取到一月份(${januaryPeriod})数据，设置期初余额`)

      isCalculating = true

      if (januaryData.assets?.current) {
        data.value.assets.current.forEach((item, index) => {
          if (januaryData.assets.current[index]) {
            item.beginBalance = januaryData.assets.current[index].beginBalance || 0
          }
        })
      }

      if (januaryData.assets?.nonCurrent) {
        data.value.assets.nonCurrent.forEach((item, index) => {
          if (januaryData.assets.nonCurrent[index]) {
            item.beginBalance = januaryData.assets.nonCurrent[index].beginBalance || 0
          }
        })
      }

      if (januaryData.liabilities?.current) {
        data.value.liabilities.current.forEach((item, index) => {
          if (januaryData.liabilities.current[index]) {
            item.beginBalance = januaryData.liabilities.current[index].beginBalance || 0
          }
        })
      }

      if (januaryData.liabilities?.nonCurrent) {
        data.value.liabilities.nonCurrent.forEach((item, index) => {
          if (januaryData.liabilities.nonCurrent[index]) {
            item.beginBalance = januaryData.liabilities.nonCurrent[index].beginBalance || 0
          }
        })
      }

      if (januaryData.equity) {
        data.value.equity.forEach((item, index) => {
          if (januaryData.equity[index]) {
            item.beginBalance = januaryData.equity[index].beginBalance || 0
          }
        })
      }

      if (januaryData.assets?.currentTotal) {
        data.value.assets.currentTotal.beginBalance = januaryData.assets.currentTotal.beginBalance || 0
      }
      if (januaryData.assets?.nonCurrentTotal) {
        data.value.assets.nonCurrentTotal.beginBalance = januaryData.assets.nonCurrentTotal.beginBalance || 0
      }
      if (januaryData.assets?.total) {
        data.value.assets.total.beginBalance = januaryData.assets.total.beginBalance || 0
      }
      if (januaryData.liabilities?.currentTotal) {
        data.value.liabilities.currentTotal.beginBalance = januaryData.liabilities.currentTotal.beginBalance || 0
      }
      if (januaryData.liabilities?.nonCurrentTotal) {
        data.value.liabilities.nonCurrentTotal.beginBalance = januaryData.liabilities.nonCurrentTotal.beginBalance || 0
      }
      if (januaryData.liabilities?.total) {
        data.value.liabilities.total.beginBalance = januaryData.liabilities.total.beginBalance || 0
      }
      if (januaryData.equityTotal) {
        data.value.equityTotal.beginBalance = januaryData.equityTotal.beginBalance || 0
      }
      if (januaryData.total) {
        data.value.total.beginBalance = januaryData.total.beginBalance || 0
      }

      nextTick(() => {
        recalculateAll()
        isCalculating = false
        console.log(`期初余额设置完成，来源：${januaryPeriod}的期初余额`)
      })
    }
  } catch (error) {
    console.error('设置期初余额失败:', error)
  }
}

const autoSetBeginBalanceFromJanuary = async (currentPeriod) => {
  if (currentPeriod.endsWith('-01')) {
    console.log('1月份数据，期初余额需要手动输入')
    return
  }

  await setBeginBalanceFromJanuary(currentPeriod)
}

const setBeginBalanceFromPreviousMonth = async (currentPeriod) => {
  if (currentPeriod.endsWith('-01')) {
    alert('1月份数据，期初余额需要手动输入')
    return
  }

  const hasExistingBeginBalance = data.value.assets.current.some(item => item.beginBalance !== 0) ||
    data.value.assets.nonCurrent.some(item => item.beginBalance !== 0) ||
    data.value.liabilities.current.some(item => item.beginBalance !== 0) ||
    data.value.liabilities.nonCurrent.some(item => item.beginBalance !== 0) ||
    data.value.equity.some(item => item.beginBalance !== 0)

  if (hasExistingBeginBalance) {
    const confirmed = confirm('当前已有期初余额数据，是否要用一月份的期初余额覆盖？')
    if (!confirmed) {
      return
    }
  }

  try {
    await setBeginBalanceFromJanuary(currentPeriod)
    alert(`成功设置期初余额（来源：${currentPeriod.slice(0, 4)}-01的期初余额）`)
  } catch (error) {
    console.error('设置期初余额失败:', error)
    alert('设置期初余额失败: ' + (error instanceof Error ? error.message : '网络错误'))
  }
}

// 定义函数（需要在watch之前定义）
const loadData = async () => {
  try {
    console.log(`正在加载资产负债表数据，期间: ${period.value.slice(0, 7)}`)

    const response = await fetch(
      `http://47.111.95.19:3000/balance-sheet/${period.value.slice(0, 7)}`
    )
    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无数据，重置为初始模板并自动设置期初余额')
        resetToInitialState()
        await autoSetBeginBalanceFromJanuary(period.value.slice(0, 7))
        return
      }
      throw new Error('加载数据失败')
    }

    const result = await response.json()
    console.log('API返回数据:', result)

    if (result.success && result.data) {
      console.log('成功获取数据，开始验证数据完整性...')
      const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data

      const isDataComplete = parsedData.assets &&
        parsedData.assets.current &&
        parsedData.assets.nonCurrent &&
        parsedData.liabilities &&
        parsedData.liabilities.current &&
        parsedData.liabilities.nonCurrent &&
        parsedData.equity

      if (isDataComplete) {
        console.log('数据结构完整，开始加载...')
        isCalculating = true

        if (!parsedData.assets.total) {
          parsedData.assets.total = { endBalance: 0, beginBalance: 0 }
        }
        if (!parsedData.liabilities.total) {
          parsedData.liabilities.total = { endBalance: 0, beginBalance: 0 }
        }

        data.value = parsedData

        nextTick(async () => {
          recalculateAll()

          const currentPeriod = period.value.slice(0, 7)
          if (!currentPeriod.endsWith('-01')) {
            console.log('非1月份数据，自动设置期初余额')
            await autoSetBeginBalanceFromJanuary(currentPeriod)
          }

          isCalculating = false
          console.log('数据加载完成')
        })
      } else {
        console.log('数据结构不完整，重置为初始模板并自动设置期初余额')
        resetToInitialState()
        await autoSetBeginBalanceFromJanuary(period.value.slice(0, 7))
      }
    } else {
      console.log('API返回成功但数据为空，重置为初始模板并自动设置期初余额')
      resetToInitialState()
      await autoSetBeginBalanceFromJanuary(period.value.slice(0, 7))
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    alert('加载数据失败: ' + (error instanceof Error ? error.message : '网络错误'))
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
watch(period, (newPeriod, oldPeriod) => {
  if (newPeriod && newPeriod !== oldPeriod) {
    console.log(`期间从 ${oldPeriod} 切换到 ${newPeriod}`)
    loadData()
    loadRemarksData()
  }
})

const save = async () => {
  try {
    console.log('开始保存资产负债表数据...')
    console.log('期间:', period.value.slice(0, 7))
    console.log('数据:', data.value)

    const requestData = {
      period: period.value.slice(0, 7),
      data: data.value,
    }

    console.log('发送请求数据:', requestData)

    const response = await fetch('http://47.111.95.19:3000/balance-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    })

    console.log('响应状态:', response.status)
    console.log('响应OK:', response.ok)

    if (!response.ok) {
      const result = await response.json()
      console.error('服务器返回错误:', result)
      throw new Error(result.error || '保存失败')
    }

    const result = await response.json()
    console.log('保存成功，服务器响应:', result)

    // 记录表单提交
    try {
      await recordFormSubmission(moduleId, period.value, data.value, remarks.value, suggestions.value)
      console.log('表单提交记录成功')
    } catch (formError) {
      console.warn('表单提交记录失败，但不影响数据保存:', formError)
      // 表单提交记录失败不应该影响主要的保存功能
    }

    alert('数据保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败: ' + (error instanceof Error ? error.message : '网络错误'))
  }
}

// 重置数据为初始状态（不包括备注和建议）
const resetToInitialState = () => {
  // 暂时禁用自动计算
  isCalculating = true

  // 重置所有数据项
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

  // 重置合计项
  data.value.assets.currentTotal.endBalance = 0
  data.value.assets.currentTotal.beginBalance = 0
  data.value.assets.nonCurrentTotal.endBalance = 0
  data.value.assets.nonCurrentTotal.beginBalance = 0
  data.value.assets.total.endBalance = 0
  data.value.assets.total.beginBalance = 0
  data.value.liabilities.currentTotal.endBalance = 0
  data.value.liabilities.currentTotal.beginBalance = 0
  data.value.liabilities.nonCurrentTotal.endBalance = 0
  data.value.liabilities.nonCurrentTotal.beginBalance = 0
  data.value.liabilities.total.endBalance = 0
  data.value.liabilities.total.beginBalance = 0
  data.value.equityTotal.endBalance = 0
  data.value.equityTotal.beginBalance = 0
  data.value.total.endBalance = 0
  data.value.total.beginBalance = 0

  // 重新启用自动计算
  nextTick(() => {
    isCalculating = false
    console.log('数据已重置为初始状态')
  })
}

const reset = () => {
  // 暂时禁用自动计算
  isCalculating = true

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
  data.value.assets.total.endBalance = 0
  data.value.assets.total.beginBalance = 0
  data.value.liabilities.currentTotal.endBalance = 0
  data.value.liabilities.currentTotal.beginBalance = 0
  data.value.liabilities.nonCurrentTotal.endBalance = 0
  data.value.liabilities.nonCurrentTotal.beginBalance = 0
  data.value.liabilities.total.endBalance = 0
  data.value.liabilities.total.beginBalance = 0
  data.value.equityTotal.endBalance = 0
  data.value.equityTotal.beginBalance = 0
  data.value.total.endBalance = 0
  data.value.total.beginBalance = 0
  remarks.value = ''
  suggestions.value = ''

  // 重新启用自动计算
  nextTick(() => {
    isCalculating = false
    console.log('已重置为初始数据')
  })
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
