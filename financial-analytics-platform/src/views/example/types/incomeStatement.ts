// 数据库存储的利润表接口
export interface IncomeStatement {
  id?: number;                  // 主键ID
  period: string;              // 期间（如：2024-03）
  data: string;                // JSON格式的表单数据
  created_at?: string;         // 创建时间
  updated_at?: string;         // 更新时间
}

// 表单数据的类型（用于JSON序列化）
export interface IncomeStatementFormData {
  [key: string]: {
    current_amount: number | null;
    cumulative_amount: number | null;
  };
} 