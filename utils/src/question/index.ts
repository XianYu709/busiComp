import { nextTick } from "vue";

/**
 * 题库工具类
 * 包含解析选项、答案格式化、MathJax渲染等通用方法
 */

// ============== MathJax 相关方法 ==============

/**
 * 确保 MathJax 已加载并正确配置
 */
export const ensureMathJaxLoaded = async (): Promise<void> => {
  const w = window as any;
  if (w.__mathjaxLoading) {
    return w.__mathjaxLoading;
  }
  if (w.MathJax?.typesetPromise) {
    return Promise.resolve();
  }

  w.MathJax = w.MathJax || {};
  w.MathJax = Object.assign(w.MathJax, {
    tex: {
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
      processEscapes: true,
      processEnvironments: true,
    },
    options: {
      skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"],
      ignoreHtmlClass: "tex2jax_ignore",
      processHtmlClass: "tex2jax_process",
    },
    svg: {
      fontCache: "global",
      displayAlign: "center",
      displayIndent: "0",
    },
    startup: {
      ready: () => {
        w.MathJax.startup.defaultReady();
      },
    },
  });

  w.__mathjaxLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = e => reject(e);
    document.head.appendChild(script);
  });
  return w.__mathjaxLoading;
};

/**
 * MathJax数学公式渲染
 * @param elements 可选，指定要渲染的DOM元素数组，不传则渲染整个页面
 */
export const typesetMath = async (elements?: HTMLElement[]): Promise<void> => {
  try {
    await ensureMathJaxLoaded();
    const mj = (window as any)?.MathJax;
    if (mj?.typesetPromise) {
      await mj.typesetPromise(elements);
    }
  } catch (error) {
    console.warn("MathJax渲染失败:", error);
  }
};

/**
 * 在DOM更新后渲染数学公式
 * @param elements 可选，指定要渲染的DOM元素数组
 */
export const typesetMathAfterUpdate = async (elements?: HTMLElement[]): Promise<void> => {
  await nextTick();
  await typesetMath(elements);
};

// ============== 题目选项解析方法 ==============

/**
 * 解析JSON格式的题目选项
 * @param optionString 选项字符串或对象，可能是JSON格式
 * @returns 解析后的选项对象
 */
export const parseOptions = (optionString: any): Record<string, string> => {
  const parseArrayOptions = (list: any[]): Record<string, string> => {
    const result: Record<string, string> = {};
    list.forEach((item: any) => {
      if (item?.key && item?.value !== undefined) {
        result[item.key] = String(item.value);
      } else if (item?.option && item?.content !== undefined) {
        result[item.option] = String(item.content);
      }
    });
    return result;
  };

  const tryParseOptionPayload = (raw: string) => {
    const normalized = raw.replace(/\\\\(?=["\\])/g, "\\");
    const candidates = [raw, normalized].filter(
      (candidate, index, list) => candidate && list.indexOf(candidate) === index,
    );

    for (const candidate of candidates) {
      let current: unknown = candidate;
      for (let depth = 0; depth < 2; depth++) {
        if (typeof current !== "string") return current;
        try {
          current = JSON.parse(current);
        } catch {
          break;
        }
      }
      if (typeof current !== "string") return current;
    }

    return null;
  };

  if (optionString && typeof optionString === "object" && !Array.isArray(optionString)) {
    return optionString;
  }

  if (Array.isArray(optionString)) {
    return parseArrayOptions(optionString);
  }

  if (typeof optionString === "string") {
    const obj = tryParseOptionPayload(optionString);
    // 对象格式：{"A":"xxx"}
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      return obj;
    }
    // 数组格式：[{"key":"A","value":"xxx"}]
    if (Array.isArray(obj)) {
      return parseArrayOptions(obj);
    }
    return {};
  }

  return {};
};

/**
 * 解析选项为带标签的数组格式（参考WorkbookDetail.vue）
 * @param option 选项数据，可以是字符串或对象
 * @returns 带标签的选项数组
 */
export const parseOptionLines = (option: any): Array<{ label: string; html: string }> => {
  try {
    if (!option) return [];

    // 如果是字符串，先尝试解析 JSON
    let obj = option;
    if (typeof option === "string") {
      try {
        // 双重转义的情况，例如 \\" 需要转换为 \"
        const fixedOption = option.replace(/\\\\(?=["\\])/g, "\\");
        obj = JSON.parse(fixedOption);
      } catch (e) {
        // 如果解析失败，处理更复杂的转义情况
        try {
          // 对整个字符串进行反转义处理后再解析
          const unescapedOption = option.replace(/\\\\(?=["\\])/g, "\\");
          obj = JSON.parse(unescapedOption);
        } catch (e3) {
          // 如果还是失败，检查是否是重复的 {} 格式
          const match = option.match(/^(\{.*?\})(\{.*\})*$/);
          if (match) {
            // 只取第一个 {} 部分
            try {
              obj = JSON.parse(match[1]);
            } catch (e2) {
              // 如果第一个 {} 也解析失败，直接返回原字符串
              return [{ label: "", html: String(option) }];
            }
          } else {
            // 不是重复 {} 格式，直接返回原字符串
            return [{ label: "", html: String(option) }];
          }
        }
      }
    }

    if (obj && typeof obj === "object") {
      // 检查是否为新的数组格式：[{"key":"A","value":"选项内容"}]
      if (Array.isArray(obj)) {
        const validOptions = obj
          .filter(
            item =>
              item &&
              typeof item === "object" &&
              item.key &&
              item.value &&
              typeof item.value === "string" &&
              item.value.trim() !== "",
          )
          .map(item => ({ label: String(item.key), html: String(item.value) }));
        return validOptions;
      }

      // 原有的对象格式：{"A": "选项A内容", "B": "选项B内容"}
      const order = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
      ];
      const validOptions = order
        .filter(k => typeof obj[k] === "string" && obj[k].trim() !== "")
        .map(k => ({ label: k, html: obj[k] }));
      // 如果没有任何有效选项，返回空数组
      return validOptions;
    }
  } catch (e) {
    // 非 JSON：直接作为一行显示
    return [{ label: "", html: String(option) }];
  }
  return [];
};

// ============== 答案格式化方法 ==============

/**
 * 格式化答案显示 - 使用WorkbookDetail.vue的解析逻辑
 * @param raw 原始答案数据
 * @returns 格式化后的答案字符串
 */
export const formatAnswer = (raw: any): string => {
  try {
    if (!raw) return "";
    // 如果 raw 是数组，检查第一个元素是否是字符串
    if (Array.isArray(raw) && raw.length > 0) {
      const firstItem = raw[0];
      if (typeof firstItem === "string") {
        // 检查字符串是否包含 HTML 标签
        if (firstItem.includes("<") && firstItem.includes(">")) {
          return firstItem; // 直接返回 HTML 内容
        }
      }
    }
    // 如果是字符串，先尝试解析 JSON
    let data = raw;
    if (typeof raw === "string") {
      try {
        data = JSON.parse(raw);
      } catch (e) {
        // 处理各种不规则的字符串数组格式
        // 匹配 ["content"] 或 ["content"][][] 或 [""] 等格式
        const match = raw.match(/\["(.*?)"\]/);
        if (match) {
          const content = match[1];
          // 如果内容是空的，返回 ''
          if (!content || content.trim() === "") {
            return "";
          }
          return content; // 返回匹配的内容
        }
        // 如果都不匹配，直接返回原字符串
        return raw;
      }
    }

    if (Array.isArray(data)) {
      const answers = data
        .map((it: any) => {
          // 如果是字符串，直接返回
          if (typeof it === "string") return it;
          // 如果是对象，尝试获取 answer、value 或 text 属性
          return it && (it.answer ?? it.value ?? it.text);
        })
        .filter((v: any) => typeof v === "string" && v.trim() !== "");
      if (answers.length > 0) return answers.join("、");
      // 如果数组为空或所有元素都是空字符串，返回 ''
      return "";
    } else if (typeof data === "object" && data.answer) {
      return String(data.answer);
    }
    // fallback: 原样输出字符串
    return String(raw);
  } catch (e) {
    // 不是 JSON，直接返回
    return String(raw);
  }
};

// ============== 通用工具方法 ==============

/**
 * 安全的HTML内容处理
 * @param html HTML字符串
 * @returns 处理后的HTML字符串
 */
export const safeHtml = (html?: string): string => {
  return html || "";
};
