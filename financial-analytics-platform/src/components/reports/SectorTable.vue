<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse border border-gray-300 text-sm">
      <thead>
        <tr class="bg-gray-50">
          <th 
            v-for="column in columns" 
            :key="column.key"
            class="border border-gray-300 px-4 py-2"
          >
            {{ column.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- 设备板块 -->
        <template v-for="(item, index) in equipmentData" :key="`equipment-${index}`">
          <tr>
            <td 
              v-if="index === 0" 
              :rowspan="equipmentData.length" 
              class="border border-gray-300 px-4 py-2 font-medium text-center"
              :class="sectorColors.equipment"
            >
              设备
            </td>
            <td 
              v-for="column in dataColumns" 
              :key="column.key"
              class="border border-gray-300 px-4 py-2"
              :class="getCellClass(column, item)"
            >
              <template v-if="column.formatter">
                {{ column.formatter(item[column.key], item) }}
              </template>
              <template v-else-if="column.type === 'number'">
                {{ formatNumber(item[column.key]) }}
              </template>
              <template v-else-if="column.type === 'percentage'">
                {{ formatNumber(item[column.key]) }}%
              </template>
              <template v-else>
                {{ item[column.key] }}
              </template>
            </td>
          </tr>
        </template>

        <!-- 元件板块 -->
        <template v-for="(item, index) in componentData" :key="`component-${index}`">
          <tr>
            <td 
              v-if="index === 0" 
              :rowspan="componentData.length" 
              class="border border-gray-300 px-4 py-2 font-medium text-center"
              :class="sectorColors.component"
            >
              元件
            </td>
            <td 
              v-for="column in dataColumns" 
              :key="column.key"
              class="border border-gray-300 px-4 py-2"
              :class="getCellClass(column, item)"
            >
              <template v-if="column.formatter">
                {{ column.formatter(item[column.key], item) }}
              </template>
              <template v-else-if="column.type === 'number'">
                {{ formatNumber(item[column.key]) }}
              </template>
              <template v-else-if="column.type === 'percentage'">
                {{ formatNumber(item[column.key]) }}%
              </template>
              <template v-else>
                {{ item[column.key] }}
              </template>
            </td>
          </tr>
        </template>

        <!-- 工程板块 -->
        <template v-for="(item, index) in projectData" :key="`project-${index}`">
          <tr>
            <td 
              v-if="index === 0" 
              :rowspan="projectData.length" 
              class="border border-gray-300 px-4 py-2 font-medium text-center"
              :class="sectorColors.project"
            >
              工程
            </td>
            <td 
              v-for="column in dataColumns" 
              :key="column.key"
              class="border border-gray-300 px-4 py-2"
              :class="getCellClass(column, item)"
            >
              <template v-if="column.formatter">
                {{ column.formatter(item[column.key], item) }}
              </template>
              <template v-else-if="column.type === 'number'">
                {{ formatNumber(item[column.key]) }}
              </template>
              <template v-else-if="column.type === 'percentage'">
                {{ formatNumber(item[column.key]) }}%
              </template>
              <template v-else>
                {{ item[column.key] }}
              </template>
            </td>
          </tr>
        </template>

        <!-- 合计行 -->
        <tr v-if="showTotal && totalRow" class="bg-gray-50 font-bold">
          <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
          <td 
            v-for="column in dataColumns.slice(1)" 
            :key="column.key"
            class="border border-gray-300 px-4 py-2"
            :class="getCellClass(column, totalRow)"
          >
            <template v-if="column.totalFormatter">
              {{ column.totalFormatter(totalRow[column.key], totalRow) }}
            </template>
            <template v-else-if="column.type === 'number'">
              {{ formatNumber(totalRow[column.key]) }}
            </template>
            <template v-else-if="column.type === 'percentage'">
              {{ formatNumber(totalRow[column.key]) }}%
            </template>
            <template v-else>
              {{ totalRow[column.key] }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  showTotal: {
    type: Boolean,
    default: false
  },
  totalRow: {
    type: Object,
    default: null
  },
  sectorColors: {
    type: Object,
    default: () => ({
      equipment: 'bg-blue-50',
      component: 'bg-green-50',
      project: 'bg-yellow-50'
    })
  }
})

// 数据列（除了第一列板块列）
const dataColumns = computed(() => props.columns.slice(1))

// 按板块分组数据
const equipmentData = computed(() => props.data.filter(item => item.sector === '设备'))
const componentData = computed(() => props.data.filter(item => item.sector === '元件'))
const projectData = computed(() => props.data.filter(item => item.sector === '工程'))

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toFixed(2)
}

// 获取单元格样式类
const getCellClass = (column, row) => {
  let classes = []
  
  if (column.align === 'right') {
    classes.push('text-right')
  } else if (column.align === 'center') {
    classes.push('text-center')
  }
  
  if (column.cellClass) {
    if (typeof column.cellClass === 'function') {
      classes.push(column.cellClass(row[column.key], row))
    } else {
      classes.push(column.cellClass)
    }
  }
  
  return classes.join(' ')
}
</script>
