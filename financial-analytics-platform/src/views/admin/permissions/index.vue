<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">权限管理</h1>
        <p class="text-gray-600 mt-2">管理角色权限和模块访问控制</p>
      </div>

      <!-- 角色选择器 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择角色</label>
              <select
                v-model="selectedRoleId"
                @change="onRoleChange"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择角色</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.role_name }} - {{ role.role_description }}
                </option>
              </select>
            </div>
            
            <div v-if="selectedRole" class="pt-6">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    :class="getRoleBadgeClass(selectedRole.role_name)">
                {{ selectedRole.role_description }}
              </span>
            </div>
          </div>

          <div v-if="selectedRoleId" class="flex space-x-2">
            <button
              @click="savePermissions"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {{ saving ? '保存中...' : '保存权限' }}
            </button>
            <button
              @click="resetPermissions"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      <!-- 权限配置 -->
      <div v-if="selectedRoleId && modules.length > 0" class="space-y-6">
        <!-- 权限统计 -->
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">权限统计</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-semibold text-blue-900">总模块数</h4>
              <p class="text-2xl font-bold text-blue-700 mt-1">{{ modules.length }}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <h4 class="font-semibold text-green-900">可查看</h4>
              <p class="text-2xl font-bold text-green-700 mt-1">{{ readableCount }}</p>
            </div>
            <div class="bg-orange-50 p-4 rounded-lg">
              <h4 class="font-semibold text-orange-900">可编辑</h4>
              <p class="text-2xl font-bold text-orange-700 mt-1">{{ writableCount }}</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <h4 class="font-semibold text-purple-900">覆盖率</h4>
              <p class="text-2xl font-bold text-purple-700 mt-1">{{ coverageRate }}%</p>
            </div>
          </div>
        </div>

        <!-- 按分类管理权限 -->
        <div v-for="category in categorizedModules" :key="category.name" class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <span class="w-4 h-4 rounded-full mr-3" 
                      :class="{
                        'bg-blue-500': category.name === '财务',
                        'bg-green-500': category.name === '营销', 
                        'bg-yellow-500': category.name === '生产',
                        'bg-purple-500': category.name === '企管'
                      }"></span>
                {{ category.name }} ({{ category.modules.length }} 个模块)
              </h3>
              
              <!-- 批量操作 -->
              <div class="flex space-x-2">
                <button
                  @click="setBatchPermission(category.name, 'read')"
                  class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  全部只读
                </button>
                <button
                  @click="setBatchPermission(category.name, 'write')"
                  class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  全部可编辑
                </button>
                <button
                  @click="setBatchPermission(category.name, 'none')"
                  class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  全部禁用
                </button>
              </div>
            </div>
            
            <!-- 分类权限统计 -->
            <div class="flex items-center mt-2 text-sm text-gray-600">
              <span class="mr-4">
                可查看: {{ category.modules.filter(m => permissions[m.id] === 'read' || permissions[m.id] === 'write').length }}
              </span>
              <span class="mr-4">
                可编辑: {{ category.modules.filter(m => permissions[m.id] === 'write').length }}
              </span>
              <span>
                未配置: {{ category.modules.filter(m => !permissions[m.id]).length }}
              </span>
            </div>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="module in category.modules" :key="module.id" class="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900 text-sm">{{ module.module_name }}</h4>
                    <p class="text-xs text-gray-600 mt-1">{{ module.description }}</p>
                    <p class="text-xs text-gray-500 mt-1">路由: {{ module.route_path }}</p>
                  </div>
                  
                  <div class="ml-4 flex flex-col space-y-2">
                    <!-- 权限选择器 -->
                    <div class="flex items-center space-x-2">
                      <input
                        :id="`none-${module.id}`"
                        v-model="permissions[module.id]"
                        type="radio"
                        :value="undefined"
                        class="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                      />
                      <label :for="`none-${module.id}`" class="text-xs text-gray-600">禁用</label>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <input
                        :id="`read-${module.id}`"
                        v-model="permissions[module.id]"
                        type="radio"
                        value="read"
                        class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label :for="`read-${module.id}`" class="text-xs text-blue-600">只读</label>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <input
                        :id="`write-${module.id}`"
                        v-model="permissions[module.id]"
                        type="radio"
                        value="write"
                        class="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <label :for="`write-${module.id}`" class="text-xs text-green-600">可编辑</label>
                    </div>
                  </div>
                </div>
                
                <!-- 权限状态指示器 -->
                <div class="mt-3 flex justify-end">
                  <span v-if="permissions[module.id]" 
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        :class="{
                          'bg-green-100 text-green-800': permissions[module.id] === 'write',
                          'bg-blue-100 text-blue-800': permissions[module.id] === 'read'
                        }">
                    {{ permissions[module.id] === 'write' ? '可编辑' : '只读' }}
                  </span>
                  <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    已禁用
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="selectedRoleId && modules.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">暂无模块数据</h3>
        <p class="text-gray-600">请联系系统管理员配置表单模块</p>
      </div>

      <!-- 未选择角色提示 -->
      <div v-else class="bg-white rounded-lg shadow-sm p-8 text-center">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">选择角色以管理权限</h3>
        <p class="text-gray-600">请先从上方下拉框中选择要配置的角色</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'

interface Role {
  id: number
  role_name: string
  role_description: string
}

interface Module {
  id: number
  module_name: string
  module_key: string
  module_category: string
  route_path: string
  description: string
}

interface CategorizedModule {
  name: string
  modules: Module[]
}

interface RolePermissions {
  role: Role
  permissions: Array<{
    id: number
    module_id: number
    permission_type: 'read' | 'write'
    module_name: string
    module_key: string
    module_category: string
  }>
}

// 数据
const roles = ref<Role[]>([])
const modules = ref<Module[]>([])
const selectedRoleId = ref('')
const permissions = reactive<Record<number, 'read' | 'write' | undefined>>({})
const originalPermissions = ref<Record<number, 'read' | 'write' | undefined>>({})
const loading = ref(true)
const saving = ref(false)

// 计算属性
const selectedRole = computed(() => {
  return roles.value.find(role => role.id === parseInt(selectedRoleId.value))
})

const categorizedModules = computed(() => {
  const categoryMap = new Map<string, Module[]>()
  
  modules.value.forEach(module => {
    if (!categoryMap.has(module.module_category)) {
      categoryMap.set(module.module_category, [])
    }
    categoryMap.get(module.module_category)!.push(module)
  })
  
  const result: CategorizedModule[] = []
  categoryMap.forEach((moduleList, categoryName) => {
    result.push({
      name: categoryName,
      modules: moduleList.sort((a, b) => {
        // 首先按display_order排序，如果没有display_order或为0，则按名称排序
        const aOrder = (a as any).display_order || 999
        const bOrder = (b as any).display_order || 999
        if (aOrder !== bOrder) {
          return aOrder - bOrder
        }
        return a.module_name.localeCompare(b.module_name)
      })
    })
  })
  
  return result.sort((a, b) => a.name.localeCompare(b.name))
})

const readableCount = computed(() => {
  return Object.values(permissions).filter(p => p === 'read' || p === 'write').length
})

const writableCount = computed(() => {
  return Object.values(permissions).filter(p => p === 'write').length
})

const coverageRate = computed(() => {
  if (modules.value.length === 0) return 0
  const configuredCount = Object.values(permissions).filter(p => p).length
  return Math.round((configuredCount / modules.value.length) * 100)
})

// 方法
const fetchRoles = async () => {
  try {
    const response = await fetch('http://47.111.95.19:3000/permissions/roles')
    const result = await response.json()
    if (result.success) {
      roles.value = result.data
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

const fetchModules = async () => {
  try {
    const response = await fetch('http://47.111.95.19:3000/permissions/modules')
    const result = await response.json()
    if (result.success) {
      modules.value = result.data.modules
    }
  } catch (error) {
    console.error('获取模块列表失败:', error)
  }
}

const fetchRolePermissions = async (roleId: string) => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/permissions/role/${roleId}`)
    const result = await response.json()
    if (result.success) {
      const rolePermissions: RolePermissions = result.data
      
      // 清空当前权限
      Object.keys(permissions).forEach(key => {
        delete permissions[parseInt(key)]
      })
      
      // 设置角色权限
      rolePermissions.permissions.forEach(perm => {
        permissions[perm.module_id] = perm.permission_type
      })
      
      // 保存原始权限用于重置
      originalPermissions.value = { ...permissions }
    }
  } catch (error) {
    console.error('获取角色权限失败:', error)
  }
}

const onRoleChange = async () => {
  if (selectedRoleId.value) {
    await fetchRolePermissions(selectedRoleId.value)
  } else {
    // 清空权限
    Object.keys(permissions).forEach(key => {
      delete permissions[parseInt(key)]
    })
  }
}

const setBatchPermission = (category: string, permissionType: 'read' | 'write' | 'none') => {
  const categoryModules = modules.value.filter(m => m.module_category === category)
  
  categoryModules.forEach(module => {
    if (permissionType === 'none') {
      delete permissions[module.id]
    } else {
      permissions[module.id] = permissionType
    }
  })
}

const savePermissions = async () => {
  if (!selectedRoleId.value) return
  
  try {
    saving.value = true
    
    const permissionsToSave: Record<number, 'read' | 'write' | null> = {}
    modules.value.forEach(module => {
      permissionsToSave[module.id] = permissions[module.id] || null
    })
    
    const response = await fetch(`http://47.111.95.19:3000/permissions/role/${selectedRoleId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        permissions: permissionsToSave
      })
    })
    
    const result = await response.json()
    if (result.success) {
      alert('权限保存成功')
      originalPermissions.value = { ...permissions }
    } else {
      alert('保存失败: ' + result.error)
    }
  } catch (error) {
    console.error('保存权限失败:', error)
    alert('保存权限失败')
  } finally {
    saving.value = false
  }
}

const resetPermissions = () => {
  // 恢复到原始权限
  Object.keys(permissions).forEach(key => {
    delete permissions[parseInt(key)]
  })
  
  Object.entries(originalPermissions.value).forEach(([moduleId, permissionType]) => {
    if (permissionType) {
      permissions[parseInt(moduleId)] = permissionType
    }
  })
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

onMounted(async () => {
  await Promise.all([fetchRoles(), fetchModules()])
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

/* 单选按钮样式优化 */
input[type="radio"]:checked {
  background-color: currentColor;
  border-color: currentColor;
}

input[type="radio"]:focus {
  outline: none;
  ring: 2px;
}
</style>