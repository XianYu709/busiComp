import { defineComponent, computed, watchEffect } from "vue";
import { ElInput, ElRadioButton, ElRadioGroup } from "element-plus";
import Judument from "../../../JudumentScore/index.vue";

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
          q.scoreRule = deepClone(scoreRule);
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
                rules={group.scoreRule}
                onUpdate:rules={(r: any) => {
                  group.scoreRule = deepClone(r);
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

      return () => {
        const opt = answerTypeOptions.value;
        if (!opt) return null;

        const list = optionList.value;

        return (
          <div class='flex items-center  justify-end w-full mt-3 mb-5'>
            <div class='flex items-center ml-3'>
              {q.prefix}.
              <div class='ml-3 flex items-center'>
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

      const setEveryWidth = (e: any) => {
        ctx.setEveryFieldValue(group.questionList || [], "width", e);
        const blocks = (group.questionList || [])
          .map((it: any) => it.block)
          .flat()
          .filter(Boolean);
        ctx.setEveryFieldValue(blocks, "width", e);
      };

      return () => (
        <>
          长度
          <ElRadioGroup v-model={group.width} class='ml-2' onChange={setEveryWidth}>
            <ElRadioButton value='20%'>1/5</ElRadioButton>
            <ElRadioButton value='25%'>1/4</ElRadioButton>
            <ElRadioButton value='33.3%'>1/3</ElRadioButton>
            <ElRadioButton value='50%'>1/2</ElRadioButton>
            <ElRadioButton value='100%'>1行</ElRadioButton>
          </ElRadioGroup>
        </>
      );
    },
  });

  const BlankNext = defineComponent({
    name: "BlankNext",
    props: { question: { type: Object, required: true } },
    setup(props) {
      const p = props.question as any;

      const blockLengthChange = (v: number) => {
        const old = p.block || [];
        const nextLen = Number(v) || 0;

        if (nextLen > old.length) {
          p.block = [
            ...old,
            ...Array.from({ length: nextLen - old.length }, () => ({
              width: p.width ?? "33.3%",
              score: p.score,
              id: ctx.genId(),
            })),
          ];
        } else {
          p.block = old.slice(0, nextLen);
        }
      };

      const onWidthChange = (e: any) => {
        (p.block || []).forEach((b: any) => (b.width = e));
      };

      const onScoreChange = (e: any) => {
        (p.block || []).forEach((b: any) => (b.score = e));
      };

      return () => (
        <div class='flex items-center  justify-end w-full mt-3 mb-5'>
          <div class='flex items-center ml-3'>{p.prefix}.</div>
          <div class='flex items-center'>
            <ElInput
              type='number'
              style='width: 60px'
              class='ml-3 mr-2'
              v-model={p.blockLength}
              onChange={blockLengthChange}
              min={1}
              max={5}
            />
            空， 长度
            <ElRadioGroup v-model={p.width} class='ml-2' onChange={onWidthChange}>
              <ElRadioButton value='20%'>1/5</ElRadioButton>
              <ElRadioButton value='25%'>1/4</ElRadioButton>
              <ElRadioButton value='33.3%'>1/3</ElRadioButton>
              <ElRadioButton value='50%'>1/2</ElRadioButton>
              <ElRadioButton value='100%'>1行</ElRadioButton>
            </ElRadioGroup>
            <ElInput
              type='number'
              style='width: 60px'
              class='ml-3 mr-2'
              v-model={p.score}
              onChange={onScoreChange}
              min={0}
            />
            分
          </div>
        </div>
      );
    },
  });

  const EssayRight = defineComponent({
    name: "EssayRight",
    props: { group: { type: Object, required: true } },
    setup(props) {
      const group = props.group as any;

      const onLineCountChange = (e: any) => {
        ctx.setEveryFieldValue(group.questionList || [], "lineCount", e);
        const blocks = (group.questionList || [])
          .map((it: any) => it.block)
          .flat()
          .filter(Boolean);
        ctx.setEveryFieldValue(blocks, "lineCount", e);
      };

      return () => (
        <>
          每题添加长横线：
          <ElInput
            type='number'
            style='width: 60px'
            class='ml-1 mr-2'
            v-model={group.lineCount}
            onChange={onLineCountChange}
            min={0}
          />
          条
        </>
      );
    },
  });

  const EssayNext = defineComponent({
    name: "EssayNext",
    props: { question: { type: Object, required: true } },
    setup(props) {
      const p = props.question as any;

      const syncPrefixes = () => {
        const blocks = p.block || [];
        blocks.forEach((b: any, i: number) => {
          const nextPrefix = blocks.length > 1 ? `${p.prefix}（${i + 1}）` : `${p.prefix}.`;
          if (b.prefix !== nextPrefix) b.prefix = nextPrefix;
        });
      };

      watchEffect(() => {
        const _len = (p.block || []).length;
        const _prefix = p.prefix;
        void _len;
        void _prefix;
        syncPrefixes();
      });

      const onLineCountChange = (v: number) => {
        p.lineCount = v;
        (p.block || []).forEach((b: any) => (b.lineCount = v));
      };

      const onScoreChange = (v: number) => {
        p.score = v;
        (p.block || []).forEach((b: any) => (b.score = v));
      };

      const onSplit = () => {
        p.block.push({
          prefix: "",
          score: p.score,
          lineCount: p.lineCount,
          width: p.width,
          id: ctx.genId(),
        });
        syncPrefixes();
      };

      const onDelete = (i: number) => {
        if ((p.block || []).length > 1) {
          p.block.splice(i, 1);
          syncPrefixes();
        }
      };

      return () => (
        <div class='mb-5'>
          <div class='flex items-center  justify-end w-full mt-3 mb-1'>
            <div class='flex items-center mr-3'>{p.prefix}.</div>
            <div class='flex items-center'>
              添加长横线：
              <ElInput
                type='number'
                style='width: 60px'
                class='ml-1 mr-2'
                v-model={p.lineCount}
                min={0}
                onChange={onLineCountChange}
              />
              条
              <ElInput
                type='number'
                style='width: 60px'
                class='ml-3 mr-2'
                v-model={p.score}
                onChange={onScoreChange}
                min={0}
              />
              分
              <a class='ml-3 text-blue cursor-pointer' onClick={onSplit}>
                拆分小题
              </a>
            </div>
          </div>

          {(p.block || []).length > 1 &&
            (p.block || []).map((b: any, i: number) => (
              <div class='flex items-center  justify-end pl-3 mt-2' key={b.id ?? i}>
                <div class='flex items-center ml-3'>{b.prefix}</div>
                <div class='flex items-center'>
                  添加长横线：
                  <ElInput
                    type='number'
                    style='width: 60px'
                    class='ml-1 mr-2'
                    v-model={b.lineCount}
                    min={0}
                  />
                  条
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
    BriefQuestion: { Right: EssayRight, Next: EssayNext },
  } as const;
}
