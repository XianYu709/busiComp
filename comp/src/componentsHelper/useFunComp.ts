import { defineComponent, h, ref, type Component } from "vue"
import type { ComponentExposed } from "vue-component-type-helpers"

export const useFunComp = <
  T extends Component,
  P extends Record<string, any> = InstanceType<T>["$props"]
>(
  component: T,
  componentProps?: P
) => {
  const innerRef = ref<InstanceType<T> | null>(null)

  type Exposed = ComponentExposed<T>

  const getCompFun = new Proxy({} as Exposed, {
    get: (_target, key) => innerRef.value?.[key as keyof Exposed],
    has: (_target, key) => key in (innerRef.value || {}),
  })

  const View = defineComponent({
    name: "UseFunCompWrapper",
    inheritAttrs: false,
    setup: (props, { attrs, expose, slots }) => {
      expose(getCompFun)
      return () => h(component as any, { ...componentProps, ...props, ...attrs, ref: innerRef }, slots)
    },
  }) as new () => {
    $props: P
  }

  return [View, getCompFun] as const
}
