'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { checkoutSchema, orderSchema } from '@/contracts/shopwave.schema';
import { apiFetch, ApiClientError, getErrorMessage } from '@/lib/client/api';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

const departments = ['La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Beni', 'Pando'];

export function CheckoutFlow() {
  const router = useRouter();
  const { cart, isLoading, refresh } = useCart();
  const queryClient = useQueryClient();
  const idempotencyKey = useRef<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [department, setDepartment] = useState(departments[0]);
  const [postalCode, setPostalCode] = useState('');
  const [mobile, setMobile] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-brand-soft/60" />;
  if (!cart || !cart.items.length) {
    return <div className="card px-6 py-16 text-center"><h2 className="text-2xl font-semibold">No hay nada que confirmar</h2><Link href="/products" className="button button-primary mt-6">Volver al catálogo</Link></div>;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const parsed = checkoutSchema.safeParse({
      address: { firstName, lastName, streetAddress, city, department, postalCode: postalCode || null, mobile, country: 'BO' },
      saveAddress,
      paymentMethod: 'MOCK',
      cartVersion: cart.version,
      quoteFingerprint: cart.quoteFingerprint,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa la dirección');
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setBusy(true);
    try {
      const order = orderSchema.parse(await apiFetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey.current },
        body: JSON.stringify(parsed.data),
      }));
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      router.push(`/orders/${order.id}`);
      router.refresh();
    } catch (cause) {
      if (cause instanceof ApiClientError && cause.status === 409) {
        const code = cause.problem?.code;
        if (code === 'CART_CHANGED' || code === 'INSUFFICIENT_STOCK' || code === 'PRODUCT_UNAVAILABLE') {
          idempotencyKey.current = null;
          await refresh();
          setError('El carrito cambió mientras confirmabas. Revisa los precios o el stock y vuelve a intentar.');
        } else if (code === 'IDEMPOTENCY_CONFLICT') {
          setError('Este intento ya fue usado con otra dirección. Recarga la página para iniciar una nueva compra.');
        } else if (code === 'EMPTY_CART') {
          setError('Tu carrito está vacío.');
        } else {
          setError(cause.message);
        }
      } else {
        setError(getErrorMessage(cause, 'No se pudo crear el pedido'));
      }
    } finally {
      setBusy(false);
    }
  };

  return <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
    <form onSubmit={submit} className="card p-6 sm:p-8">
      <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-brand"><ArrowLeft size={16} />Volver al carrito</Link>
      <p className="eyebrow mt-8">Checkout</p>
      <h1 className="mt-2 text-3xl font-semibold">¿A dónde enviamos tu pedido?</h1>
      <p className="mt-2 text-sm text-muted">Completa tu dirección. No solicitamos datos de tarjeta.</p>
      {error && <div className="mt-6 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">{error}</div>}
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Nombre<input className="field" value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" required /></label>
        <label className="text-sm font-semibold">Apellido<input className="field" value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" required /></label>
      </div>
      <label className="mt-4 block text-sm font-semibold">Dirección<input className="field" value={streetAddress} onChange={(event) => setStreetAddress(event.target.value)} autoComplete="street-address" required maxLength={200} /></label>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Ciudad<input className="field" value={city} onChange={(event) => setCity(event.target.value)} autoComplete="address-level2" required /></label>
        <label className="text-sm font-semibold">Departamento<select className="field" value={department} onChange={(event) => setDepartment(event.target.value)}>{departments.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Celular<input className="field" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="71234567" autoComplete="tel" required /></label>
        <label className="text-sm font-semibold">Código postal <span className="font-normal text-muted">(opcional)</span><input className="field" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} autoComplete="postal-code" maxLength={20} /></label>
      </div>
      <label className="mt-5 flex items-center gap-3 text-sm text-muted"><input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} className="size-4 accent-brand" />Guardar esta dirección para futuras compras</label>
      <div className="mt-8 rounded-2xl bg-brand-soft p-4"><p className="flex items-center gap-2 text-sm font-semibold text-brand-strong"><ShieldCheck size={17} />Pago simulado</p><p className="mt-2 text-xs leading-5 text-brand-strong/80">Se registrará una operación MOCK/SIMULATED. No hay cobro ni campos para tarjetas reales.</p></div>
      <button type="submit" disabled={busy} className="button button-primary mt-7 w-full">{busy ? <LoaderCircle size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}Confirmar pedido por {formatPrice(cart.totalMinor)}</button>
    </form>
    <aside className="card h-fit p-5 lg:sticky lg:top-24"><h2 className="font-semibold">Tu pedido</h2><div className="mt-5 space-y-3 text-sm">{cart.items.map((item) => <div key={item.id} className="flex justify-between gap-3"><span className="min-w-0 truncate text-muted">{item.quantity} × {item.title}</span><span className="font-semibold">{formatPrice(item.lineTotalMinor)}</span></div>)}<div className="flex justify-between border-t border-line pt-4 text-lg font-bold"><span>Total</span><span>{formatPrice(cart.totalMinor)}</span></div></div></aside>
  </div>;
}
