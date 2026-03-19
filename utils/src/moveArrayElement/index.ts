/**
 * 移动数组元素（支持循环、步长、原地修改、锁定索引）
 * @param arr - 原数组
 * @param currentIndex - 当前索引
 * @param direction - 移动方向 ('up' | 'down')
 * @param step - 步长（默认 1）
 * @param inPlace - 是否修改原数组（默认 false）
 * @param lockedIndexes - 不允许被移动或被占用的索引（默认 [0, 2]）
 * @returns 移动后的数组（若非原地模式则为新数组）
 */
export function moveArrayElement<T>(
  arr: T[],
  currentIndex: number,
  direction: "up" | "down",
  step: number = 1,
  inPlace: boolean = false,
  lockedIndexes: number[] = [],
): T[] {
  if (!Array.isArray(arr) || arr.length === 0) return arr;
  if (lockedIndexes.includes(currentIndex)) return arr; // 当前索引被锁定，不允许移动

  const len = arr.length;
  const newArr = inPlace ? arr : [...arr];
  const item = newArr[currentIndex];

  // 计算新索引（循环移动）
  let newIndex =
    direction === "up" ? (currentIndex - step + len) % len : (currentIndex + step) % len;

  // 跳过被锁定的索引
  while (lockedIndexes.includes(newIndex)) {
    newIndex = direction === "up" ? (newIndex - 1 + len) % len : (newIndex + 1) % len;
  }

  // 删除旧位置，插入新位置
  newArr.splice(currentIndex, 1);
  newArr.splice(newIndex, 0, item);

  return newArr;
}
