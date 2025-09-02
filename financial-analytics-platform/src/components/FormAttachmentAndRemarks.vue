<template>
  <div class="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
    <!-- 标题栏 -->
    <div class="border-b border-gray-200 px-6 py-4 bg-gray-50">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">附件和备注</h3>
        <span
          class="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          共 {{ attachments.length }} 个附件
        </span>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- 文件上传区域 -->
      <div class="border border-gray-200 rounded-lg">
        <div class="border-b border-gray-200 px-4 py-3 bg-gray-50">
          <h4 class="text-sm font-medium text-gray-900">文件上传</h4>
        </div>

        <div class="p-4">
          <!-- 上传区域 -->
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors duration-200">
            <div class="space-y-4">
              <div class="text-sm text-gray-600">
                <label for="file-upload" class="relative cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                  <span>点击选择文件</span>
                  <input id="file-upload" ref="fileInput" type="file" @change="handleFileSelect" class="sr-only"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt" />
                </label>
                <span class="ml-1">或拖拽文件到此处</span>
              </div>
              <p class="text-xs text-gray-500">支持格式：PDF、DOC、DOCX、XLS、XLSX、JPG、PNG、GIF、TXT</p>
              <p class="text-xs text-blue-600 mt-1">请上传：{{ moduleTitle }}相关文件</p>
            </div>
          </div>

          <!-- 选中文件预览 -->
          <div v-if="selectedFile" class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
                <p class="text-xs text-gray-500">文件大小：{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button @click="uploadSelectedFile" :disabled="uploading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200">
                {{ uploading ? '上传中...' : '确认上传' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 已上传文件列表 -->
      <div v-if="attachments.length > 0" class="border border-gray-200 rounded-lg">
        <div class="border-b border-gray-200 px-4 py-3 bg-gray-50">
          <h4 class="text-sm font-medium text-gray-900">已上传文件</h4>
        </div>

        <div class="divide-y divide-gray-200">
          <div v-for="file in attachments" :key="file.id" class="p-4 hover:bg-gray-50 transition-colors duration-150">
            <div class="flex items-center justify-between">
              <!-- 文件信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3">
                  <h5 class="text-sm font-medium text-gray-900 truncate">{{ file.original_name }}</h5>
                  <span
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {{ formatFileSize(file.file_size) }}
                  </span>
                </div>
                <div class="mt-1 text-xs text-gray-500 space-x-4">
                  <span>上传时间：{{ formatDate(file.uploaded_at) }}</span>
                  <span>上传人：{{ file.uploaded_by }}</span>
                </div>
                <div v-if="file.description" class="mt-2 text-xs text-gray-600 bg-gray-50 rounded px-3 py-1">
                  {{ file.description }}
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex items-center space-x-2 ml-4">
                <a :href="`http://47.111.95.19:3000/files/download/${file.id}`" target="_blank"
                  class="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
                  下载
                </a>
                <button @click="deleteAttachment(file.id)"
                  class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 备注信息区域 -->
      <div class="border border-gray-200 rounded-lg">
        <div class="border-b border-gray-200 px-4 py-3 bg-gray-50">
          <h4 class="text-sm font-medium text-gray-900">管理分析与建议</h4>
        </div>

        <div class="p-4">
          <!-- 填写区域 -->
          <div class="mb-6">
            <h5 class="text-sm font-medium text-gray-800 mb-4 flex items-center">
              <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                </path>
              </svg>
              填写管理分析与建议
            </h5>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- 管理分析填写 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">管理分析</label>
                <textarea :value="remarks"
                  @input="$emit('update:remarks', ($event.target as HTMLTextAreaElement).value)" rows="5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="要求填写对当前数据的总结和说明"></textarea>
              </div>

              <!-- 建议信息填写 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">建议信息</label>
                <textarea :value="suggestions"
                  @input="$emit('update:suggestions', ($event.target as HTMLTextAreaElement).value)" rows="5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="要求填写相关改进意见和优化措施等"></textarea>
              </div>
            </div>
          </div>

          <!-- 查看其他人填写的内容 -->
          <div v-if="managementAnalysis.analysis_items.length > 0 || managementAnalysis.suggestion_items.length > 0"
            class="border-t border-gray-200 pt-6">
            <h5 class="text-sm font-medium text-gray-800 mb-4 flex items-center">
              <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                </path>
              </svg>
              查看相关管理分析与建议
            </h5>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- 管理分析查看 -->
              <div v-if="managementAnalysis.analysis_items.length > 0">
                <h6 class="text-sm font-medium text-gray-700 mb-3">管理分析</h6>
                <div class="space-y-3">
                  <div v-for="(item, index) in managementAnalysis.analysis_items" :key="'analysis-' + index"
                    class="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs text-blue-600 font-medium">
                        填写人：{{ item.submitted_by }} ({{ getRoleDisplayName(item.submitted_by_role) }})
                      </span>
                      <span v-if="item.updated_at" class="text-xs text-gray-500">
                        {{ formatDate(item.updated_at) }}
                      </span>
                    </div>
                    <div class="text-sm text-gray-900 whitespace-pre-wrap" :class="{ 'line-clamp-3': !item.expanded }"
                      v-html="formatContent(item.content)">
                    </div>
                    <button v-if="item.content && item.content.length > 100" @click="toggleExpanded('analysis', index)"
                      class="mt-2 text-xs text-blue-600 hover:text-blue-800 underline">
                      {{ item.expanded ? '收起' : '展开全部' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- 建议信息查看 -->
              <div v-if="managementAnalysis.suggestion_items.length > 0">
                <h6 class="text-sm font-medium text-gray-700 mb-3">建议信息</h6>
                <div class="space-y-3">
                  <div v-for="(item, index) in managementAnalysis.suggestion_items" :key="'suggestion-' + index"
                    class="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs text-green-600 font-medium">
                        填写人：{{ item.submitted_by }} ({{ getRoleDisplayName(item.submitted_by_role) }})
                      </span>
                      <span v-if="item.updated_at" class="text-xs text-gray-500">
                        {{ formatDate(item.updated_at) }}
                      </span>
                    </div>
                    <div class="text-sm text-gray-900 whitespace-pre-wrap" :class="{ 'line-clamp-3': !item.expanded }"
                      v-html="formatContent(item.content)">
                    </div>
                    <button v-if="item.content && item.content.length > 100"
                      @click="toggleExpanded('suggestion', index)"
                      class="mt-2 text-xs text-green-600 hover:text-green-800 underline">
                      {{ item.expanded ? '收起' : '展开全部' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { uploadFile, getFormAttachments, deleteFile, getModuleTitle } from '@/utils/formSubmissionHelper'
import { useUserStore } from '@/stores/user'

interface Props {
  moduleId: number
  period: string
  remarks: string
  suggestions: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:remarks': [value: string]
  'update:suggestions': [value: string]
}>()

// 用户信息
const userStore = useUserStore()

// 文件上传相关
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const attachments = ref<any[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

// 管理分析和建议查看数据
const managementAnalysis = ref<{
  analysis_items: Array<{
    content: string
    submitted_by: string
    submitted_by_role: string
    updated_at?: string
    expanded?: boolean
  }>
  suggestion_items: Array<{
    content: string
    submitted_by: string
    submitted_by_role: string
    updated_at?: string
    expanded?: boolean
  }>
}>({
  analysis_items: [],
  suggestion_items: []
})

// 计算模块标题
const moduleTitle = computed(() => getModuleTitle(props.moduleId))

// 文件处理函数
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const uploadSelectedFile = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  try {
    await uploadFile(selectedFile.value, props.moduleId, props.period, `${moduleTitle.value}相关文件`)
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    await loadAttachments()
    alert('文件上传成功')
  } catch (error) {
    console.error('文件上传失败:', error)
    alert('文件上传失败')
  } finally {
    uploading.value = false
  }
}

const loadAttachments = async () => {
  try {
    attachments.value = await getFormAttachments(props.moduleId, props.period)
  } catch (error) {
    console.error('加载附件列表失败:', error)
  }
}

const deleteAttachment = async (fileId: number) => {
  if (!confirm('确定要删除这个文件吗？')) return

  try {
    const success = await deleteFile(fileId)
    if (success) {
      await loadAttachments()
      alert('文件删除成功')
    }
  } catch (error) {
    console.error('文件删除失败:', error)
    alert('文件删除失败')
  }
}

// 加载管理分析和建议信息
const loadManagementAnalysis = async () => {
  if (!props.moduleId || !props.period) return

  try {
    const userId = userStore.userInfo?.id
    if (!userId) return

    const response = await fetch(`http://47.111.95.19:3000/forms/management-analysis/${props.moduleId}/${props.period}?userId=${userId}`)

    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        managementAnalysis.value = result.data
        // 为每个项目添加展开状态
        managementAnalysis.value.analysis_items.forEach(item => {
          item.expanded = false
        })
        managementAnalysis.value.suggestion_items.forEach(item => {
          item.expanded = false
        })
      }
    }
  } catch (error) {
    console.error('加载管理分析和建议失败:', error)
  }
}

// 切换展开/收起状态
const toggleExpanded = (type: 'analysis' | 'suggestion', index: number) => {
  if (type === 'analysis') {
    managementAnalysis.value.analysis_items[index].expanded = !managementAnalysis.value.analysis_items[index].expanded
  } else {
    managementAnalysis.value.suggestion_items[index].expanded = !managementAnalysis.value.suggestion_items[index].expanded
  }
}

// 格式化内容显示
const formatContent = (content: string) => {
  if (!content) return ''
  // 将换行符转换为HTML换行
  return content.replace(/\n/g, '<br>')
}

// 角色显示名称转换
const getRoleDisplayName = (roleName: string) => {
  const roleMap: { [key: string]: string } = {
    'super_admin': '超级管理员',
    'daya_office': '大亚管理办公室',
    'ceo_nanhua': '总经理',
    'vice_ceo_finance': '副总',
    'dept_manager_finance': '财务部门经理',
    'dept_manager_marketing': '营销部门经理',
    'dept_manager_production': '生产部门经理',
    'dept_manager_hr': '人事部门经理'
  }
  return roleMap[roleName] || roleName
}

// 工具函数
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 保存管理分析和建议
const saveManagementAnalysis = async () => {
  if (!props.moduleId || !props.period) return

  try {
    const userId = userStore.userInfo?.id
    if (!userId) return

    const response = await fetch(`http://47.111.95.19:3000/forms/management-analysis/${props.moduleId}/${props.period}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        remarks: props.remarks,
        suggestions: props.suggestions
      })
    })

    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        // 保存成功后重新加载管理分析建议
        await loadManagementAnalysis()
      }
    }
  } catch (error) {
    console.error('保存管理分析和建议失败:', error)
  }
}

// 防抖保存函数
let saveTimeout: number | null = null
const debouncedSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(() => {
    saveManagementAnalysis()
  }, 1000)
}

// 监听备注和建议变化，自动保存
watch(() => props.remarks, () => {
  if (props.remarks !== undefined) {
    debouncedSave()
  }
})

watch(() => props.suggestions, () => {
  if (props.suggestions !== undefined) {
    debouncedSave()
  }
})

// 监听期间变化，重新加载附件和管理分析建议
watch(() => props.period, () => {
  loadAttachments()
  loadManagementAnalysis()
})

// 监听模块变化，重新加载管理分析建议
watch(() => props.moduleId, () => {
  loadManagementAnalysis()
})

onMounted(() => {
  loadAttachments()
  loadManagementAnalysis()
})
</script>

<style scoped>
.file-upload-area {
  border: 2px dashed #d1d5db;
  transition: border-color 0.2s ease-in-out;
}

.file-upload-area:hover {
  border-color: #3b82f6;
}

.file-upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>