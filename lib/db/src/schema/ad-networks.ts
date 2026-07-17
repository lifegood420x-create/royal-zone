import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const adNetworksTable = pgTable("ad_networks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sdkType: text("sdk_type").notNull().default("monetag"), // 'monetag' | 'adsgram' | 'custom'
  zoneId: text("zone_id").notNull(),
  sdkUrl: text("sdk_url"),           // custom SDK script URL
  callTemplate: text("call_template"), // custom JS call pattern e.g. window.showAd('{{ZONE_ID}}')
  isEnabled: boolean("is_enabled").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdNetworkRow = typeof adNetworksTable.$inferSelect;
