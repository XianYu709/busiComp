import { defineAsyncComponent, h, markRaw } from "vue";
import Block from "../base/Block.vue";
import { ElSkeleton } from "element-plus";

export type compTypes =
  | "EditBlock"
  | "TopInfo"
  | "TopInfoHomework"
  | "ChoiceQuestion"
  | "BriefQuestion"
  | "FillBlankQuestion"
  | "ArticleQuestion"
  | "WithQustionDetail";

const NotSupported = {
  name: "NotSupported",
  props: { type: String },
  template: `<div style="color:#999;">暂不支持该组件：{{ type }}</div>`,
};

const loaders: Record<Exclude<compTypes, "EditBlock">, () => Promise<any>> = {
  TopInfo: () => import("../blockes/TopInfo.vue"),
  TopInfoHomework: () => import("../blockes/TopInfoHomework.vue"),
  ChoiceQuestion: () => import("../blockes/ChoiceQuestion.vue"),
  BriefQuestion: () => import("../blockes/BriefQuestion.vue"),
  FillBlankQuestion: () => import("../blockes/FillBlankQuestion.vue"),
  ArticleQuestion: () => import("../blockes/ArticleQuestion.vue"),
  WithQustionDetail: () => import("../blockes/WithQustionDetail.vue"),
};

const asyncCache = new Map<string, any>();

function asAsyncComp(type: compTypes) {
  if (type === "EditBlock") return Block;

  const cached = asyncCache.get(type);
  if (cached) return cached;
  const loader = (loaders as any)[type] as (() => Promise<any>) | undefined;

  const comp = loader
    ? markRaw(
        defineAsyncComponent({
          loader,
          delay: 80,
          timeout: 20000,
          loadingComponent: h(ElSkeleton, {
            rows: 4,
            class: "px-2 py-3",
            animated: true,
          }),
          onError(error, retry, fail, attempts) {
            if (attempts <= 2) retry();
            else fail();
          },
        }),
      )
    : NotSupported;

  asyncCache.set(type, comp);
  return comp;
}

export const typeCompMaps: Record<compTypes, any> = {
  EditBlock: asAsyncComp("EditBlock"),
  TopInfo: asAsyncComp("TopInfo"),
  TopInfoHomework: asAsyncComp("TopInfoHomework"),
  ChoiceQuestion: asAsyncComp("ChoiceQuestion"),
  BriefQuestion: asAsyncComp("BriefQuestion"),
  FillBlankQuestion: asAsyncComp("FillBlankQuestion"),
  ArticleQuestion: asAsyncComp("ArticleQuestion"),
  WithQustionDetail: asAsyncComp("WithQustionDetail"),
};

export const resolveComp = (type: compTypes) => asAsyncComp(type);
