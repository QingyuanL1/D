<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold text-center">{{ title }}</h1>
    <div class="flex items-center space-x-4">
      <input 
        :value="period" 
        @input="$emit('update:period', $event.target.value)"
        @change="$emit('period-change')"
        type="month" 
        class="px-3 py-2 border rounded" 
      />
      <button 
        @click="$emit('generate-pdf')" 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
        :disabled="isGenerating"
      >
        {{ isGenerating ? '生成中...' : '生成PDF' }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  period: {
    type: String,
    required: true
  },
  isGenerating: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:period', 'period-change', 'generate-pdf'])
</script>
