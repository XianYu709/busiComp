import CryptoJS from 'crypto-js';
import * as pako from 'pako';

/**
 * 随机生成32位的字符串
 * @returns {string}
 */
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * 随机生成aes 密钥
 * @returns {string}
 */
export const generateAesKey = () => {
  return CryptoJS.enc.Utf8.parse(generateRandomString());
};

/**
 * 加密base64
 * @returns {string}
 */
export const encryptBase64 = (str: CryptoJS.lib.WordArray) => {
  return CryptoJS.enc.Base64.stringify(str);
};

/**
 * 解密base64
 */
export const decryptBase64 = (str: string) => {
  return CryptoJS.enc.Base64.parse(str);
};

/**
 * 使用密钥对数据进行加密
 * @param message
 * @param aesKey
 * @returns {string}
 */
export const encryptWithAes = (message: string, aesKey: CryptoJS.lib.WordArray) => {
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
};

/**
 * 使用密钥对数据进行解密
 * @param message
 * @param aesKey
 * @returns {string}
 */
export const decryptWithAes = (message: string, aesKey: CryptoJS.lib.WordArray) => {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};

/**
 * 使用gzip压缩数据
 * @param data 要压缩的数据（字符串或对象）
 * @returns {string} 压缩后的base64字符串
 */
const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
  const chunkSize = 0x8000;
  let binary = '';

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }

  return btoa(binary);
};

export const compressWithGzip = (data: string | object): string => {
  try {
    // 如果是对象，先转换为JSON字符串
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

    // 将字符串转换为Uint8Array
    const uint8Array = new TextEncoder().encode(jsonString);

    // 使用pako进行gzip压缩
    const compressed = pako.gzip(uint8Array);

    // 将压缩后的数据转换为base64字符串
    const base64String = uint8ArrayToBase64(compressed);

    return base64String;
  } catch (error) {
    console.error('gzip压缩失败：', error);
    throw new Error('数据压缩失败');
  }
};

/**
 * 使用gzip解压数据
 * @param compressedData 压缩后的base64字符串
 * @returns {string} 解压后的原始字符串
 */
export const decompressWithGzip = (compressedData: string): string => {
  try {
    // 将base64字符串转换为Uint8Array
    const binaryString = atob(compressedData);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    // 使用pako进行gzip解压
    const decompressed = pako.ungzip(uint8Array);

    // 将解压后的数据转换为字符串
    const originalString = new TextDecoder().decode(decompressed);

    return originalString;
  } catch (error) {
    console.error('gzip解压失败：', error);
    throw new Error('数据解压失败');
  }
};

/**
 * 将字符串转换为 Base64 编码
 * @param str 要编码的字符串
 * @returns Base64 编码的字符串
 */
export const stringToBase64 = (str: string): string => {
  try {
    const wordArray = CryptoJS.enc.Utf8.parse(str);
    return CryptoJS.enc.Base64.stringify(wordArray);
  } catch (error) {
    console.error('字符串转 Base64 失败：', error);
    throw new Error('字符串转 Base64 失败');
  }
}
/**
 * 将 Base64 编码还原为字符串
 * @param base64Str Base64 编码的字符串
 * @returns 解码后的原始字符串
 */
export const base64ToString = (base64Str: string): string => {
  try {
    const parsed = CryptoJS.enc.Base64.parse(base64Str);
    return CryptoJS.enc.Utf8.stringify(parsed);
  } catch (error) {
    console.error('Base64 解码失败：', error);
    throw new Error('Base64 解码失败');
  }
};

