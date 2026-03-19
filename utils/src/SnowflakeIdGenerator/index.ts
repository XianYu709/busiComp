export class SnowflakeIdGenerator {
  private static instance: SnowflakeIdGenerator;
  private lastTimestamp: number = -1;
  private sequence: number = 0;
  private readonly sequenceMask: number = 999;
  private nodeId: number;

  private constructor() {
    // 生成一个固定的节点ID（1-99之间），避免前导0
    this.nodeId = Math.floor(Math.random() * 99) + 1;
  }

  public static getInstance(): SnowflakeIdGenerator {
    if (!SnowflakeIdGenerator.instance) {
      SnowflakeIdGenerator.instance = new SnowflakeIdGenerator();
    }
    return SnowflakeIdGenerator.instance;
  }

  // 添加静态方法，简化调用
  public static generateId(): string {
    return SnowflakeIdGenerator.getInstance().generateId();
  }

  public generateId(): string {
    let timestamp = Date.now();

    if (timestamp < this.lastTimestamp) {
      throw new Error("Clock moved backwards!");
    }

    if (this.lastTimestamp === timestamp) {
      this.sequence = (this.sequence + 1) & this.sequenceMask;
      if (this.sequence === 0) {
        timestamp = this.tilNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    // 提取时间戳中的数字并打乱顺序，避免连续的0
    const timeStr = timestamp.toString();
    let mixedTime = '';
    
    // 从时间戳中提取数字并重新组合，跳过简单的padEnd操作
    for (let i = 0; i < Math.min(timeStr.length, 8); i++) {
      // 使用时间戳的不同位数进行计算，产生变化
      const charCode = timeStr.charCodeAt(i);
      mixedTime += ((charCode + i * 7) % 9) + 1; // 产生1-9之间的数字，避免0
    }
    
    // 确保mixedTime长度为8位
    while (mixedTime.length < 8) {
      // 基于时间戳和序列号生成填充数字
      const fillValue = (timestamp + this.sequence + mixedTime.length) % 9 + 1;
      mixedTime += fillValue.toString();
    }
    
    // 如果超过8位则截取
    if (mixedTime.length > 8) {
      mixedTime = mixedTime.substring(0, 8);
    }
    
    // 生成不为0的随机数部分
    const randomHigh = Math.floor(Math.random() * 9) + 1; // 1-9
    const randomMid = Math.floor(Math.random() * 900) + 100; // 100-999
    const randomLow = Math.floor(Math.random() * 90) + 10; // 10-99
    
    // 序列号也避免前导0
    const sequenceValue = (this.sequence % 999) + 1; // 1-999
    
    // 组合各部分
    const nodeIdPart = this.nodeId.toString().padStart(2, '1'); // 用1填充而不是0
    const timePart = mixedTime;
    const randomPart1 = randomHigh.toString();
    const sequencePart = sequenceValue.toString().padStart(3, '1'); // 用1填充而不是0
    const randomPart2 = randomMid.toString();
    const randomPart3 = randomLow.toString();
    
    // 组合成接近18位的字符串
    let result = `${nodeIdPart}${timePart}${randomPart1}${sequencePart}${randomPart2}${randomPart3}`;
    
    // 调整到 exactly 18 位
    if (result.length > 18) {
      result = result.substring(0, 18);
    } else if (result.length < 18) {
      // 用更有变化的数字填充
      while (result.length < 18) {
        const fillDigit = (timestamp + result.length) % 9 + 1;
        result += fillDigit.toString();
      }
    }

    return result.substring(0, 18);
  }

  private tilNextMillis(lastTimestamp: number): number {
    let timestamp = Date.now();
    while (timestamp <= lastTimestamp) {
      timestamp = Date.now();
    }
    return timestamp;
  }
}