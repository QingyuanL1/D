#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import requests

def debug_calculation():
    """调试边际贡献率计算"""
    
    # 1. 获取后端计算结果
    print("=== 后端计算结果 ===")
    try:
        response = requests.post("http://47.111.95.19:3000/business-contribution/calculate/2025-07")
        backend_result = response.json()
        print(f"后端总体边际贡献率: {backend_result['data']['total']['actual']}")
    except Exception as e:
        print(f"获取后端结果失败: {e}")
        return
    
    # 2. 获取原始数据
    print("\n=== 原始数据对比 ===")
    
    # 获取收入数据
    income_response = requests.get("http://47.111.95.19:3000/main-business-income/2025-07")
    income_data = income_response.json()['data']
    
    # 获取成本数据
    cost_response = requests.get("http://47.111.95.19:3000/main-business-cost/2025-07")
    cost_data = cost_response.json()['data']
    
    # 3. 手工计算验证
    print("\n=== 手工计算验证 ===")
    
    total_income = 0
    total_cost = 0
    
    # 计算设备板块
    equipment_income = 0
    equipment_cost = 0
    
    print("设备板块:")
    for item in income_data['equipment']:
        customer = item['customer'].strip()
        income = float(item['accumulatedIncome'])
        equipment_income += income
        
        # 找对应成本
        cost = 0
        for cost_item in cost_data['equipment']:
            if cost_item['customerType'].strip() == customer:
                cost = float(cost_item['cumulativeMaterialCost'])
                break
        
        equipment_cost += cost
        
        if income > 0:
            rate = ((income - cost) / income) * 100
        else:
            rate = 0
        
        print(f"  {customer}: 收入={income:.2f}, 成本={cost:.2f}, 贡献率={rate:.2f}%")
    
    print(f"设备小计: 收入={equipment_income:.2f}, 成本={equipment_cost:.2f}, 贡献率={((equipment_income-equipment_cost)/equipment_income*100):.2f}%")
    
    # 计算元件板块
    components_income = 0
    components_cost = 0
    
    print("\n元件板块:")
    for item in income_data['components']:
        customer = item['customer'].strip()
        income = float(item['accumulatedIncome'])
        components_income += income
        
        # 找对应成本
        cost = 0
        for cost_item in cost_data['component']:
            if cost_item['customerType'].strip() == customer:
                cost = float(cost_item['cumulativeMaterialCost'])
                break
        
        components_cost += cost
        
        if income > 0:
            rate = ((income - cost) / income) * 100
        else:
            rate = 0
        
        print(f"  {customer}: 收入={income:.2f}, 成本={cost:.2f}, 贡献率={rate:.2f}%")
    
    print(f"元件小计: 收入={components_income:.2f}, 成本={components_cost:.2f}, 贡献率={((components_income-components_cost)/components_income*100):.2f}%")
    
    # 计算工程板块
    engineering_income = 0
    engineering_cost = 0
    
    print("\n工程板块:")
    for item in income_data['engineering']:
        customer = item['customer'].strip()
        income = float(item['accumulatedIncome'])
        engineering_income += income
        
        # 找对应成本
        cost = 0
        for cost_item in cost_data['project']:
            if cost_item['customerType'].strip() == customer:
                cost = float(cost_item['cumulativeMaterialCost'])
                break
        
        engineering_cost += cost
        
        if income > 0:
            rate = ((income - cost) / income) * 100
        else:
            rate = 0
        
        print(f"  {customer}: 收入={income:.2f}, 成本={cost:.2f}, 贡献率={rate:.2f}%")
    
    print(f"工程小计: 收入={engineering_income:.2f}, 成本={engineering_cost:.2f}, 贡献率={((engineering_income-engineering_cost)/engineering_income*100):.2f}%")
    
    # 总计
    total_income = equipment_income + components_income + engineering_income
    total_cost = equipment_cost + components_cost + engineering_cost
    total_rate = ((total_income - total_cost) / total_income) * 100
    
    print(f"\n=== 总计对比 ===")
    print(f"手工计算: 收入={total_income:.2f}, 成本={total_cost:.2f}, 贡献率={total_rate:.2f}%")
    print(f"后端计算: {backend_result['data']['total']['actual']}")
    print(f"差异: {abs(total_rate - float(backend_result['data']['total']['actual'].replace('%', ''))):.2f}%")

if __name__ == "__main__":
    debug_calculation() 