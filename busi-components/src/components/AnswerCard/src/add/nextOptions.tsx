import { defineComponent, computed, watchEffect, inject } from "vue";
import { ElInput, ElRadioButton, ElRadioGroup, ElSelect } from "element-plus";
import Judument from "../../../JudumentScore/index.vue";

const ProbType = defineComponent({
  name: "ProbType",
  props: {
    modelValue: {
      type: Number,
      default: 1,
    },
    disabledOne: {
      type: Boolean,
      default: false,
    },
    disabledTwo: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit, attrs }) {
    const options = [
      { label: "单题", value: 1, disabled: props.disabledOne },
      { label: "大小问", value: 2, disabled: props.disabledTwo },
    ];
    const handleUpdate = (value: number) => {
      emit("update:modelValue", value);
    };
    return () => {
      return (
        <ElSelect
          {...attrs}
          modelValue={props.modelValue}
          options={options}
          onUpdate:modelValue={handleUpdate}
          style={{
            marginLeft: "10px",
            width: "90px",
          }}
        />
      );
    };
  },
});

type TypeOption = { label: string; value: number; answerType: number };

type Ctx = {
  typeOptions: { value: TypeOption[] };
  findAnswerType: (id: number) => number | "" | null;
  answerTypeOptionsMap: Record<number, Record<string, any>>;
  contentMap: Record<string, any[]>;
  setEveryFieldValue: (list: any[], field: string, value: any) => void;
  genId: () => any;
};

const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export function createNextOptions(ctx: Ctx) {
  const SelectRight = defineComponent({
    name: "SelectRight",
    props: {
      group: { type: Object, required: true },
    },
    setup(props) {
      const group = props.group as any;

      const answerType = computed(() => ctx.findAnswerType(group.questionTypeId));
      const answerTypeOptions = computed(() =>
        answerType.value ? ctx.answerTypeOptionsMap[answerType.value as number] : null,
      );
      const findGroupScoreRule = () => {
        if (group.scoreRule) return group.scoreRule;
        return (group.questionList || []).find((q: any) => q?.scoreRule)?.scoreRule;
      };
      const displayScoreRule = computed(() => findGroupScoreRule());

      const setEveryWidth = (e: any) => {
        ctx.setEveryFieldValue(group.questionList || [], "optionLength", e);
      };

      watchEffect(() => {
        const scoreRule = group.scoreRule;
        const list = group.questionList || [];

        const _ref = group.questionList;
        const _len = list.length;
        void _ref;
        void _len;

        if (!scoreRule) return;

        list.forEach((q: any) => {
          if (!q.scoreRule) {
            q.scoreRule = deepClone(scoreRule);
          }
        });
      });

      return () => {
        const opt = answerTypeOptions.value;
        if (!opt) return null;

        return (
          <>
            每题
            <ElInput
              type='number'
              min={opt.minOptions ?? 1}
              max={opt.maxOptions ?? 7}
              v-model={group.optionLength}
              onChange={setEveryWidth}
              style='width: 70px'
            />
            个选项
            {!opt.single && (
              <Judument
                rules={displayScoreRule.value}
                onUpdate:rules={(r: any) => {
                  const nextRules = deepClone(r);
                  group.scoreRule = nextRules;
                  (group.questionList || []).forEach((q: any) => {
                    q.scoreRule = deepClone(nextRules);
                  });
                }}
              />
            )}
          </>
        );
      };
    },
  });

  const SelectNext = defineComponent({
    name: "SelectNext",
    props: {
      question: { type: Object, required: true },
    },
    setup(props) {
      const q = props.question as any;

      const answerType = computed(() => ctx.findAnswerType(q.questionTypeId));
      const answerTypeOptions = computed(() =>
        answerType.value ? ctx.answerTypeOptionsMap[answerType.value as number] : null,
      );

      const optionList = computed(() => {
        const opt = answerTypeOptions.value;
        if (!opt) return [];
        const letters = ctx.contentMap[opt.contentStyle] || [];
        return letters.slice(0, q.optionLength || 0);
      });

      watchEffect(() => {
        const at = answerType.value;
        const opt = answerTypeOptions.value;
        if (!at || !opt) return;

        if (q.answerType !== at) q.answerType = at;

        const typeName = ctx.typeOptions.value.find(it => it.value === q.questionTypeId)?.label;
        if (q.questionTypeName !== typeName) q.questionTypeName = typeName;

        if (q.contentType !== opt.contentStyle) q.contentType = opt.contentStyle;

        const ol = optionList.value;
        const same =
          Array.isArray(q.optionList) &&
          q.optionList.length === ol.length &&
          q.optionList.every((x: any, i: number) => x === ol[i]);
        if (!same) q.optionList = [...ol];
      });

      const isActive = (key: any) => {
        if (!q.answer) return false;
        if (typeof q.answer === "string") return q.answer === key;
        if (Array.isArray(q.answer)) return q.answer.includes(key);
        return false;
      };

      const handleClick = (key: any) => {
        if (!key) return;
        const opt = answerTypeOptions.value;
        if (!opt) return;

        let current: any[] = [];
        if (Array.isArray(q.answer)) {
          current = q.answer.filter((i: any) => i !== "");
        } else if (typeof q.answer === "string" && q.answer !== "") {
          current = [q.answer];
        }

        if (opt.single) {
          if (current[0] === key) return;
          q.answer = key; // 单选保持字符串
          return;
        }

        const pos = current.indexOf(key);
        if (pos !== -1) current.splice(pos, 1);
        else current.push(key);

        q.answer = current; // 多选保持数组
      };
      const thinMode = inject("thinMode");

      return () => {
        const opt = answerTypeOptions.value;
        if (!opt) return null;
        const list = optionList.value;

        return (
          <div class='flex items-center  justify-end w-full mt-3 mb-5'>
            <div class='flex items-center ml-3'>
              <input
                style='width:  40px; border: 1px solid transparent;text-align: right; color: #60A5FA'
                class='mr-3'
                v-model={q.prefix}
              />
              <div class='flex items-center'>
                {list.map((item: any) => (
                  <div
                    onClick={() => handleClick(item)}
                    class={[
                      "question-chiose-item",
                      opt.single ? "round" : "",
                      isActive(item) ? "active" : "",
                    ]}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div class='flex items-center'>
              <ElInput
                style='width: 60px'
                class='mr-2'
                type='number'
                v-model={q.optionLength}
                min={2}
                max={7}
              />
              个选项
              <ElInput
                type='number'
                style='width: 60px'
                class='ml-3 mr-2'
                v-model={q.score}
                min={2}
                max={7}
              />
              分
              {!opt.single && (
                <Judument
                  rules={q.scoreRule}
                  onUpdate:rules={(r: any) => {
                    q.scoreRule = deepClone(r);
                  }}
                />
              )}
              {!thinMode?.value && <ProbType v-model={q.isOneProb} />}
            </div>
          </div>
        );
      };
    },
  });

  const BlankRight = defineComponent({
    name: "BlankRight",
    props: { group: { type: Object, required: true } },
    setup(props) {
      const group = props.group as any;
      const thinMode = inject("thinMode");
      const setEveryWidth = (e: any) => {
        ctx.setEveryFieldValue(group.questionList || [], "width", e);
        const blocks = (group.questionList || [])
          .map((it: any) => it.block)
          .flat()
          .filter(Boolean);
        ctx.setEveryFieldValue(blocks, "width", e);
      };

      return () => (
        <div
          style={{ display: thinMode?.value ? "none" : "block" }}
          class='flex! items-center h-full'>
          长度
          <ElRadioGroup v-model={group.width} class='ml-2' onChange={setEveryWidth}>
            <ElRadioButton value='20%'>1/5</ElRadioButton>
            <ElRadioButton value='25%'>1/4</ElRadioButton>
            <ElRadioButton value='33.3%'>1/3</ElRadioButton>
            <ElRadioButton value='50%'>1/2</ElRadioButton>
            <ElRadioButton value='100%'>1行</ElRadioButton>
          </ElRadioGroup>
        </div>
      );
    },
  });

  const BlankNext = defineComponent({
    name: "BlankNext",
    props: { question: { type: Object, required: true } },
    setup(props) {
      const p = props.question as any;
      const thinMode = inject("thinMode");

      const createBlock = () => ({
        width: p.width ?? "33.3%",
        score: p.score,
        id: ctx.genId(),
        isOneProb: 1,
      });

      const createChild = (base: any = {}) => {
        const width = base.width ?? p.width ?? "33.3%";
        const score = base.score ?? p.score;
        const questionTypeId = base.questionTypeId ?? p.questionTypeId;
        return {
          id: base.id ?? ctx.genId(),
          prefix: base.prefix ?? "",
          width,
          score,
          questionTypeId,
          isOneProb: 1,
          blockLength: Math.max(
            1,
            Number(base.blockLength) || (Array.isArray(base.block) ? base.block.length : 1),
          ),
          block: Array.isArray(base.block) ? [...base.block] : undefined,
        };
      };

      const ensureBlocks = () => {
        if (!Array.isArray(p.block) || p.block.length === 0) {
          p.block = [createBlock()];
        }
        (p.block as any[]).forEach((it: any, idx: number) => {
          if (!it || typeof it !== "object") {
            p.block[idx] = createBlock();
            return;
          }
          if (!it.id) it.id = ctx.genId();
          if (it.width === undefined || it.width === null || it.width === "") {
            it.width = p.width ?? "33.3%";
          }
          if (it.score === undefined || it.score === null || it.score === "") {
            it.score = p.score;
          }
          it.isOneProb = 1;
        });
        delete p.childs;
        return p.block as any[];
      };

      const normalizeChild = (raw: any) => {
        const child = createChild(raw);
        child.isOneProb = 1;

        const nextLen = Math.max(1, Number(child.blockLength) || 1);
        child.blockLength = nextLen;

        const old = Array.isArray(child.block) ? child.block : [];
        child.block = Array.from({ length: nextLen }, (_, i) => {
          const item = old[i];
          return {
            width: item?.width ?? child.width,
            score: item?.score ?? child.score,
            id: item?.id ?? ctx.genId(),
            questionTypeId: item?.questionTypeId ?? child.questionTypeId,
            isOneProb: 1,
            
          };
        });

        return child;
      };

      const syncChildPrefixes = () => {
        if (!Array.isArray(p.childs)) return;
        p.childs.forEach((it: any, i: number) => {
          const nextPrefix = `${p.prefix}(${i + 1})`;
          if (it.prefix !== nextPrefix) it.prefix = nextPrefix;
        });
      };
      // 兼容老数据，老数据可能直接在block里放了数组
      const ensureChilds = () => {
        if (!Array.isArray(p.childs)) {
          const old = Array.isArray(p.block) ? p.block : [];
          const looksLikeOldChildShape = old.some(
            (it: any) => Array.isArray(it?.block) || it?.blockLength !== undefined,
          );

          if (looksLikeOldChildShape) {
            p.childs = old.map((it: any) => normalizeChild(it));
          } else if (old.length > 0) {
            const first = old[0];
            p.childs = [
              normalizeChild({
                width: first?.width ?? p.width,
                score: first?.score ?? p.score,
                blockLength: old.length,
                block: old.length > 1 ? old : undefined,
              }),
            ];
          } else {
            p.childs = [normalizeChild({})];
          }
        }

        if (!p.childs?.length) {
          p.childs.push(normalizeChild({}));
        }

        p.childs = (p.childs as any[]).map((it: any) => normalizeChild(it));
        syncChildPrefixes();
        delete p.block;
        return p.childs as any[];
      };

      const syncBlockLength = () => {
        if (p.isOneProb === 2) {
          p.blockLength = Array.isArray(p.childs) ? p.childs.length : 1;
          return;
        }
        p.blockLength = Array.isArray(p.block) ? p.block.length : 1;
      };

      const blockLengthChange = (v: number, target?: any) => {
        const nextLen = Math.max(1, Number(v) || 1);

        if (target) {
          const idx = (p.childs || []).indexOf(target);
          const child = normalizeChild(target);
          child.blockLength = nextLen;
          const old = Array.isArray(child.block) ? child.block : [];
          child.block = Array.from({ length: nextLen }, (_, i) => {
            const item = old[i];
            return {
              width: item?.width ?? child.width,
              score: item?.score ?? child.score,
              id: item?.id ?? ctx.genId(),
              isOneProb: 1,
            };
          });
          if (idx > -1) p.childs[idx] = child;
          return;
        }

        if (p.isOneProb !== 1) return;
        const old = ensureBlocks();
        if (nextLen > old.length) {
          p.block = [...old, ...Array.from({ length: nextLen - old.length }, () => createBlock())];
        } else {
          p.block = old.slice(0, nextLen);
        }

        syncBlockLength();
      };

      const onWidthChange = (e: any) => {
        p.width = e;
        if (p.isOneProb === 2) {
          ensureChilds().forEach((c: any) => {
            c.width = e;
            (c.block || []).forEach((b: any) => (b.width = e));
          });
          return;
        }
        ensureBlocks().forEach((b: any) => {
          b.width = e;
        });
      };

      const onScoreChange = (e: any) => {
        p.score = e;
        if (p.isOneProb === 2) {
          ensureChilds().forEach((c: any) => {
            c.score = e;
            (c.block || []).forEach((b: any) => (b.score = e));
          });
          return;
        }
        ensureBlocks().forEach((b: any) => {
          b.score = e;
        });
      };

      const onChildWidthChange = (child: any, e: any) => {
        child.width = e;
        (child.block || []).forEach((b: any) => (b.width = e));
      };

      const onChildScoreChange = (child: any, e: any) => {
        child.score = e;
        (child.block || []).forEach((b: any) => (b.score = e));
      };

      const toSplitMode = () => {
        const old = ensureBlocks();
        const first = old[0];
        const child = normalizeChild({
          width: first?.width ?? p.width,
          score: first?.score ?? p.score,
          blockLength: old.length,
          block: old.length > 1 ? old : undefined,
        });
        p.childs = [child];
        delete p.block;
      };

      const toSingleMode = () => {
        const childs = ensureChilds();
        const first = normalizeChild(childs[0] || {});

        if (Array.isArray(first.block) && first.block.length > 1) {
          p.block = first.block.map((b: any) => ({
            width: b.width ?? first.width,
            score: b.score ?? first.score,
            id: b.id ?? ctx.genId(),
            isOneProb: 1,
          }));
        } else {
          p.block = [
            {
              width: first.width,
              score: first.score,
              id: ctx.genId(),
              isOneProb: 1,
            },
          ];
        }
        p.width = first.width ?? p.width;
        p.score = first.score ?? p.score;
        delete p.childs;
      };

      const onProbChange = (v: number) => {
        if (v === 2) toSplitMode();
        if (v === 1) toSingleMode();
        if (v === 2) syncChildPrefixes();
        syncBlockLength();
      };

      const onSplit = () => {
        if (p.isOneProb !== 2) return;
        ensureChilds();
        p.childs.push(normalizeChild({}));
        syncChildPrefixes();
        syncBlockLength();
      };

      const onDelete = (i: number) => {
        if ((p.childs || []).length > 1) {
          p.childs.splice(i, 1);
          syncChildPrefixes();
          syncBlockLength();
        }
      };

      if (p.isOneProb === 2) ensureChilds();
      else ensureBlocks();

      watchEffect(() => {
        const _blocks = (p.block || []).length;
        const _childs = (p.childs || []).length;
        const _prob = p.isOneProb;
        const _prefix = p.prefix;
        void _blocks;
        void _childs;
        void _prob;
        void _prefix;
        if (p.isOneProb === 2) syncChildPrefixes();
        syncBlockLength();
      });

      return () => (
        <div class='mb-5'>
          <div class='flex items-center  justify-end w-full mt-3 mb-1'>
            <input
              style='width:  40px; border: 1px solid transparent;text-align: right; color: #60A5FA'
              class='mr-3'
              v-model={p.prefix}
            />
            <div class='flex items-center'>
              {!thinMode?.value && p.isOneProb == 1 && (
                <>
                  <ElInput
                    type='number'
                    style='width: 60px'
                    class='ml-3 mr-2'
                    v-model={p.blockLength}
                    onChange={blockLengthChange}
                    min={1}
                    max={5}
                  />
                  <span>空，</span>
                </>
              )}
              {!thinMode?.value && (
                <div class='flex! items-center h-full'>
                  长度
                  <ElRadioGroup v-model={p.width} class='ml-2' onChange={onWidthChange}>
                    <ElRadioButton value='20%'>1/5</ElRadioButton>
                    <ElRadioButton value='25%'>1/4</ElRadioButton>
                    <ElRadioButton value='33.3%'>1/3</ElRadioButton>
                    <ElRadioButton value='50%'>1/2</ElRadioButton>
                    <ElRadioButton value='100%'>1行</ElRadioButton>
                  </ElRadioGroup>
                </div>
              )}
              {!thinMode?.value && (
                <span class='ml-2'>{p.isOneProb === 1 ? "每空：" : "每题："}</span>
              )}
              <ElInput
                type='number'
                style='width: 60px'
                class='mr-2'
                v-model={p.score}
                onChange={onScoreChange}
                min={0}
              />
              分
              {!thinMode?.value && p.isOneProb == 2 && (
                <a class='ml-3 text-blue cursor-pointer' onClick={onSplit}>
                  添加小问
                </a>
              )}
              {!thinMode?.value && (
                <ProbType v-model={p.isOneProb} onUpdate:modelValue={onProbChange} />
              )}
            </div>
          </div>

          {p.isOneProb == 2 &&
            (p.childs || []).length > 1 &&
            (p.childs || []).map((b: any, i: number) => (
              <div class='flex items-center justify-end pl-3 mt-2' key={b.id ?? i}>
                <div class='flex items-center ml-3'>{b.prefix}</div>
                <>
                  <ElInput
                    type='number'
                    style='width: 60px'
                    class='ml-3 mr-2'
                    v-model={b.blockLength}
                    onChange={(v: number) => blockLengthChange(v, b)}
                    min={1}
                    max={5}
                  />
                  <span>空，</span>
                </>
                <span class='ml-2'>每空：</span>
                <ElInput
                  type='number'
                  style='width: 60px'
                  class=' mr-2'
                  v-model={b.score}
                  onChange={(e: any) => onChildScoreChange(b, e)}
                  min={0}
                />
                分
                <div class='flex items-center'>
                  {!thinMode?.value && (
                    <div class='flex items-center h-full ml-2'>
                      长度
                      <ElRadioGroup
                        v-model={b.width}
                        class='ml-2'
                        onChange={(e: any) => onChildWidthChange(b, e)}>
                        <ElRadioButton value='20%'>1/5</ElRadioButton>
                        <ElRadioButton value='25%'>1/4</ElRadioButton>
                        <ElRadioButton value='33.3%'>1/3</ElRadioButton>
                        <ElRadioButton value='50%'>1/2</ElRadioButton>
                        <ElRadioButton value='100%'>1行</ElRadioButton>
                      </ElRadioGroup>
                    </div>
                  )}

                  <a class='ml-3 text-red cursor-pointer' onClick={() => onDelete(i)}>
                    删除
                  </a>
                </div>
              </div>
            ))}
        </div>
      );
    },
  });

  const BriefRight = defineComponent({
    name: "BriefRight",
    props: { group: { type: Object, required: true } },
    setup(props) {
      const group = props.group as any;

      const onLineCountChange = (e: any) => {
        ctx.setEveryFieldValue(group.questionList || [], "lineCount", e);
        const childs = (group.questionList || [])
          .map((it: any) => it.childs ?? it.block)
          .flat()
          .filter(Boolean);
        ctx.setEveryFieldValue(childs, "lineCount", e);
      };
      const thinMode = inject("thinMode");

      return () => (
        <div style={{ visibility: thinMode?.value ? "hidden" : "visible" }}>
          每小题添加长横线：
          <ElInput
            type='number'
            style='width: 60px'
            class='ml-1 mr-2'
            v-model={group.lineCount}
            onChange={onLineCountChange}
            min={0}
          />
          条
        </div>
      );
    },
  });

  const BriefNext = defineComponent({
    name: "BriefNext",
    props: { question: { type: Object, required: true } },
    setup(props) {
      const p = props.question as any;

      const createChild = (base: any = {}) => {
        const width = base.width ?? p.width ?? "33.3%";
        const score = base.score ?? p.score;
        const questionTypeId = base.questionTypeId ?? p.questionTypeId;
        return {
          id: base.id ?? ctx.genId(),
          prefix: base.prefix ?? "",
          width,
          score,
          lineCount: base.lineCount ?? p.lineCount ?? 0,
          questionTypeId,
          isOneProb: 1,
          blockLength: Math.max(
            1,
            Number(base.blockLength) || (Array.isArray(base.block) ? base.block.length : 1),
          ),
          block: Array.isArray(base.block) ? [...base.block] : undefined,
        };
      };

      const ensureChilds = () => {
        if (!Array.isArray(p.childs)) {
          p.childs = Array.isArray(p.block) ? [...p.block] : [];
        }
        if (Array.isArray(p.block)) {
          delete p.block;
        }
        if (p.childs.length === 0) {
          p.childs = [createChild()];
        }
        p.childs = (p.childs as any[]).map((child: any) => {
          if (!child.questionTypeId && p.questionTypeId) {
            child.questionTypeId = p.questionTypeId;
          }
          return child;
        });
        return p.childs as any[];
      };

      const syncPrefixes = () => {
        const childs = ensureChilds();
        childs.forEach((b: any, i: number) => {
          const nextPrefix = childs.length > 1 ? `${p.prefix}（${i + 1}）` : `${p.prefix}.`;
          if (b.prefix !== nextPrefix) b.prefix = nextPrefix;
        });
      };

      watchEffect(() => {
        const _len = (p.childs || p.block || []).length;
        const _prefix = p.prefix;
        void _len;
        void _prefix;
        syncPrefixes();
      });

      const onLineCountChange = (v: number) => {
        p.lineCount = v;
        ensureChilds().forEach((b: any) => {
          b.lineCount = v;
          if (!b.questionTypeId && p.questionTypeId) {
            b.questionTypeId = p.questionTypeId;
          }
        });
      };

      const onScoreChange = (v: number) => {
        p.score = v;
        ensureChilds().forEach((b: any) => {
          b.score = v;
          if (!b.questionTypeId && p.questionTypeId) {
            b.questionTypeId = p.questionTypeId;
          }
        });
      };

      const onProbChange = (v: number) => {
        const childs = ensureChilds();
        childs.forEach((b: any) => (b.isOneProb = 1));

        if (v === 1 && childs.length > 1) {
          p.childs = [childs[0]];
        }
        syncPrefixes();
      };

      const onSplit = () => {
        if (p.isOneProb !== 2) return;
        ensureChilds();
        p.childs.push({
          ...createChild(),
        });
        syncPrefixes();
      };

      const onDelete = (i: number) => {
        if ((p.childs || []).length > 1) {
          p.childs.splice(i, 1);
          syncPrefixes();
        }
      };

      const thinMode = inject("thinMode");

      return () => (
        <div class='mb-5'>
          <div class='flex items-center  justify-end w-full mt-3 mb-1'>
            <input
              style='width:  40px; border: 1px solid transparent;text-align: right; color: #60A5FA'
              class='mr-3'
              v-model={p.prefix}
            />
            <div class='flex items-center'>
              <div
                class='flex items-center h-full'
                style={{ display: thinMode?.value ? "none" : "block" }}>
                {p.isOneProb == 2 ? "每问添加长横线：" : "每题添加长横线："}
                <ElInput
                  type='number'
                  style='width: 60px'
                  class='ml-1 mr-2'
                  v-model={p.lineCount}
                  min={0}
                  onChange={onLineCountChange}
                />
                条
              </div>
              {p.isOneProb == 2 ? (
                <span class='ml-2'>每问：</span>
              ) : (
                <span class='ml-2'>每题：</span>
              )}
              <ElInput
                type='number'
                style='width: 60px'
                class='mr-2'
                v-model={p.score}
                onChange={onScoreChange}
                min={0}
              />
              分
              {!thinMode?.value && p.isOneProb == 2 && (
                <a class='ml-3 text-blue cursor-pointer' onClick={onSplit}>
                  添加小问
                </a>
              )}
              {!thinMode?.value && (
                <ProbType v-model={p.isOneProb} onUpdate:modelValue={onProbChange} />
              )}
            </div>
          </div>

          {p.isOneProb == 2 &&
            (p.childs || []).length > 1 &&
            (p.childs || []).map((b: any, i: number) => (
              <div class='flex items-center  justify-end pl-3 mt-2' key={b.id ?? i}>
                <div class='flex items-center ml-3'>{b.prefix}</div>
                <div class='flex items-center'>
                  <div
                    class='flex items-center'
                    style={{ display: thinMode?.value ? "none" : "block" }}>
                    添加长横线：
                    <ElInput
                      type='number'
                      style='width: 60px'
                      class='ml-1 mr-2'
                      v-model={b.lineCount}
                      min={0}
                    />
                    条
                  </div>
                  <ElInput
                    type='number'
                    style='width: 60px'
                    class='ml-3 mr-2'
                    v-model={b.score}
                    min={0}
                  />
                  分
                  <a class='ml-3 text-red cursor-pointer' onClick={() => onDelete(i)}>
                    删除
                  </a>
                </div>
              </div>
            ))}
        </div>
      );
    },
  });

  return {
    ChoiceQuestion: { Right: SelectRight, Next: SelectNext },
    FillBlankQuestion: { Right: BlankRight, Next: BlankNext },
    BriefQuestion: { Right: BriefRight, Next: BriefNext },
  } as const;
}
