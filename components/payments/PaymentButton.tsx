"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import PaymentDialog from "./PaymentDialog";
import type { CheckoutType } from "@/types";

interface PaymentButtonProps {
  type: CheckoutType;
  id: string;
  amount?: number;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
  referenceNumber?: string;
  items?: Array<{ name: string; quantity?: number; price: number }>;
}

export default function PaymentButton({
  type,
  id,
  amount = 0,
  disabled,
  variant = "default",
  size = "default",
  className,
  referenceNumber = "",
  items,
}: PaymentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={disabled} variant={variant} size={size} className={className}>
        <CreditCard className="mr-2 h-4 w-4" />
        Pay {amount ? formatCurrency(amount) : "Now"}
      </Button>
      <PaymentDialog
        type={type}
        id={id}
        referenceNumber={referenceNumber}
        amount={amount}
        items={items}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
