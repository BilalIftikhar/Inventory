"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, CreditCard, Banknote, Smartphone, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CheckoutType } from "@/types";

type PaymentMethod = "cod" | "jazzcash" | "easypaisa" | "bank";

const PAYMENT_METHODS: Array<{ id: PaymentMethod; label: string; icon: React.ReactNode; description: string }> = [
  { id: "cod",       label: "Cash on Delivery", icon: <Banknote className="h-5 w-5" />,                          description: "Pay in cash when your order arrives." },
  { id: "jazzcash",  label: "JazzCash",          icon: <Smartphone className="h-5 w-5 text-red-400" />,          description: "Send payment via JazzCash mobile wallet." },
  { id: "easypaisa", label: "EasyPaisa",         icon: <Smartphone className="h-5 w-5 text-green-400" />,        description: "Send payment via EasyPaisa mobile wallet." },
  { id: "bank",      label: "Bank Transfer",     icon: <Building2 className="h-5 w-5 text-blue-400" />,          description: "Transfer directly to our bank account." },
];

interface PaymentDialogProps {
  type: CheckoutType;
  id: string;
  referenceNumber: string;
  amount: number;
  items?: Array<{ name: string; quantity?: number; price: number }>;
  tax?: number | null;
  shipping?: number | null;
  discount?: number | null;
  disabled?: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function PaymentDialog({
  type,
  id,
  referenceNumber,
  amount,
  items,
  tax,
  shipping,
  discount,
  disabled,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: PaymentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    controlledOnOpenChange ? controlledOnOpenChange(v) : setInternalOpen(v);
    if (!v) { setSelected(null); setDone(false); }
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const endpoint = type === "order" ? "orders" : "invoices";
      await fetch(`/api/${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentMethod: selected }),
      });
      setDone(true);
      toast({ title: "Payment method saved", description: `${PAYMENT_METHODS.find(m => m.id === selected)?.label} selected for ${type} #${referenceNumber}.` });
    } catch {
      toast({ title: "Error", description: "Failed to save payment method.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const triggerEl = trigger || (
    <Button disabled={disabled}>
      <CreditCard className="mr-2 h-4 w-4" />
      Pay {formatCurrency(amount)}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlledOpen && <DialogTrigger asChild>{triggerEl}</DialogTrigger>}

      <DialogContent className="poppins max-h-[90vh] overflow-y-auto border-sky-400/30 shadow-[0_30px_80px_rgba(2,132,199,0.35)] p-6">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Select Payment Method</DialogTitle>
          <DialogDescription className="text-white/70">
            {type === "order" ? "Order" : "Invoice"} #{referenceNumber} —{" "}
            <span className="font-semibold text-white">{formatCurrency(amount)}</span>
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-400" />
            <p className="text-white font-semibold text-lg">Payment Method Saved</p>
            <p className="text-white/60 text-sm">
              {PAYMENT_METHODS.find(m => m.id === selected)?.label} has been recorded for this {type}.
            </p>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {/* Items summary */}
            {items && items.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
                {items.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-white">
                    <span>{item.quantity != null ? `${item.quantity}× ` : ""}{item.name}</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                ))}
                {((tax != null && tax > 0) || (shipping != null && shipping > 0) || (discount != null && discount > 0)) && (
                  <>
                    <Separator />
                    {tax != null && tax > 0 && <div className="flex justify-between text-sm text-white"><span>Tax</span><span>{formatCurrency(tax)}</span></div>}
                    {shipping != null && shipping > 0 && <div className="flex justify-between text-sm text-white"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>}
                    {discount != null && discount > 0 && <div className="flex justify-between text-sm text-white"><span>Discount</span><span className="text-emerald-400">-{formatCurrency(discount)}</span></div>}
                  </>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-white">
                  <span>Total</span><span>{formatCurrency(amount)}</span>
                </div>
              </div>
            )}

            {/* Payment method options */}
            <div className="grid grid-cols-1 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelected(m.id)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    selected === m.id ? "border-sky-400/60 bg-sky-500/20" : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <span className="text-white shrink-0">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{m.label}</p>
                    <p className="text-white/50 text-xs">{m.description}</p>
                  </div>
                  {selected === m.id && <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />}
                </button>
              ))}
            </div>

            <Button
              onClick={handleConfirm}
              disabled={!selected || loading}
              className="w-full h-11 bg-sky-600 hover:bg-sky-500 text-white"
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : `Confirm — ${formatCurrency(amount)}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
