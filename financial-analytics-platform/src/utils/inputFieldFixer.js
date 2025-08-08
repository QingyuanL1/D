/**
 * 输入字段修复工具
 * 用于诊断和修复财务报表中的输入字段问题
 */

// 常见的输入字段问题和解决方案
export const inputFieldDiagnostics = {
    // 检查 v-model 绑定问题
    checkVModelBinding: (element) => {
        const vModelValue = element.getAttribute('v-model') || element.getAttribute('v-model.number')
        if (!vModelValue) {
            return { issue: 'missing-v-model', message: '缺少 v-model 绑定' }
        }
        return { issue: null, message: 'v-model 绑定正常' }
    },

    // 检查数据类型问题
    checkDataType: (value) => {
        if (value === undefined) {
            return { issue: 'undefined-value', message: '数据值为 undefined' }
        }
        if (value === null) {
            return { issue: null, message: '数据值为 null（正常）' }
        }
        if (typeof value !== 'number' && value !== '') {
            return { issue: 'invalid-type', message: `数据类型错误: ${typeof value}` }
        }
        return { issue: null, message: '数据类型正常' }
    },

    // 检查 CSS 样式问题
    checkCSSIssues: (element) => {
        const computedStyle = window.getComputedStyle(element)
        const issues = []

        if (computedStyle.pointerEvents === 'none') {
            issues.push('pointer-events 被设置为 none')
        }
        if (computedStyle.display === 'none') {
            issues.push('元素被隐藏 (display: none)')
        }
        if (computedStyle.visibility === 'hidden') {
            issues.push('元素不可见 (visibility: hidden)')
        }
        if (element.disabled) {
            issues.push('输入框被禁用')
        }
        if (element.readOnly) {
            issues.push('输入框为只读')
        }

        return {
            issue: issues.length > 0 ? 'css-issues' : null,
            message: issues.length > 0 ? issues.join(', ') : 'CSS 样式正常'
        }
    },

    // 检查事件监听器
    checkEventListeners: (element) => {
        const hasInputListener = element.oninput !== null || 
                               element.addEventListener !== undefined
        return {
            issue: hasInputListener ? null : 'missing-listeners',
            message: hasInputListener ? '事件监听器正常' : '缺少输入事件监听器'
        }
    }
}

// 修复输入字段的通用方法
export const fixInputField = (element, dataObject, fieldName) => {
    // 1. 确保正确的 v-model 绑定
    if (!element.getAttribute('v-model') && !element.getAttribute('v-model.number')) {
        console.warn(`字段 ${fieldName} 缺少 v-model 绑定`)
    }

    // 2. 添加必要的属性
    if (!element.getAttribute('data-field')) {
        element.setAttribute('data-field', fieldName)
    }

    // 3. 确保正确的事件处理
    if (!element.oninput) {
        element.addEventListener('input', (event) => {
            const value = event.target.value
            const numValue = value === '' ? null : Number(value)
            if (numValue === null || !isNaN(numValue)) {
                dataObject[fieldName] = numValue
            }
        })
    }

    // 4. 添加调试样式
    element.style.outline = '1px solid #10b981' // 绿色边框表示已修复
    
    return true
}

// 批量诊断页面中的所有输入字段
export const diagnoseAllInputs = () => {
    const inputs = document.querySelectorAll('input[type="number"]')
    const results = []

    inputs.forEach((input, index) => {
        const fieldName = input.getAttribute('data-field') || `input-${index}`
        const result = {
            element: input,
            fieldName,
            diagnostics: {
                vModel: inputFieldDiagnostics.checkVModelBinding(input),
                css: inputFieldDiagnostics.checkCSSIssues(input),
                events: inputFieldDiagnostics.checkEventListeners(input)
            }
        }
        results.push(result)
    })

    return results
}

// 生成诊断报告
export const generateDiagnosticReport = () => {
    const results = diagnoseAllInputs()
    const report = {
        totalInputs: results.length,
        issues: [],
        summary: {}
    }

    results.forEach(result => {
        Object.entries(result.diagnostics).forEach(([key, diagnostic]) => {
            if (diagnostic.issue) {
                report.issues.push({
                    field: result.fieldName,
                    type: key,
                    issue: diagnostic.issue,
                    message: diagnostic.message
                })
            }
        })
    })

    // 统计问题类型
    report.summary = report.issues.reduce((acc, issue) => {
        acc[issue.issue] = (acc[issue.issue] || 0) + 1
        return acc
    }, {})

    return report
}

// Vue 组合式函数：用于在组件中使用
export const useInputFieldDiagnostics = () => {
    const runDiagnostics = () => {
        const report = generateDiagnosticReport()
        console.group('🔍 输入字段诊断报告')
        console.log('总输入字段数:', report.totalInputs)
        console.log('发现的问题:', report.issues)
        console.log('问题统计:', report.summary)
        console.groupEnd()
        return report
    }

    const fixAllInputs = (dataObject) => {
        const inputs = document.querySelectorAll('input[type="number"]')
        let fixedCount = 0

        inputs.forEach(input => {
            const fieldName = input.getAttribute('data-field')
            if (fieldName && dataObject[fieldName] !== undefined) {
                if (fixInputField(input, dataObject, fieldName)) {
                    fixedCount++
                }
            }
        })

        console.log(`✅ 已修复 ${fixedCount} 个输入字段`)
        return fixedCount
    }

    return {
        runDiagnostics,
        fixAllInputs,
        diagnoseAllInputs,
        generateDiagnosticReport
    }
}

// 导出默认对象
export default {
    inputFieldDiagnostics,
    fixInputField,
    diagnoseAllInputs,
    generateDiagnosticReport,
    useInputFieldDiagnostics
}
