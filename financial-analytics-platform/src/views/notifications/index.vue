<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">通知管理</h1>
        <p class="text-gray-600 mt-2">管理系统通知和公告</p>
      </div>

      <!-- 操作栏 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <!-- 搜索和筛选 -->
          <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索通知标题或内容..."
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @input="handleSearch"
            />
            <select
              v-model="filterType"
              @change="handleFilter"
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有类型</option>
              <option value="info">信息</option>
              <option value="warning">警告</option>
              <option value="error">错误</option>
              <option value="success">成功</option>
            </select>
            <select
              v-model="filterPriority"
              @change="handleFilter"
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有优先级</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>

          <!-- 操作按钮 -->
          <div class="flex space-x-2">
            <button
              @click="openCreateModal"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              新建通知
            </button>
            <button
              @click="refreshData"
              class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              刷新
            </button>
          </div>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6" v-if="stats">
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">总通知数</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total_notifications }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">已发布</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.published_count }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">草稿</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.draft_count }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">已归档</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.archived_count }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 通知列表 -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">通知列表</h3>
        </div>
        
        <div class="p-6">
          <div v-if="loading" class="text-center py-8 text-gray-500">
            <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            加载中...
          </div>
          
          <div v-else-if="notifications.length === 0" class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <p>暂无通知数据</p>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="notification in notifications" 
              :key="notification.id"
              class="p-4 border rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              :class="getNotificationBorderClass(notification.type)"
              @click="viewNotification(notification)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h4 class="font-medium text-gray-900">{{ notification.title }}</h4>
                    <span class="px-2 py-1 text-xs rounded-full" :class="getTypeClass(notification.type)">
                      {{ getTypeText(notification.type) }}
                    </span>
                    <span class="px-2 py-1 text-xs rounded-full" :class="getPriorityClass(notification.priority)">
                      {{ getPriorityText(notification.priority) }}
                    </span>
                  </div>
                  <p class="text-gray-600 text-sm mb-2 line-clamp-2">{{ notification.content }}</p>
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span>发送者: {{ notification.sender_name || '系统' }}</span>
                    <span>创建时间: {{ formatDate(notification.created_at) }}</span>
                    <span v-if="notification.start_time">开始时间: {{ formatDate(notification.start_time) }}</span>
                    <span v-if="notification.end_time">结束时间: {{ formatDate(notification.end_time) }}</span>
                  </div>
                </div>
                <div class="ml-4 flex space-x-2">
                  <button
                    @click.stop="editNotification(notification)"
                    class="p-1 text-blue-600 hover:text-blue-700"
                    title="编辑"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    @click.stop="deleteNotification(notification.id)"
                    class="p-1 text-red-600 hover:text-red-700"
                    title="删除"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="pagination && pagination.totalPages > 1" class="flex justify-center mt-6">
            <nav class="flex space-x-2">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page <= 1"
                class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span class="px-3 py-2 text-sm text-gray-700">
                第 {{ pagination.page }} 页，共 {{ pagination.totalPages }} 页
              </span>
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.totalPages"
                class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑通知模态框 -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto" @click.stop>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ isEditing ? '编辑通知' : '新建通知' }}
        </h3>
        
        <form @submit.prevent="saveNotification">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
              <input
                v-model="formData.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入通知标题"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
              <textarea
                v-model="formData.content"
                required
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入通知内容"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <select
                  v-model="formData.type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="info">信息</option>
                  <option value="warning">警告</option>
                  <option value="error">错误</option>
                  <option value="success">成功</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <select
                  v-model="formData.priority"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                <input
                  v-model="formData.start_time"
                  type="datetime-local"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                <input
                  v-model="formData.end_time"
                  type="datetime-local"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                v-model="formData.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="archived">已归档</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'

interface Notification {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'error' | 'success'
  priority: 'low' | 'medium' | 'high'
  status: 'draft' | 'published' | 'archived'
  sender_name?: string
  created_at: string
  start_time?: string
  end_time?: string
}

interface Stats {
  total_notifications: number
  published_count: number
  draft_count: number
  archived_count: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const userStore = useUserStore()

// 响应式数据
const notifications = ref<Notification[]>([])
const stats = ref<Stats | null>(null)
const pagination = ref<Pagination | null>(null)
const loading = ref(true)
const saving = ref(false)

// 搜索和筛选
const searchQuery = ref('')
const filterType = ref('')
const filterPriority = ref('')

// 模态框
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

// 表单数据
const formData = ref({
  title: '',
  content: '',
  type: 'info' as const,
  priority: 'medium' as const,
  status: 'published' as const,
  start_time: '',
  end_time: ''
})

// 获取通知列表
const fetchNotifications = async (page = 1) => {
  try {
    loading.value = true
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10'
    })
    
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    if (filterType.value) {
      params.append('type', filterType.value)
    }
    if (filterPriority.value) {
      params.append('priority', filterPriority.value)
    }

    const response = await fetch(`http://127.0.0.1:3000/notifications?${params}`)
    
    if (!response.ok) {
      throw new Error('获取通知列表失败')
    }
    
    const result = await response.json()
    if (result.success) {
      notifications.value = result.data.notifications
      pagination.value = result.data.pagination
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await fetch('http://127.0.0.1:3000/notifications/stats/summary')
    
    if (!response.ok) {
      throw new Error('获取统计数据失败')
    }
    
    const result = await response.json()
    if (result.success) {
      stats.value = result.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 搜索处理
const handleSearch = () => {
  fetchNotifications(1)
}

// 筛选处理
const handleFilter = () => {
  fetchNotifications(1)
}

// 分页处理
const changePage = (page: number) => {
  if (page >= 1 && pagination.value && page <= pagination.value.totalPages) {
    fetchNotifications(page)
  }
}

// 刷新数据
const refreshData = () => {
  fetchNotifications(pagination.value?.page || 1)
  fetchStats()
}

// 打开创建模态框
const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    title: '',
    content: '',
    type: 'info',
    priority: 'medium',
    status: 'published',
    start_time: '',
    end_time: ''
  }
  showModal.value = true
}

// 编辑通知
const editNotification = (notification: Notification) => {
  isEditing.value = true
  editingId.value = notification.id
  formData.value = {
    title: notification.title,
    content: notification.content,
    type: notification.type,
    priority: notification.priority,
    status: notification.status,
    start_time: notification.start_time ? notification.start_time.slice(0, 16) : '',
    end_time: notification.end_time ? notification.end_time.slice(0, 16) : ''
  }
  showModal.value = true
}

// 关闭模态框
const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingId.value = null
}

// 保存通知
const saveNotification = async () => {
  try {
    saving.value = true
    
    const data = {
      ...formData.value,
      sender_id: userStore.userInfo?.id || 1,
      start_time: formData.value.start_time || null,
      end_time: formData.value.end_time || null
    }

    const url = isEditing.value 
      ? `http://127.0.0.1:3000/notifications/${editingId.value}`
      : 'http://127.0.0.1:3000/notifications'
    
    const method = isEditing.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('保存通知失败')
    }

    const result = await response.json()
    if (result.success) {
      closeModal()
      refreshData()
    }
  } catch (error) {
    console.error('保存通知失败:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 删除通知
const deleteNotification = async (id: number) => {
  if (!confirm('确定要删除这条通知吗？')) {
    return
  }

  try {
    const response = await fetch(`http://127.0.0.1:3000/notifications/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('删除通知失败')
    }

    const result = await response.json()
    if (result.success) {
      refreshData()
    }
  } catch (error) {
    console.error('删除通知失败:', error)
    alert('删除失败，请重试')
  }
}

// 查看通知详情
const viewNotification = (notification: Notification) => {
  // 这里可以实现查看详情的逻辑
  console.log('查看通知详情:', notification)
}

// 工具函数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getTypeClass = (type: string) => {
  const classes = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const getTypeText = (type: string) => {
  const texts = {
    info: '信息',
    warning: '警告',
    error: '错误',
    success: '成功'
  }
  return texts[type as keyof typeof texts] || '信息'
}

const getPriorityClass = (priority: string) => {
  const classes = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-red-100 text-red-800'
  }
  return classes[priority as keyof typeof classes] || classes.medium
}

const getPriorityText = (priority: string) => {
  const texts = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return texts[priority as keyof typeof texts] || '中'
}

const getNotificationBorderClass = (type: string) => {
  const classes = {
    info: 'border-blue-200',
    warning: 'border-yellow-200',
    error: 'border-red-200',
    success: 'border-green-200'
  }
  return classes[type as keyof typeof classes] || classes.info
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    fetchNotifications(),
    fetchStats()
  ])
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>