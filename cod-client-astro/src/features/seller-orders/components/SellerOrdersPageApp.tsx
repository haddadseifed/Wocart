import { useEffect, useState } from "react";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { DashboardPage } from "@/components/layout/page";
import { Alert, PageHeader } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useT } from "@/i18n/react";
import { getMySellerOrder, listMySellerOrders, type SellerOrder } from "../api";

function SellerOrdersContent() {
  const t = useT("seller_orders");
  const orderT = useT("orders");
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [selected, setSelected] = useState<SellerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<"forbidden" | "failed" | null>(null);

  useEffect(() => {
    let alive = true;
    listMySellerOrders()
      .then((rows) => { if (alive) setOrders(rows); })
      .catch((cause) => {
        if (!alive) return;
        setError(cause instanceof ApiError && cause.status === 403 ? "forbidden" : "failed");
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  async function openOrder(order: SellerOrder) {
    setSelected(order);
    setDetailLoading(true);
    try {
      setSelected(await getMySellerOrder(order.id));
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 403 ? "forbidden" : "failed");
    } finally {
      setDetailLoading(false);
    }
  }

  const money = (amount: number) => new Intl.NumberFormat(undefined, {
    style: "currency", currency: "DZD", maximumFractionDigits: 0,
  }).format(amount);
  const statusLabel = (status: string) => {
    try { return orderT(`status.${status}`); } catch { return status; }
  };

  return (
    <DashboardPage>
      <PageHeader title={t("title")} />
      {error === "forbidden" && <Alert tone="critical">{t("no_access")}</Alert>}
      {error === "failed" && <Alert tone="critical">{t("load_error")}</Alert>}

      {!error && loading && (
        <div className="space-y-3" aria-label={t("loading")} aria-busy="true">
          {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-muted" />)}
        </div>
      )}

      {!error && !loading && orders.length === 0 && (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      )}

      {!error && orders.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]">
          <section className="space-y-3" aria-label={t("title")}>
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => void openOrder(order)}
                aria-pressed={selected?.id === order.id}
                className={`w-full rounded-xl border p-4 text-start transition-colors hover:bg-muted/50 ${selected?.id === order.id ? "border-primary bg-muted/40" : "border-border bg-card"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold" dir="ltr">{order.orderNumber}</span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{statusLabel(order.status)}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>{order.customerName}</span>
                  <span className="font-semibold tabular-nums">{money(order.codAmount)}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground" dir="ltr">{order.phone}</div>
              </button>
            ))}
          </section>

          <section className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5" aria-live="polite">
            {!selected && <p className="py-8 text-center text-sm text-muted-foreground">{t("select_order")}</p>}
            {selected && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t("order_number")}</p>
                  <h2 className="mt-1 text-lg font-bold" dir="ltr">{selected.orderNumber}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{statusLabel(selected.status)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground">{t("customer")}</p><p className="mt-1 font-medium">{selected.customerName}</p></div>
                  <div><p className="text-muted-foreground">{t("phone")}</p><a className="mt-1 block font-medium underline" href={`tel:${selected.phone}`} dir="ltr">{selected.phone}</a></div>
                  <div className="col-span-2"><p className="text-muted-foreground">{t("address")}</p><p className="mt-1 font-medium">{selected.address || "—"}</p></div>
                </div>
                <div className="border-t border-border pt-3">
                  <h3 className="mb-3 text-sm font-semibold">{t("products")}</h3>
                  {detailLoading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
                  {!detailLoading && (selected.products ?? []).map((line) => (
                    <div key={line.id} className="flex items-start justify-between gap-3 border-b border-border py-2 text-sm last:border-0">
                      <div className="min-w-0">
                        <p className="font-medium">{line.productName}</p>
                        {line.variantLabel && <p className="text-xs text-muted-foreground">{line.variantLabel}</p>}
                        <p className="text-xs text-muted-foreground">{t("quantity")}: {line.quantity}</p>
                      </div>
                      <p className="shrink-0 font-medium tabular-nums">{money(line.lineTotal)}</p>
                    </div>
                  ))}
                </div>
                <dl className="space-y-2 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t("subtotal")}</dt><dd className="font-medium tabular-nums">{money(selected.subtotal)}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t("delivery")}</dt><dd className="font-medium tabular-nums">{money(selected.deliveryFee)}</dd></div>
                  <div className="flex justify-between gap-3 border-t border-border pt-2"><dt className="font-semibold">{t("cod_amount")}</dt><dd className="font-bold tabular-nums">{money(selected.codAmount)}</dd></div>
                </dl>
                {selected.notes && <div className="rounded-lg bg-muted p-3 text-sm"><p className="mb-1 font-semibold">{t("notes")}</p><p>{selected.notes}</p></div>}
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardPage>
  );
}

export default function SellerOrdersPageApp() {
  return <RequireAuth><SellerOrdersContent /></RequireAuth>;
}
