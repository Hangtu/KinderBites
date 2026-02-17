"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCartStore } from "@/store/cart-store";
import { useDeliveryAddresses } from "@/hooks/use-delivery-addresses";
import { Button } from "@/components/ui/button";
import { getSchools } from "@/actions/schools";
import { createAddress } from "@/actions/addresses";
import { createOrder } from "@/actions/orders";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type School = { id: string; name: string; address: string };

export const dynamic = "force-dynamic";

const STEPS = [
  { id: 1, label: "Dirección", key: "address" },
  { id: 2, label: "Fecha y Hora", key: "datetime" },
  { id: 3, label: "Pago", key: "payment" },
];

const CUTOFF_HOUR = 8; // 8:00 AM

const TIME_SLOTS = [
  { id: "morning", label: "11:30", sublabel: "Mañana" },
  { id: "evening", label: "17:30", sublabel: "Tarde" },
];

const LABEL_MAP: Record<string, string> = {
  school: "Escuela",
  home: "Casa",
  office: "Oficina",
};

interface AddAddressFormProps {
  schools: School[];
  selectedSchoolId: string;
  setSelectedSchoolId: (id: string) => void;
  address: string;
  timeSlot: "morning" | "evening";
  setTimeSlot: (s: "morning" | "evening") => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
}

function AddAddressForm({
  schools,
  selectedSchoolId,
  setSelectedSchoolId,
  address,
  timeSlot,
  setTimeSlot,
  onSubmit,
  loading,
  error,
  onCancel,
}: AddAddressFormProps) {
  return (
    <div className="p-4 rounded-xl border-2 border-primary/30 bg-white dark:bg-surface-dark space-y-4">
      <h4 className="font-bold text-sm">Nueva dirección</h4>
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-500">Escuela</label>
        <select
          value={selectedSchoolId}
          onChange={(e) => setSelectedSchoolId(e.target.value)}
          required
          className="flex h-11 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm"
        >
          <option value="">Selecciona una escuela</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {selectedSchoolId && (
          <p className="text-xs text-slate-500">{address}</p>
        )}
      </div>
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
  const [timeSlot, setTimeSlot] = useState("morning");
  const [isPastCutoff, setIsPastCutoff] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentReady, setPaymentReady] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addAddrSelectedSchoolId, setAddAddrSelectedSchoolId] = useState("");
  const [addAddrSchoolName, setAddAddrSchoolName] = useState("");
  const [addAddrAddress, setAddAddrAddress] = useState("");
  const [addAddrTimeSlot, setAddAddrTimeSlot] = useState<"morning" | "evening">("morning");
  const [addAddrLoading, setAddAddrLoading] = useState(false);
  const [addAddrError, setAddAddrError] = useState<string | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const router = useRouter();

  useEffect(() => {
    getSchools().then((data) => setSchools(data));
    // Cutoff logic: if past 8am, force "Mañana"
    const now = new Date();
    if (now.getHours() >= CUTOFF_HOUR) {
      setIsPastCutoff(true);
      setDeliveryDate("tomorrow");
    }
  }, []);

  const { items, getSubtotal, getTotal, isSubscription, clearCart } = useCartStore();
  const { addresses, isLoading: addressesLoading, refetch: refetchAddresses } = useDeliveryAddresses();

  const handleAddAddress = async () => {
    const addr = addAddrSelectedSchoolId && addAddrAddress.trim() ? addAddrAddress.trim() : "";
    if (!addr) {
      setAddAddrError("Selecciona una escuela");
      return;
    }
    setAddAddrLoading(true);
    setAddAddrError(null);
    const preferredSlot = addAddrTimeSlot === "morning" ? "11:30" : "17:30";

    try {
      const newAddr = await createAddress({
        label: "school",
        address: addr,
        schoolId: addAddrSelectedSchoolId || null,
        schoolName: addAddrSchoolName || null,
        preferredTimeSlot: preferredSlot,
      });

      await refetchAddresses();
      if (newAddr && newAddr.id) {
        setSelectedAddressId(newAddr.id);
      }
      setShowAddAddress(false);
      setAddAddrAddress("");
      setAddAddrSelectedSchoolId("");
      setAddAddrSchoolName("");
    } catch (err: any) {
      setAddAddrError(err.message || "Error al guardar");
    } finally {
      setAddAddrLoading(false);
    }
  };

  const subtotal = getSubtotal();
  const subscriptionDiscount = isSubscription ? subtotal * 0.15 : 0;
  const shipping = 0;
  const total = getTotal() + shipping;

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const hasAddress = selectedAddressId && selectedAddress;

  // Create Payment Intent when entering Step 3
  const initPaymentIntent = useCallback(async () => {
    if (clientSecret) return;
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          metadata: {
            deliveryDate,
            timeSlot,
            addressId: selectedAddressId || "",
          },
        }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setError("Error al iniciar el pago");
      }
    } catch {
      setError("Error al conectar con el procesador de pago");
    }
  }, [total, deliveryDate, timeSlot, selectedAddressId, clientSecret]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setLoading(true);
    setError(null);

    const date = new Date();
    if (deliveryDate === "tomorrow") date.setDate(date.getDate() + 1);
    const deliveryDateStr = date.toISOString().slice(0, 10);

    try {
      const order = await createOrder({
        deliveryAddressId: selectedAddressId!,
        deliveryDate: deliveryDateStr,
        deliveryTimeSlot: timeSlot,
        subtotal,
        shipping,
        subscriptionDiscount,
        totalAmount: total,
        isSubscription,
        items: items.map((item) => ({
          productId: item.product.id,
          childId: item.child.id,
          quantity: item.quantity,
          unitPrice: Number(item.product.price),
          specificNotes: item.specificNotes
        }))
      });

      clearCart();
      
      fetch("/api/send-order-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      }).catch(() => {});
      
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (err: any) {
      setError(err.message || "Error al crear el pedido");
      setLoading(false);
    }
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
                    schools={schools}
                    selectedSchoolId={addAddrSelectedSchoolId}
                    setSelectedSchoolId={(id) => {
                      setAddAddrSelectedSchoolId(id);
                      const s = schools.find((x) => x.id === id);
                      if (s) {
                        setAddAddrSchoolName(s.name);
                        setAddAddrAddress(s.address);
                      }
                    }}
                    address={addAddrAddress}
                    timeSlot={addAddrTimeSlot}
                    setTimeSlot={setAddAddrTimeSlot}
                    onSubmit={handleAddAddress}
                    loading={addAddrLoading}
                    error={addAddrError}
                    onCancel={() => {
                      setShowAddAddress(false);
                      setAddAddrSelectedSchoolId("");
                      setAddAddrSchoolName("");
                      setAddAddrAddress("");
                    }}
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
                      {addr.schoolName && (
                        <p className="text-xs text-slate-500">{addr.schoolName}</p>
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
                    schools={schools}
                    selectedSchoolId={addAddrSelectedSchoolId}
                    setSelectedSchoolId={(id) => {
                      setAddAddrSelectedSchoolId(id);
                      const s = schools.find((x) => x.id === id);
                      if (s) {
                        setAddAddrSchoolName(s.name);
                        setAddAddrAddress(s.address);
                      }
                    }}
                    address={addAddrAddress}
                    timeSlot={addAddrTimeSlot}
                    setTimeSlot={setAddAddrTimeSlot}
                    onSubmit={handleAddAddress}
                    loading={addAddrLoading}
                    error={addAddrError}
                    onCancel={() => {
                      setShowAddAddress(false);
                      setAddAddrSelectedSchoolId("");
                      setAddAddrSchoolName("");
                      setAddAddrAddress("");
                    }}
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

            {isPastCutoff && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400" style={{ fontSize: 20 }}>schedule</span>
                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                  Pedidos después de las 8:00 AM se entregan mañana.
                </p>
              </div>
            )}

            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit mb-4">
              <button
                type="button"
                onClick={() => !isPastCutoff && setDeliveryDate("today")}
                disabled={isPastCutoff}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  isPastCutoff
                    ? "text-slate-400 dark:text-slate-600 cursor-not-allowed line-through"
                    : deliveryDate === "today"
                      ? "bg-white dark:bg-surface-dark shadow-sm"
                      : "text-slate-500"
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setDeliveryDate("tomorrow")}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  deliveryDate === "tomorrow" ? "bg-white dark:bg-surface-dark shadow-sm" : "text-slate-500"
                }`}
              >
                Mañana
              </button>
            </div>

            <h4 className="text-sm font-bold mb-3 text-text-sec-light dark:text-text-sec-dark">Horario de entrega</h4>
            <div className="grid grid-cols-2 gap-3">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setTimeSlot(slot.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    timeSlot === slot.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <span className="text-lg font-bold">{slot.label}</span>
                  <span className="text-xs font-medium opacity-75">{slot.sublabel}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h3 className="text-xl font-bold mb-3">Pago con tarjeta</h3>
            {clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#22c55e",
                      borderRadius: "12px",
                      fontFamily: "system-ui, sans-serif",
                    },
                  },
                  locale: "es",
                }}
              >
                <StripeCheckoutForm
                  onSuccess={handlePaymentSuccess}
                  onError={(msg) => setError(msg)}
                  loading={loading}
                  setLoading={setLoading}
                  total={total}
                />
              </Elements>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
                <span className="ml-3 text-sm text-slate-500">Conectando con el procesador de pago...</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-4 text-slate-400">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <p className="text-xs font-medium">Pago seguro procesado por Stripe. Tus datos están encriptados.</p>
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
                onClick={() => {
                  const nextStep = Math.min(3, step + 1);
                  setStep(nextStep);
                  if (nextStep === 3) initPaymentIntent();
                }}
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
                <p className="text-xl font-bold">${total.toFixed(2)} MXN</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Stripe checkout sub-component (must be inside Elements provider)
function StripeCheckoutForm({
  onSuccess,
  onError,
  loading,
  setLoading,
  total,
}: {
  onSuccess: (paymentIntentId: string) => void;
  onError: (msg: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  total: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Error al procesar el pago");
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      onError("El pago no se completó. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: "tabs",
          }}
        />
      </div>
      <Button
        type="submit"
        disabled={!stripe || !ready || loading}
        className="w-full mt-4 py-3"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full" />
            Procesando pago...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>lock</span>
            Pagar ${total.toFixed(2)} MXN
          </span>
        )}
      </Button>
    </form>
  );
}
