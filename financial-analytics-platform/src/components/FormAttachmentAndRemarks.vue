<template>
  <div class="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
    <!-- 标题栏 -->
    <div class="border-b border-gray-200 px-6 py-4 bg-gray-50">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">附件和备注</h3>
        <span class="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
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
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors duration-200">
            <div class="space-y-4">
              <div class="text-sm text-gray-600">
                <label for="file-upload" class="relative cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                  <span>点击选择文件</span>
                  <input 
                    id="file-upload"
                    ref="fileInput"
                    type="file" 
                    @change="handleFileSelect"
                    class="sr-only"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                  />
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
              <button 
                @click="uploadSelectedFile" 
                :disabled="uploading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
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
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
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
                <a 
                  :href="`http://127.0.0.1:3000/files/download/${file.id}`" 
                  target="_blank"
                  class="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                  下载
                </a>
                <button 
                  @click="deleteAttachment(file.id)"
                  class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                >
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
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 备注信息 -->
            <div>

              <label class="block text-sm font-medium text-gray-700 mb-2">管理分析</label>
              <textarea 
                :value="remarks"
                @input="$emit('update:remarks', ($event.target as HTMLTextAreaElement).value)"
                rows="5" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="要求填写对当前数据的总结和说明"
              ></textarea>
            </div>
            
            <!-- 建议信息 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">建议信息</label>
              <textarea 
                :value="suggestions"
                @input="$emit('update:suggestions', ($event.target as HTMLTextAreaElement).value)"
                rows="5" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="要求填写相关改进意见和优化措施等"
              ></textarea>
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

// 文件上传相关
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const attachments = ref<any[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

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

// 监听期间变化，重新加载附件
watch(() => props.period, () => {
  loadAttachments()
})

onMounted(() => {
  loadAttachments()
})
</script>