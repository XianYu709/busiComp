import { ref } from "vue";

export function createRefManager<T>() {
  const refs = ref<any[]>([]);

  const setRef = (el: unknown, i: number, j?: number) => {
    if (j === undefined) {
      if (!el) {
        delete refs.value[i];
        return;
      }
      refs.value[i] = el as any;
    } else {
      if (!refs.value[i]) refs.value[i] = [];
      if (!el) {
        delete refs.value[i][j];
        return;
      }
      refs.value[i][j] = el;
    }
  };

  const getRef = (i: number, j?: number): T | undefined => {
    return j === undefined ? (refs.value[i] as any) : refs.value[i]?.[j];
  };

  return { refs, setRef, getRef };
}
