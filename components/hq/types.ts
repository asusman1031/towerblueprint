import type { Blueprint } from "@/lib/data";

export type HqBlueprint = Blueprint & {
  print_key: string | null;
  preorders: number;
  views: number;
  buy_clicks: number;
  sales: number;
  originals: { id: number; mime: string; filename: string }[];
};

export type HqRequest = {
  id: number;
  email: string;
  builder_name: string;
  tower_name: string;
  description: string;
  status: "new" | "making" | "done" | "declined";
  blueprint_id: string | null;
  created_at: string;
  has_photo: boolean;
};

export type HqSale = {
  id: number;
  amount_cents: number;
  note: string;
  created_at: string;
  blueprint: string | null;
};

export type HqDashboard = {
  today: Partial<Record<"visit" | "view_blueprint" | "click_buy", number>>;
  total: Partial<Record<"visit" | "view_blueprint" | "click_buy", number>>;
  daily_visits: { day: string; visits: number }[];
  club: number;
  preorders: number;
  sales_count: number;
  sales_cents: number;
  recent_sales: HqSale[];
  blueprints: HqBlueprint[];
  requests: HqRequest[];
  settings: Partial<Record<"architect_note" | "custom_price_cents" | "custom_open", string>>;
};
