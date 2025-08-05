<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">年度预算计划表</h1>
            <div class="flex items-center space-x-4">
                <select v-model="selectedTable" class="px-3 py-2 border rounded" @change="loadSelectedTable">
                    <option value="">请选择表格</option>
                    <option v-for="table in availableTables" :key="table.key" :value="table.key">
                        {{ table.name }}
                    </option>
                </select>
                <select v-model="period" class="px-3 py-2 border rounded">
                    <option value="2020">2020年</option>
                    <option value="2021">2021年</option>
                    <option value="2022">2022年</option>
                    <option value="2023">2023年</option>
                    <option value="2024">2024年</option>
                    <option value="2025">2025年</option>
                    <option value="2026">2026年</option>
                    <option value="2027">2027年</option>
                    <option value="2028">2028年</option>
                    <option value="2029">2029年</option>
                    <option value="2030">2030年</option>
                </select>
            </div>
        </div>

        <div class="overflow-x-auto my-6" v-if="budgetData.length > 0">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块属性</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">
                            <span v-if="selectedTable === 'main_business_contribution_rate_structure' || selectedTable === 'main_business_gross_profit_rate_structure'">年度计划（%）</span>
                            <span v-else>年度计划（万元）</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(category, categoryIndex) in budgetData" :key="category.name">
                        <template v-for="(item, itemIndex) in category.items" :key="`${categoryIndex}-${itemIndex}`">
                            <tr>
                                <td v-if="itemIndex === 0" :rowspan="category.items.length" class="border border-gray-300 px-4 py-2 font-medium text-center bg-gray-50">
                                    {{ category.name }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    {{ item.projectName }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    <div v-if="selectedTable === 'main_business_contribution_rate_structure' || selectedTable === 'main_business_gross_profit_rate_structure'" class="flex items-center">
                                        <input v-model.number="item.yearlyBudget" type="number" class="flex-1 px-2 py-1 border rounded text-right" step="0.01" />
                                        <span class="ml-1">%</span>
                                    </div>
                                    <input v-else v-model.number="item.yearlyBudget" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                                </td>
                            </tr>
                        </template>
                    </template>
                    
                    <!-- 总计行 -->
                    <tr class="bg-blue-100 font-bold text-lg">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span v-if="selectedTable === 'main_business_contribution_rate_structure'">21.98%</span>
                            <span v-else-if="selectedTable === 'main_business_gross_profit_rate_structure'">24.00%</span>
                            <span v-else>{{ totalBudget.toFixed(2) }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 空状态提示 -->
        <div v-else class="text-center py-12 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-lg">请选择要编辑的表格</p>
        </div>

        <div class="mt-6 flex justify-end space-x-4">
            <button @click="handleSave" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                保存预算计划
            </button>
            <button @click="handleReset" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                重置
            </button>
            <button @click="exportToExcel" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                导出Excel
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().getFullYear().toString())
const selectedTable = ref('')

interface BudgetItem {
    id: number;
    projectName: string;
    yearlyBudget: number;
}

interface BudgetCategory {
    name: string;
    items: BudgetItem[];
}

interface TableData {
    key: string;
    name: string;
    data: BudgetCategory[];
}

// 静态表格数据
const staticTablesData: TableData[] = [
    {
        key: 'new_orders',
        name: '新签订单结构与质量',
        data: [
            {
                name: '设备',
                items: [
                    { id: 1, projectName: '上海项目', yearlyBudget: 30000.00 },
                    { id: 2, projectName: '国网项目', yearlyBudget: 8000.00 },
                    { id: 3, projectName: '江苏项目', yearlyBudget: 5000.00 },
                    { id: 4, projectName: '输配电内配', yearlyBudget: 4000.00 },
                    { id: 5, projectName: '西门子项目', yearlyBudget: 5000.00 },
                    { id: 6, projectName: '同业项目', yearlyBudget: 5000.00 },
                    { id: 7, projectName: '用户项目', yearlyBudget: 5000.00 },
                    { id: 8, projectName: '其它项目', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 9, projectName: '用户项目', yearlyBudget: 4000.00 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 10, projectName: '一包项目', yearlyBudget: 3900.00 },
                    { id: 11, projectName: '二包项目', yearlyBudget: 2200.00 },
                    { id: 12, projectName: '域内合作项目', yearlyBudget: 5000.00 },
                    { id: 13, projectName: '域外合作项目', yearlyBudget: 1000.00 },
                    { id: 14, projectName: '其它项目', yearlyBudget: 1900.00 }
                ]
            }
        ]
    },
    {
        key: 'project_tracking',
        name: '项目跟踪情况',
        data: [
            {
                name: '设备',
                items: [
                    { id: 15, projectName: '上海', yearlyBudget: 500000.00 },
                    { id: 16, projectName: '国网', yearlyBudget: 1050000.00 },
                    { id: 17, projectName: '江苏', yearlyBudget: 300000.00 },
                    { id: 18, projectName: '输配电内配', yearlyBudget: 0.00 },
                    { id: 19, projectName: '西门子', yearlyBudget: 0.00 },
                    { id: 20, projectName: '同业', yearlyBudget: 0.00 },
                    { id: 21, projectName: '用户', yearlyBudget: 20000.00 },
                    { id: 22, projectName: '其它', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 23, projectName: '用户', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 24, projectName: '一包', yearlyBudget: 150000.00 },
                    { id: 25, projectName: '二包', yearlyBudget: 600.00 },
                    { id: 26, projectName: '域内合作', yearlyBudget: 95000.00 },
                    { id: 27, projectName: '域外合作', yearlyBudget: 5000.00 },
                    { id: 28, projectName: '其它', yearlyBudget: 2000.00 }
                ]
            }
        ]
    },
    {
        key: 'business_income_structure',
        name: '营业收入结构与质量',
        data: [
            {
                name: '营业收入',
                items: [
                    { id: 29, projectName: '主营业务', yearlyBudget: 59400.00 },
                    { id: 30, projectName: '非主营业务', yearlyBudget: 600.00 }
                ]
            }
        ]
    },
    {
        key: 'main_business_income_breakdown',
        name: '主营业务收入分解情况',
        data: [
            {
                name: '设备',
                items: [
                    { id: 31, projectName: '上海', yearlyBudget: 22000.00 },
                    { id: 32, projectName: '国网', yearlyBudget: 5000.00 },
                    { id: 33, projectName: '江苏', yearlyBudget: 3000.00 },
                    { id: 34, projectName: '输配电内配', yearlyBudget: 2000.00 },
                    { id: 35, projectName: '西门子', yearlyBudget: 1000.00 },
                    { id: 36, projectName: '同业', yearlyBudget: 3000.00 },
                    { id: 37, projectName: '用户', yearlyBudget: 2000.00 },
                    { id: 38, projectName: '其它', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 39, projectName: '用户', yearlyBudget: 1000.00 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 40, projectName: '一包', yearlyBudget: 3800.00 },
                    { id: 41, projectName: '二包', yearlyBudget: 700.00 },
                    { id: 42, projectName: '域内合作', yearlyBudget: 10000.00 },
                    { id: 43, projectName: '域外合作', yearlyBudget: 0.00 },
                    { id: 44, projectName: '其它', yearlyBudget: 1500.00 }
                ]
            }
        ]
    },
    {
        key: 'current_year_order_to_income',
        name: '主营业务——当年订单转收入',
        data: [
            {
                name: '设备',
                items: [
                    { id: 45, projectName: '上海', yearlyBudget: 5593.15 },
                    { id: 46, projectName: '国网', yearlyBudget: 1358.11 },
                    { id: 47, projectName: '江苏', yearlyBudget: 1132.24 },
                    { id: 48, projectName: '输配电内配', yearlyBudget: 0.00 },
                    { id: 49, projectName: '西门子', yearlyBudget: 9.94 },
                    { id: 50, projectName: '同业', yearlyBudget: 765.74 },
                    { id: 51, projectName: '用户', yearlyBudget: 90.95 },
                    { id: 52, projectName: '其它', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 53, projectName: '用户', yearlyBudget: 97.86 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 54, projectName: '一包', yearlyBudget: 2029.79 },
                    { id: 55, projectName: '二包', yearlyBudget: 7.94 },
                    { id: 56, projectName: '域内合作', yearlyBudget: 1744.52 },
                    { id: 57, projectName: '域外合作', yearlyBudget: 12.70 },
                    { id: 58, projectName: '其它', yearlyBudget: 238.62 }
                ]
            }
        ]
    },
    {
        key: 'stock_order_to_income',
        name: '主营业务——存量订单转收入',
        data: [
            {
                name: '设备',
                items: [
                    { id: 59, projectName: '上海', yearlyBudget: 39050.53 },
                    { id: 60, projectName: '国网', yearlyBudget: 7802.20 },
                    { id: 61, projectName: '江苏', yearlyBudget: 6341.95 },
                    { id: 62, projectName: '输配电内配', yearlyBudget: 0.00 },
                    { id: 63, projectName: '西门子', yearlyBudget: 14.11 },
                    { id: 64, projectName: '同业', yearlyBudget: 1003.79 },
                    { id: 65, projectName: '用户', yearlyBudget: 535.45 },
                    { id: 66, projectName: '其它', yearlyBudget: 221.15 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 67, projectName: '用户', yearlyBudget: 34.95 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 68, projectName: '一包', yearlyBudget: 13327.25 },
                    { id: 69, projectName: '二包', yearlyBudget: 954.35 },
                    { id: 70, projectName: '域内合作', yearlyBudget: 1906.28 },
                    { id: 71, projectName: '域外合作', yearlyBudget: 7590.69 },
                    { id: 72, projectName: '其它', yearlyBudget: 1677.30 }
                ]
            }
        ]
    },
    {
        key: 'non_main_business',
        name: '非主营业务情况',
        data: [
            {
                name: '非主营业务',
                items: [
                    { id: 73, projectName: '固废收入', yearlyBudget: 100.00 },
                    { id: 74, projectName: '房屋租金', yearlyBudget: 100.00 },
                    { id: 75, projectName: '利息收入', yearlyBudget: 100.00 },
                    { id: 76, projectName: '投资收益', yearlyBudget: 130.00 },
                    { id: 77, projectName: '补贴收入', yearlyBudget: 130.00 },
                    { id: 78, projectName: '其他', yearlyBudget: 40.00 }
                ]
            }
        ]
    },
    {
        key: 'inventory_structure_quality',
        name: '存量结构与质量',
        data: [
            {
                name: '设备',
                items: [
                    { id: 79, projectName: '上海', yearlyBudget: 39151.53 },
                    { id: 80, projectName: '国网', yearlyBudget: 7841.48 },
                    { id: 81, projectName: '江苏', yearlyBudget: 6793.01 },
                    { id: 82, projectName: '输配电内配', yearlyBudget: 0.00 },
                    { id: 83, projectName: '西门子', yearlyBudget: 28.46 },
                    { id: 84, projectName: '同业', yearlyBudget: 821.55 },
                    { id: 85, projectName: '用户', yearlyBudget: 577.37 },
                    { id: 86, projectName: '其它', yearlyBudget: 220.08 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 87, projectName: '用户', yearlyBudget: 26.60 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 88, projectName: '一包', yearlyBudget: 12720.17 },
                    { id: 89, projectName: '二包', yearlyBudget: 960.55 },
                    { id: 90, projectName: '域内合作', yearlyBudget: 1818.79 },
                    { id: 91, projectName: '域外合作', yearlyBudget: 8063.91 },
                    { id: 92, projectName: '其它', yearlyBudget: 1973.08 }
                ]
            }
        ]
    },
    {
        key: 'bid_fulfillment_status',
        name: '中标未履约情况',
        data: [
            {
                name: '设备',
                items: [
                    { id: 93, projectName: '上海', yearlyBudget: 31055.26 },
                    { id: 94, projectName: '国网', yearlyBudget: 2798.76 },
                    { id: 95, projectName: '江苏', yearlyBudget: 5085.93 },
                    { id: 96, projectName: '输配电内配', yearlyBudget: 0.00 },
                    { id: 97, projectName: '西门子', yearlyBudget: 0.00 },
                    { id: 98, projectName: '同业', yearlyBudget: 0.00 },
                    { id: 99, projectName: '用户', yearlyBudget: 0.00 },
                    { id: 100, projectName: '其它', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 101, projectName: '用户', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 102, projectName: '一包', yearlyBudget: 8281.13 },
                    { id: 103, projectName: '二包', yearlyBudget: 444.83 },
                    { id: 104, projectName: '域内合作', yearlyBudget: 702.04 },
                    { id: 105, projectName: '域外合作', yearlyBudget: 0.00 },
                    { id: 106, projectName: '其它', yearlyBudget: 21.93 }
                ]
            }
        ]
    },
    {
        key: 'work_in_progress',
        name: '在产情况',
        data: [
            {
                name: '设备',
                items: [
                    { id: 107, projectName: '上海', yearlyBudget: 4726.55 },
                    { id: 108, projectName: '国网', yearlyBudget: 5036.79 },
                    { id: 109, projectName: '江苏', yearlyBudget: 1603.09 },
                    { id: 110, projectName: '输配电内配', yearlyBudget: 0.00 },
                    { id: 111, projectName: '西门子', yearlyBudget: 28.46 },
                    { id: 112, projectName: '同业', yearlyBudget: 749.99 },
                    { id: 113, projectName: '用户', yearlyBudget: 520.40 },
                    { id: 114, projectName: '其它', yearlyBudget: 205.32 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 115, projectName: '用户', yearlyBudget: 26.60 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 116, projectName: '一包', yearlyBudget: 4388.98 },
                    { id: 117, projectName: '二包', yearlyBudget: 421.20 },
                    { id: 118, projectName: '域内合作', yearlyBudget: 4062.14 },
                    { id: 119, projectName: '域外合作', yearlyBudget: 1603.51 },
                    { id: 120, projectName: '其它', yearlyBudget: 2492.58 }
                ]
            }
        ]
    },
    {
        key: 'contract_inventory',
        name: '库存情况(合同存量)',
        data: [
            {
                name: '设备',
                items: [
                    { id: 121, projectName: '上海', yearlyBudget: 1924.96 },
                    { id: 122, projectName: '国网', yearlyBudget: 0.00 },
                    { id: 123, projectName: '江苏', yearlyBudget: 0.00 },
                    { id: 124, projectName: '输配电内配', yearlyBudget: 0.00 },
                    { id: 125, projectName: '西门子', yearlyBudget: 0.00 },
                    { id: 126, projectName: '同业', yearlyBudget: 71.56 },
                    { id: 127, projectName: '用户', yearlyBudget: 56.97 },
                    { id: 128, projectName: '其它', yearlyBudget: 14.76 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 129, projectName: '用户', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 130, projectName: '一包', yearlyBudget: 50.06 },
                    { id: 131, projectName: '二包', yearlyBudget: 94.52 },
                    { id: 132, projectName: '域内合作', yearlyBudget: 825.80 },
                    { id: 133, projectName: '域外合作', yearlyBudget: 11.81 },
                    { id: 134, projectName: '其它', yearlyBudget: 1299.29 }
                ]
            }
        ]
    },
    {
        key: 'main_business_cost_structure',
        name: '主营业务成本结构与质量',
        data: [
            {
                name: '设备',
                items: [
                    { id: 135, projectName: '上海', yearlyBudget: 17398.82 },
                    { id: 136, projectName: '国网', yearlyBudget: 6890.12 },
                    { id: 137, projectName: '江苏', yearlyBudget: 3534.29 },
                    { id: 138, projectName: '输配电内配', yearlyBudget: 0.00 },
                    { id: 139, projectName: '西门子', yearlyBudget: 0.00 },
                    { id: 140, projectName: '同业', yearlyBudget: 2828.35 },
                    { id: 141, projectName: '用户', yearlyBudget: 4658.44 },
                    { id: 142, projectName: '其它', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 143, projectName: '用户', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 144, projectName: '一包', yearlyBudget: 3283.30 },
                    { id: 145, projectName: '二包', yearlyBudget: 659.15 },
                    { id: 146, projectName: '域内合作', yearlyBudget: 9700.00 },
                    { id: 147, projectName: '域外合作', yearlyBudget: 0.00 },
                    { id: 148, projectName: '其它', yearlyBudget: 1366.90 }
                ]
            }
        ]
    },
    {
        key: 'department_cost_center_profit_loss',
        name: '部门成本中心计入损益情况',
        data: [
            {
                name: '部门成本中心',
                items: [
                    { id: 149, projectName: '总经理室', yearlyBudget: 736.83 },
                    { id: 150, projectName: '企管部', yearlyBudget: 501.30 },
                    { id: 151, projectName: '财务部', yearlyBudget: 0.00 },
                    { id: 152, projectName: '销售部', yearlyBudget: 1614.28 },
                    { id: 153, projectName: '市场部', yearlyBudget: 0.00 },
                    { id: 154, projectName: '营运部', yearlyBudget: 906.40 },
                    { id: 155, projectName: '研技部', yearlyBudget: 1069.78 },
                    { id: 156, projectName: 'C-GIS事业部', yearlyBudget: 1894.69 },
                    { id: 157, projectName: '工程事业部', yearlyBudget: 1620.43 }
                ]
            }
        ]
    },
    {
        key: 'main_business_contribution_rate_structure',
        name: '主营业务边际贡献率结构与质量',
        data: [
            {
                name: '设备',
                items: [
                    { id: 158, projectName: '上海', yearlyBudget: 28.22 },
                    { id: 159, projectName: '国网', yearlyBudget: 20.19 },
                    { id: 160, projectName: '江苏', yearlyBudget: 8.00 },
                    { id: 161, projectName: '输配电内配', yearlyBudget: 0.00 },
                    { id: 162, projectName: '西门子', yearlyBudget: 0.00 },
                    { id: 163, projectName: '同业', yearlyBudget: 25.92 },
                    { id: 164, projectName: '用户', yearlyBudget: 0.00 },
                    { id: 165, projectName: '其它', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 166, projectName: '用户', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 167, projectName: '一包', yearlyBudget: 26.00 },
                    { id: 168, projectName: '二包', yearlyBudget: 15.00 },
                    { id: 169, projectName: '域内合作', yearlyBudget: 8.00 },
                    { id: 170, projectName: '域外合作', yearlyBudget: 6.00 },
                    { id: 171, projectName: '其它', yearlyBudget: 15.00 }
                ]
            }
        ]
    },
    {
        key: 'cost_estimate_personnel_withdrawals',
        name: '成本暂估人库和计提情况',
        data: [
            {
                name: '设备',
                items: [
                    { id: 172, projectName: '上海', yearlyBudget: 586.50 },
                    { id: 173, projectName: '国网', yearlyBudget: 0.00 },
                    { id: 174, projectName: '江苏', yearlyBudget: 0.00 },
                    { id: 175, projectName: '输配电内配', yearlyBudget: 0.00 },
                    { id: 176, projectName: '西门子', yearlyBudget: 62.13 },
                    { id: 177, projectName: '同业', yearlyBudget: 0.00 },
                    { id: 178, projectName: '用户', yearlyBudget: 199.74 },
                    { id: 179, projectName: '其它', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 180, projectName: '用户', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 181, projectName: '一包', yearlyBudget: 3644.44 },
                    { id: 182, projectName: '二包', yearlyBudget: 2341.80 },
                    { id: 183, projectName: '域内合作', yearlyBudget: 1023.15 },
                    { id: 184, projectName: '域外合作', yearlyBudget: 487.10 },
                    { id: 185, projectName: '其它', yearlyBudget: 788.07 }
                ]
            }
        ]
    },
    {
        key: 'main_business_gross_profit_rate_structure',
        name: '主营业务毛利率结构与质量',
        data: [
            {
                name: '设备',
                items: [
                    { id: 186, projectName: '上海', yearlyBudget: 21.99 },
                    { id: 187, projectName: '国网', yearlyBudget: 13.83 },
                    { id: 188, projectName: '江苏', yearlyBudget: 8.00 },
                    { id: 189, projectName: '输配电内配', yearlyBudget: 0.00 },
                    { id: 190, projectName: '西门子', yearlyBudget: 0.00 },
                    { id: 191, projectName: '同业', yearlyBudget: 22.43 },
                    { id: 192, projectName: '用户', yearlyBudget: 11.68 },
                    { id: 193, projectName: '其它', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 194, projectName: '用户', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 195, projectName: '一包', yearlyBudget: 26.00 },
                    { id: 196, projectName: '二包', yearlyBudget: 15.00 },
                    { id: 197, projectName: '域内合作', yearlyBudget: 8.00 },
                    { id: 198, projectName: '域外合作', yearlyBudget: 6.00 },
                    { id: 199, projectName: '其它', yearlyBudget: 15.00 }
                ]
            }
        ]
    },
    {
        key: 'net_profit_structure_quality',
        name: '净利润结构与质量',
        data: [
            {
                name: '净利润',
                items: [
                    { id: 200, projectName: '主营业务', yearlyBudget: 3871.58 },
                    { id: 201, projectName: '非主营业务', yearlyBudget: 128.42 }
                ]
            }
        ]
    },
    {
        key: 'main_business_net_profit_contribution',
        name: '主营业务净利润贡献情况',
        data: [
            {
                name: '设备',
                items: [
                    { id: 202, projectName: '上海', yearlyBudget: 2145.03 },
                    { id: 203, projectName: '国网', yearlyBudget: 621.55 },
                    { id: 204, projectName: '江苏', yearlyBudget: 0.00 },
                    { id: 205, projectName: '输配电内配', yearlyBudget: 0.00 },
                    { id: 206, projectName: '西门子', yearlyBudget: 0.00 },
                    { id: 207, projectName: '同业', yearlyBudget: 553.08 },
                    { id: 208, projectName: '用户', yearlyBudget: 323.80 },
                    { id: 209, projectName: '其它', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 210, projectName: '用户', yearlyBudget: -26.21 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 211, projectName: '一包', yearlyBudget: 328.91 },
                    { id: 212, projectName: '二包', yearlyBudget: 14.40 },
                    { id: 213, projectName: '域内合作', yearlyBudget: -35.24 },
                    { id: 214, projectName: '域外合作', yearlyBudget: 0.00 },
                    { id: 215, projectName: '其它', yearlyBudget: 69.60 }
                ]
            }
        ]
    },
    {
        key: 'non_main_business_net_profit_contribution',
        name: '非主营业务净利润贡献情况',
        data: [
            {
                name: '非主营业务',
                items: [
                    { id: 216, projectName: '固废收入', yearlyBudget: 12.83 },
                    { id: 217, projectName: '房屋租金', yearlyBudget: 25.58 },
                    { id: 218, projectName: '利息收入', yearlyBudget: 25.58 },
                    { id: 219, projectName: '投资收益', yearlyBudget: 33.25 },
                    { id: 220, projectName: '补贴收入', yearlyBudget: 33.25 },
                    { id: 221, projectName: '其他', yearlyBudget: 10.23 }
                ]
            }
        ]
    },
    {
        key: 'payment_structure_quality',
        name: '收款结构与质量',
        data: [
            {
                name: '设备',
                items: [
                    { id: 222, projectName: '上海', yearlyBudget: 25000.00 },
                    { id: 223, projectName: '国网', yearlyBudget: 5000.00 },
                    { id: 224, projectName: '江苏', yearlyBudget: 3500.00 },
                    { id: 225, projectName: '输配电内配', yearlyBudget: 3000.00 },
                    { id: 226, projectName: '西门子', yearlyBudget: 3500.00 },
                    { id: 227, projectName: '同业', yearlyBudget: 3500.00 },
                    { id: 228, projectName: '用户', yearlyBudget: 3500.00 },
                    { id: 229, projectName: '其它', yearlyBudget: 0.00 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 230, projectName: '用户', yearlyBudget: 3000.00 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 231, projectName: '一包', yearlyBudget: 2800.00 },
                    { id: 232, projectName: '二包', yearlyBudget: 1700.00 },
                    { id: 233, projectName: '域内合作', yearlyBudget: 4000.00 },
                    { id: 234, projectName: '域外合作', yearlyBudget: 1000.00 },
                    { id: 235, projectName: '其它', yearlyBudget: 1500.00 }
                ]
            }
        ]
    },
    {
        key: 'accounts_receivable_situation',
        name: '应收账款情况',
        data: [
            {
                name: '设备',
                items: [
                    { id: 236, projectName: '上海', yearlyBudget: 3558.98 },
                    { id: 237, projectName: '国网', yearlyBudget: 5190.93 },
                    { id: 238, projectName: '江苏', yearlyBudget: 1154.56 },
                    { id: 239, projectName: '输配电内配', yearlyBudget: 176.86 },
                    { id: 240, projectName: '西门子', yearlyBudget: 0.00 },
                    { id: 241, projectName: '同业', yearlyBudget: 2028.53 },
                    { id: 242, projectName: '用户', yearlyBudget: 1727.31 },
                    { id: 243, projectName: '其它', yearlyBudget: 303.55 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 244, projectName: '用户', yearlyBudget: 458.54 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 245, projectName: '一包', yearlyBudget: 385.47 },
                    { id: 246, projectName: '二包', yearlyBudget: 189.12 },
                    { id: 247, projectName: '域内合作', yearlyBudget: 2772.83 },
                    { id: 248, projectName: '域外合作', yearlyBudget: 752.14 },
                    { id: 249, projectName: '其它', yearlyBudget: 488.67 }
                ]
            }
        ]
    },
    {
        key: 'overdue_accounts_receivable_situation',
        name: '逾期应收账款情况',
        data: [
            {
                name: '设备',
                items: [
                    { id: 250, projectName: '上海', yearlyBudget: 1349.60 },
                    { id: 251, projectName: '国网', yearlyBudget: 462.01 },
                    { id: 252, projectName: '江苏', yearlyBudget: 1123.94 },
                    { id: 253, projectName: '输配电内配', yearlyBudget: 176.86 },
                    { id: 254, projectName: '西门子', yearlyBudget: 0.00 },
                    { id: 255, projectName: '同业', yearlyBudget: 46.23 },
                    { id: 256, projectName: '用户', yearlyBudget: 1705.24 },
                    { id: 257, projectName: '其它', yearlyBudget: 391.31 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 258, projectName: '用户', yearlyBudget: 380.94 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 259, projectName: '一包', yearlyBudget: 106.86 },
                    { id: 260, projectName: '二包', yearlyBudget: 189.12 },
                    { id: 261, projectName: '域内合作', yearlyBudget: 358.51 },
                    { id: 262, projectName: '域外合作', yearlyBudget: 564.23 },
                    { id: 263, projectName: '其它', yearlyBudget: 324.30 }
                ]
            }
        ]
    },
    {
        key: 'bad_debt_provision_situation',
        name: '坏账准备情况',
        data: [
            {
                name: '设备',
                items: [
                    { id: 264, projectName: '上海', yearlyBudget: 235.75 },
                    { id: 265, projectName: '国网', yearlyBudget: 76.77 },
                    { id: 266, projectName: '江苏', yearlyBudget: 79.63 },
                    { id: 267, projectName: '输配电内配', yearlyBudget: 163.42 },
                    { id: 268, projectName: '西门子', yearlyBudget: 0.00 },
                    { id: 269, projectName: '同业', yearlyBudget: 10.33 },
                    { id: 270, projectName: '用户', yearlyBudget: 1490.63 },
                    { id: 271, projectName: '其它', yearlyBudget: 381.37 }
                ]
            },
            {
                name: '元件',
                items: [
                    { id: 272, projectName: '用户', yearlyBudget: 14.76 }
                ]
            },
            {
                name: '工程',
                items: [
                    { id: 273, projectName: '一包', yearlyBudget: 13.94 },
                    { id: 274, projectName: '二包', yearlyBudget: 66.50 },
                    { id: 275, projectName: '域内合作', yearlyBudget: 71.29 },
                    { id: 276, projectName: '域外合作', yearlyBudget: 76.52 },
                    { id: 277, projectName: '其它', yearlyBudget: 16.89 }
                ]
            }
        ]
    }
]

// 可用表格列表
const availableTables = computed(() => staticTablesData)

const budgetData = ref<BudgetCategory[]>([])

// 计算总预算
const totalBudget = computed(() => {
    let total = 0
    
    budgetData.value.forEach(category => {
        category.items.forEach(item => {
            total += item.yearlyBudget || 0
        })
    })
    
    return total
})

// 加载选中的表格数据
const loadSelectedTable = () => {
    if (!selectedTable.value) {
        budgetData.value = []
        return
    }
    
    const selectedTableData = staticTablesData.find(table => table.key === selectedTable.value)
    if (selectedTableData) {
        budgetData.value = JSON.parse(JSON.stringify(selectedTableData.data)) // 深拷贝
    }
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载预算计划数据，期间: ${targetPeriod}`)
        
        const response = await fetch(`http://127.0.0.1:3000/budget-planning/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据')
                return
            }
            throw new Error('加载数据失败')
        }
        
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data) {
            // 如果有保存的选中表格，恢复选择
            if (result.data.selectedTable) {
                selectedTable.value = result.data.selectedTable
                loadSelectedTable()
            }
            
            // 恢复各表格的修改数据
            if (result.data.modifications) {
                applyModifications(result.data.modifications)
            }
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 应用修改数据
const applyModifications = (modifications: any) => {
    Object.keys(modifications).forEach(tableKey => {
        const tableData = staticTablesData.find(table => table.key === tableKey)
        if (tableData && modifications[tableKey]) {
            modifications[tableKey].forEach((modCategory: any) => {
                const category = tableData.data.find(cat => cat.name === modCategory.name)
                if (category) {
                    modCategory.items.forEach((modItem: any) => {
                        const item = category.items.find(item => item.id === modItem.id)
                        if (item) {
                            item.yearlyBudget = modItem.yearlyBudget
                        }
                    })
                }
            })
        }
    })
    
    // 重新加载当前选中的表格
    if (selectedTable.value) {
        loadSelectedTable()
    }
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
    }
})

// 监听期间变化
watch(period, (newPeriod) => {
    loadData(newPeriod)
})

const handleSave = async () => {
    try {
        // 收集所有表格的修改数据
        const modifications: any = {}
        
        staticTablesData.forEach(tableData => {
            const modData: any = []
            tableData.data.forEach(category => {
                const modCategory = {
                    name: category.name,
                    items: category.items.map(item => ({
                        id: item.id,
                        projectName: item.projectName,
                        yearlyBudget: item.yearlyBudget
                    }))
                }
                modData.push(modCategory)
            })
            modifications[tableData.key] = modData
        })

        const saveData = {
            period: period.value,
            data: {
                selectedTable: selectedTable.value,
                modifications: modifications,
                timestamp: new Date().toISOString()
            }
        }

        console.log('保存预算计划数据:', saveData)

        // 保存到专用表
        const response = await fetch('http://127.0.0.1:3000/budget-planning', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saveData)
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`保存失败: ${response.status} - ${errorText}`)
        }

        alert('预算计划保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    if (confirm('确定要重置当前表格的预算数据吗？')) {
        if (selectedTable.value) {
            loadSelectedTable()
            console.log('已重置为初始数据')
        }
    }
}

// 导出Excel功能
const exportToExcel = () => {
    if (!selectedTable.value) {
        alert('请先选择要导出的表格')
        return
    }
    
    const selectedTableData = staticTablesData.find(table => table.key === selectedTable.value)
    if (!selectedTableData) return
    
    // 生成CSV格式数据
    let csvContent = "板块属性,客户属性,年度计划（万元）\n"
    
    budgetData.value.forEach(category => {
        category.items.forEach(item => {
            csvContent += `${category.name},${item.projectName},${item.yearlyBudget}\n`
        })
    })
    
    // 添加合计行
    csvContent += `合计,,${totalBudget.value.toFixed(2)}\n`
    
    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${selectedTableData.name}_${period.value}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

onMounted(() => {
    console.log('预算计划组件挂载，当前期间:', period.value)
    if (route.query.period) {
        loadData(route.query.period.toString())
    } else {
        loadData(period.value)
    }
})
</script>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
    height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>