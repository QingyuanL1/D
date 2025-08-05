<template>
  <div class="p-6">
    <h1>测试页面</h1>
    <select v-model="selectedValue" @change="handleChange">
      <option value="1">选项1</option>
      <option value="2">选项2</option>
    </select>
    <p>选中的值: {{ selectedValue }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedValue = ref('1')

const handleChange = () => {
  console.log('选择改变:', selectedValue.value)
}
</script>
