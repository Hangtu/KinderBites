"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useDeliveryAddresses } from "@/hooks/use-delivery-addresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
  { id: 1, label: "Dirección", key: "address" },
  { id: 2, label: "Fecha y Hora", key: "datetime" },
  { id: 3, label: "Pago", key: "payment" },
];

const TIME_SLOTS = [
  { id: "09-11", label: "09:00 - 11:00", sublabel: "Mañana" },
  { id: "11-13", label: "11:00 - 13:00", sublabel: "Almuerzo" },
  { id: "14-16", label: "14:00 - 16:00", sublabel: "Tarde" },
  { id: "16-18", label: "16:00 - 18:00", sublabel: "Final del día" },
];

const LABEL_MAP: Record<string, string> = {
  school: "Escuela",
  home: "Casa",
  office: "Oficina",
};

const ADDRESS_LABELS = [
  { id: "school" as const, name: "Escuela", icon: "school" },
  { id: "home" as const, name: "Casa", icon: "home" },
  { id: "office" as const, name: "Oficina", icon: "work" },
];

function AddAddressForm({
  label,
  setLabel,
  school,
  setSchool,
  address,
  setAddress,
  timeSlot,
  setTimeSlot,
  onSubmit,
  loading,
  error,
  onCancel,
  LABEL_MAP: lm,
}: {
  label: "school" | "home" | "office";
  setLabel: (l: "school" | "home" | "office") => void;
  school: string;
  setSchool: (s: string) => void;
  address: string;
  setAddress: (s: string) => void;
  timeSlot: "morning" | "evening";
  setTimeSlot: (s: "morning" | "evening") => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  LABEL_MAP: Record<string, string>;
}) {
  return (
    <div className="p-4 rounded-xl border-2 border-primary/30 bg-white dark:bg-surface-dark space-y-4">
      <h4 className="font-bold text-sm">Nueva dirección</h4>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {ADDRESS_LABELS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLabel(l.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium shrink-0 ${
              label === l.id ? "bg-primary text-black" : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            {lm[l.id]}
          </button>
        ))}
      </div>
      {label === "school" && (
        <Input
          placeholder="Nombre de escuela/guardería"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="h-11"
        />
      )}
      <Input
        placeholder="Dirección de envío"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        className="h-11"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTimeSlot("morning")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            timeSlot === "morning" ? "bg-primary/20 border-2 border-primary" : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          Mañana (11:30)
        </button>
        <button
          type="button"
          onClick={() => setTimeSlot("evening")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            timeSlot === "evening" ? "bg-primary/20 border-2 border-primary" : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          Tarde (17:30)
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={onSubmit} disabled={loading} className="flex-1">
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState<"today" | "tomorrow">("today");
  const [timeSlot, setTimeSlot] = useState("09-11");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addAddrLabel, setAddAddrLabel] = useState<"school" | "home" | "office">("school");
  const [addAddrSchool, setAddAddrSchool] = useState("");
  const [addAddrAddress, setAddAddrAddress] = useState("");
  const [addAddrTimeSlot, setAddAddrTimeSlot] = useState<"morning" | "evening">("morning");
  const [addAddrLoading, setAddAddrLoading] = useState(false);
  const [addAddrError, setAddAddrError] = useState<string | null>(null);
  const router = useRouter();
  const { items, getSubtotal, getTotal, isSubscription, clearCart } = useCartStore();
  const { addresses, isLoading: addressesLoading, refetch: refetchAddresses } = useDeliveryAddresses();
  const supabase = createClient();

  const handleAddAddress = async () => {
    if (!addAddrAddress.trim()) {
      setAddAddrError("Ingresa la dirección");
      return;
    }
    setAddAddrLoading(true);
    setAddAddrError(null);
    const preferredSlot = addAddrTimeSlot === "morning" ? "11:30" : "17:30";
    // Nota: aquí podríamos soportar direcciones solo en memoria,
    // pero por ahora mantener la creación de direcciones solo para usuarios logueados.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      setAddAddrLoading(false);
      return;
    }

    const { data: newAddr, error: insertError } = await supabase
      .from("delivery_addresses")
      .insert({
        profile_id: user.id,
        label: addAddrLabel,
        address: addAddrAddress.trim(),
        school_name: addAddrLabel === "school" ? addAddrSchool || null : null,
        preferred_time_slot: preferredSlot,
        is_default: false,
      })
      .select("id")
      .single();
    setAddAddrLoading(false);
    if (insertError) {
      setAddAddrError(insertError.message || "Error al guardar");
      return;
    }
    await refetchAddresses();
    setSelectedAddressId(newAddr.id);
    setShowAddAddress(false);
    setAddAddrAddress("");
    setAddAddrSchool("");
  };

  const subtotal = getSubtotal();
  const subscriptionDiscount = isSubscription ? subtotal * 0.15 : 0;
  const shipping = 0;
  const total = getTotal() + shipping;

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const hasAddress = selectedAddressId && selectedAddress;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      setLoading(false);
      return;
    }

    if (!hasAddress) {
      setError("Selecciona una dirección de entrega");
      setLoading(false);
      return;
    }

    const date = new Date();
    if (deliveryDate === "tomorrow") date.setDate(date.getDate() + 1);
    const deliveryDateStr = date.toISOString().slice(0, 10);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        parent_id: user.id,
        delivery_address_id: selectedAddressId,
        delivery_date: deliveryDateStr,
        delivery_time_slot: timeSlot,
        subtotal,
        shipping,
        subscription_discount: subscriptionDiscount,
        total_amount: total,
        is_subscription: isSubscription,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError) {
      setError(orderError.message || "Error al crear el pedido");
      setLoading(false);
      return;
    }

    for (const item of items) {
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: item.product.id,
        child_id: item.child.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        specific_notes: item.specific_notes,
      });
      if (itemError) {
        setError("Error al guardar ítems del pedido");
        setLoading(false);
        return;
      }
    }

    clearCart();
    fetch("/api/send-order-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    }).catch(() => {});
    router.push(`/checkout/success?orderId=${order.id}`);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <header className="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
        <Link href="/cart">
          <button className="flex size-10 shrink-0 items-center justify-center rounded-full">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
        </Link>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          Finalizar Pedido
        </h2>
      </header>

      <div className="flex flex-col gap-2 px-6 pt-6 pb-2">
        <div className="flex gap-6 justify-between items-end">
          <p className="text-base font-bold">Paso {step} de 3</p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {STEPS[step - 1].label}
          </p>
        </div>
        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 space-y-8">
        {step === 1 && (
          <section>
            <h3 className="text-xl font-bold mb-3">¿Dónde entregar?</h3>
            {addressesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : addresses.length === 0 && !showAddAddress ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">
                    No tienes direcciones guardadas. Agrega una para continuar.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setShowAddAddress(true)}>
                    Agregar dirección
                  </Button>
                </div>
                {showAddAddress && (
                  <AddAddressForm
                    label={addAddrLabel}
                    setLabel={setAddAddrLabel}
                    school={addAddrSchool}
                    setSchool={setAddAddrSchool}
                    address={addAddrAddress}
                    setAddress={setAddAddrAddress}
                    timeSlot={addAddrTimeSlot}
                    setTimeSlot={setAddAddrTimeSlot}
                    onSubmit={handleAddAddress}
                    loading={addAddrLoading}
                    error={addAddrError}
                    onCancel={() => setShowAddAddress(false)}
                    LABEL_MAP={LABEL_MAP}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`w-full flex gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedAddressId === addr.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark"
                    }`}
                  >
                    <div className="flex items-center justify-center rounded-lg bg-primary/20 size-12 shrink-0">
                      <span className="material-symbols-outlined text-primary">location_on</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{LABEL_MAP[addr.label] || addr.label}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {addr.address}
                      </p>
                      {addr.school_name && (
                        <p className="text-xs text-slate-500">{addr.school_name}</p>
                      )}
                    </div>
                    <div
                      className={`size-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        selectedAddressId === addr.id ? "border-primary bg-primary" : "border-gray-300"
                      }`}
                    >
                      {selectedAddressId === addr.id && (
                        <span className="material-symbols-outlined text-white text-xs">check</span>
                      )}
                    </div>
                  </button>
                ))}
                {showAddAddress ? (
                  <AddAddressForm
                    label={addAddrLabel}
                    setLabel={setAddAddrLabel}
                    school={addAddrSchool}
                    setSchool={setAddAddrSchool}
                    address={addAddrAddress}
                    setAddress={setAddAddrAddress}
                    timeSlot={addAddrTimeSlot}
                    setTimeSlot={setAddAddrTimeSlot}
                    onSubmit={handleAddAddress}
                    loading={addAddrLoading}
                    error={addAddrError}
                    onCancel={() => setShowAddAddress(false)}
                    LABEL_MAP={LABEL_MAP}
                  />
                ) : (
                  <Button variant="outline" onClick={() => setShowAddAddress(true)} className="w-full">
                    Agregar nueva dirección
                  </Button>
                )}
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section>
            <h3 className="text-xl font-bold mb-3">¿Cuándo entregar?</h3>
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit mb-4">
              <button
                type="button"
                onClick={() => setDeliveryDate("today")}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold ${
                  deliveryDate === "today" ? "bg-white dark:bg-surface-dark shadow-sm" : "text-slate-500"
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setDeliveryDate("tomorrow")}
                className={`px-4 py-1.5 text-sm font-medium ${
                  deliveryDate === "tomorrow" ? "bg-white dark:bg-surface-dark shadow-sm" : "text-slate-500"
                }`}
              >
                Mañana
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setTimeSlot(slot.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    timeSlot === slot.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <span className="text-sm font-bold">{slot.label}</span>
                  <span className="text-xs opacity-75">{slot.sublabel}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h3 className="text-xl font-bold mb-3">¿Cómo pagar?</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl border-2 border-primary bg-white dark:bg-surface-dark cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="material-symbols-outlined">credit_card</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Pago en efectivo / transferencia</p>
                    <p className="text-xs text-slate-500">Pagar al recibir (próximamente Stripe)</p>
                  </div>
                </div>
                <div className="size-5 rounded-full border-[6px] border-primary bg-white" />
                <input type="radio" name="payment" defaultChecked className="sr-only" />
              </label>
            </div>
            <div className="flex items-center gap-2 mt-3 text-slate-400">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <p className="text-xs font-medium">Tus datos están protegidos y encriptados.</p>
            </div>
          </section>
        )}

        <section className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-slate-500 text-sm">Subtotal</p>
            <p className="font-medium text-sm">${subtotal.toFixed(2)}</p>
          </div>
          {subscriptionDiscount > 0 && (
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 text-sm">Descuento suscripción (15%)</p>
              <p className="text-primary font-medium text-sm">-${subscriptionDiscount.toFixed(2)}</p>
            </div>
          )}
          <div className="flex justify-between items-center mb-2">
            <p className="text-slate-500 text-sm">Envío</p>
            <p className="text-primary font-medium text-sm">Gratis</p>
          </div>
        </section>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 p-4 pb-safe-lg z-40">
        <div className="max-w-md mx-auto flex items-center gap-4">
          {step < 3 ? (
            <>
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="shrink-0"
              >
                Atrás
              </Button>
              <Button
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                className="flex-1"
                disabled={step === 1 && !hasAddress}
              >
                Siguiente
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-col">
                <p className="text-xs text-slate-500 font-medium">Total a pagar</p>
                <p className="text-xl font-bold">${total.toFixed(2)}</p>
              </div>
              <Button
                onClick={handleConfirm}
                disabled={loading || !hasAddress}
                className="flex-1"
              >
                {loading ? "Procesando..." : (
                  <>
                    Confirmar Pedido
                    <span className="material-symbols-outlined ml-2">check</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
