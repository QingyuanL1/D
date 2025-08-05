<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse border border-gray-300 text-sm">
      <thead>
        <tr class="bg-gray-50">
          <th 
            v-for="column in columns" 
            :key="column.key"
            class="border border-gray-300 px-4 py-2"
            :class="column.headerClass"
          >
            {{ column.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="row.id || index" :class="getRowClass(row, index)">
          <td 
            v-for="column in columns" 
            :key="column.key"
            class="border border-gray-300 px-4 py-2"
            :class="getCellClass(column, row)"
          >
            <template v-if="column.formatter">
              {{ column.formatter(row[column.key], row) }}
            </template>
            <template v-else-if="column.type === 'number'">
              {{ formatNumber(row[column.key]) }}
            </template>
            <template v-else-if="column.type === 'percentage'">
              {{ formatNumber(row[column.key]) }}%
            </template>
            <template v-else>
              {{ row[column.key] }}
            </template>
          </td>
        </tr>
        
        <!-- 合计行 -->
        <tr v-if="showTotal && totalRow" class="bg-gray-100 font-bold">
          <td 
            v-for="column in columns" 
            :key="column.key"
            class="border border-gray-300 px-4 py-2"
            :class="column.totalClass"
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
  rowClass: {
    type: [String, Function],
    default: ''
  }
})

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toFixed(2)
}

// 获取行样式类
const getRowClass = (row, index) => {
  if (typeof props.rowClass === 'function') {
    return props.rowClass(row, index)
  }
  return props.rowClass
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
