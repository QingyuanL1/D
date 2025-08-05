// 数据库存储的资产负债表接口
export interface BalanceSheet {
  id?: number;                  // 主键ID
  period: string;              // 期间（如：2024-03）
  data: string;                // JSON格式的表单数据
  created_at?: string;         // 创建时间
  updated_at?: string;         // 更新时间
}

// 表单数据的类型（用于JSON序列化）
export interface BalanceSheetFormData {
  [key: string]: {
    ending_balance: number | null;  // 期末余额
    beginning_balance: number | null;  // 期初余额
  };
} 