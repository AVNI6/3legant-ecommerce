import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export type InvoiceItem = {
  name?: string;
  quantity?: number;
  price?: number;
  color?: string;
};

export type InvoiceAddress = {
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
};

export type InvoiceOrder = {
  id: number;
  customer_name?: string;
  order_date?: string;
  shipping_address?: InvoiceAddress | null;
  items?: InvoiceItem[];
  total_price?: number;
};

type InvoiceDocumentProps = {
  order: InvoiceOrder;
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 11,
    color: "#111827",
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 12,
  },
  brand: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6,
  },
  grid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 18,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    padding: 10,
  },
  cardTitle: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  cardLine: {
    marginBottom: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  colItem: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  summary: {
    alignSelf: "flex-end",
    width: 210,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 4,
    paddingTop: 6,
    fontWeight: 700,
    fontSize: 12,
  },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
    fontSize: 9,
    color: "#6B7280",
  },
});

const currency = (value?: number) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const fullName = (address?: InvoiceAddress | null, fallback?: string) => {
  const first = address?.firstName?.trim() || "";
  const last = address?.lastName?.trim() || "";
  const name = `${first} ${last}`.trim();
  return name || fallback || "Valued Customer";
};

const toDate = (value?: string) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function InvoiceDocument({ order }: InvoiceDocumentProps) {
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const total = Number(order.total_price || subtotal || 0);
  const shipping = order.shipping_address || null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>3legant</Text>
            <Text style={styles.label}>Modern furniture e-commerce</Text>
          </View>
          <View>
            <Text style={styles.title}>Invoice</Text>
            <Text style={styles.label}>Invoice #: INV-{order.id}</Text>
            <Text style={styles.label}>Order #: {order.id}</Text>
            <Text style={styles.label}>Date: {toDate(order.order_date)}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bill To</Text>
            <Text style={styles.cardLine}>{order.customer_name || fullName(shipping)}</Text>
            {shipping?.phone ? <Text style={styles.cardLine}>{shipping.phone}</Text> : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Shipping Address</Text>
            <Text style={styles.cardLine}>{fullName(shipping, "No shipping name")}</Text>
            <Text style={styles.cardLine}>{shipping?.street || "N/A"}</Text>
            <Text style={styles.cardLine}>
              {[shipping?.city, shipping?.state, shipping?.zip].filter(Boolean).join(", ") || "N/A"}
            </Text>
            <Text style={styles.cardLine}>{shipping?.country || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colTotal}>Line Total</Text>
          </View>

          {items.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={styles.colItem}>No items available for this invoice.</Text>
              <Text style={styles.colQty}>-</Text>
              <Text style={styles.colPrice}>-</Text>
              <Text style={styles.colTotal}>-</Text>
            </View>
          ) : (
            items.map((item, idx) => {
              const qty = Number(item.quantity || 0);
              const price = Number(item.price || 0);
              const lineTotal = qty * price;
              const itemName = item.name || `Item ${idx + 1}`;
              const colorSuffix = item.color ? ` (${item.color})` : "";

              return (
                <View key={`${itemName}-${idx}`} style={styles.tableRow}>
                  <Text style={styles.colItem}>{itemName}{colorSuffix}</Text>
                  <Text style={styles.colQty}>{qty}</Text>
                  <Text style={styles.colPrice}>{currency(price)}</Text>
                  <Text style={styles.colTotal}>{currency(lineTotal)}</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>{currency(subtotal)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.grandTotal]}>
            <Text>Total</Text>
            <Text>{currency(total)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your purchase.</Text>
          <Text>This is a computer-generated invoice and does not require a signature.</Text>
        </View>
      </Page>
    </Document>
  );
}
