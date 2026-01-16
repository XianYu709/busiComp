import { ref } from "vue";

export function createRefManager<T>() {
  const refs = ref<T[][]>([]);

  const setRef = (el?: T | any, i: number, j?: number) => {
    if (!el) return;
    if (j === undefined) {
      refs.value[i] = el as any;
    } else {
      if (!refs.value[i]) refs.value[i] = [];
      refs.value[i][j] = el;
    }
  };

  const getRef = (i: number, j?: number): T | undefined => {
    return j === undefined ? (refs.value[i] as any) : refs.value[i]?.[j];
  };

  return { refs, setRef, getRef };
}
