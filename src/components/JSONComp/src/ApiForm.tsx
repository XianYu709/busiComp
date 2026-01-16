import { useFunComp } from "@sjjb/utils";
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElSwitch,
  type FormItemRule,
  type FormProps,
} from "element-plus";
import { defineComponent, type Component } from "vue";

type schema = {
  field: string;
  label: string;
  component: string | Component;
  rules?: FormItemRule[];
  componentProps?: any;
  itemProps?: any;
  required?: boolean;
};
type props = {
  schema?: schema[];
  rules?: FormItemRule[];
  modelValue?: {
    [key: string]: any;
  };
  formProps?: Partial<FormProps>;
};

export const Item = defineComponent<schema>({
  props: {
    component: {
      type: [String, Object],
      required: true,
    },
  },
  setup(props, { slots, attrs }) {
    const isComp = typeof props.component === "object";
    const compMap: Record<string, any> = {
      input: ElInput,
      select: ElSelect,
      switch: ElSwitch,
      /* .........自定义组件等 */
    };
    const Comp = isComp ? props.component : compMap[props.component as string];
    return () => h(Comp, { ...attrs }, slots);
  },
});

export const Form = defineComponent<props>({
  props: {
    schema: { type: Object },
    modelValue: { type: Object, required: true },
  },
  setup(props, { expose }) {
    const elRef = ref();

    const elFuns = new Proxy(
      {},
      {
        get: (_target, key) => elRef.value?.[key],
        has: (_target, key) => key in (elRef.value || {}),
      },
    );
    expose(elFuns);

    const getSchema = computed(() => props?.schema ?? []);

    const getFormItemProps = (item: schema): any => {
      return {
        ...item,
        prop: item.field,
        rules: item.rules,
        required: item?.required ?? false,
      };
    };

    const getItemProps = (item: schema): any => {
      const compProps = { ...(item.componentProps || {}) };
      if (compProps.options && isRef(compProps.options)) {
        compProps.options = unref(compProps.options);
      }
      return {
        component: item.component,
        ...compProps,
        modelValue: props?.modelValue?.[item.field],
        "onUpdate:modelValue": (val: any) => {
          props!.modelValue![item.field] = val;
        },
      };
    };
    const formProps = computed(() => {
      return props.formProps;
    });

    return () => (
      <ElForm
        ref={elRef}
        class='w-full'
        rules={props?.rules as any}
        model={props.modelValue}
        {...formProps.value}>
        {getSchema.value.map((item: schema) => {
          return (
            <ElFormItem {...getFormItemProps(item)}>
              <Item {...getItemProps(item)} />
            </ElFormItem>
          );
        })}
      </ElForm>
    );
  },
});

export const useForm = (props: props) => {
  return useFunComp<typeof ElForm, props>(Form as any, props);
};
