// UI-related types shared across components
export type GridType = "two" | "three" | "horizontal" | "vertical";
export type TabType = "all" | "features" | "blog";
export type SortOrder = "default" | "asc" | "desc";

export interface ColorImage {
  color: string;
  images: string[];
}

export interface Props {
  children?: React.ReactNode;
  className?: string;
}

export interface ArticleProps {
  data: any;
  gridType?: GridType;
}

export interface ControlsProps {
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  gridType: GridType;
  setGridType: (type: GridType) => void;
}

export interface ProductProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
}

export interface AddToCartProps {
  variantId: number;
  quantity?: number;
}

export interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export type UpdateType = "inc" | "dec";

// Toast types
export type ToastType = "success" | "error";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}
