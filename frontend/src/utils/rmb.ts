/**
 * 人民币金额大小写转换
 * 将阿拉伯数字金额转换为中文大写（适用于财务、票据等场景）
 *
 * 示例：
 *   12345.67 → 壹万贰仟叁佰肆拾伍元陆角柒分
 *   100.00   → 壹佰元整
 *   0.08     => 捌分
 */

const CN_NUM = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'] as const
const CN_UNIT = ['', '拾', '佰', '仟'] as const
const CN_BIG_UNIT = ['', '万', '亿', '万亿'] as const

/**
 * 将数字金额转换为中文大写
 * @param amount 金额数字（支持字符串或数字类型）
 * @returns 中文大写金额字符串
 */
export function rmbToChinese(amount: number | string): string {
  // 统一转为字符串处理
  let strAmount = String(amount)

  // 处理负数
  const isNegative = strAmount.startsWith('-')
  if (isNegative) {
    strAmount = strAmount.slice(1)
  }

  // 校验格式
  if (!/^\d+(\.\d{1,2})?$/.test(strAmount)) {
    throw new Error('金额格式错误，最多支持两位小数')
  }

  // 去除前导零（但保留单个零）
  strAmount = strAmount.replace(/^0+(?=\d)/, '')
  if (strAmount === '' || strAmount === '.') {
    strAmount = '0'
  }

  const parts = strAmount.split('.')
  const integerPart = parts[0] || '0'
  const decimalPart = parts[1] || ''

  if (integerPart === '0' && decimalPart === '') {
    return '零元整'
  }

  // 如果整数部分为 0 且有小数，不读"零元"
  let result = ''
  if (integerPart !== '0') {
    result += convertInteger(integerPart) + '元'
  }

  result += convertDecimal(decimalPart)

  if (isNegative) {
    result = '负' + result
  }

  return result
}

/** 转换整数部分 */
function convertInteger(numStr: string): string {
  const len = numStr.length
  if (len === 0 || numStr === '0') return ''

  // 按四位一节分组（从低位到高位）
  const groups: string[] = []
  let remaining = numStr
  while (remaining.length > 0) {
    groups.unshift(remaining.slice(-4))
    remaining = remaining.slice(0, -4)
  }

  let result = ''
  const groupCount = groups.length

  for (let i = 0; i < groupCount; i++) {
    const group = groups[i]
    const groupValue = parseInt(group, 10)
    const bigUnitIndex = groupCount - 1 - i

    if (groupValue === 0) {
      // 跳过全零的组，但如果是万位组且后面有非零组，需要补"零"
      if (bigUnitIndex % 2 === 1 && result !== '' && result[result.length - 1] !== '零') {
        // 万位组全零，补"零"替代万的单位
        // 但需要用更精确的判断：检查是否还有低位非零组
        let hasLowerNonZero = false
        for (let j = i + 1; j < groupCount; j++) {
          if (parseInt(groups[j], 10) !== 0) {
            hasLowerNonZero = true
            break
          }
        }
        if (hasLowerNonZero) {
          result += '零'
        }
      }
      continue
    }

    // 处理组内前导零
    if (result !== '' && result[result.length - 1] !== '零' && Number(group) < 1000) {
      // 检查当前组是否千位以下（可能有前导零）
      const groupStr = String(groupValue).padStart(group.length, '0')
      if (groupStr[0] === '0' && groupValue > 0) {
        result += '零'
      }
    }

    result += convertGroup(group) + CN_BIG_UNIT[bigUnitIndex]

    // 相邻组之间补零（如果当前组不是以零结尾且不是最后一组）
    if (i < groupCount - 1) {
      const nextGroup = parseInt(groups[i + 1], 10)
      const curLastChar = group.slice(-1)
      if (groupValue > 0 && nextGroup > 0 && nextGroup < 1000 && curLastChar === '0') {
        // 当前组尾部有零且下一组非零 → 需要补零
        // 但不重复已在 convertGroup 中处理的零
      }
    }
  }

  return result
}

/** 转换四位以内的数字（不含单位后缀） */
function convertGroup(numStr: string): string {
  const len = numStr.length
  let result = ''
  let hasZero = false // 标记是否处于连续的零段

  for (let i = 0; i < len; i++) {
    const digit = parseInt(numStr[i], 10)
    const unitIndex = len - 1 - i

    if (digit === 0) {
      hasZero = true
    } else {
      if (hasZero) {
        result += '零'
        hasZero = false
      }
      result += CN_NUM[digit] + CN_UNIT[unitIndex]
    }
  }

  return result
}

/** 转换小数部分（角分） */
function convertDecimal(decimalStr: string): string {
  if (decimalStr === '') return '整'

  // 补齐两位
  const padded = decimalStr.padEnd(2, '0').slice(0, 2)
  const jiao = parseInt(padded[0], 10)
  const fen = parseInt(padded[1], 10)

  if (jiao === 0 && fen === 0) return '整'

  let result = ''
  if (jiao > 0) {
    result += CN_NUM[jiao] + '角'
  } else if (fen > 0) {
    result += '零'
  }

  if (fen > 0) {
    result += CN_NUM[fen] + '分'
  }

  return result
}
