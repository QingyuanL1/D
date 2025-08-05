<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">用户管理</h1>
        <p class="text-gray-600 mt-2">管理系统用户和角色分配</p>
      </div>

      <!-- 操作栏 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <!-- 搜索框 -->
          <div class="flex items-center space-x-4">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索用户..."
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            
            <!-- 角色筛选 -->
            <select
              v-model="selectedRoleFilter"
              class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有角色</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.role_name }}
              </option>
            </select>
          </div>

          <!-- 新增用户按钮 -->
          <button
            @click="showCreateModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            新增用户
          </button>
        </div>
      </div>

      <!-- 用户列表 -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">用户列表</h3>
          <p class="text-sm text-gray-600 mt-1">共 {{ filteredUsers.length }} 个用户</p>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户信息</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading" class="text-center">
                <td colspan="5" class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center justify-center">
                    <div class="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                    加载中...
                  </div>
                </td>
              </tr>
              <tr v-else-if="paginatedUsers.length === 0" class="text-center">
                <td colspan="5" class="px-6 py-4 whitespace-nowrap">暂无用户数据</td>
              </tr>
              <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getRoleBadgeClass(user.role_name)">
                    {{ user.role_description || user.role_name }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    活跃
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="editUser(user)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    编辑
                  </button>
                  <button
                    @click="viewPermissions(user)"
                    class="text-green-600 hover:text-green-900"
                  >
                    权限
                  </button>
                  <button
                    v-if="user.id !== currentUserId"
                    @click="deleteUser(user)"
                    class="text-red-600 hover:text-red-900"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            显示 {{ startIndex + 1 }} 到 {{ Math.min(startIndex + pageSize, filteredUsers.length) }} 
            的 {{ filteredUsers.length }} 个结果
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span class="px-3 py-1 text-sm text-gray-700">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑用户弹窗 -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ showCreateModal ? '新增用户' : '编辑用户' }}
          </h3>
        </div>
        
        <form @submit.prevent="showCreateModal ? createUser() : updateUser()" class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
              v-model="userForm.username"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              v-model="userForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div v-if="showCreateModal">
            <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              v-model="userForm.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">角色</label>
            <select
              v-model="userForm.role_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">请选择角色</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.role_name }} - {{ role.role_description }}
              </option>
            </select>
          </div>
        </form>
        
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            @click="closeModal"
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="showCreateModal ? createUser() : updateUser()"
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            {{ showCreateModal ? '创建' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 权限查看弹窗 -->
    <div v-if="showPermissionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ selectedUser?.username }} 的权限详情
          </h3>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div v-if="userPermissions" class="space-y-6">
            <!-- 角色信息 -->
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-semibold text-blue-900">角色信息</h4>
              <p class="text-blue-700 mt-1">
                {{ userPermissions.user.role_name }} - {{ userPermissions.user.role_description }}
              </p>
            </div>

            <!-- 权限统计 -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-semibold text-green-900">可查看模块</h4>
                <p class="text-2xl font-bold text-green-700 mt-1">
                  {{ userPermissions.permissions.read.length }}
                </p>
              </div>
              <div class="bg-orange-50 p-4 rounded-lg">
                <h4 class="font-semibold text-orange-900">可编辑模块</h4>
                <p class="text-2xl font-bold text-orange-700 mt-1">
                  {{ userPermissions.permissions.write.length }}
                </p>
              </div>
            </div>

            <!-- 按分类显示权限 -->
            <div v-for="category in getPermissionsByCategory()" :key="category.name" class="border rounded-lg p-4">
              <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                <span class="w-3 h-3 rounded-full mr-2" 
                      :class="{
                        'bg-blue-500': category.name === '财务',
                        'bg-green-500': category.name === '营销', 
                        'bg-yellow-500': category.name === '生产',
                        'bg-purple-500': category.name === '企管'
                      }"></span>
                {{ category.name }} ({{ category.modules.length }} 个模块)
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div v-for="module in category.modules" :key="module.id" class="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span class="text-sm text-gray-700">{{ module.module_name }}</span>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        :class="{
                          'bg-green-100 text-green-800': module.permission_type === 'write',
                          'bg-blue-100 text-blue-800': module.permission_type === 'read'
                        }">
                    {{ module.permission_type === 'write' ? '可编辑' : '只读' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            @click="showPermissionModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

interface User {
  id: number
  username: string
  email: string
  role_id: number
  role_name: string
  role_description: string
  created_at: string
}

interface Role {
  id: number
  role_name: string
  role_description: string
}

interface UserPermissions {
  user: {
    role_name: string
    role_description: string
  }
  permissions: {
    read: Array<{
      id: number
      module_name: string
      module_category: string
      permission_type: string
    }>
    write: Array<{
      id: number
      module_name: string
      module_category: string
      permission_type: string
    }>
  }
}

const userStore = useUserStore()

// 数据
const users = ref<User[]>([])
const roles = ref<Role[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedRoleFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 弹窗状态
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showPermissionModal = ref(false)

// 表单数据
const userForm = ref({
  id: null as number | null,
  username: '',
  email: '',
  password: '',
  role_id: null as number | null
})

// 权限数据
const selectedUser = ref<User | null>(null)
const userPermissions = ref<UserPermissions | null>(null)

// 计算属性
const currentUserId = computed(() => userStore.userInfo?.id)

const filteredUsers = computed(() => {
  let filtered = users.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role_name.toLowerCase().includes(query)
    )
  }

  // 角色过滤
  if (selectedRoleFilter.value) {
    filtered = filtered.filter(user => user.role_id === parseInt(selectedRoleFilter.value))
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize.value))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const paginatedUsers = computed(() => {
  return filteredUsers.value.slice(startIndex.value, startIndex.value + pageSize.value)
})

// 方法
const fetchUsers = async () => {
  try {
    const response = await fetch('http://127.0.0.1:3000/users')
    const result = await response.json()
    if (result.success) {
      users.value = result.data.users
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

const fetchRoles = async () => {
  try {
    const response = await fetch('http://127.0.0.1:3000/permissions/roles')
    const result = await response.json()
    if (result.success) {
      roles.value = result.data
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

const createUser = async () => {
  try {
    const response = await fetch('http://127.0.0.1:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: userForm.value.username,
        email: userForm.value.email,
        password: userForm.value.password,
        role_id: userForm.value.role_id
      })
    })
    
    const result = await response.json()
    if (result.success) {
      alert('用户创建成功')
      closeModal()
      fetchUsers()
    } else {
      alert('创建失败: ' + result.error)
    }
  } catch (error) {
    console.error('创建用户失败:', error)
    alert('创建用户失败')
  }
}

const updateUser = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/users/${userForm.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: userForm.value.username,
        email: userForm.value.email,
        role_id: userForm.value.role_id
      })
    })
    
    const result = await response.json()
    if (result.success) {
      alert('用户更新成功')
      closeModal()
      fetchUsers()
    } else {
      alert('更新失败: ' + result.error)
    }
  } catch (error) {
    console.error('更新用户失败:', error)
    alert('更新用户失败')
  }
}

const deleteUser = async (user: User) => {
  if (!confirm(`确定要删除用户 ${user.username} 吗？`)) {
    return
  }
  
  try {
    const response = await fetch(`http://127.0.0.1:3000/users/${user.id}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    if (result.success) {
      alert('用户删除成功')
      fetchUsers()
    } else {
      alert('删除失败: ' + result.error)
    }
  } catch (error) {
    console.error('删除用户失败:', error)
    alert('删除用户失败')
  }
}

const editUser = (user: User) => {
  userForm.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    password: '',
    role_id: user.role_id
  }
  showEditModal.value = true
}

const viewPermissions = async (user: User) => {
  selectedUser.value = user
  showPermissionModal.value = true
  
  try {
    const response = await fetch(`http://127.0.0.1:3000/permissions/user/${user.id}`)
    const result = await response.json()
    if (result.success) {
      userPermissions.value = result.data
    }
  } catch (error) {
    console.error('获取用户权限失败:', error)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  userForm.value = {
    id: null,
    username: '',
    email: '',
    password: '',
    role_id: null
  }
}

const getRoleBadgeClass = (roleName: string) => {
  const roleClasses: Record<string, string> = {
    'super_admin': 'bg-red-100 text-red-800',
    'admin': 'bg-purple-100 text-purple-800',
    'financial_manager': 'bg-blue-100 text-blue-800',
    'marketing_manager': 'bg-green-100 text-green-800',
    'production_manager': 'bg-yellow-100 text-yellow-800',
    'enterprise_manager': 'bg-indigo-100 text-indigo-800',
    'leader': 'bg-gray-100 text-gray-800'
  }
  return roleClasses[roleName] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getPermissionsByCategory = () => {
  if (!userPermissions.value) return []
  
  const categoryMap = new Map()
  
  userPermissions.value.permissions.read.forEach(module => {
    if (!categoryMap.has(module.module_category)) {
      categoryMap.set(module.module_category, [])
    }
    categoryMap.get(module.module_category).push(module)
  })
  
  const result: Array<{name: string, modules: any[]}> = []
  categoryMap.forEach((modules, categoryName) => {
    result.push({
      name: categoryName,
      modules: modules.sort((a: any, b: any) => a.module_name.localeCompare(b.module_name))
    })
  })
  
  return result.sort((a, b) => a.name.localeCompare(b.name))
}

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchRoles()])
  loading.value = false
})
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 