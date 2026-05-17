export function buildScoreArray(score: number) {
  const arr: any[] = [];
  const intVal = Math.floor(score);

  // —— 情况 A：个位数（1~9）——
  if (intVal < 10) {
    for (let i = intVal; i >= 1; i--) {
      arr.push(i);
    }
    arr.push("小", "0.5");
    return arr;
  }

  // —— 情况 B：十位或以上 —— //

  // 1️⃣ 非整十（如 22、37、76）
  if (intVal % 10 !== 0) {
    // arr.push(String(intVal)); // "76"

    let tens = Math.floor(intVal / 10) * 10; // 70
    while (tens >= 10) {
      arr.push(tens); // 70 → 60 → 50 → ...
      tens -= 10;
    }
  }
  // 2️⃣ 整十（20, 30, 40, 60）
  else {
    let v = intVal;
    while (v >= 10) {
      arr.push(v);
      v -= 10;
    }
  }

  // “个”
  arr.push("个");

  // 个位数 9 → 1
  for (let i = 9; i >= 1; i--) {
    arr.push(i);
  }

  // 固定尾部
  arr.push("小", "0.5");

  return arr;
}
