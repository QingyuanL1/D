#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import csv

def load_data():
    """加载收入和成本数据"""
    try:
        with open('income_2025_07.json', 'r', encoding='utf-8') as f:
            income_data = json.load(f)
        
        with open('cost_2025_07.json', 'r', encoding='utf-8') as f:
            cost_data = json.load(f)
            
        return income_data, cost_data
    except Exception as e:
        print(f"加载数据失败: {e}")
        return None, None

def create_verification_table():
    """创建验算表格"""
    income_data, cost_data = load_data()
    
    if not income_data or not cost_data:
        return
    
    print("=" * 100)
    print("2025年7月主营业务边际贡献率验算表（修正版）")
    print("=" * 100)
    
    # 创建验算数据列表
    verification_data = []
    
    # 处理设备板块
    print("\n【设备板块】")
    print("-" * 80)
    print(f"{'客户类型':<12} {'累计收入(万元)':<15} {'累计直接成本':<15} {'边际贡献率':<12}")
    print("-" * 80)
    
    if income_data.get('success') and cost_data.get('success'):
        # 收入数据映射
        income_map = {}
        if 'equipment' in income_data['data']:
            for item in income_data['data']['equipment']:
                income_map[item['customer']] = float(item.get('accumulatedIncome', 0))
        
        # 成本数据映射
        cost_map = {}
        if 'equipment' in cost_data['data']:
            for item in cost_data['data']['equipment']:
                customer = item['customerType']
                # 只使用 cumulativeMaterialCost 作为累计直接成本
                direct_cost = float(item.get('cumulativeMaterialCost', 0))
                cost_map[customer] = direct_cost
        
        # 合并数据并计算边际贡献率
        all_customers = set(income_map.keys()) | set(cost_map.keys())
        equipment_total_income = 0
        equipment_total_cost = 0
        
        for customer in sorted(all_customers):
            income = income_map.get(customer, 0)
            cost = cost_map.get(customer, 0)
            
            # 计算边际贡献率
            if income > 0:
                contribution_rate = ((income - cost) / income) * 100
            else:
                contribution_rate = 0 if cost == 0 else -100
            
            equipment_total_income += income
            equipment_total_cost += cost
            
            print(f"{customer:<12} {income:<15.2f} {cost:<15.2f} {contribution_rate:<12.2f}%")
            
            verification_data.append({
                '板块': '设备',
                '客户类型': customer,
                '累计收入': income,
                '累计直接成本': cost,
                '边际贡献率': f"{contribution_rate:.2f}%"
            })
        
        print("-" * 80)
        equipment_contribution_rate = ((equipment_total_income - equipment_total_cost) / equipment_total_income * 100) if equipment_total_income > 0 else 0
        print(f"{'小计':<12} {equipment_total_income:<15.2f} {equipment_total_cost:<15.2f} {equipment_contribution_rate:<12.2f}%")
    
    # 处理元件板块
    print("\n【元件板块】")
    print("-" * 80)
    print(f"{'客户类型':<12} {'累计收入(万元)':<15} {'累计直接成本':<15} {'边际贡献率':<12}")
    print("-" * 80)
    
    components_total_income = 0
    components_total_cost = 0
    
    if 'components' in income_data['data'] and 'component' in cost_data['data']:
        for income_item in income_data['data']['components']:
            customer = income_item['customer']
            income = float(income_item.get('accumulatedIncome', 0))
            
            # 查找对应的成本数据
            cost = 0
            for cost_item in cost_data['data']['component']:
                if cost_item['customerType'] == customer:
                    cost = float(cost_item.get('cumulativeMaterialCost', 0))
                    break
            
            # 计算边际贡献率
            if income > 0:
                contribution_rate = ((income - cost) / income) * 100
            else:
                contribution_rate = 0 if cost == 0 else -100
            
            components_total_income += income
            components_total_cost += cost
            
            print(f"{customer:<12} {income:<15.2f} {cost:<15.2f} {contribution_rate:<12.2f}%")
            
            verification_data.append({
                '板块': '元件',
                '客户类型': customer,
                '累计收入': income,
                '累计直接成本': cost,
                '边际贡献率': f"{contribution_rate:.2f}%"
            })
    
    print("-" * 80)
    components_contribution_rate = ((components_total_income - components_total_cost) / components_total_income * 100) if components_total_income > 0 else 0
    print(f"{'小计':<12} {components_total_income:<15.2f} {components_total_cost:<15.2f} {components_contribution_rate:<12.2f}%")
    
    # 处理工程板块
    print("\n【工程板块】")
    print("-" * 80)
    print(f"{'客户类型':<12} {'累计收入(万元)':<15} {'累计直接成本':<15} {'边际贡献率':<12}")
    print("-" * 80)
    
    engineering_total_income = 0
    engineering_total_cost = 0
    
    if 'engineering' in income_data['data'] and 'project' in cost_data['data']:
        for income_item in income_data['data']['engineering']:
            customer = income_item['customer']
            income = float(income_item.get('accumulatedIncome', 0))
            
            # 查找对应的成本数据
            cost = 0
            for cost_item in cost_data['data']['project']:
                if cost_item['customerType'] == customer:
                    cost = float(cost_item.get('cumulativeMaterialCost', 0))
                    break
            
            # 计算边际贡献率
            if income > 0:
                contribution_rate = ((income - cost) / income) * 100
            else:
                contribution_rate = 0 if cost == 0 else -100
            
            engineering_total_income += income
            engineering_total_cost += cost
            
            print(f"{customer:<12} {income:<15.2f} {cost:<15.2f} {contribution_rate:<12.2f}%")
            
            verification_data.append({
                '板块': '工程',
                '客户类型': customer,
                '累计收入': income,
                '累计直接成本': cost,
                '边际贡献率': f"{contribution_rate:.2f}%"
            })
    
    print("-" * 80)
    engineering_contribution_rate = ((engineering_total_income - engineering_total_cost) / engineering_total_income * 100) if engineering_total_income > 0 else 0
    print(f"{'小计':<12} {engineering_total_income:<15.2f} {engineering_total_cost:<15.2f} {engineering_contribution_rate:<12.2f}%")
    
    # 总计
    print("\n【总计】")
    print("=" * 80)
    total_income = equipment_total_income + components_total_income + engineering_total_income
    total_cost = equipment_total_cost + components_total_cost + engineering_total_cost
    total_contribution_rate = ((total_income - total_cost) / total_income * 100) if total_income > 0 else 0
    
    print(f"{'总计':<12} {total_income:<15.2f} {total_cost:<15.2f} {total_contribution_rate:<12.2f}%")
    print("=" * 80)
    
    # 保存为CSV文件
    with open('边际贡献率验算表_修正版_2025-07.csv', 'w', newline='', encoding='utf-8-sig') as csvfile:
        if verification_data:
            fieldnames = verification_data[0].keys()
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(verification_data)
    print(f"\n验算表已保存为: 边际贡献率验算表_修正版_2025-07.csv")
    
    # 公式说明
    print("\n【公式说明】")
    print("边际贡献率 = (累计收入 - 累计直接成本) / 累计收入 × 100%")
    print("累计直接成本 = cumulativeMaterialCost（已包含所有直接成本）")
    print(f"验证总体边际贡献率: ({total_income:.2f} - {total_cost:.2f}) / {total_income:.2f} × 100% = {total_contribution_rate:.2f}%")
    
    # 详细计算验证
    print("\n【详细验证计算】")
    print(f"设备板块: ({equipment_total_income:.2f} - {equipment_total_cost:.2f}) / {equipment_total_income:.2f} = {equipment_contribution_rate:.2f}%")
    print(f"元件板块: ({components_total_income:.2f} - {components_total_cost:.2f}) / {components_total_income:.2f} = {components_contribution_rate:.2f}%")
    print(f"工程板块: ({engineering_total_income:.2f} - {engineering_total_cost:.2f}) / {engineering_total_income:.2f} = {engineering_contribution_rate:.2f}%")

if __name__ == "__main__":
    create_verification_table() 