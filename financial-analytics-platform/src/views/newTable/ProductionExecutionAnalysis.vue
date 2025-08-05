<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">生产/施工订单生产施工执行情况（单位：万元）</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <span class="mr-2">选择日期：</span>
          <input type="month" v-model="selectedDate" class="border rounded px-2 py-1" />
        </div>
        <div class="flex space-x-4">
          <button 
            @click="handleSave" 
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            保存数据
          </button>
          <button 
            @click="handleReset" 
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            重置
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border px-4 py-2 text-left">板块</th>
              <th class="border px-4 py-2 text-left">客户属性</th>
              <th class="border px-4 py-2 text-center">年度计划产值</th>
              <th class="border px-4 py-2 text-center">自制/自行施工</th>
              <th class="border px-4 py-2 text-center">半自制/分包</th>
              <th class="border px-4 py-2 text-center">外发/转包</th>
            </tr>
          </thead>
          <tbody>
            <!-- 设备板块 -->
            <tr v-for="(item, index) in equipmentData" :key="`equipment-${index}`">
              <td class="border px-4 py-2" v-if="index === 0" :rowspan="equipmentData.length + 1">设备</td>
              <td class="border px-4 py-2">{{ item.customerType }}</td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model.number="item.yearlyPlan" 
                  class="w-full border-0 focus:ring-0 text-right"
                  @input="calculateRates(item)"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model.number="item.selfProduction" 
                  class="w-full border-0 focus:ring-0 text-right"
                  @input="calculateRates(item)"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model.number="item.semiProduction" 
                  class="w-full border-0 focus:ring-0 text-right"
                  @input="calculateRates(item)"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model.number="item.outsourcing" 
                  class="w-full border-0 focus:ring-0 text-right"
                  @input="calculateRates(item)"
                />
              </td>
            </tr>
            
            <!-- 设备自制率 -->
            <tr class="bg-gray-50">
              <td class="border px-4 py-2">自制率%</td>
              <td class="border px-4 py-2"></td>
              <td class="border px-4 py-2 text-right">{{ equipmentSelfRate }}</td>
              <td class="border px-4 py-2 text-right">{{ equipmentSemiRate }}</td>
              <td class="border px-4 py-2 text-right">{{ equipmentOutsourcingRate }}</td>
            </tr>
            
            <!-- 元件板块 -->
            <tr>
              <td class="border px-4 py-2" rowspan="2">元件</td>
              <td class="border px-4 py-2">用户</td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model.number="componentData.yearlyPlan" 
                  class="w-full border-0 focus:ring-0 text-right"
                  @input="calculateComponentRates"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model.number="componentData.selfProduction" 
                  class="w-full border-0 focus:ring-0 text-right"
                  @input="calculateComponentRates"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model.number="componentData.semiProduction" 
                  class="w-full border-0 focus:ring-0 text-right"
                  @input="calculateComponentRates"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model.number="componentData.outsourcing" 
                  class="w-full border-0 focus:ring-0 text-right"
                  @input="calculateComponentRates"
                />
              </td>
            </tr>
            
            <!-- 元件自制率 -->
            <tr class="bg-gray-50">
              <td class="border px-4 py-2">自制率%</td>
              <td class="border px-4 py-2"></td>
              <td class="border px-4 py-2 text-right">{{ componentSelfRate }}</td>
              <td class="border px-4 py-2 text-right">{{ componentSemiRate }}</td>
              <td class="border px-4 py-2 text-right">{{ componentOutsourcingRate }}</td>
            </tr>
            
            <!-- 工程板块 -->
            <tr v-for="(item, index) in projectData" :key="`project-${index}`">
              <td class="border px-4 py-2" v-if="index === 0" :rowspan="projectData.length + 1">工程</td>
              <td class="border px-4 py-2">{{ item.customerType }}</td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model.number="item.yearlyPlan" 
                  class="w-full border-0 focus:ring-0 text-right"
                  @input="calculateRates(item)"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model.number="item.selfProduction" 
                  class="w-full border-0 focus:ring-0 text-right"
                  @input="calculateRates(item)"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model.number="item.semiProduction" 
                  class="w-full border-0 focus:ring-0 text-right"
                  @input="calculateRates(item)"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model.number="item.outsourcing" 
                  class="w-full border-0 focus:ring-0 text-right"
                  @input="calculateRates(item)"
                />
              </td>
            </tr>
            
            <!-- 工程自行施工率 -->
            <tr class="bg-gray-50">
              <td class="border px-4 py-2">自行施工率%</td>
              <td class="border px-4 py-2"></td>
              <td class="border px-4 py-2 text-right">{{ projectSelfRate }}</td>
              <td class="border px-4 py-2 text-right">{{ projectSemiRate }}</td>
              <td class="border px-4 py-2 text-right">{{ projectOutsourcingRate }}</td>
            </tr>
            
            <!-- 合计产值 -->
            <tr class="bg-gray-100 font-bold">
              <td class="border px-4 py-2" colspan="2">合计产值</td>
              <td class="border px-4 py-2 text-right">{{ totalYearlyPlan.toLocaleString() }}</td>
              <td class="border px-4 py-2 text-right">{{ totalSelfProduction.toLocaleString() }}</td>
              <td class="border px-4 py-2 text-right">{{ totalSemiProduction.toLocaleString() }}</td>
              <td class="border px-4 py-2 text-right">{{ totalOutsourcing.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 文件上传和备注组件 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <FormAttachmentAndRemarks 
        :module-id="MODULE_IDS.PRODUCTION_EXECUTION_ANALYSIS"
        :period="selectedDate"
        v-model:remarks="remarks"
        v-model:suggestions="suggestions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const selectedDate = ref(route.query.period?.toString() || new Date().toISOString().substr(0, 7))

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

interface ProductionExecutionItem {
  id: number
  segment: string
  customerType: string
  yearlyPlan: number
  selfProduction: number
  semiProduction: number
  outsourcing: number
}

interface ComponentData {
  yearlyPlan: number
  selfProduction: number
  semiProduction: number
  outsourcing: number
}

// 获取初始数据模板
const getInitialData = () => {
  return {
    equipment: [
      { id: 1, segment: '设备', customerType: '上海', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 2, segment: '设备', customerType: '国网', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 3, segment: '设备', customerType: '江苏', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 4, segment: '设备', customerType: '输配电内配', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 5, segment: '设备', customerType: '西门子', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 6, segment: '设备', customerType: '同业', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 7, segment: '设备', customerType: '用户', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 8, segment: '设备', customerType: '其它', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 }
    ],
    component: {
      yearlyPlan: 0,
      selfProduction: 0,
      semiProduction: 0,
      outsourcing: 0
    },
    project: [
      { id: 10, segment: '工程', customerType: '一包', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 11, segment: '工程', customerType: '二包', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 12, segment: '工程', customerType: '域内合作', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 13, segment: '工程', customerType: '域外合作', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 14, segment: '工程', customerType: '其它', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 }
    ]
  }
}

// 数据
const tableData = ref<ProductionExecutionItem[]>([])
const componentData = ref<ComponentData>({ yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 })

// 初始化数据
const initializeData = () => {
  const initialData = getInitialData()
  tableData.value = [...initialData.equipment, ...initialData.project]
  componentData.value = { ...initialData.component }
}

// 按板块分组数据
const equipmentData = computed(() => {
  return tableData.value.filter(item => item.segment === '设备')
})

const projectData = computed(() => {
  return tableData.value.filter(item => item.segment === '工程')
})

// 计算各项总和
const getItemTotal = (item: ProductionExecutionItem): number => {
  return (item.selfProduction || 0) + (item.semiProduction || 0) + (item.outsourcing || 0)
}

const getComponentTotal = (): number => {
  return (componentData.value.selfProduction || 0) + (componentData.value.semiProduction || 0) + (componentData.value.outsourcing || 0)
}


// 计算比率
const calculateRates = (item: ProductionExecutionItem) => {
  // 这里可以添加额外的计算逻辑
  console.log(`重新计算 ${item.customerType} 的比率`)
}

const calculateComponentRates = () => {
  console.log('重新计算元件比率')
}

// 设备板块合计和比率
const equipmentYearlyPlan = computed(() => {
  return equipmentData.value.reduce((sum, item) => sum + Number(item.yearlyPlan || 0), 0)
})

const equipmentSelfProduction = computed(() => {
  return equipmentData.value.reduce((sum, item) => sum + Number(item.selfProduction || 0), 0)
})

const equipmentSemiProduction = computed(() => {
  return equipmentData.value.reduce((sum, item) => sum + Number(item.semiProduction || 0), 0)
})

const equipmentOutsourcing = computed(() => {
  return equipmentData.value.reduce((sum, item) => sum + Number(item.outsourcing || 0), 0)
})

const equipmentSelfRate = computed(() => {
  const total = equipmentYearlyPlan.value
  return total > 0 ? (equipmentSelfProduction.value / total * 100).toFixed(1) + '%' : '0.0%'
})

const equipmentSemiRate = computed(() => {
  const total = equipmentYearlyPlan.value
  return total > 0 ? (equipmentSemiProduction.value / total * 100).toFixed(1) + '%' : '0.0%'
})

const equipmentOutsourcingRate = computed(() => {
  const total = equipmentYearlyPlan.value
  return total > 0 ? (equipmentOutsourcing.value / total * 100).toFixed(1) + '%' : '0.0%'
})

// 元件板块比率
const componentSelfRate = computed(() => {
  const total = componentData.value.yearlyPlan
  return total > 0 ? (componentData.value.selfProduction / total * 100).toFixed(1) + '%' : '0.0%'
})

const componentSemiRate = computed(() => {
  const total = componentData.value.yearlyPlan
  return total > 0 ? (componentData.value.semiProduction / total * 100).toFixed(1) + '%' : '0.0%'
})

const componentOutsourcingRate = computed(() => {
  const total = componentData.value.yearlyPlan
  return total > 0 ? (componentData.value.outsourcing / total * 100).toFixed(1) + '%' : '0.0%'
})

// 工程板块合计和比率
const projectYearlyPlan = computed(() => {
  return projectData.value.reduce((sum, item) => sum + Number(item.yearlyPlan || 0), 0)
})

const projectSelfProduction = computed(() => {
  return projectData.value.reduce((sum, item) => sum + Number(item.selfProduction || 0), 0)
})

const projectSemiProduction = computed(() => {
  return projectData.value.reduce((sum, item) => sum + Number(item.semiProduction || 0), 0)
})

const projectOutsourcing = computed(() => {
  return projectData.value.reduce((sum, item) => sum + Number(item.outsourcing || 0), 0)
})

const projectSelfRate = computed(() => {
  const total = projectYearlyPlan.value
  return total > 0 ? (projectSelfProduction.value / total * 100).toFixed(1) + '%' : '0.0%'
})

const projectSemiRate = computed(() => {
  const total = projectYearlyPlan.value
  return total > 0 ? (projectSemiProduction.value / total * 100).toFixed(1) + '%' : '0.0%'
})

const projectOutsourcingRate = computed(() => {
  const total = projectYearlyPlan.value
  return total > 0 ? (projectOutsourcing.value / total * 100).toFixed(1) + '%' : '0.0%'
})

// 总计
const totalYearlyPlan = computed(() => {
  return equipmentYearlyPlan.value + componentData.value.yearlyPlan + projectYearlyPlan.value
})

const totalSelfProduction = computed(() => {
  return equipmentSelfProduction.value + componentData.value.selfProduction + projectSelfProduction.value
})

const totalSemiProduction = computed(() => {
  return equipmentSemiProduction.value + componentData.value.semiProduction + projectSemiProduction.value
})

const totalOutsourcing = computed(() => {
  return equipmentOutsourcing.value + componentData.value.outsourcing + projectOutsourcing.value
})

// 数据合并函数
const mergeData = (initialData: any, loadedData: any) => {
  if (!loadedData || typeof loadedData !== 'object') {
    return initialData
  }
  
  // 合并设备数据
  if (loadedData.equipment && Array.isArray(loadedData.equipment)) {
    initialData.equipment = initialData.equipment.map((templateItem: ProductionExecutionItem) => {
      const loadedItem = loadedData.equipment.find((item: any) => item.customerType === templateItem.customerType)
      return loadedItem ? { ...templateItem, ...loadedItem } : templateItem
    })
  }
  
  // 合并元件数据
  if (loadedData.component) {
    initialData.component = { ...initialData.component, ...loadedData.component }
  }
  
  // 合并工程数据
  if (loadedData.project && Array.isArray(loadedData.project)) {
    initialData.project = initialData.project.map((templateItem: ProductionExecutionItem) => {
      const loadedItem = loadedData.project.find((item: any) => item.customerType === templateItem.customerType)
      return loadedItem ? { ...templateItem, ...loadedItem } : templateItem
    })
  }
  
  return initialData
}

// 加载数据
const loadData = async (targetPeriod: string) => {
  try {
    console.log(`正在加载生产执行分析数据，期间: ${targetPeriod}`)
    const response = await fetch(`http://127.0.0.1:3000/production-execution/${targetPeriod}`)
    if (!response.ok) {
      if (response.status !== 404) {
        throw new Error('加载数据失败')
      }
      console.log('未找到数据，使用初始模板')
      initializeData()
      return
    }
    const result = await response.json()
    console.log('API返回数据:', result)
    
    if (result.success && result.data) {
      console.log('成功获取数据，开始合并...')
      const initialData = getInitialData()
      const mergedData = mergeData(initialData, result.data)
      
      tableData.value = [...mergedData.equipment, ...mergedData.project]
      componentData.value = { ...mergedData.component }
      console.log('合并后的数据:', { tableData: tableData.value, componentData: componentData.value })
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    initializeData()
  }
}

// 加载备注和建议
const loadRemarksData = async () => {
  const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.PRODUCTION_EXECUTION_ANALYSIS, selectedDate.value)
  remarks.value = loadedRemarks
  suggestions.value = loadedSuggestions
}

// 监听期间变化
watch(selectedDate, (newPeriod) => {
  loadData(newPeriod)
  loadRemarksData()
})

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
  if (newPeriod) {
    selectedDate.value = newPeriod.toString()
  }
})

const handleSave = async () => {
  try {
    console.log('=== 开始保存生产执行分析数据 ===')
    console.log('期间:', selectedDate.value)
    console.log('模块ID:', MODULE_IDS.PRODUCTION_EXECUTION_ANALYSIS)
    
    // 准备表单数据
    const formData = {
      equipment: equipmentData.value.map(item => ({
        customerType: item.customerType,
        yearlyPlan: item.yearlyPlan,
        selfProduction: item.selfProduction,
        semiProduction: item.semiProduction,
        outsourcing: item.outsourcing
      })),
      component: {
        yearlyPlan: componentData.value.yearlyPlan,
        selfProduction: componentData.value.selfProduction,
        semiProduction: componentData.value.semiProduction,
        outsourcing: componentData.value.outsourcing
      },
      project: projectData.value.map(item => ({
        customerType: item.customerType,
        yearlyPlan: item.yearlyPlan,
        selfProduction: item.selfProduction,
        semiProduction: item.semiProduction,
        outsourcing: item.outsourcing
      }))
    }
    
    console.log('表单数据:', formData)

    // 第一步：保存到专用表
    console.log('步骤1：保存到专用表...')
    const response = await fetch('http://127.0.0.1:3000/production-execution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        period: selectedDate.value,
        data: formData
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('专用表保存失败，响应:', errorText)
      throw new Error('保存失败')
    }
    
    const result = await response.json()
    console.log('专用表保存成功:', result)

    // 第二步：记录提交状态
    console.log('步骤2：记录提交状态...')
    const recordSuccess = await recordFormSubmission(
      MODULE_IDS.PRODUCTION_EXECUTION_ANALYSIS,
      selectedDate.value,
      formData,
      remarks.value,
      suggestions.value
    )
    
    console.log('提交状态记录结果:', recordSuccess)
    
    if (recordSuccess) {
      console.log('=== 保存完成，所有步骤成功 ===')
      alert('保存成功')
    } else {
      console.warn('=== 专用表保存成功，但提交状态记录失败 ===')
      alert('保存成功，但提交状态记录失败')
    }
  } catch (error) {
    console.error('=== 保存过程中发生错误 ===', error)
    alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

const handleReset = () => {
  initializeData()
  remarks.value = ''
  suggestions.value = ''
  console.log('已重置为初始数据')
}

onMounted(() => {
  console.log('生产执行分析组件挂载，当前期间:', selectedDate.value)
  if (route.query.period) {
    loadData(route.query.period.toString())
  } else {
    loadData(selectedDate.value)
  }
  loadRemarksData()
})
</script>

<style scoped>
/* 表格样式 */
table {
  width: 100%;
  border-collapse: collapse;
}
</style>