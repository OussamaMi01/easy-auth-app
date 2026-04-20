// src/app/(main)/dashboard/settings/disable-totp-form.tsx
"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { disableTotpAction } from "@/lib/totp/totp-actions";

interface ActionState { success?: boolean; error?: string; }

export function DisableTotpForm() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [code, setCode] = useState("");
  const [state, action] = useFormState<ActionState, FormData>(disableTotpAction, {});

  useEffect(() => {
    if (state.success) {
      toast.success("TOTP disabled. You will be redirected to set it up again.");
      updateSession().then(() => {
        router.push("/setup-totp");
        router.refresh();
      });
    }
    if (state.error) {
      toast.error(state.error);
      setCode("");
    }
  }, [state, router, updateSession]);

  function handleSubmit(formData: FormData) {
    formData.set("code", code);
    action(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="disable-code" className="text-xs text-red-700 dark:text-red-400">
          Current TOTP code
        </Label>
        <Input
          id="disable-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="font-mono tracking-widest text-center border-red-300 dark:border-red-700 focus:ring-red-500"
        />
      </div>
      <SubmitButton
        disabled={code.length !== 6}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        Disable Two-Factor Authentication
      </SubmitButton>
    </form>
  );
}