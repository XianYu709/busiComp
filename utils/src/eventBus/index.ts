import mitt, { type Handler } from "mitt";
import { onMounted, onBeforeUnmount } from "vue";

type Events = {
  [key: string]: any;
};

const emitter = mitt<Events>();

export function useEventBus<K extends keyof Events>(event: K, callback: Handler<Events[K]>) {
  onMounted(() => emitter.on(event, callback));
  onBeforeUnmount(() => emitter.off(event, callback));
}

export function onEvent<K extends keyof Events>(event: K, callback: Handler<Events[K]>) {
  emitter.on(event, callback);
  return () => emitter.off(event, callback); // 方便链式注销
}

export function offEvent<K extends keyof Events>(event: K, callback?: Handler<Events[K]>) {
  emitter.off(event, callback);
}

export function emitEvent<K extends keyof Events>(event: K, payload: Events[K]) {
  emitter.emit(event, payload);
}

export function offAllEvents() {
  emitter.all.clear();
}
