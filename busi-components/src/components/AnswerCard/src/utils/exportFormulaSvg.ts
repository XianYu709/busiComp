type FormulaMetrics = {
  em: number;
  ex: number;
  containerWidth: number;
};

type FormulaTask = {
  cacheKey: string;
  source: string;
  displayMode: boolean;
  metrics: FormulaMetrics;
  plainText: string;
};

type FormulaTarget = {
  element: Element;
  task: FormulaTask;
  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;
  verticalAlign: string | null;
};

type FormulaRenderAsset = {
  dataUrl: string;
  verticalAlign: string | null;
};

type FormulaConverterRuntime = {
  iframe: HTMLIFrameElement;
  window: Window & typeof globalThis & { MathJax?: any };
  document: Document;
};

const mathJaxScriptSrc = new URL("../base/libs/tex-mml-svg.js", import.meta.url).href;
const formulaSelector = ["[data-original-mathml]", "math", "mjx-container"].join(",");

const svgDataUrlCache = new Map<string, Promise<FormulaRenderAsset | null>>();
const formulaMetricsCache = new Map<string, FormulaMetrics>();

let formulaConverterRuntime: FormulaConverterRuntime | null = null;
let formulaConverterRuntimePromise: Promise<FormulaConverterRuntime> | null = null;

const normalizeFormulaText = (value = "") => value.replace(/\s+/g, " ").trim();

const getElementWindow = (element: Element) => element.ownerDocument.defaultView || window;

const parseSvgLengthToPx = (value: string | null | undefined, metrics: FormulaMetrics) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.endsWith("%")) return null;

  const numberValue = Number.parseFloat(trimmed);
  if (!Number.isFinite(numberValue)) return null;

  if (trimmed.endsWith("ex")) return numberValue * metrics.ex;
  if (trimmed.endsWith("em")) return numberValue * metrics.em;
  if (trimmed.endsWith("pt")) return (numberValue * 96) / 72;
  if (trimmed.endsWith("pc")) return (numberValue * 12 * 96) / 72;
  if (trimmed.endsWith("mm")) return (numberValue * 96) / 25.4;
  if (trimmed.endsWith("cm")) return (numberValue * 96) / 2.54;
  if (trimmed.endsWith("in")) return numberValue * 96;

  return numberValue;
};

const parseVerticalAlignToCss = (
  value: string | null | undefined,
  metrics: FormulaMetrics,
): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const pxValue = parseSvgLengthToPx(trimmed, metrics);
  if (pxValue == null) return trimmed;
  return `${pxValue}px`;
};

const extractTextFromMarkup = (markup = "") => {
  if (!markup) return "";
  const holder = document.createElement("div");
  holder.innerHTML = markup;
  return normalizeFormulaText(holder.textContent || "");
};

const normalizeMathmlSource = (source = "") => {
  const normalized = source.trim().replace(/>\s+</g, "><");
  if (!normalized) return "";
  if (
    /^<math\b/i.test(normalized) &&
    !/\sxmlns=(['"])http:\/\/www\.w3\.org\/1998\/Math\/MathML\1/i.test(normalized)
  ) {
    return normalized.replace(/^<math\b/i, '<math xmlns="http://www.w3.org/1998/Math/MathML"');
  }
  return normalized;
};

const createPlainTextFallback = (
  doc: Document,
  element: Element,
  text: string,
  displayMode: boolean,
) => {
  const replacement = doc.createElement(
    displayMode || element.tagName.toLowerCase() === "math" ? "div" : "span",
  );
  replacement.className = "export-plain-formula";
  replacement.textContent = text || " ";
  replacement.style.whiteSpace = "pre-wrap";
  replacement.style.wordBreak = "break-word";
  replacement.style.overflowWrap = "anywhere";
  replacement.style.lineHeight = "inherit";
  replacement.style.fontFamily = "inherit";
  replacement.style.display = replacement.tagName.toLowerCase() === "div" ? "block" : "inline";
  return replacement;
};

const resolveFormulaRoot = (element: Element) => {
  return (
    element.closest("[data-original-mathml]") ||
    (/^(?:math|mjx-container)$/i.test(element.tagName) ? element : null)
  );
};

const resolveFormulaSource = (element: Element) => {
  const originalMathml = element.getAttribute("data-original-mathml");
  if (originalMathml) {
    return {
      source: normalizeMathmlSource(originalMathml),
      displayMode:
        element.getAttribute("display") === "block" ||
        element.querySelector("math")?.getAttribute("display") === "block",
      plainText: extractTextFromMarkup(originalMathml),
    };
  }

  if (element.tagName.toLowerCase() === "math") {
    return {
      source: normalizeMathmlSource(element.outerHTML),
      displayMode: element.getAttribute("display") === "block",
      plainText: normalizeFormulaText(element.textContent || ""),
    };
  }

  const nestedMath = element.querySelector("math");
  if (nestedMath) {
    return {
      source: normalizeMathmlSource(nestedMath.outerHTML),
      displayMode: nestedMath.getAttribute("display") === "block",
      plainText: normalizeFormulaText(nestedMath.textContent || ""),
    };
  }

  return null;
};

const measureEx = (
  referenceElement: Element,
  fontSize: number,
  fontFamily: string,
  fontWeight: string,
) => {
  const doc = referenceElement.ownerDocument;
  const host = doc.body || doc.documentElement;
  const probe = doc.createElement("span");
  probe.textContent = "x";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.fontSize = `${fontSize}px`;
  probe.style.fontFamily = fontFamily;
  probe.style.fontWeight = fontWeight;
  probe.style.lineHeight = "1";
  probe.style.height = "1ex";
  probe.style.padding = "0";
  probe.style.margin = "0";
  probe.style.border = "0";
  probe.style.display = "inline-block";
  host.appendChild(probe);
  const ex = probe.getBoundingClientRect().height;
  probe.remove();
  return ex || fontSize * 0.43;
};

const resolveFormulaMetrics = (element: Element, displayMode: boolean) => {
  const referenceElement =
    element.closest(".inline-display, .inline-richtext") || element.parentElement || element;
  const computedStyle = getElementWindow(referenceElement).getComputedStyle(referenceElement);
  const fontSize = parseFloat(computedStyle.fontSize || "16") || 16;
  const fontFamily = computedStyle.fontFamily || "serif";
  const fontWeight = computedStyle.fontWeight || "400";
  const containerElement =
    (displayMode ? element.parentElement : referenceElement.parentElement) || referenceElement;
  const containerWidth = Math.max(
    1,
    Math.ceil(
      containerElement.getBoundingClientRect().width ||
        referenceElement.getBoundingClientRect().width ||
        800,
    ),
  );

  const metricsKey = [
    displayMode ? "block" : "inline",
    fontSize,
    fontFamily,
    fontWeight,
    containerWidth,
  ].join("|");

  let metrics = formulaMetricsCache.get(metricsKey);
  if (!metrics) {
    metrics = {
      em: fontSize,
      ex: measureEx(referenceElement, fontSize, fontFamily, fontWeight),
      containerWidth,
    };
    formulaMetricsCache.set(metricsKey, metrics);
  }

  return {
    metrics,
    metricsKey,
  };
};

const extractVerticalAlign = (element: Element) => {
  const nestedSvg =
    element.tagName.toLowerCase() === "svg" ? element : element.querySelector("svg");
  const svgStyle = nestedSvg?.getAttribute("style") || "";
  const match = /vertical-align:\s*([^;]+)/i.exec(svgStyle);
  if (match?.[1]) return match[1].trim();

  const computed = getElementWindow(element).getComputedStyle(element).verticalAlign;
  if (computed && computed !== "baseline" && computed !== "0px") {
    return computed;
  }

  return null;
};

const createFormulaTask = (element: Element): FormulaTarget | null => {
  const descriptor = resolveFormulaSource(element);
  const displayMode =
    descriptor?.displayMode ||
    element.getAttribute("display") === "block" ||
    element.getAttribute("display") === "true";
  const { metrics, metricsKey } = resolveFormulaMetrics(element, displayMode);
  const cacheKey = [
    "mathml",
    displayMode ? "block" : "inline",
    metricsKey,
    descriptor?.source || element.outerHTML,
  ].join("::");
  const computedStyle = getElementWindow(element).getComputedStyle(element);

  return {
    element,
    task: {
      cacheKey,
      source: descriptor?.source || "",
      displayMode,
      metrics,
      plainText: descriptor?.plainText || normalizeFormulaText(element.textContent || ""),
    },
    marginTop: computedStyle.marginTop,
    marginRight: computedStyle.marginRight,
    marginBottom: computedStyle.marginBottom,
    marginLeft: computedStyle.marginLeft,
    verticalAlign: extractVerticalAlign(element),
  };
};

const buildSvgAssetFromExistingSvg = (element: Element, metrics: FormulaMetrics) => {
  const svgElement =
    element.tagName.toLowerCase() === "svg" ? element : element.querySelector("svg");
  if (!svgElement) return null;

  const svgAsset = serializeSvgElement(svgElement, metrics);
  return {
    dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgAsset.svgMarkup)}`,
    verticalAlign: svgAsset.verticalAlign,
  } satisfies FormulaRenderAsset;
};

const collectFormulaTargets = (root: ParentNode) => {
  const seen = new Set<Element>();
  const targets: FormulaTarget[] = [];

  root.querySelectorAll(formulaSelector).forEach(candidate => {
    const formulaRoot = resolveFormulaRoot(candidate);
    if (!formulaRoot || seen.has(formulaRoot)) return;
    seen.add(formulaRoot);

    const target = createFormulaTask(formulaRoot);
    if (target) {
      targets.push(target);
    }
  });

  return targets;
};

const createFormulaConverterRuntime = async (): Promise<FormulaConverterRuntime> => {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  iframe.style.position = "fixed";
  iframe.style.left = "-24000px";
  iframe.style.top = "0";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const runtimeWindow = iframe.contentWindow as FormulaConverterRuntime["window"] | null;
  const runtimeDocument = iframe.contentDocument;
  if (!runtimeWindow || !runtimeDocument) {
    iframe.remove();
    throw new Error("无法创建公式转换文档");
  }

  runtimeDocument.open();
  runtimeDocument.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body></body>
</html>`);
  runtimeDocument.close();

  runtimeWindow.MathJax = {
    svg: {
      fontCache: "none",
      displayAlign: "center",
      displayIndent: "0",
    },
    startup: {
      typeset: false,
    },
  };

  await new Promise<void>((resolve, reject) => {
    const script = runtimeDocument.createElement("script");
    script.src = mathJaxScriptSrc;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = error => reject(error);
    runtimeDocument.head.appendChild(script);
  });

  if (runtimeWindow.MathJax?.startup?.promise) {
    await runtimeWindow.MathJax.startup.promise;
  }

  return {
    iframe,
    window: runtimeWindow,
    document: runtimeDocument,
  };
};

const ensureFormulaConverterRuntime = async () => {
  if (formulaConverterRuntime?.iframe?.isConnected) {
    return formulaConverterRuntime;
  }

  if (!formulaConverterRuntimePromise) {
    formulaConverterRuntimePromise = createFormulaConverterRuntime()
      .then(runtime => {
        formulaConverterRuntime = runtime;
        return runtime;
      })
      .catch(error => {
        destroyFormulaSvgExportSupport();
        throw error;
      })
      .finally(() => {
        formulaConverterRuntimePromise = null;
      });
  }

  return await formulaConverterRuntimePromise;
};

const serializeSvgElement = (svgElement: Element, metrics: FormulaMetrics) => {
  const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
  const widthPx = parseSvgLengthToPx(svgClone.getAttribute("width"), metrics);
  const heightPx = parseSvgLengthToPx(svgClone.getAttribute("height"), metrics);
  const styleAttribute = svgClone.getAttribute("style") || "";
  const styleVerticalAlign = /vertical-align:\s*([^;]+)/i.exec(styleAttribute)?.[1]?.trim() || null;

  if (widthPx != null) {
    svgClone.setAttribute("width", `${widthPx}px`);
  }
  if (heightPx != null) {
    svgClone.setAttribute("height", `${heightPx}px`);
  }
  if (!svgClone.getAttribute("xmlns")) {
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  if (!svgClone.getAttribute("xmlns:xlink")) {
    svgClone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  }
  svgClone.setAttribute("role", "img");
  return {
    svgMarkup: new XMLSerializer().serializeToString(svgClone),
    verticalAlign: parseVerticalAlignToCss(styleVerticalAlign, metrics),
  };
};

const convertFormulaToSvgMarkup = async (task: FormulaTask) => {
  if (!task.source) return null;

  const runtime = await ensureFormulaConverterRuntime();
  const mathJax = runtime.window.MathJax;
  if (!mathJax) return null;

  const options = {
    display: task.displayMode,
    em: task.metrics.em,
    ex: task.metrics.ex,
    containerWidth: task.metrics.containerWidth,
  };

  const container = await (mathJax.mathml2svgPromise
    ? mathJax.mathml2svgPromise(task.source, options)
    : Promise.resolve(mathJax.mathml2svg?.(task.source, options)));

  const svgElement =
    container?.querySelector?.("svg") ||
    (container?.tagName?.toLowerCase?.() === "svg" ? container : null);
  if (!svgElement) return null;

  return serializeSvgElement(svgElement, task.metrics);
};

const getFormulaSvgDataUrl = (task: FormulaTask) => {
  let cached = svgDataUrlCache.get(task.cacheKey);
  if (!cached) {
    cached = convertFormulaToSvgMarkup(task)
      .then(svgAsset => {
        if (!svgAsset) return null;
        return {
          dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgAsset.svgMarkup)}`,
          verticalAlign: svgAsset.verticalAlign,
        };
      })
      .catch(error => {
        console.warn("答题卡导出 MathML 转 SVG 失败:", error);
        return null;
      });
    svgDataUrlCache.set(task.cacheKey, cached);
  }
  return cached;
};

const replaceFormulaWithSvgImage = (target: FormulaTarget, asset: FormulaRenderAsset | null) => {
  const doc = target.element.ownerDocument;
  if (!asset) {
    target.element.replaceWith(
      createPlainTextFallback(doc, target.element, target.task.plainText, target.task.displayMode),
    );
    return;
  }

  const image = doc.createElement("img");
  image.className = "answer-card-export-formula-image";
  image.src = asset.dataUrl;
  image.alt = target.task.plainText || "formula";
  image.decoding = "async";
  image.loading = "eager";
  image.style.background = "transparent";
  image.style.maxWidth = "100%";
  image.style.lineHeight = "inherit";
  image.style.marginTop = target.marginTop;
  image.style.marginRight = target.marginRight;
  image.style.marginBottom = target.marginBottom;
  image.style.marginLeft = target.marginLeft;

  if (target.task.displayMode) {
    image.style.display = "block";
    image.style.marginLeft = "auto";
    image.style.marginRight = "auto";
  } else {
    image.style.display = "inline-block";
    if (asset.verticalAlign || target.verticalAlign) {
      image.style.verticalAlign = asset.verticalAlign || target.verticalAlign || "";
    }
  }

  target.element.replaceWith(image);
};

const resolveFormulaRenderAsset = async (target: FormulaTarget) => {
  const existingSvgAsset = buildSvgAssetFromExistingSvg(target.element, target.task.metrics);
  if (existingSvgAsset) return existingSvgAsset;
  return await getFormulaSvgDataUrl(target.task);
};

export const scheduleFormulaSvgCacheWarmup = (_roots: ParentNode[]) => {};

export const replaceFormulaNodesWithSvgImages = async (root: ParentNode) => {
  const targets = collectFormulaTargets(root);
  if (!targets.length) return;

  await Promise.all(
    targets.map(async target => {
      const asset = await resolveFormulaRenderAsset(target);
      replaceFormulaWithSvgImage(target, asset);
    }),
  );
};

export const destroyFormulaSvgExportSupport = () => {
  formulaConverterRuntime?.iframe.remove();
  formulaConverterRuntime = null;
  formulaConverterRuntimePromise = null;
  svgDataUrlCache.clear();
  formulaMetricsCache.clear();
};
