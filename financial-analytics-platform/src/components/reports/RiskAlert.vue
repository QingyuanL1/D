<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div 
      v-for="(risk, index) in risks" 
      :key="index"
      :class="getRiskCardClass(risk.type)"
      class="p-3 rounded"
    >
      <h4 class="font-semibold mb-1">{{ risk.title }}</h4>
      <p class="text-sm">{{ risk.content || '当期无风险披露。' }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  risks: {
    type: Array,
    required: true,
    default: () => []
  }
})

const getRiskCardClass = (type) => {
  const classMap = {
    financial: 'bg-red-50',
    marketing: 'bg-yellow-50',
    production: 'bg-green-50',
    management: 'bg-blue-50',
    research: 'bg-purple-50',
    others: 'bg-gray-50'
  }
  return classMap[type] || 'bg-gray-50'
}
</script>
