<template>
  <div class="max-w-[1600px] mx-auto bg-white rounded-lg shadow-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">坏账准备情况（单位：万元）</h1>
      <div class="flex items-center space-x-4">
        <input v-model="period" type="month" class="px-3 py-2 border rounded" />
      </div>
    </div>

    <div class="overflow-x-auto my-6">
      <table class="w-full border-collapse border border-gray-300">
        <thead class="sticky top-0 bg-white">
          <tr class="bg-gray-50">
            <th class="border border-gray-300 px-4 py-2 w-32">板块</th>
            <th class="border border-gray-300 px-4 py-2">客户属性</th>
            <th class="border border-gray-300 px-4 py-2 w-32">年初余额</th>
            <th class="border border-gray-300 px-4 py-2 w-32">本年新增</th>
            <th class="border border-gray-300 px-4 py-2 w-32">当月转回</th>
            <th class="border border-gray-300 px-4 py-2 w-32">累计转回</th>
            <th class="border border-gray-300 px-4 py-2 w-32">坏账准备余额</th>
          </tr>
        </thead>
        <tbody>
          <!-- 设备板块 -->
          <template v-for="(item, index) in equipmentData" :key="`设备-${item.customerType}`">
            <tr>
              <td
                v-if="index === 0"
                class="border border-gray-300 px-4 py-2 text-center font-medium"
                :rowspan="equipmentData.length"
              >
                设备
              </td>
              <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
              <td class="border border-gray-300 px-4 py-2">
                <span class="w-full px-2 py-1">{{ formatNumber(item.initialBalance) }}</span>
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input
                  v-model.number="item.newAddition"
                  type="number"
                  class="w-full px-2 py-1 border rounded"
                  step="0.01"
                  @input="calculateTotal(item)"
                />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input
                  v-model.number="item.currentReversal"
                  type="number"
                  class="w-full px-2 py-1 border rounded"
                  step="0.01"
                  @input="calculateTotal(item)"
                />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <span class="w-full px-2 py-1">{{
                  formatNumber(item.accumulatedReversal)
                }}</span>
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ formatNumber(item.finalBalance) }}
              </td>
            </tr>
          </template>

          <!-- 元件板块 -->
          <template v-for="(item, index) in componentData" :key="`元件-${item.customerType}`">
            <tr>
              <td
                v-if="index === 0"
                class="border border-gray-300 px-4 py-2 text-center font-medium"
                :rowspan="componentData.length"
              >
                元件
              </td>
              <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
              <td class="border border-gray-300 px-4 py-2">
                <span class="w-full px-2 py-1">{{ formatNumber(item.initialBalance) }}</span>
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input
                  v-model.number="item.newAddition"
                  type="number"
                  class="w-full px-2 py-1 border rounded"
                  step="0.01"
                  @input="calculateTotal(item)"
                />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input
                  v-model.number="item.currentReversal"
                  type="number"
                  class="w-full px-2 py-1 border rounded"
                  step="0.01"
                  @input="calculateTotal(item)"
                />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <span class="w-full px-2 py-1">{{
                  formatNumber(item.accumulatedReversal)
                }}</span>
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ formatNumber(item.finalBalance) }}
              </td>
            </tr>
          </template>

          <!-- 工程板块 -->
          <template
            v-for="(item, index) in engineeringData"
            :key="`工程-${item.customerType}`"
          >
            <tr>
              <td
                v-if="index === 0"
                class="border border-gray-300 px-4 py-2 text-center font-medium"
                :rowspan="engineeringData.length"
              >
                工程
              </td>
              <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
              <td class="border border-gray-300 px-4 py-2">
                <span class="w-full px-2 py-1">{{ formatNumber(item.initialBalance) }}</span>
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input
                  v-model.number="item.newAddition"
                  type="number"
                  class="w-full px-2 py-1 border rounded"
                  step="0.01"
                  @input="calculateTotal(item)"
                />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input
                  v-model.number="item.currentReversal"
                  type="number"
                  class="w-full px-2 py-1 border rounded"
                  step="0.01"
                  @input="calculateTotal(item)"
                />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <span class="w-full px-2 py-1">{{
                  formatNumber(item.accumulatedReversal)
                }}</span>
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ formatNumber(item.finalBalance) }}
              </td>
            </tr>
          </template>

          <!-- 合计行 -->
          <tr class="bg-gray-50 font-bold">
            <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">
              合计
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ formatNumber(totalInitialBalance) }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ formatNumber(totalNewAddition) }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ formatNumber(totalCurrentReversal) }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ formatNumber(totalAccumulatedReversal) }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ formatNumber(totalFinalBalance) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 备注说明 -->
    <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
      <p class="text-sm text-gray-700">
        <strong>备注：</strong>坏账转回应说明去向
      </p>
    </div>

    <!-- 按钮区域 -->
    <div class="mt-4 flex justify-end space-x-4">
      <button
        @click="handleSave"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        保存
      </button>
      <button
        @click="handleReset"
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        重置
      </button>
    </div>

    <!-- 文件上传和备注组件 -->
    <FormAttachmentAndRemarks
      :module-id="MODULE_IDS.BAD_DEBT_PROVISION"
      :period="period"
      v-model:remarks="remarks"
      v-model:suggestions="suggestions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue';
import {
  recordFormSubmission,
  loadRemarksAndSuggestions,
  MODULE_IDS,
} from '@/utils/formSubmissionHelper';

interface BadDebtProvisionItem {
  customerType: string;
  initialBalance: number;
  newAddition: number;
  currentReversal: number;
  accumulatedReversal: number;
  finalBalance: number;
  yearlyPlan?: number;
  progress?: string;
}

const route = useRoute();
const period = ref(
  route.query.period?.toString() || new Date().toISOString().slice(0, 7),
);
const remarks = ref('');
const suggestions = ref('');
const allMonthsData = ref<any[]>([]); // 存储所有月份的数据

// 初始数据模板（当没有数据时使用）
const getInitialEquipmentData = (): BadDebtProvisionItem[] => [
  {
    customerType: '上海',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
  {
    customerType: '国网',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
  {
    customerType: '江苏',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
  {
    customerType: '输配电内配',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
  {
    customerType: '西门子',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
  {
    customerType: '同业',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
  {
    customerType: '用户',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
  {
    customerType: '其它',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
];

const getInitialComponentData = (): BadDebtProvisionItem[] => [
  {
    customerType: '用户',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
];

const getInitialEngineeringData = (): BadDebtProvisionItem[] => [
  {
    customerType: '一包',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
  {
    customerType: '二包',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
  {
    customerType: '域内合作',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
  {
    customerType: '域外合作',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
  {
    customerType: '其它',
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0,
  },
];

// 响应式数据
const equipmentData = ref<BadDebtProvisionItem[]>(getInitialEquipmentData());
const componentData = ref<BadDebtProvisionItem[]>(getInitialComponentData());
const engineeringData = ref<BadDebtProvisionItem[]>(getInitialEngineeringData());

// 计算合计
const totalInitialBalance = computed(() => {
  return [
    ...equipmentData.value,
    ...componentData.value,
    ...engineeringData.value,
  ].reduce((sum, item) => sum + (item.initialBalance || 0), 0);
});

const totalNewAddition = computed(() => {
  return [
    ...equipmentData.value,
    ...componentData.value,
    ...engineeringData.value,
  ].reduce((sum, item) => sum + (item.newAddition || 0), 0);
});

const totalCurrentReversal = computed(() => {
  return [
    ...equipmentData.value,
    ...componentData.value,
    ...engineeringData.value,
  ].reduce((sum, item) => sum + (item.currentReversal || 0), 0);
});

const totalAccumulatedReversal = computed(() => {
  return [
    ...equipmentData.value,
    ...componentData.value,
    ...engineeringData.value,
  ].reduce((sum, item) => sum + (item.accumulatedReversal || 0), 0);
});

const totalFinalBalance = computed(() => {
  return [
    ...equipmentData.value,
    ...componentData.value,
    ...engineeringData.value,
  ].reduce((sum, item) => sum + (item.finalBalance || 0), 0);
});

// 获取所有月份数据用于累计计算
const loadAllMonthsData = async (currentPeriod: string) => {
  try {
    const [year, month] = currentPeriod.split('-');
    const currentMonth = parseInt(month);
    const allData = [];

    // 获取当年1月到当前月的所有数据
    for (let i = 1; i <= currentMonth; i++) {
      const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`;
      try {
        const response = await fetch(
          `http://127.0.0.1:3000/bad-debt-provision/${monthPeriod}`,
        );
        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data)) {
            allData.push({ period: monthPeriod, data: result.data });
          }
        }
      } catch (error) {
        console.log(`跳过月份 ${monthPeriod}:`, error);
      }
    }

    allMonthsData.value = allData;
    console.log('加载的所有月份数据:', allData);
  } catch (error) {
    console.error('加载所有月份数据失败:', error);
  }
};

// 计算单个项目的累计转回
const calculateAccumulatedReversal = (segment: string, customerType: string) => {
  let total = 0;
  const currentPeriod = period.value;

  // 累加历史月份数据
  for (const monthData of allMonthsData.value) {
    if (monthData.period === currentPeriod) continue;

    const item = monthData.data.find(
      (d: any) => d.segment === segment && d.customerType === customerType,
    );
    if (item && item.currentReversal) {
      const value = parseFloat(item.currentReversal.toString()) || 0;
      total += value;
    }
  }

  // 加上当前月份的输入值
  let currentData: any[] = [];
  if (segment === '设备') currentData = equipmentData.value;
  else if (segment === '元件') currentData = componentData.value;
  else if (segment === '工程') currentData = engineeringData.value;

  const currentItem = currentData.find((d) => d.customerType === customerType);
  if (currentItem && currentItem.currentReversal) {
    const currentValue = parseFloat(currentItem.currentReversal.toString()) || 0;
    total += currentValue;
  }

  return total;
};

// 更新累计转回数据
const updateAccumulatedReversal = () => {
  // 更新设备板块累计转回
  equipmentData.value.forEach((item) => {
    item.accumulatedReversal = calculateAccumulatedReversal('设备', item.customerType);
  });

  // 更新元件板块累计转回
  componentData.value.forEach((item) => {
    item.accumulatedReversal = calculateAccumulatedReversal('元件', item.customerType);
  });

  // 更新工程板块累计转回
  engineeringData.value.forEach((item) => {
    item.accumulatedReversal = calculateAccumulatedReversal('工程', item.customerType);
  });
};

// 计算单项余额
const calculateTotal = (item: BadDebtProvisionItem) => {
  // 更新累计转回
  updateAccumulatedReversal();

  // 计算最终余额：年初余额 + 本年新增 - 累计转回
  item.finalBalance =
    (item.initialBalance || 0) +
    (item.newAddition || 0) -
    (item.accumulatedReversal || 0);
};

// 格式化数字
const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// 预算数据映射（来自BudgetPlanning.vue）
const budgetDataMap = {
  设备: {
    上海: 235.75,
    国网: 76.77,
    江苏: 79.63,
    输配电内配: 163.42,
    西门子: 0.0,
    同业: 10.33,
    用户: 1490.63,
    其它: 381.37,
  },
  元件: {
    用户: 14.76,
  },
  工程: {
    一包: 13.94,
    二包: 66.5,
    域内合作: 71.29,
    域外合作: 76.52,
    其它: 16.89,
  },
};

// 合并数据：将从数据库加载的数据与初始模板合并
const mergeData = (
  templateData: BadDebtProvisionItem[],
  loadedData: any[],
  segment: string,
): BadDebtProvisionItem[] => {
  return templateData.map((templateItem) => {
    const loadedItem = loadedData?.find(
      (item) =>
        item.segment === segment && item.customerType === templateItem.customerType,
    );
    const budgetValue = budgetDataMap[segment]?.[templateItem.customerType] || 0;

    if (loadedItem) {
      return {
        customerType: templateItem.customerType,
        // 使用预算数据作为年初余额
        initialBalance: budgetValue,
        newAddition: Number(loadedItem.newAddition) || 0,
        currentReversal: Number(loadedItem.currentReversal) || 0,
        accumulatedReversal: Number(loadedItem.accumulatedReversal) || 0,
        finalBalance: Number(loadedItem.finalBalance) || 0,
        yearlyPlan: budgetValue,
      };
    }
    // 没有实际数据时，只显示预算数据
    return {
      customerType: templateItem.customerType,
      initialBalance: budgetValue,
      newAddition: 0,
      currentReversal: 0,
      accumulatedReversal: 0,
      finalBalance: 0,
      yearlyPlan: budgetValue,
    };
  });
};

// 加载数据
const loadData = async (targetPeriod: string) => {
  try {
    console.log(`正在加载坏账准备数据，期间: ${targetPeriod}`);

    const response = await fetch(
      `http://127.0.0.1:3000/bad-debt-provision/${targetPeriod}`,
    );
    let loadedData: any[] = [];

    if (response.ok) {
      const result = await response.json();
      console.log('API返回数据:', result);

      if (result.success && result.data && Array.isArray(result.data)) {
        loadedData = result.data;
        console.log('成功获取数据，开始合并...');
      }
    } else if (response.status === 404) {
      console.log('该期间暂无数据，使用预算数据填充');
    } else {
      console.log('加载数据失败，使用预算数据填充');
    }

    // 无论是否有数据，都进行合并（确保预算数据始终显示）
    equipmentData.value = mergeData(getInitialEquipmentData(), loadedData, '设备');
    componentData.value = mergeData(getInitialComponentData(), loadedData, '元件');
    engineeringData.value = mergeData(getInitialEngineeringData(), loadedData, '工程');
    console.log('合并后的数据:', {
      equipmentData: equipmentData.value,
      componentData: componentData.value,
      engineeringData: engineeringData.value,
    });

    // 加载所有月份数据并计算累计转回
    await loadAllMonthsData(targetPeriod);
    updateAccumulatedReversal();

    // 重新计算所有项目的最终余额
    const allItems = [
      ...equipmentData.value,
      ...componentData.value,
      ...engineeringData.value,
    ];
    allItems.forEach((item) => {
      item.finalBalance =
        (item.initialBalance || 0) +
        (item.newAddition || 0) -
        (item.accumulatedReversal || 0);
    });
  } catch (error) {
    console.error('加载数据失败:', error);
    // 出错时也要确保预算数据显示
    equipmentData.value = mergeData(getInitialEquipmentData(), [], '设备');
    componentData.value = mergeData(getInitialComponentData(), [], '元件');
    engineeringData.value = mergeData(getInitialEngineeringData(), [], '工程');

    // 即使出错也要加载所有月份数据
    await loadAllMonthsData(targetPeriod);
    updateAccumulatedReversal();
  }
};

// 监听路由参数变化
watch(
  () => route.query.period,
  (newPeriod) => {
    if (newPeriod) {
      period.value = newPeriod.toString();
      loadData(newPeriod.toString());
      loadRemarksData();
    }
  },
);

// 监听period变化
watch(period, (newPeriod) => {
  if (newPeriod) {
    loadData(newPeriod);
    loadRemarksData();
  }
});

// 保存数据
const handleSave = async () => {
  try {
    // 更新累计转回
    updateAccumulatedReversal();

    // 准备要保存的数据
    const allData = [
      ...equipmentData.value.map((item) => ({ ...item, segment: '设备' })),
      ...componentData.value.map((item) => ({ ...item, segment: '元件' })),
      ...engineeringData.value.map((item) => ({ ...item, segment: '工程' })),
    ];

    const saveData = {
      period: period.value,
      data: allData,
    };

    console.log('保存数据:', saveData);

    // 1. 保存到 bad_debt_provision 表
    const response = await fetch('http://127.0.0.1:3000/bad-debt-provision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saveData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`保存失败: ${response.status} - ${errorText}`);
    }

    // 2. 保存到 form_submissions 表
    await recordFormSubmission(
      MODULE_IDS.BAD_DEBT_PROVISION,
      period.value,
      allData,
      remarks.value,
      suggestions.value,
    );

    alert('保存成功');
  } catch (error) {
    console.error('保存失败:', error);
    alert(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 重置数据
const handleReset = () => {
  equipmentData.value = getInitialEquipmentData();
  componentData.value = getInitialComponentData();
  engineeringData.value = getInitialEngineeringData();
  console.log('已重置为初始数据');
};

// 加载备注和建议
const loadRemarksData = async () => {
  const { remarks: loadedRemarks, suggestions: loadedSuggestions } =
    await loadRemarksAndSuggestions(MODULE_IDS.BAD_DEBT_PROVISION, period.value);
  remarks.value = loadedRemarks;
  suggestions.value = loadedSuggestions;
};

onMounted(() => {
  console.log('组件挂载，当前期间:', period.value);
  loadData(period.value);
  loadRemarksData();
});
</script>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
