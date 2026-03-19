/**
 * 获取某个值对应类型的空值
 */
export function getEmptyValue(value: any): any {
  const type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
  switch (type) {
    case 'string':
      return ''
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'array':
      return []
    case 'object':
      return {}
    case 'map':
      return new Map()
    case 'set':
      return new Set()
    case 'date':
      return new Date(NaN)
    case 'null':
      return null
    case 'undefined':
      return undefined
    case 'function':
      return () => {}
    case 'symbol':
      return Symbol()
    default:
      return undefined
  }
}

/**
 * 递归将复杂对象的所有字段重置为空
 * - 支持嵌套对象、数组
 * - 会保持结构
 * @param target 任意对象或数组
 * @returns 新对象（不修改原始数据）
 */
export function resetToEmpty<T>(target: T): T {
  const type = Object.prototype.toString.call(target).slice(8, -1).toLowerCase()

  if (type === 'array') {
    // 数组：保留结构但清空内部元素
    return (target as any[]).map(item => resetToEmpty(item)) as any
  }

  if (type === 'object') {
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(target as Record<string, any>)) {
      const valueType = Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
      if (valueType === 'object' || valueType === 'array') {
        result[key] = resetToEmpty(value)
      } else {
        result[key] = getEmptyValue(value)
      }
    }
    return result as T
  }

  // 其他基础类型直接返回空值
  return getEmptyValue(target)
}
