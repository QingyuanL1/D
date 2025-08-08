const fs = require('fs');

const filePath = '/Users/yaowenya/Desktop/D/financial-analytics-platform/src/views/example/ShanghaiNanhuaLanlingBalanceSheet.vue';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 替换所有合计项为只读显示
const totalReplacements = [
  // 固定资产合计
  {
    old: `                <td class="border border-gray-300 px-4 py-2">{{ data.assets.fixedAssetsTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="data.assets.fixedAssetsTotal.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="data.assets.fixedAssetsTotal.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>`,
    new: `                <td class="border border-gray-300 px-4 py-2">{{ data.assets.fixedAssetsTotal.name }} <span class="text-blue-600 text-xs">[自动计算]</span></td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{ data.assets.fixedAssetsTotal.periodEnd || 0 }}</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{ data.assets.fixedAssetsTotal.yearInitial || 0 }}</span>
                </td>`
  }
];

// 2. 替换普通项目的输入框逻辑
const itemPatterns = [
  // 无形资产及其他资产
  {
    pattern: /(<tr v-for="\(item, index\) in data\.assets\.intangibleAssets".*?>[\s\S]*?<td class="border border-gray-300 px-4 py-2">)\s*<input type="number" v-model\.number="item\.yearInitial"[^>]*>\s*(<\/td>\s*<td class="border border-gray-300 px-4 py-2">)\s*<input type="number" v-model\.number="item\.periodEnd"[^>]*>\s*(<\/td>\s*<\/tr>)/g,
    replacement: '$1\n                  <input type="number" v-model.number="item.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />\n                $2\n                  <input v-if="period.endsWith(\'-01\')" type="number" v-model.number="item.yearInitial" \n                    class="w-full px-2 py-1 border rounded" step="0.01" />\n                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.yearInitial || 0 }}</span>\n                $3'
  }
];

// 应用替换
totalReplacements.forEach(replacement => {
  content = content.replace(replacement.old, replacement.new);
});

// 写入文件
fs.writeFileSync(filePath, content);
console.log('批量更新完成'); 