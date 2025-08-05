<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">生产/施工计划执行情况</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <span class="mr-2">选择月份：</span>
          <input type="month" v-model="selectedDate" class="border rounded px-2 py-1" @change="updateData" />
        </div>
        <button 
          @click="saveData" 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          保存数据
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border px-4 py-2 text-left">板块</th>
              <th class="border px-4 py-2 text-left">客户属性</th>
              <th class="border px-4 py-2 text-center">年度目标</th>
              <th class="border px-4 py-2 text-center">准时完工率</th>
              <th class="border px-4 py-2 text-center">出厂合格率</th>
              <th class="border px-4 py-2 text-center">计划达成率</th>
            </tr>
          </thead>
          <tbody>
            <!-- 设备板块 -->
            <tr v-for="(item, index) in equipmentData" :key="`equipment-${index}`">
              <td class="border px-4 py-2" v-if="index === 0" :rowspan="equipmentData.length">设备</td>
              <td class="border px-4 py-2">{{ item.customerType }}</td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="item.yearlyTarget" 
                  class="w-full border-0 focus:ring-0"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="item.onTimeRate" 
                  class="w-full border-0 focus:ring-0"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="item.qualifiedRate" 
                  class="w-full border-0 focus:ring-0"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="item.achievementRate" 
                  class="w-full border-0 focus:ring-0"
                />
              </td>
            </tr>
            
            <!-- 元件板块 -->
            <tr v-for="(item, index) in componentData" :key="`component-${index}`">
              <td class="border px-4 py-2" v-if="index === 0" :rowspan="componentData.length">元件</td>
              <td class="border px-4 py-2">{{ item.customerType }}</td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="item.yearlyTarget" 
                  class="w-full border-0 focus:ring-0"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="item.onTimeRate" 
                  class="w-full border-0 focus:ring-0"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="item.qualifiedRate" 
                  class="w-full border-0 focus:ring-0"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="item.achievementRate" 
                  class="w-full border-0 focus:ring-0"
                />
              </td>
            </tr>
            
            <!-- 工程板块 -->
            <tr v-for="(item, index) in projectData" :key="`project-${index}`">
              <td class="border px-4 py-2" v-if="index === 0" :rowspan="projectData.length">工程</td>
              <td class="border px-4 py-2">{{ item.customerType }}</td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="item.yearlyTarget" 
                  class="w-full border-0 focus:ring-0"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="item.onTimeRate" 
                  class="w-full border-0 focus:ring-0"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="item.qualifiedRate" 
                  class="w-full border-0 focus:ring-0"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="item.achievementRate" 
                  class="w-full border-0 focus:ring-0"
                />
              </td>
            </tr>
            
            <!-- 合计行 -->
            <tr class="bg-gray-100 font-bold">
              <td class="border px-4 py-2" colspan="2">合计</td>
              <td class="border px-4 py-2"></td>
              <td class="border px-4 py-2">{{ averageOnTimeRate }}</td>
              <td class="border px-4 py-2">{{ averageQualifiedRate }}</td>
              <td class="border px-4 py-2">{{ averageAchievementRate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 文件上传和备注组件 -->
    <FormAttachmentAndRemarks 
        :module-id="MODULE_IDS.PRODUCTION_VALUE"
        :period="selectedDate"
        v-model:remarks="remarks"
        v-model:suggestions="suggestions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, MODULE_IDS } from '@/utils/formSubmissionHelper'

interface ProductionPlanItem {
  id: number
  segment: string
  customerType: string
  yearlyTarget: string
  onTimeRate: string
  qualifiedRate: string
  achievementRate: string
  date: string
}

const selectedDate = ref(new Date().toISOString().substr(0, 7))
const userStore = useUserStore()
const remarks = ref('')
const suggestions = ref('')

// 使用统一的模块ID - 产值结构与质量

const tableData = ref<ProductionPlanItem[]>([
  { id: 1, segment: '设备', customerType: '上海', yearlyTarget: '100%', onTimeRate: '99%', qualifiedRate: '99.99%', achievementRate: '80%', date: selectedDate.value },
  { id: 2, segment: '设备', customerType: '国网', yearlyTarget: '100%', onTimeRate: '98%', qualifiedRate: '99.95%', achievementRate: '85%', date: selectedDate.value },
  { id: 3, segment: '设备', customerType: '江苏', yearlyTarget: '100%', onTimeRate: '97%', qualifiedRate: '99.98%', achievementRate: '82%', date: selectedDate.value },
  { id: 4, segment: '设备', customerType: '输配电内配', yearlyTarget: '100%', onTimeRate: '98.5%', qualifiedRate: '99.97%', achievementRate: '84%', date: selectedDate.value },
  { id: 5, segment: '设备', customerType: '西门子', yearlyTarget: '100%', onTimeRate: '99.5%', qualifiedRate: '100%', achievementRate: '88%', date: selectedDate.value },
  { id: 6, segment: '设备', customerType: '同业', yearlyTarget: '100%', onTimeRate: '97.5%', qualifiedRate: '99.96%', achievementRate: '83%', date: selectedDate.value },
  { id: 7, segment: '设备', customerType: '用户', yearlyTarget: '100%', onTimeRate: '98%', qualifiedRate: '99.98%', achievementRate: '81%', date: selectedDate.value },
  { id: 8, segment: '设备', customerType: '其它', yearlyTarget: '100%', onTimeRate: '96%', qualifiedRate: '99.9%', achievementRate: '79%', date: selectedDate.value },
  { id: 9, segment: '元件', customerType: '用户', yearlyTarget: '100%', onTimeRate: '97%', qualifiedRate: '99.95%', achievementRate: '83%', date: selectedDate.value },
  { id: 10, segment: '工程', customerType: '一包', yearlyTarget: '100%', onTimeRate: '95%', qualifiedRate: '99.8%', achievementRate: '78%', date: selectedDate.value },
  { id: 11, segment: '工程', customerType: '二包', yearlyTarget: '100%', onTimeRate: '94%', qualifiedRate: '99.85%', achievementRate: '77%', date: selectedDate.value },
  { id: 12, segment: '工程', customerType: '域内合作', yearlyTarget: '100%', onTimeRate: '96%', qualifiedRate: '99.7%', achievementRate: '80%', date: selectedDate.value },
  { id: 13, segment: '工程', customerType: '域外合作', yearlyTarget: '100%', onTimeRate: '93%', qualifiedRate: '99.6%', achievementRate: '75%', date: selectedDate.value },
  { id: 14, segment: '工程', customerType: '其它', yearlyTarget: '100%', onTimeRate: '92%', qualifiedRate: '99.5%', achievementRate: '73%', date: selectedDate.value }
])

const filteredData = computed(() => {
  return tableData.value.filter(item => item.date === selectedDate.value)
})

// 按板块分组数据
const equipmentData = computed(() => {
  return filteredData.value.filter(item => item.segment === '设备')
})

const componentData = computed(() => {
  return filteredData.value.filter(item => item.segment === '元件')
})

const projectData = computed(() => {
  return filteredData.value.filter(item => item.segment === '工程')
})

// 计算平均准时完工率
const averageOnTimeRate = computed(() => {
  const rates = filteredData.value.map(item => {
    const rate = parseFloat(item.onTimeRate.replace('%', ''))
    return isNaN(rate) ? 0 : rate
  })
  
  if (rates.length === 0) return '0%'
  
  const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length
  return average.toFixed(2) + '%'
})

// 计算平均出厂合格率
const averageQualifiedRate = computed(() => {
  const rates = filteredData.value.map(item => {
    const rate = parseFloat(item.qualifiedRate.replace('%', ''))
    return isNaN(rate) ? 0 : rate
  })
  
  if (rates.length === 0) return '0%'
  
  const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length
  return average.toFixed(2) + '%'
})

// 计算平均计划达成率
const averageAchievementRate = computed(() => {
  const rates = filteredData.value.map(item => {
    const rate = parseFloat(item.achievementRate.replace('%', ''))
    return isNaN(rate) ? 0 : rate
  })
  
  if (rates.length === 0) return '0%'
  
  const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length
  return average.toFixed(2) + '%'
})

const updateData = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/production-plan-execution/${selectedDate.value}`)
    if (!response.ok) {
      if (response.status !== 404) {
        throw new Error('加载数据失败')
      }
      return
    }
    const result = await response.json()
    if (result.data) {
      // 重构数据格式以匹配现有的tableData结构
      const newData = []
      
      // 设备数据
      if (result.data.equipment) {
        result.data.equipment.forEach((item, index) => {
          newData.push({
            id: index + 1,
            segment: '设备',
            customerType: item.customerType,
            yearlyTarget: item.yearlyTarget,
            onTimeRate: item.onTimeRate,
            qualifiedRate: item.qualifiedRate,
            achievementRate: item.achievementRate,
            date: selectedDate.value
          })
        })
      }
      
      // 元件数据
      if (result.data.component) {
        result.data.component.forEach((item, index) => {
          newData.push({
            id: newData.length + 1,
            segment: '元件',
            customerType: item.customerType,
            yearlyTarget: item.yearlyTarget,
            onTimeRate: item.onTimeRate,
            qualifiedRate: item.qualifiedRate,
            achievementRate: item.achievementRate,
            date: selectedDate.value
          })
        })
      }
      
      // 工程数据
      if (result.data.project) {
        result.data.project.forEach((item, index) => {
          newData.push({
            id: newData.length + 1,
            segment: '工程',
            customerType: item.customerType,
            yearlyTarget: item.yearlyTarget,
            onTimeRate: item.onTimeRate,
            qualifiedRate: item.qualifiedRate,
            achievementRate: item.achievementRate,
            date: selectedDate.value
          })
        })
      }
      
      if (newData.length > 0) {
        tableData.value = newData
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 加载备注数据
const loadRemarks = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.PRODUCTION_VALUE}/${selectedDate.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.data) {
        remarks.value = result.data.remarks || ''
        suggestions.value = result.data.suggestions || ''
      }
    }
  } catch (error) {
    console.error('加载备注失败:', error)
  }
}

const saveData = async () => {
  try {
    const equipmentData = filteredData.value.filter(item => item.segment === '设备')
    const componentData = filteredData.value.filter(item => item.segment === '元件')
    const projectData = filteredData.value.filter(item => item.segment === '工程')
    
    const response = await fetch('http://127.0.0.1:3000/production-plan-execution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        period: selectedDate.value,
        data: {
          equipment: equipmentData.map(item => ({
            customerType: item.customerType,
            yearlyTarget: item.yearlyTarget,
            onTimeRate: item.onTimeRate,
            qualifiedRate: item.qualifiedRate,
            achievementRate: item.achievementRate
          })),
          component: componentData.map(item => ({
            customerType: item.customerType,
            yearlyTarget: item.yearlyTarget,
            onTimeRate: item.onTimeRate,
            qualifiedRate: item.qualifiedRate,
            achievementRate: item.achievementRate
          })),
          project: projectData.map(item => ({
            customerType: item.customerType,
            yearlyTarget: item.yearlyTarget,
            onTimeRate: item.onTimeRate,
            qualifiedRate: item.qualifiedRate,
            achievementRate: item.achievementRate
          }))
        }
      })
    })

    if (!response.ok) {
      throw new Error('保存失败')
    }

    // 业务数据保存成功后，记录提交状态
    const formData = {
      equipment: filteredData.value.filter(item => item.segment === '设备'),
      component: filteredData.value.filter(item => item.segment === '元件'),
      project: filteredData.value.filter(item => item.segment === '工程')
    }
    
    await recordFormSubmission(MODULE_IDS.PRODUCTION_VALUE, selectedDate.value, formData, remarks.value, suggestions.value)
    
    alert('数据保存成功！')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}


onMounted(() => {
  // 在实际应用中，这里应该从API获取初始数据
  updateData()
  loadRemarks()
})
</script> 