import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

export const useObserverInView = (
  targetRef: Ref<HTMLElement | null>,
  onChange?: (inView: boolean) => void,
) => {
  const inView = ref(false);

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        inView.value = entry.isIntersecting;
        onChange?.(entry.isIntersecting);
        entry.target.dispatchEvent(
          new CustomEvent("in-viewport", { detail: entry.isIntersecting }),
        );
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px 0px 0px" },
  );

  onMounted(() => {
    observer.observe(targetRef.value as Element);
  });
  
  onBeforeUnmount(() => {
    observer.unobserve(targetRef.value as Element);
  });

  return { inView };
};
