// src/app/(main)/dashboard/settings/regenerate-backup-codes-form.tsx
"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { Download, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { regenerateBackupCodesAction } from "@/lib/totp/totp-actions";

interface ActionState {
  success?: boolean;
  error?: string;
  backupCodes?: string[];
}

export function RegenerateBackupCodesForm() {
  const [code, setCode] = useState("");
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [state, action] = useFormState<ActionState, FormData>(
    regenerateBackupCodesAction,
    {}
  );

  useEffect(() => {
    if (state.success && state.backupCodes) {
      setNewCodes(state.backupCodes);
      setCode("");
      toast.success("New backup codes generated. Save them now!");
    }
    if (state.error) {
      toast.error(state.error);
      setCode("");
    }
  }, [state]);

  function handleSubmit(formData: FormData) {
    formData.set("code", code);
    action(formData);
  }

  function handleDownload() {
    const blob = new Blob([newCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (newCodes.length > 0) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs font-semibold text-amber-800 mb-1">
            New backup codes — save these now!
          </p>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {newCodes.map((c, i) => (
              <code
                key={i}
                className="text-xs font-mono bg-white border border-amber-200 rounded px-2 py-1 text-center tracking-wider"
              >
                {c}
              </code>
            ))}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleDownload}
        >
          <Download className="h-3.5 w-3.5 mr-2" />
          Download backup codes
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="regen-code" className="text-xs">
          Confirm with current TOTP code
        </Label>
        <Input
          id="regen-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="font-mono tracking-widest text-center"
        />
      </div>
      <SubmitButton
        disabled={code.length !== 6}
        variant="outline"
        className="w-full"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Generate New Backup Codes
      </SubmitButton>
    </form>
  );
}