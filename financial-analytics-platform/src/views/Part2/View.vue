<template>
    <div class="container mx-auto p-6">
        <h1 class="text-3xl font-bold mb-8 text-center text-gray-800">财务分析平台</h1>
        
        <!-- 财务分区 -->
        <div class="mb-10">
            <div class="flex items-center mb-6">
                <div class="w-1 h-8 bg-blue-500 rounded mr-4"></div>
                <h2 class="text-2xl font-bold text-gray-800">财务</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- 资产负债表 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">资产负债表</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业特定时点的财务状况，包括资产、负债和所有者权益。</p>
                        <router-link to="/example" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 现金流量表 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">现金流量表</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业现金及现金等价物的变动情况，包括经营、投资和筹资活动。</p>
                        <router-link to="/cashflow" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 利润表 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">利润表</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业在特定期间的经营成果，包括收入、成本和利润。</p>
                        <router-link to="/incomestatement" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 营业收入 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">营业收入结构与质量</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业营业收入结构与质量，按年度计划分析执行进度。</p>
                        <router-link to="/business-income-structure" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 主营业务收入 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">主营业务收入分解情况</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业主营业务收入的详细分解情况，按板块和客户属性分析。</p>
                        <router-link to="/main-business-income" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 主营业务-当年订单转收入 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">主营业务——当年订单转收入</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业主营业务当年订单转收入情况，分析当年新签订单向收入的转化率。</p>
                        <router-link to="/order-to-income" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 主营业务-存量订单转收入 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">主营业务——存量订单转收入</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业主营业务存量订单转收入情况，分析往年存量订单向收入的转化率。</p>
                        <router-link to="/stock-order-to-income" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 非主营业务 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">非主营业务情况</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业非主营业务收入情况，包括固定收入、房屋租金、利息收入等各项收入的执行进度。</p>
                        <router-link to="/non-main-business" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 成本中心 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">成本中心结构与质量</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业成本中心结构与质量情况，按年度计划口径分解分析各板块的累计收入。</p>
                        <router-link to="/cost-center-structure" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 主营业务边际贡献率 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">主营业务边际贡献率</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业主营业务边际贡献率结构与质量，按年度计划口径分解分析各板块的计划完成情况。</p>
                        <router-link to="/business-contribution" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 主营业务毛利率 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">主营业务毛利率</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看主营业务毛利率结构与质量情况，按年度计划口径分解分析各板块的毛利率完成情况。</p>
                        <router-link to="/business-profit-margin" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 净利润结构 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">净利润结构</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看净利润结构与质量情况，按年度计划口径分解分析主营业务和非主营业务的净利润完成情况。</p>
                        <router-link to="/net-profit-structure" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 主营净利润贡献情况 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">主营净利润贡献情况</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看主营业务净利润贡献情况，按板块和客户属性分析年度计划、当期累计和分类贡献占比。</p>
                        <router-link to="/main-business-net-profit" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 非主营净利润贡献情况 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">非主营净利润贡献情况</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看非主营业务净利润贡献情况，包括固废收入、房屋租金、利息收入等各项收入的执行进度。</p>
                        <router-link to="/non-main-business-net-profit" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 收款结构 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">收款结构</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业收款结构与质量情况，按板块和客户属性分析年度计划、当期累计和执行进度。</p>
                        <router-link to="/receipt-structure" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 应收账款 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">应收账款</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业应收账款情况，按板块和客户属性分析年初应收余额、当期新增开票、当期累计收款和当期应收余额。</p>
                        <router-link to="/accounts-receivable" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 逾期应收款 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">逾期应收款</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业逾期应收账款情况，按板块和客户属性分析年初余额、本年新增、当期累计已收款和收款进度。</p>
                        <router-link to="/overdue-receivables" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 坏账准备情况 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-blue-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">坏账准备情况</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业坏账准备情况，按板块和客户属性分析年初余额、本年新增、当期累计已转回和坏账准备余额。</p>
                        <router-link to="/bad-debt-provision" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 营销分区 -->
        <div class="mb-10">
            <div class="flex items-center mb-6">
                <div class="w-1 h-8 bg-green-500 rounded mr-4"></div>
                <h2 class="text-2xl font-bold text-gray-800">营销</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- 新签订单 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-green-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">新签订单</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业新签订单的结构与质量情况，按年度计划分析执行进度。</p>
                        <router-link to="/new-order" class="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 项目跟踪 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-green-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">项目跟踪</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业项目跟踪情况，分析项目进展和执行状态。</p>
                        <router-link to="/budget-execution-new" class="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 招投标情况 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-green-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">招投标情况</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业招投标情况，了解各板块的投标与中标数据。</p>
                        <router-link to="/bidding-status" class="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 中标未履约 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-green-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">中标未履约</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业中标未履约情况，按板块和客户属性分析期初余额、当期余额及波动率。</p>
                        <router-link to="/bid-fulfillment" class="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 存量结构 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-green-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">存量结构</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业存量结构与质量情况，按板块和客户属性分析年初金额、当期金额及波动率。</p>
                        <router-link to="/inventory-structure" class="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 在产情况 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-green-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">在产情况</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业在产情况，按板块和客户属性分析年初余额、当期余额及波动率。</p>
                        <router-link to="/inventory-in-progress" class="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 库存情况（合同存量） -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-green-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">库存情况（合同存量）</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业库存情况(合同存量)，按板块和客户属性分析年初余量、当期库存及波动率。</p>
                        <router-link to="/contract-inventory" class="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 主营业务成本（对应年度计划） -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-green-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">主营业务成本（对应年度计划）</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看主营业务成本结构与质量情况，按年度计划口径分解分析各板块的计划执行进度。</p>
                        <router-link to="/main-business-cost" class="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 成本暂估入库和计提 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-green-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">成本暂估入库和计提</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业成本暂估入库和计提情况，按板块和客户属性分析年初余额、本年新增、本年累计和计提率。</p>
                        <router-link to="/cost-estimation" class="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 生产分区 -->
        <div class="mb-10">
            <div class="flex items-center mb-6">
                <div class="w-1 h-8 bg-yellow-500 rounded mr-4"></div>
                <h2 class="text-2xl font-bold text-gray-800">生产</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- 产值结构与质量 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-yellow-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">产值结构与质量</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业主营业务产值——自制/自行施工情况分析，按板块和客户属性分析公司设计产能、年度产能计划、当期产能累计、计划执行进度和产能利用率。</p>
                        <router-link to="/production-value" class="inline-block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 主营业务产值-自制/自行施工情况分析 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-yellow-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">主营业务产值-自制/自行施工情况分析</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看主营业务产值中自制/自行施工的分析情况。</p>
                        <router-link to="/production-value-analysis" class="inline-block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 生产/施工计划执行情况 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-yellow-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">生产/施工计划执行情况</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看生产/施工计划执行情况，按板块和客户属性分析年度目标、准时完工率、出厂合格率和计划达成率。</p>
                        <router-link to="/production-plan-execution" class="inline-block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 生产/施工订单生产施工执行情况 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-yellow-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">生产/施工订单生产施工执行情况</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看生产/施工订单生产施工执行情况，按板块和客户属性分析年度计划产值、自制/自行施工、半自制/分包和外发/转包数据。</p>
                        <router-link to="/production-execution-analysis" class="inline-block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 研发分区 -->
        <div class="mb-10">
            <div class="flex items-center mb-6">
                <div class="w-1 h-8 bg-purple-500 rounded mr-4"></div>
                <h2 class="text-2xl font-bold text-gray-800">研发</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-purple-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">研发项目管理</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业研发项目的管理情况，包括项目进度、投入产出等。</p>
                        <router-link to="/rd-project-management" class="inline-block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div> -->
            </div>
        </div>
        
        <!-- 企管分区 -->
        <div class="mb-10">
            <div class="flex items-center mb-6">
                <div class="w-1 h-8 bg-red-500 rounded mr-4"></div>
                <h2 class="text-2xl font-bold text-gray-800">企管</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- 部门成本中心实际发生 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-red-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">部门成本中心实际发生</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业部门成本中心实际发生情况，按部门分析年度预算、当期累计、执行进度和占产值比。</p>
                        <router-link to="/department-cost-center" class="inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 部门成本中心计入损益 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-red-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">部门成本中心计入损益</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业部门成本中心计入损益情况，按部门分析各项成本数据的当期发生额和累计占比。</p>
                        <router-link to="/department-cost-input" class="inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 年度重大投资情况 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-red-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">年度重大投资情况</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业年度重大投资项目情况，包括项目名称、年初计划、当期执行和执行进度等关键数据。</p>
                        <router-link to="/major-investment-analysis" class="inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div>
                
                <!-- 预算执行情况 -->
                <!-- <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-red-50 p-4">
                        <h3 class="text-lg font-semibold text-gray-800">预算执行情况</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">查看企业预算执行情况，了解各工程板块的预算完成进度。</p>
                        <router-link to="/budget-execution-new" class="inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                            查看详情
                        </router-link>
                    </div>
                </div> -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Vue will automatically infer the component name from the filename
</script>