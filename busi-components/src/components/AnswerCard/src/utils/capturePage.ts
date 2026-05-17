import html2canvas from "html2canvas";
import { replaceFormulaNodesWithSvgImages } from "./exportFormulaSvg.ts";
import { canvasToBlob, canvasToFile, canvasToObjectUrl } from "./imageUtils.ts";

export type CaptureOutput = "file" | "blob" | "objectUrl" | "dataUrl";
export type CaptureFormulaPolicy = "rendered" | "raw-text" | "svg-image";
export type CaptureProgress = {
  phase: "capture-page" | "merge-pages";
  pageIndex?: number;
  pageTotal?: number;
};

export type CapturePagesOptions = {
  output?: CaptureOutput;
  formulaPolicy?: CaptureFormulaPolicy;
  scale?: number;
  onProgress?: (progress: CaptureProgress) => void;
};

type CaptureIframeRenderer = {
  iframe: HTMLIFrameElement;
  window: Window & typeof globalThis;
  document: Document;
  root: HTMLDivElement;
};

export type CapturePageCanvasOptions = {
  formulaPolicy?: CaptureFormulaPolicy;
  onProgress?: (progress: CaptureProgress) => void;
  pageIndex?: number;
  pageTotal?: number;
  scale?: number;
};

/** 截图/html2canvas 对原生 MathML 支持不稳定；默认在导出克隆树上按需将公式转为 SVG 图片（不经 Block 预渲染） */
export const DEFAULT_CAPTURE_FORMULA_POLICY: CaptureFormulaPolicy = "svg-image";
export const DEFAULT_CAPTURE_SCALE = 1;

let captureIframeRenderer: CaptureIframeRenderer | null = null;
let captureIframeRendererPromise: Promise<CaptureIframeRenderer> | null = null;

export const waitForImagesLoaded = async (container: ParentNode) => {
  const images = Array.from(container.querySelectorAll("img")) as HTMLImageElement[];
  await Promise.all(
    images.map(image => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>(resolve => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener(
          "error",
          () => {
            console.warn("capturePages: 图片加载失败，继续导出", image.src);
            resolve();
          },
          { once: true },
        );
      });
    }),
  );
};

export const yieldToBrowser = async () => {
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => resolve());
  });
};

const waitForWindowPaint = async (targetWindow: Window & typeof globalThis) => {
  await new Promise<void>(resolve => {
    targetWindow.requestAnimationFrame(() => {
      targetWindow.requestAnimationFrame(() => resolve());
    });
  });
};

const syncElementAttributes = (source: HTMLElement, target: HTMLElement) => {
  Array.from(source.attributes).forEach(attribute => {
    target.setAttribute(attribute.name, attribute.value);
  });
};

const waitForStylesReady = async (doc: Document) => {
  const linkElements = Array.from(
    doc.querySelectorAll('link[rel="stylesheet"]'),
  ) as HTMLLinkElement[];

  await Promise.all(
    linkElements.map(link => {
      if (link.sheet) return Promise.resolve();
      return new Promise<void>(resolve => {
        link.addEventListener("load", () => resolve(), { once: true });
        link.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );

  try {
    await doc.fonts?.ready;
  } catch {}
};

const stripCaptureOnlyNodes = (root: ParentNode) => {
  root
    .querySelectorAll(
      ".__draw_rect, button, .el-button, .tox, .tox-tinymce-aux, .tox-editor-header, mjx-assistive-mml, .MJX_Assistive_MathML, [data-semantic-speech]",
    )
    .forEach(element => {
      element.remove();
    });

  root.querySelectorAll("u").forEach(el => {
    const node = el as HTMLElement;
    node.style.textDecoration = "none";
    node.style.borderBottom = "1px solid currentColor";
    node.style.display = "inline-block";
    node.style.whiteSpace = "pre";
    node.style.minWidth = "1em";
    node.style.lineHeight = "1";
    node.style.verticalAlign = "baseline";
  });
};

const stabilizeClonedImages = (sourceRoot: ParentNode, cloneRoot: ParentNode) => {
  const sourceImages = Array.from(sourceRoot.querySelectorAll("img")) as HTMLImageElement[];
  const cloneImages = Array.from(cloneRoot.querySelectorAll("img")) as HTMLImageElement[];
  const pairCount = Math.min(sourceImages.length, cloneImages.length);

  for (let index = 0; index < pairCount; index++) {
    const sourceImage = sourceImages[index];
    const cloneImage = cloneImages[index];
    const rect = sourceImage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;

    const computedStyle = getComputedStyle(sourceImage);
    cloneImage.style.width = `${rect.width}px`;
    cloneImage.style.height = `${rect.height}px`;
    cloneImage.style.maxWidth = `${rect.width}px`;
    cloneImage.style.maxHeight = `${rect.height}px`;
    cloneImage.style.minWidth = `${rect.width}px`;
    cloneImage.style.minHeight = `${rect.height}px`;
    cloneImage.style.objectFit = computedStyle.objectFit;
    cloneImage.style.objectPosition = computedStyle.objectPosition;
    cloneImage.style.display = computedStyle.display;
    cloneImage.style.verticalAlign = computedStyle.verticalAlign;
    cloneImage.style.cssFloat = computedStyle.cssFloat;
    cloneImage.style.aspectRatio = `${rect.width} / ${rect.height}`;
    cloneImage.width = Math.round(rect.width);
    cloneImage.height = Math.round(rect.height);
  }
};

export const destroyCaptureIframeRenderer = () => {
  captureIframeRenderer?.iframe.remove();
  captureIframeRenderer = null;
  captureIframeRendererPromise = null;
};

const createCaptureIframeRenderer = async (): Promise<CaptureIframeRenderer> => {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  iframe.style.position = "fixed";
  iframe.style.left = "-20000px";
  iframe.style.top = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.border = "0";
  iframe.style.background = "#ffffff";
  document.body.appendChild(iframe);

  const iframeWindow = iframe.contentWindow;
  const iframeDocument = iframe.contentDocument;
  if (!iframeWindow || !iframeDocument) {
    iframe.remove();
    throw new Error("无法创建截图隔离文档");
  }

  iframeDocument.open();
  iframeDocument.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body></body>
</html>`);
  iframeDocument.close();

  syncElementAttributes(document.documentElement, iframeDocument.documentElement);
  syncElementAttributes(document.body, iframeDocument.body);
  iframeDocument.body.style.margin = "0";
  iframeDocument.body.style.background = "#ffffff";

  const base = iframeDocument.createElement("base");
  base.href = document.baseURI;
  iframeDocument.head.appendChild(base);

  document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
    iframeDocument.head.appendChild(node.cloneNode(true));
  });

  const root = iframeDocument.createElement("div");
  root.id = "answer-card-capture-root";
  root.style.display = "inline-block";
  root.style.background = "#ffffff";
  iframeDocument.body.replaceChildren(root);

  await waitForStylesReady(iframeDocument);
  await waitForWindowPaint(iframeWindow as Window & typeof globalThis);

  return {
    iframe,
    window: iframeWindow as Window & typeof globalThis,
    document: iframeDocument,
    root,
  };
};

const ensureCaptureIframeRenderer = async (): Promise<CaptureIframeRenderer> => {
  if (captureIframeRenderer?.iframe?.isConnected) {
    return captureIframeRenderer;
  }

  if (!captureIframeRendererPromise) {
    captureIframeRendererPromise = createCaptureIframeRenderer()
      .then(renderer => {
        captureIframeRenderer = renderer;
        return renderer;
      })
      .catch(error => {
        destroyCaptureIframeRenderer();
        throw error;
      })
      .finally(() => {
        captureIframeRendererPromise = null;
      });
  }

  return await captureIframeRendererPromise;
};

const mountPageInCaptureIframe = async (
  page: HTMLElement,
  options: {
    formulaPolicy?: CaptureFormulaPolicy;
  } = {},
) => {
  const renderer = await ensureCaptureIframeRenderer();
  const pageRect = page.getBoundingClientRect();
  const pageWidth = Math.max(1, Math.ceil(pageRect.width));
  const pageHeight = Math.max(1, Math.ceil(pageRect.height));

  renderer.iframe.style.width = `${pageWidth}px`;
  renderer.iframe.style.height = `${pageHeight}px`;
  renderer.root.style.width = `${pageWidth}px`;
  renderer.root.style.height = `${pageHeight}px`;

  const pageClone = page.cloneNode(true) as HTMLElement;
  stripCaptureOnlyNodes(pageClone);
  stabilizeClonedImages(page, pageClone);
  renderer.root.replaceChildren(pageClone);

  if (options.formulaPolicy === "svg-image") {
    await replaceFormulaNodesWithSvgImages(pageClone);
  }

  await waitForImagesLoaded(renderer.root);
  await waitForStylesReady(renderer.document);
  await waitForWindowPaint(renderer.window);

  return {
    pageClone,
  };
};

export const capturePageCanvas = async (
  page: HTMLElement,
  options: CapturePageCanvasOptions = {},
) => {
  options.onProgress?.({
    phase: "capture-page",
    pageIndex: options.pageIndex ?? 1,
    pageTotal: options.pageTotal ?? 1,
  });

  await waitForImagesLoaded(page);
  const { pageClone } = await mountPageInCaptureIframe(page, {
    formulaPolicy: options.formulaPolicy,
  });
  return await html2canvas(pageClone, {
    scale: options.scale ?? DEFAULT_CAPTURE_SCALE,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: Math.max(pageClone.scrollWidth, pageClone.clientWidth),
    windowHeight: Math.max(pageClone.scrollHeight, pageClone.clientHeight),
  });
};

export const buildCaptureOutput = async (
  canvas: HTMLCanvasElement,
  index: number,
  output: CaptureOutput,
) => {
  const filename = `canvas-image-${index + 1}.png`;
  if (output === "dataUrl") return canvas.toDataURL("image/png");
  if (output === "file") return await canvasToFile(canvas, filename);
  if (output === "blob") return await canvasToBlob(canvas);
  return await canvasToObjectUrl(canvas);
};
