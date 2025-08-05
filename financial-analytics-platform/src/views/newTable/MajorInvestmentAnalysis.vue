<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">年度重大投资情况（单位：万元）</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <span class="mr-2">选择月份：</span>
          <input type="month" v-model="selectedDate" class="border rounded px-2 py-1" />
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
              <th class="border px-4 py-2 text-center">序号</th>
              <th class="border px-4 py-2 text-center">项目名称</th>
              <th class="border px-4 py-2 text-center">年初计划</th>
              <th class="border px-4 py-2 text-center">当期执行</th>
              <th class="border px-4 py-2 text-center">执行进度</th>
            </tr>
          </thead>
          <tbody>
            <!-- 项目行 -->
            <tr v-for="(project, index) in projectData" :key="index">
              <td class="border px-4 py-2 text-center">{{ index + 1 }}</td>
              <td class="border px-4 py-2">
                <input 
                  type="text" 
                  v-model="project.projectName"
                  class="w-full border-0 focus:ring-0"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model="project.initialPlan"
                  class="w-full border-0 focus:ring-0"
                  @input="calculateProgress(index)"
                />
              </td>
              <td class="border px-4 py-2">
                <input 
                  type="number" 
                  v-model="project.currentExecution"
                  class="w-full border-0 focus:ring-0"
                  @input="calculateProgress(index)"
                />
              </td>
              <td class="border px-4 py-2 text-center">
                {{ project.executionProgress || '0.0%' }}
              </td>
            </tr>
            
            <!-- 合计行 -->
            <tr class="bg-gray-100 font-bold">
              <td class="border px-4 py-2 text-center" colspan="2">合计</td>
              <td class="border px-4 py-2 text-center">{{ totalInitialPlan }}</td>
              <td class="border px-4 py-2 text-center">{{ totalCurrentExecution }}</td>
              <td class="border px-4 py-2 text-center">{{ totalProgress }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 文件上传和备注组件 -->
      <FormAttachmentAndRemarks 
          :module-id="MODULE_IDS.MAJOR_INVESTMENT_ANALYSIS"
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
import { recordFormSubmission, MODULE_IDS, loadRemarksAndSuggestions } from '@/utils/formSubmissionHelper'

interface ProjectItem {
  id: number
  projectName: string
  initialPlan: number
  currentExecution: number
  executionProgress: string
}

const route = useRoute()
const selectedDate = ref(route.query.period?.toString() || new Date().toISOString().substr(0, 7))
const remarks = ref('')
const suggestions = ref('')

// 获取初始数据模板
const getInitialData = (): ProjectItem[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    projectName: '',
    initialPlan: 0,
    currentExecution: 0,
    executionProgress: '0.0%'
  }))
}

// 数据合并函数
const mergeData = (initialData: ProjectItem[], loadedData: any) => {
  if (!loadedData || !loadedData.projects) return initialData
  
  const mergedProjects = [...initialData]
  loadedData.projects.forEach((loadedProject: any, index: number) => {
    if (index < mergedProjects.length) {
      mergedProjects[index] = { ...mergedProjects[index], ...loadedProject }
    }
  })
  
  return mergedProjects
}

const projectData = ref<ProjectItem[]>(getInitialData())

// 计算单个项目的执行进度
const calculateProgress = (index: number) => {
  const project = projectData.value[index]
  const initialPlan = Number(project.initialPlan || 0)
  const currentExecution = Number(project.currentExecution || 0)
  
  if (initialPlan > 0) {
    project.executionProgress = (currentExecution / initialPlan * 100).toFixed(1) + '%'
  } else {
    project.executionProgress = '0.0%'
  }
}

// 计算合计
const totalInitialPlan = computed(() => {
  return projectData.value.reduce((sum, project) => sum + Number(project.initialPlan || 0), 0).toFixed(2)
})

const totalCurrentExecution = computed(() => {
  return projectData.value.reduce((sum, project) => sum + Number(project.currentExecution || 0), 0).toFixed(2)
})

const totalProgress = computed(() => {
  const initial = parseFloat(totalInitialPlan.value)
  const current = parseFloat(totalCurrentExecution.value)
  
  if (initial > 0) {
    return (current / initial * 100).toFixed(1) + '%'
  }
  return '0.0%'
})

const loadData = async (targetPeriod: string) => {
  console.log(`正在加载年度重大投资情况数据，期间: ${targetPeriod}`)
  try {
    const response = await fetch(`http://127.0.0.1:3000/major-investment-analysis/${targetPeriod}`)
    if (!response.ok) {
      if (response.status !== 404) {
        throw new Error('加载数据失败')
      }
      console.log('未找到数据，使用空白模板')
      return
    }
    const result = await response.json()
    console.log('加载到的数据:', result)
    
    if (result.data) {
      // 使用数据合并逻辑
      const mergedData = mergeData(getInitialData(), result.data)
      projectData.value = mergedData
      console.log('数据合并完成:', projectData.value)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 加载备注信息
const loadRemarksData = async (targetPeriod: string) => {
  try {
    const remarksData = await loadRemarksAndSuggestions(MODULE_IDS.MAJOR_INVESTMENT_ANALYSIS, targetPeriod)
    remarks.value = remarksData.remarks
    suggestions.value = remarksData.suggestions
  } catch (error) {
    console.error('加载备注信息失败:', error)
  }
}

const saveData = async () => {
  try {
    // 过滤掉空项目（没有项目名称的）
    const validProjects = projectData.value.filter(project => project.projectName.trim() !== '')
    
    const formData = {
      projects: validProjects,
      summary: {
        totalInitialPlan: parseFloat(totalInitialPlan.value),
        totalCurrentExecution: parseFloat(totalCurrentExecution.value),
        totalExecutionProgress: totalProgress.value
      }
    }
    
    // 保存到专用表
    const response = await fetch('http://127.0.0.1:3000/major-investment-analysis', {
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
      throw new Error('保存失败')
    }

    // 记录提交状态到 form_submissions 表
    await recordFormSubmission(
      MODULE_IDS.MAJOR_INVESTMENT_ANALYSIS,
      selectedDate.value,
      formData,
      remarks.value,
      suggestions.value
    )

    alert('数据保存成功！')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 监听期间变化
watch(selectedDate, (newPeriod) => {
  if (newPeriod) {
    loadData(newPeriod)
    loadRemarksData(newPeriod)
  }
})

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
  if (newPeriod) {
    selectedDate.value = newPeriod.toString()
  }
})

onMounted(() => {
  const targetPeriod = route.query.period?.toString() || selectedDate.value
  loadData(targetPeriod)
  loadRemarksData(targetPeriod)
})
</script> 