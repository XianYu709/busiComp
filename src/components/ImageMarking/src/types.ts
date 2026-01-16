// types.ts
export interface Annotation {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  id?: string | number;
  type?: string;
  color?: string;
  label?: string;
  active?: boolean;
  extra?: Record<string, any>;
}

export interface AbsoluteCoordinates {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export type ResizeHandleType =
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | "n"
  | "s"
  | "w"
  | "e"
  | "move"
  | "delete";

export interface ResizeHandle {
  id: Exclude<ResizeHandleType, "move" | "delete">;
  x: number;
  y: number;
}
