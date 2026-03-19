import * as XLSX from 'xlsx';
import createService from '../request/createService'

// 1. 定义类型接口
/** 表格列配置类型 */
interface TableColumn {
  label: string;
  prop?: string;
  align?: string;
  minWidth?: number;
  fixed?: boolean;
  sortable?: boolean;
  children?: TableColumn[];
  formatter?: string; // 显式声明格式化器字段
}
// 单元格合并信息类型
interface CellMerge {
  s: { c: number; r: number }; // 起始位置
  e: { c: number; r: number }; // 结束位置
}
// 表头单元格信息类型
interface HeaderCell {
  label: string;
  rowSpan: number;
  colSpan: number;
  startCol: number;
  endCol: number;
  level: number;
}
// 通用配置接口
interface ExportConfig {
  valueExtractor?: {
    defaultValue?: any;
    nullValue?: any;
    undefinedValue?: any;
  };
  valueFormatters?: {
    [key: string]: (value: any) => any;
  };
  anomalyHandlers?: {
    [pattern: string]: (value: any) => any;
  };
  customDataProcessor?: (data: any[], columns: TableColumn[]) => any[];
}

// 2. 默认配置
const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  valueExtractor: {
    defaultValue: '',
    nullValue: '',
    undefinedValue: ''
  },
  valueFormatters: {
    number: (value: any) => typeof value === 'number' ? value.toFixed(2) : value,
    percentage: (value: any) => value ? `${value}%` : value,
    date: (value: any) => {
      if (!value) return value;
      const date = new Date(value);
      return date.toLocaleDateString();
    }
  },
  anomalyHandlers: {
    '-1.00': () => '',
    '-1': () => '',
    'null': () => '',
    'undefined': () => ''
  }
};

// 3. 通用的值提取器
class ValueExtractor {
  private config: ExportConfig['valueExtractor'];
  
  constructor(config: ExportConfig['valueExtractor'] = {}) {
    this.config = { ...DEFAULT_EXPORT_CONFIG.valueExtractor, ...config };
  }
  
  extract(item: any, prop: string): any {
    if (!prop) return this.config.defaultValue;
    const value = item[prop];
    if (value === null) return this.config.nullValue;
    if (value === undefined) return this.config.undefinedValue;
    return value;
  }
}

// 4. 通用的值格式化器
class ValueFormatter {
  private formatters: ExportConfig['valueFormatters'];
  private anomalyHandlers: ExportConfig['anomalyHandlers'];
  
  constructor(config: ExportConfig = {}) {
    this.formatters = { ...DEFAULT_EXPORT_CONFIG.valueFormatters, ...config.valueFormatters };
    this.anomalyHandlers = { ...DEFAULT_EXPORT_CONFIG.anomalyHandlers, ...config.anomalyHandlers };
  }
  
  format(value: any, formatterType?: string): any {
    // 异常值处理
    const strValue = String(value);
    for (const [pattern, handler] of Object.entries(this.anomalyHandlers)) {
      if (strValue === pattern) {
        return handler(value);
      }
    }
    // 格式化处理
    if (formatterType && this.formatters[formatterType]) {
      return this.formatters[formatterType](value);
    }
    return value;
  }
}

// 5. 核心工具函数
/**
 * 递归提取表格列配置中的所有叶子节点（最终Excel的列）
 */
const extractLeafColumns = (columns: TableColumn[]): TableColumn[] => {
  const leafColumns: TableColumn[] = [];
  columns.forEach(column => {
    if (column.children && column.children.length > 0) {
      leafColumns.push(...extractLeafColumns(column.children));
    } else if (column.prop) {
      leafColumns.push(column);
    }
  });
  return leafColumns;
};

/**
 * 获取列结构的最大层级
 */
const getMaxLevel = (columns: TableColumn[]): number => {
  let maxLevel = 1;
  columns.forEach(col => {
    if (col.children && col.children.length > 0) {
      maxLevel = Math.max(maxLevel, 1 + getMaxLevel(col.children));
    }
  });
  return maxLevel;
};

/**
 * 获取列的叶子节点数量（用于计算列跨度）
 */
const getLeafColumnCount = (column: TableColumn): number => {
  if (!column.children || column.children.length === 0) {
    return 1;
  }
  return column.children.reduce((sum, child) => sum + getLeafColumnCount(child), 0);
};

/**
 * 构建表头单元格信息树（核心修复：rowSpan计算逻辑）
 */
const buildHeaderCells = (
  columns: TableColumn[], 
  level: number, 
  startCol: number = 0,
  maxLevel: number // 新增：传入总层级，避免重复计算
): HeaderCell[] => {
  const cells: HeaderCell[] = [];
  let currentCol = startCol;

  columns.forEach(col => {
    const leafCount = getLeafColumnCount(col);
    const hasChildren = col.children && col.children.length > 0;
    
    // 【核心修复】rowSpan计算逻辑
    // 有子节点：行跨度=1（仅占当前行）
    // 无子节点：行跨度=总层级 - 当前层级（占据剩余所有行）
    const rowSpan = hasChildren ? 1 : maxLevel - level;

    cells.push({
      label: col.label,
      rowSpan: rowSpan,
      colSpan: leafCount,
      startCol: currentCol,
      endCol: currentCol + leafCount - 1,
      level: level
    });

    // 递归处理子列
    if (hasChildren) {
      const childCells = buildHeaderCells(col.children, level + 1, currentCol, maxLevel);
      cells.push(...childCells);
    }

    currentCol += leafCount;
  });

  return cells;
};

/**
 * 生成多级表头结构
 */
const generateMultiLevelHeaders = (columns: TableColumn[]): string[][] => {
  const maxLevel = getMaxLevel(columns);
  const leafCount = extractLeafColumns(columns).length;
  
  // 初始化表头矩阵
  const headers: string[][] = Array.from({ length: maxLevel }, () => Array(leafCount).fill(''));
  
  // 构建表头单元格信息（传入总层级）
  const headerCells = buildHeaderCells(columns, 0, 0, maxLevel);
  
  // 按层级分组并排序
  const cellsByLevel: { [level: number]: HeaderCell[] } = {};
  headerCells.forEach(cell => {
    if (!cellsByLevel[cell.level]) cellsByLevel[cell.level] = [];
    cellsByLevel[cell.level].push(cell);
  });

  // 填充表头矩阵
  Object.keys(cellsByLevel).forEach(levelStr => {
    const level = parseInt(levelStr);
    const sortedCells = cellsByLevel[level].sort((a, b) => a.startCol - b.startCol);
    
    sortedCells.forEach(cell => {
      // 仅在起始位置填入label
      headers[cell.level][cell.startCol] = cell.label;
      
      // 横向合并：清空合并范围内的其他单元格
      if (cell.colSpan > 1) {
        for (let c = cell.startCol + 1; c <= cell.endCol; c++) {
          headers[cell.level][c] = '';
        }
      }
    });
  });

  return headers;
};

/**
 * 计算表头单元格合并信息（过滤无效合并项）
 */
const calculateHeaderMerges = (columns: TableColumn[]): CellMerge[] => {
  const maxLevel = getMaxLevel(columns);
  const headerCells = buildHeaderCells(columns, 0, 0, maxLevel);
  const merges: CellMerge[] = [];

  headerCells.forEach(cell => {
    // 过滤掉跨度为1的无效合并
    if (cell.colSpan > 1) {
      merges.push({
        s: { r: cell.level, c: cell.startCol },
        e: { r: cell.level, c: cell.endCol }
      });
    }
    if (cell.rowSpan > 1) {
      merges.push({
        s: { r: cell.level, c: cell.startCol },
        e: { r: cell.level + cell.rowSpan - 1, c: cell.startCol }
      });
    }
  });

  // 去重：避免重复的合并项导致Excel解析异常
  const uniqueMerges = Array.from(new Map(merges.map(m => [JSON.stringify(m), m])).values());
  return uniqueMerges;
};

/**
 * 生成数据行
 */
const generateDataRows = (
  data: any[], 
  leafColumns: TableColumn[], 
  config: ExportConfig = {}
): any[][] => {
  const valueExtractor = new ValueExtractor(config.valueExtractor);
  const valueFormatter = new ValueFormatter(config);
  
  let processedData = data;
  if (config.customDataProcessor) {
    processedData = config.customDataProcessor(data, leafColumns);
  }

  // 打印列配置和数据结构（方便调试，可删除）
  // console.log('叶子列配置（prop与label）:', leafColumns.map(col => ({ label: col.label, prop: col.prop, formatter: col.formatter })));
  // if (processedData.length > 0) {
  //   console.log('数据结构:', processedData);
  // }

  return processedData.map(item => {
    return leafColumns.map(col => {
      const rawValue = valueExtractor.extract(item, col.prop || '');
      const formattedValue = valueFormatter.format(rawValue, col.formatter);
      return formattedValue;
    });
  });
};


// 6. 导出函数
// 获取环境变量的基础URL
const getBaseUrl = () => {
  // 兼容不同环境的写法
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.VITE_APP_BASE_API;
  }
  // 备用方案：从全局变量或其他方式获取
  return (window as any).__APP_BASE_API__ || "/api";
};
/**
 * 从接口获取数据并导出Excel
 */
export async function exportToXlsx(apiFnOrUrl: string, _data: any[], filename: string) {
  try {
    // 使用 createService 创建 service 实例
    const service = createService({
      baseURL: getBaseUrl(),
      timeout: 60000, // 文件下载可能需要更长时间
    });

    const res = await service({
      url: apiFnOrUrl,
      method: 'post',
      data: _data,
      responseType: "blob",
    });
    const data = res?.data ? res.data : res?.rows; 
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data); 
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data'); 
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

/**
 * 多级表头Excel导出（带样式）
 */
export function selfExportToXlsx(
  colData: TableColumn[], 
  myData: any[], 
  filename: string,
  config: ExportConfig = {}
): void {
  try {
    const headers = generateMultiLevelHeaders(colData);
    const leafColumns = extractLeafColumns(colData);    // 多级表头
    const dataRows = generateDataRows(myData, leafColumns, config);   // 生成数据
    const exportData = [...headers, ...dataRows];

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    // 获取工作表范围
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    // 设置行高
    const headerRowHeight = 25; // 表头行高（单位：点）
    const dataRowHeight = 20;   // 数据行高（单位：点）

    // 初始化行高数组
    ws['!rows'] = [];
    
    // 设置表头样式（第0行到headers.length-1行 行高）
    for (let R = 0; R < headers.length; ++R) {
      // 设置行高
      if (!ws['!rows'][R]) {
        ws['!rows'][R] = { hpt: headerRowHeight };
      }
      
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
        if (!ws[cellAddress]) {
          // 如果单元格不存在但需要样式，创建一个空单元格
          ws[cellAddress] = { t: 's', v: '' };
        }
        
        // 创建表头样式
        ws[cellAddress].s = {
          font: {
            bold: true,
            sz: 11,
            color: { rgb: "333333" } // 字体颜色深灰
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
          },
          fill: {
            fgColor: { rgb: "FFA5A5A5" }, // 表头背景色：蓝色
            bgColor: { rgb: "FFA5A5A5" },
            patternType: "solid"
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },    // 黑色边框
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
    }
    
    // 设置数据行样式和行高
    for (let R = headers.length; R <= range.e.r; ++R) {
      // 设置行高
      if (!ws['!rows'][R]) {
        ws['!rows'][R] = { hpt: dataRowHeight };
      }
      
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
        if (!ws[cellAddress]) continue;
        
        // 创建数据行样式
        ws[cellAddress].s = {
          font: {
            sz: 10,
            color: { rgb: "000000" } // 黑色字体
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          },
          border: {
            top: { style: "thin", color: { rgb: "D9D9D9" } },    // 浅灰边框
            bottom: { style: "thin", color: { rgb: "D9D9D9" } },
            left: { style: "thin", color: { rgb: "D9D9D9" } },
            right: { style: "thin", color: { rgb: "D9D9D9" } }
          }
        };
        
        // 为特定列添加条件样式（可选）
        // 例如：为总计列添加特殊背景色
        if (R >= headers.length && C >= range.e.c - 1) { // 假设最后两列是总计
          ws[cellAddress].s.fill = {
            fgColor: { rgb: "F2F2F2" }, // 浅灰色背景
            patternType: "solid"
          };
          ws[cellAddress].s.font.bold = true;
        }
      }
    }
    
    // 设置列宽（自动调整）
    const colWidths = leafColumns.map(col => {
      // 计算列宽：最大字符数 * 字符宽度
      let maxLength = col.label.length;
      
      // 检查表头中该列的所有单元格
      for (let R = 0; R < headers.length; ++R) {
        const cellAddress = XLSX.utils.encode_cell({r: R, c: leafColumns.indexOf(col)});
        if (ws[cellAddress] && ws[cellAddress].v) {
          maxLength = Math.max(maxLength, String(ws[cellAddress].v).length);
        }
      }
      
      // 检查数据行
      dataRows.forEach(row => {
        const value = row[leafColumns.indexOf(col)];
        maxLength = Math.max(maxLength, String(value || '').length);
      });
      
      // 最小宽度8，最大宽度50
      return { wch: Math.min(Math.max(maxLength + 2, 8), 50) };
    });
    
    ws['!cols'] = colWidths;
    
    // 应用合并
    const merges = calculateHeaderMerges(colData);
    if (merges.length > 0) {
      ws['!merges'] = merges;
    }
    
    // 导出文件
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, filename || 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('导出Excel失败:', error);
    throw error;
  }
}

// 7. 预设配置
export const EXPORT_PRESETS = {
  classAverageScore: {
    valueFormatters: {
      score: (value: any) => value && value !== '-1.00' ? Number(value).toFixed(2) : '',
      percentage: (value: any) => value && value !== '-1.00' ? `${Number(value).toFixed(1)}%` : ''
    },
    anomalyHandlers: {
      '-1.00': () => '',
      '-1': () => '',
      'null': () => '',
      'undefined': () => ''
    }
  },
  originalScore: {
    valueFormatters: {
      score: (value: any) => value && value !== '-1.00' ? Number(value).toFixed(1) : '',
      rank: (value: any) => value || ''
    }
  },
  general: {
    valueFormatters: {
      number: (value: any) => typeof value === 'number' ? value.toFixed(2) : value
    }
  }
};