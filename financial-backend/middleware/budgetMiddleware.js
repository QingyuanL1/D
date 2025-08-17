const { pool } = require('../config/database');

/**
 * 预算数据中间件
 * 为业务数据附加年度预算计划数据
 */

/**
 * 获取指定表格的年度预算数据
 * @param {string} tableKey - 表格键值 
 * @param {string} period - 期间（YYYY-MM格式）
 * @returns {Object} 预算数据映射
 */
async function getBudgetData(tableKey, period) {
    try {
        // 从期间中提取年份
        const year = period.split('-')[0];
        
        const query = `
            SELECT category, customer, yearly_budget 
            FROM budget_planning 
            WHERE table_key = ? AND period = ?
            ORDER BY 
                CASE category 
                    WHEN '设备' THEN 1 
                    WHEN '元件' THEN 2 
                    WHEN '工程' THEN 3 
                    WHEN '营业收入' THEN 4
                    WHEN '非主营业务' THEN 5
                END,
                customer
        `;
        
        const [rows] = await pool.execute(query, [tableKey, year]);
        
        // 创建预算数据映射：{category-customer: budget}
        const budgetMap = {};
        rows.forEach(row => {
            const key = `${row.category}-${row.customer}`;
            budgetMap[key] = parseFloat(row.yearly_budget);
            
            // 对于非主营业务，也创建直接用customer作为key的映射
            if (tableKey === 'non_main_business') {
                budgetMap[row.customer] = parseFloat(row.yearly_budget);
            }
        });
        
        return budgetMap;
    } catch (error) {
        console.error('获取预算数据失败:', error);
        return {};
    }
}

/**
 * 为新签订单数据附加预算信息
 */
async function attachNewOrdersBudget(req, res, next) {
    const originalJson = res.json;

    res.json = async function(data) {
        if (data.success && data.data) {
            try {
                // 前端写死的年度预算数据（根据用户提供的表格）
                const budgetData = {
                    '设备': {
                        '上海项目': 30000.00,
                        '国网项目': 8000.00,
                        '江苏项目': 5000.00,
                        '输配电内配': 4000.00,
                        '西门子项目': 5000.00,
                        '同业项目': 5000.00,
                        '用户项目': 5000.00,
                        '其它项目': 0.00
                    },
                    '元件': {
                        '用户项目': 4000.00,
                        '一包项目': 3900.00,
                        '二包项目': 2200.00
                    },
                    '工程': {
                        '域内合作项目': 5000.00,
                        '域外合作项目': 1000.00,
                        '其它项目': 1900.00
                    }
                };

                // 为设备类数据附加预算
                if (data.data.equipment) {
                    data.data.equipment = data.data.equipment.map(item => ({
                        ...item,
                        yearlyPlan: budgetData['设备'][item.customer] || item.yearlyPlan || 0
                    }));
                }

                // 为元件类数据附加预算
                if (data.data.components) {
                    data.data.components = data.data.components.map(item => ({
                        ...item,
                        yearlyPlan: budgetData['元件'][item.customer] || item.yearlyPlan || 0
                    }));
                }

                // 为工程类数据附加预算
                if (data.data.engineering) {
                    data.data.engineering = data.data.engineering.map(item => ({
                        ...item,
                        yearlyPlan: budgetData['工程'][item.customer] || item.yearlyPlan || 0
                    }));
                }

                console.log('已为新签订单数据附加预算信息');
            } catch (error) {
                console.error('附加新签订单预算数据失败:', error);
            }
        }

        originalJson.call(this, data);
    };

    next();
}

/**
 * 为项目跟踪数据附加预算信息
 */
async function attachProjectTrackingBudget(req, res, next) {
    const originalJson = res.json;
    
    res.json = async function(data) {
        if (data.success && data.data && req.params.period) {
            try {
                const budgetMap = await getBudgetData('project_tracking', req.params.period);
                
                // 为各类别数据附加预算
                ['equipment', 'components', 'engineering'].forEach(category => {
                    if (data.data[category]) {
                        const categoryName = category === 'equipment' ? '设备' : 
                                           category === 'components' ? '元件' : '工程';
                        
                        data.data[category] = data.data[category].map(item => {
                            const budgetKey = `${categoryName}-${item.customer || item.projectName}`;
                            return {
                                ...item,
                                yearlyPlan: budgetMap[budgetKey] || item.yearlyPlan || 0
                            };
                        });
                    }
                });
                
                console.log('已为项目跟踪数据附加预算信息');
            } catch (error) {
                console.error('附加项目跟踪预算数据失败:', error);
            }
        }
        
        originalJson.call(this, data);
    };
    
    next();
}

/**
 * 为营业收入结构数据附加预算信息
 */
async function attachBusinessIncomeBudget(req, res, next) {
    const originalJson = res.json;
    
    res.json = async function(data) {
        if (data.success && data.data && req.params.period) {
            try {
                const budgetMap = await getBudgetData('business_income_structure', req.params.period);
                
                // 处理营业收入数据
                if (Array.isArray(data.data)) {
                    data.data = data.data.map(item => {
                        const budgetKey = `营业收入-${item.category}`;
                        return {
                            ...item,
                            yearlyPlan: budgetMap[budgetKey] || item.yearlyPlan || 0
                        };
                    });
                } else if (data.data.incomeData) {
                    data.data.incomeData = data.data.incomeData.map(item => {
                        const budgetKey = `营业收入-${item.category}`;
                        return {
                            ...item,
                            yearlyPlan: budgetMap[budgetKey] || item.yearlyPlan || 0
                        };
                    });
                }
                
                console.log('已为营业收入结构数据附加预算信息');
            } catch (error) {
                console.error('附加营业收入结构预算数据失败:', error);
            }
        }
        
        originalJson.call(this, data);
    };
    
    next();
}

/**
 * 通用预算中间件
 * 根据路由自动选择对应的预算表
 */
function createBudgetMiddleware(tableKey) {
    return async (req, res, next) => {
        const originalJson = res.json;
        
        res.json = async function(data) {
            if (data.success && data.data && req.params.period) {
                try {
                    const budgetMap = await getBudgetData(tableKey, req.params.period);
                    
                    // 处理JSON字符串数据
                    let parsedData = data.data;
                    if (typeof data.data === 'string') {
                        try {
                            parsedData = JSON.parse(data.data);
                        } catch (e) {
                            console.error('JSON解析失败:', e);
                            parsedData = data.data;
                        }
                    }
                    
                    // 根据数据结构附加预算信息
                    if (Array.isArray(parsedData)) {

                        // 如果是收款结构质量且数据为空，生成预算数据
                        if (parsedData.length === 0 && tableKey === 'payment_structure_quality') {
                            console.log('数据为空，为收款结构质量生成预算数据');
                            parsedData = generateReceiptStructureBudgetData(budgetMap);
                        }

                        // 如果是预算执行且数据为空，生成预算数据
                        if (parsedData.length === 0 && tableKey === 'budget_execution') {
                            console.log('数据为空，为预算执行生成预算数据');
                            parsedData = generateBudgetExecutionData(budgetMap);
                        }
                        
                        // 针对非主营业务的特殊处理
                        if (tableKey === 'non_main_business') {
                            parsedData = parsedData.map(item => {
                                return attachBudgetToNonMainItem(item, budgetMap);
                            });
                        } else if (tableKey === 'non_main_business_net_profit_contribution') {
                            parsedData = parsedData.map(item => {
                                return attachBudgetToNonMainNetProfitItem(item, budgetMap);
                            });
                        } else {
                            parsedData = parsedData.map(item => {
                                return attachBudgetToItem(item, budgetMap, tableKey);
                            });
                        }
                    } else if (typeof parsedData === 'object') {
                            // 特殊处理库存结构质量数据、合同库存数据、标书履约状况数据和在制品数据
                        if (tableKey === 'inventory_structure_quality' || tableKey === 'contract_inventory' || tableKey === 'bid_fulfillment_status' || tableKey === 'work_in_progress') {
                            Object.keys(parsedData).forEach(key => {
                                if (Array.isArray(parsedData[key])) {
                                    const categoryName = key === 'equipment' ? '设备' : 
                                                       key === 'component' ? '元件' : 
                                                       key === 'project' ? '工程' : key;
                                    parsedData[key] = parsedData[key].map(item => 
                                        attachBudgetToInventoryItem(item, budgetMap, categoryName)
                                    );
                                }
                            });
                        } else if (tableKey === 'main_business_contribution_rate_structure') {
                            // 特殊处理主营业务贡献率结构数据
                            Object.keys(parsedData).forEach(category => {
                                if (typeof parsedData[category] === 'object' && !Array.isArray(parsedData[category])) {
                                    Object.keys(parsedData[category]).forEach(customerKey => {
                                        if (typeof parsedData[category][customerKey] === 'object') {
                                            const categoryName = category === 'equipment' ? '设备' :
                                                               category === 'components' ? '元件' :
                                                               category === 'engineering' ? '工程' : category;
                                            
                                            const customerName = getCustomerNameFromKey(customerKey);
                                            const budgetKey = `${categoryName}-${customerName}`;
                                            
                                            if (budgetMap[budgetKey] !== undefined) {
                                                const budget = budgetMap[budgetKey];
                                                // 将预算数据填充到plan字段，以百分比格式
                                                if (budget > 0) {
                                                    parsedData[category][customerKey].plan = `${budget.toFixed(2)}%`;
                                                }

                                            }
                                        }
                                    });
                                }
                            });
                        } else if (tableKey === 'department_cost_center_profit_loss') {
                            // 特殊处理部门成本中心盈亏数据
                            if (parsedData.departments && Array.isArray(parsedData.departments)) {
                                parsedData.departments = parsedData.departments.map(dept => {
                                    const budgetKey = `部门成本中心-${dept.department}`;
                                    if (budgetMap[budgetKey] !== undefined) {
                                        const budget = budgetMap[budgetKey];
                                        // 格式化预算数据，保留2位小数并转换为字符串
                                        const formattedBudget = parseFloat(budget).toFixed(2);
                                        return {
                                            ...dept,
                                            yearlyBudget: formattedBudget
                                        };
                                    }
                                    return dept;
                                });
                            }
                            
                            // 处理合计行 
                            if (parsedData.total && typeof parsedData.total === 'object') {
                                // 合计行可能没有单独的预算数据，我们可以计算所有部门的总和
                                let totalBudget = 0;
                                if (parsedData.departments && Array.isArray(parsedData.departments)) {
                                    parsedData.departments.forEach(dept => {
                                        if (dept.yearlyBudget && dept.yearlyBudget !== '') {
                                            totalBudget += parseFloat(dept.yearlyBudget) || 0;
                                        }
                                    });
                                }
                                
                                if (totalBudget > 0) {
                                    // 格式化合计预算数据，保留2位小数
                                    parsedData.total.yearlyBudget = totalBudget.toFixed(2);
                                } else {
                                    parsedData.total.yearlyBudget = "0.00";
                                }
                            }
                        } else if (tableKey === 'cost_estimate_personnel_withdrawals') {
                            // 特殊处理成本暂估入库和计提情况数据
                            ['equipment', 'component', 'project'].forEach(category => {
                                if (parsedData[category] && Array.isArray(parsedData[category])) {
                                    const categoryName = category === 'equipment' ? '设备' : 
                                                       category === 'component' ? '元件' : '工程';
                                    
                                    parsedData[category] = parsedData[category].map(item => {
                                        const budgetKey = `${categoryName}-${item.customerType}`;
                                        if (budgetMap[budgetKey] !== undefined) {
                                            const budget = budgetMap[budgetKey];
                                            return {
                                                ...item,
                                                initialBalance: budget
                                            };
                                        }
                                        return item;
                                    });
                                }
                            });
                        } else if (tableKey === 'budget_execution') {
                            // 特殊处理预算执行数据
                            ['equipment', 'components', 'engineering'].forEach(category => {
                                if (parsedData[category] && Array.isArray(parsedData[category])) {
                                    const categoryName = category === 'equipment' ? '设备' :
                                                       category === 'components' ? '元件' : '工程';

                                    parsedData[category] = parsedData[category].map(item => {
                                        const budgetKey = `${categoryName}-${item.customer}`;
                                        if (budgetMap[budgetKey] !== undefined) {
                                            const budget = budgetMap[budgetKey];
                                            return {
                                                ...item,
                                                yearlyPlan: budget
                                            };
                                        }
                                        return item;
                                    });
                                }
                            });
                        } else if (tableKey === 'stock_order_to_income') {
                            // 特殊处理存量订单转收入数据
                            ['equipment', 'components', 'engineering'].forEach(category => {
                                if (parsedData[category] && Array.isArray(parsedData[category])) {
                                    const categoryName = category === 'equipment' ? '设备' :
                                                       category === 'components' ? '元件' : '工程';

                                    parsedData[category] = parsedData[category].map(item => {
                                        const budgetKey = `${categoryName}-${item.customer}`;
                                        if (budgetMap[budgetKey] !== undefined) {
                                            const budget = budgetMap[budgetKey];
                                            return {
                                                ...item,
                                                yearlyPlan: budget,
                                                stockOrder: budget / 2  // 年初存量订单余额 = 年度计划 / 2，与前端显示的年初余额一致
                                            };
                                        }
                                        return item;
                                    });
                                }
                            });
                        } else {
                            Object.keys(parsedData).forEach(key => {
                                if (Array.isArray(parsedData[key])) {
                                    parsedData[key] = parsedData[key].map(item => attachBudgetToItem(item, budgetMap, key));
                                }
                            });
                        }
                    }
                    
                    // 更新数据
                    data.data = parsedData;
                    
                    console.log(`已为 ${tableKey} 数据附加预算信息，处理 ${Array.isArray(parsedData) ? parsedData.length : '1'} 项数据`);
                } catch (error) {
                    console.error(`附加 ${tableKey} 预算数据失败:`, error);
                }
            }
            
            originalJson.call(this, data);
        };
        
        next();
    };
}

/**
 * 为单个数据项附加预算信息
 */
function attachBudgetToItem(item, budgetMap, categoryKey) {
    
    // 建立中文到英文的类别映射
    const categoryMap = {
        'equipment': '设备',
        'components': '元件', 
        'engineering': '工程',
        'revenue': '营业收入',
        'non_main': '非主营业务'
    };
    
    // 获取中文类别名称
    const chineseCategory = categoryMap[categoryKey] || categoryKey;
    
    // 坏账准备情况的特殊处理
    if (categoryKey === 'bad_debt_provision_situation') {
        // 对于坏账准备情况，数据结构是：segment + customerType
        const segment = item.segment || item.category || chineseCategory;
        const customerType = item.customerType || item.customer || item.projectName;
        
        const possibleKeys = [
            `${segment}-${customerType}`,
            `设备-${customerType}`,
            `元件-${customerType}`,
            `工程-${customerType}`,
            customerType
        ].filter(Boolean);
        
        for (const key of possibleKeys) {
            if (budgetMap[key] !== undefined) {
                const budget = budgetMap[key];
                const currentTotal = parseFloat(item.finalBalance || item.currentTotal) || 0;
                const progress = budget > 0 ? ((currentTotal / budget) * 100).toFixed(2) + '%' : '/';
                
                return {
                    ...item,
                    yearlyPlan: budget,
                    progress: progress
                };
            }
        }
        return {
            ...item,
            yearlyPlan: item.yearlyPlan || 0
        };
    }
    
    // 逾期应收账款情况的特殊处理
    if (categoryKey === 'overdue_accounts_receivable_situation') {
        // 对于逾期应收账款情况，数据结构是：segment + customerType
        const segment = item.segment || item.category || chineseCategory;
        const customerType = item.customerType || item.customer || item.projectName;
        
        const possibleKeys = [
            `${segment}-${customerType}`,
            `设备-${customerType}`,
            `元件-${customerType}`,
            `工程-${customerType}`,
            customerType
        ].filter(Boolean);
        
        for (const key of possibleKeys) {
            if (budgetMap[key] !== undefined) {
                const budget = budgetMap[key];
                const currentTotal = parseFloat(item.initialBalance || item.currentTotal) || 0;
                const progress = budget > 0 ? ((currentTotal / budget) * 100).toFixed(2) + '%' : '/';
                
                return {
                    ...item,
                    yearlyPlan: budget,
                    progress: progress
                };
            }
        }
        return {
            ...item,
            yearlyPlan: item.yearlyPlan || 0
        };
    }
    
    // 应收账款情况的特殊处理
    if (categoryKey === 'accounts_receivable_situation') {
        // 对于应收账款情况，数据结构是：segment + customerType
        const segment = item.segment || item.category || chineseCategory;
        const customerType = item.customerType || item.customer || item.projectName;
        
        const possibleKeys = [
            `${segment}-${customerType}`,
            `设备-${customerType}`,
            `元件-${customerType}`,
            `工程-${customerType}`,
            customerType
        ].filter(Boolean);
        
        for (const key of possibleKeys) {
            if (budgetMap[key] !== undefined) {
                const budget = budgetMap[key];
                const currentTotal = parseFloat(item.initialBalance || item.currentBalance || item.currentTotal) || 0;
                const progress = budget > 0 ? ((currentTotal / budget) * 100).toFixed(2) + '%' : '/';
                
                return {
                    ...item,
                    yearlyPlan: budget,
                    progress: progress
                };
            }
        }
        return {
            ...item,
            yearlyPlan: item.yearlyPlan || 0
        };
    }
    
    // 收款结构质量的特殊处理
    if (categoryKey === 'payment_structure_quality') {
        // 对于收款结构质量，数据结构是：segment + customerType
        const segment = item.segment || item.category || chineseCategory;
        const customerType = item.customerType || item.customer || item.projectName;
        
        const possibleKeys = [
            `${segment}-${customerType}`,
            `设备-${customerType}`,
            `元件-${customerType}`,
            `工程-${customerType}`,
            customerType
        ].filter(Boolean);
        
        for (const key of possibleKeys) {
            if (budgetMap[key] !== undefined) {
                const budget = budgetMap[key];
                const currentTotal = parseFloat(item.plan || item.actual || item.currentTotal) || 0;
                const progress = budget > 0 ? ((currentTotal / budget) * 100).toFixed(2) + '%' : '/';
                
                return {
                    ...item,
                    yearlyPlan: budget,
                    progress: progress
                };
            }
        }
        return {
            ...item,
            yearlyPlan: item.yearlyPlan || 0
        };
    }
    
    // 主营业务净利润贡献的特殊处理
    if (categoryKey === 'main_business_net_profit_contribution') {
        // 对于主营业务净利润贡献，数据结构是：segment + customerType
        const segment = item.segment || item.category || chineseCategory;
        const customerType = item.customerType || item.customer || item.projectName;
        
        const possibleKeys = [
            `${segment}-${customerType}`,
            `设备-${customerType}`,
            `元件-${customerType}`,
            `工程-${customerType}`,
            customerType
        ].filter(Boolean);
        
        for (const key of possibleKeys) {
            if (budgetMap[key] !== undefined) {
                const budget = budgetMap[key];
                const currentTotal = parseFloat(item.yearInitialBalance || item.currentTotal) || 0;
                const progress = budget > 0 ? ((currentTotal / budget) * 100).toFixed(2) + '%' : '/';
                
                return {
                    ...item,
                    yearlyPlan: budget,
                    progress: progress
                };
            }
        }
        return {
            ...item,
            yearlyPlan: item.yearlyPlan || 0
        };
    }
    
    // 主营业务毛利率结构的特殊处理
    if (categoryKey === 'main_business_gross_profit_rate_structure') {
        // 对于主营业务毛利率结构，数据结构是：segment + customerType
        const segment = item.segment || item.category || chineseCategory;
        const customerType = item.customerType || item.customer || item.projectName;
        
        const possibleKeys = [
            `${segment}-${customerType}`,
            `设备-${customerType}`,
            `元件-${customerType}`,
            `工程-${customerType}`,
            customerType
        ].filter(Boolean);
        
        for (const key of possibleKeys) {
            if (budgetMap[key] !== undefined) {
                const budget = budgetMap[key];
                const currentTotal = parseFloat(item.yearInitialBalance || item.rate || item.currentTotal) || 0;
                const progress = budget > 0 ? ((currentTotal / budget) * 100).toFixed(2) + '%' : '/';
                
                return {
                    ...item,
                    yearlyPlan: budget,
                    progress: progress
                };
            }
        }
        return {
            ...item,
            yearlyPlan: item.yearlyPlan || 0
        };
    }
    
    // 净利润结构质量的特殊处理
    if (categoryKey === 'net_profit_structure_quality') {
        // 对于净利润结构质量，数据结构是：category + 主营业务/非主营业务
        const category = item.category || item.projectName || item.customer;
        
        const possibleKeys = [
            `净利润-${category}`,
            category
        ].filter(Boolean);
        
        for (const key of possibleKeys) {
            if (budgetMap[key] !== undefined) {
                const budget = budgetMap[key];
                const currentTotal = parseFloat(item.yearInitialBalance || item.currentTotal) || 0;
                const progress = budget > 0 ? ((currentTotal / budget) * 100).toFixed(2) + '%' : '/';
                
                return {
                    ...item,
                    yearlyPlan: budget,
                    progress: progress
                };
            }
        }
        return {
            ...item,
            yearlyPlan: item.yearlyPlan || 0
        };
    }
    
    // 通用匹配逻辑
    const possibleKeys = [
        `${item.category}-${item.customer}`,
        `${item.category}-${item.projectName}`,
        `${item.category}-${item.customerType}`,
        `${chineseCategory}-${item.customer}`,
        `${chineseCategory}-${item.projectName}`,
        `${chineseCategory}-${item.customerType}`,
        item.customer,
        item.projectName,
        item.customerType,
        item.category  // 直接匹配category
    ].filter(Boolean);
    
    for (const key of possibleKeys) {
        if (budgetMap[key] !== undefined) {
            const budget = budgetMap[key];
            const currentTotal = parseFloat(item.currentTotal) || 0;
            const progress = budget > 0 ? ((currentTotal / budget) * 100).toFixed(2) + '%' : '/';
            
            return {
                ...item,
                yearlyPlan: budget,
                progress: progress
            };
        }
    }
    return {
        ...item,
        yearlyPlan: item.yearlyPlan || 0
    };
}

/**
 * 为非主营业务数据项附加预算信息
 * 针对非主营业务的特殊数据结构处理
 */
function attachBudgetToNonMainItem(item, budgetMap) {
    // 非主营业务数据的匹配策略
    const possibleKeys = [
        `非主营业务-${item.category}`,
        item.category
    ].filter(Boolean);
    
    for (const key of possibleKeys) {
        if (budgetMap[key] !== undefined) {
            const budget = budgetMap[key];
            const currentTotal = parseFloat(item.currentTotal) || 0;
            const progress = budget > 0 ? ((currentTotal / budget) * 100).toFixed(2) + '%' : '/';
            
            return {
                ...item,
                yearlyPlan: budget,
                progress: progress
            };
        }
    }
    return {
        ...item,
        yearlyPlan: item.yearlyPlan || 0
    };
}

/**
 * 为非主营业务净利润贡献数据项附加预算信息
 * 针对非主营业务净利润贡献的特殊数据结构处理
 */
function attachBudgetToNonMainNetProfitItem(item, budgetMap) {
    // 非主营业务净利润贡献数据的匹配策略
    const possibleKeys = [
        `非主营业务-${item.name}`,
        item.name
    ].filter(Boolean);
    
    for (const key of possibleKeys) {
        if (budgetMap[key] !== undefined) {
            const budget = budgetMap[key];
            const actual = parseFloat(item.actual) || 0;
            const progress = budget > 0 ? ((actual / budget) * 100).toFixed(2) + '%' : '0.00%';
            
            return {
                ...item,
                yearlyPlan: budget,
                progress: progress
            };
        }
    }
    return {
        ...item,
        yearlyPlan: item.yearlyPlan || 0
    };
}

/**
 * 将客户key转换为中文名称
 */
function getCustomerNameFromKey(customerKey) {
    const keyMap = {
        // 设备板块
        'shanghai': '上海',
        'national': '国网',
        'jiangsu': '江苏',
        'power': '输配电内配',
        // 自动化板块（属于设备）
        'siemens': '西门子',
        'peers': '同业',
        'users': '用户',
        'others': '其它',
        // 元件板块
        // 'users': '用户', // 已在上面定义
        // 工程板块
        'package1': '一包',
        'package2': '二包',
        'domestic': '域内合作',
        'international': '域外合作'
        // 'others': '其它' // 已在上面定义
    };
    
    return keyMap[customerKey] || customerKey;
}

/**
 * 为收款结构质量生成预算数据
 * 当实际数据为空时，根据预算数据生成基础结构
 */
function generateReceiptStructureBudgetData(budgetMap) {
    const budgetData = [];

    // 定义收款结构的基础客户类型
    const customerTypes = {
        '设备': ['上海', '国网', '江苏', '输配电内配', '西门子', '同业', '用户', '其它'],
        '元件': ['用户'],
        '工程': ['一包', '二包', '域内合作', '域外合作', '其它']
    };

    // 为每个板块和客户类型生成预算数据
    Object.keys(customerTypes).forEach(segment => {
        customerTypes[segment].forEach(customerType => {
            const budgetKey = `${segment}-${customerType}`;
            const yearlyPlan = budgetMap[budgetKey] || 0;

            if (yearlyPlan > 0) {
                budgetData.push({
                    segment: segment,
                    customerType: customerType,
                    yearlyPlan: yearlyPlan,
                    currentReceipt: '0',
                    actual: '0',
                    progress: '0.00%'
                });
            }
        });
    });

    return budgetData;
}

/**
 * 为预算执行生成预算数据
 * 当实际数据为空时，根据预算数据生成基础结构
 */
function generateBudgetExecutionData(budgetMap) {
    const budgetData = {
        equipment: [],
        components: [],
        engineering: []
    };

    // 定义预算执行的基础客户类型
    const customerTypes = {
        '设备': ['上海', '国网', '江苏', '输配电内配', '西门子', '同业', '用户', '其它'],
        '元件': ['用户'],
        '工程': ['一包', '二包', '域内合作', '域外合作', '其它']
    };

    // 为每个类别和客户类型生成预算数据
    Object.keys(customerTypes).forEach(category => {
        const categoryKey = category === '设备' ? 'equipment' :
                           category === '元件' ? 'components' : 'engineering';

        customerTypes[category].forEach(customer => {
            const budgetKey = `${category}-${customer}`;
            const yearlyPlan = budgetMap[budgetKey] || 0;

            if (yearlyPlan > 0) {
                budgetData[categoryKey].push({
                    customer: customer,
                    yearlyPlan: yearlyPlan,
                    currentMonth: 0,
                    currentTotal: 0,
                    progress: 0
                });
            }
        });
    });

    return budgetData;
}

/**
 * 为库存结构质量数据项附加预算信息
 * 针对库存结构质量的特殊数据结构处理
 */
function attachBudgetToInventoryItem(item, budgetMap, categoryName) {
    // 库存结构质量数据的匹配策略
    const possibleKeys = [
        `${categoryName}-${item.customerType}`,
        item.customerType
    ].filter(Boolean);
    
    for (const key of possibleKeys) {
        if (budgetMap[key] !== undefined) {
            const budget = budgetMap[key];
            const currentAmount = parseFloat(item.currentAmount) || 0;
            const progress = budget > 0 ? ((currentAmount / budget) * 100).toFixed(2) + '%' : '/';
            
            return {
                ...item,
                yearlyPlan: budget,
                progress: progress
            };
        }
    }
    return {
        ...item,
        yearlyPlan: item.yearlyPlan || 0
    };
}

module.exports = {
    getBudgetData,
    attachNewOrdersBudget,
    attachProjectTrackingBudget, 
    attachBusinessIncomeBudget,
    createBudgetMiddleware
};