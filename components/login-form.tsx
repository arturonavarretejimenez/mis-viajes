"use client";

import { useActionState, useId } from "react";
import { login, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const fieldId = useId();

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-2">
        <label
          htmlFor={fieldId}
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Contraseña
        </label>
        <input
          id={fieldId}
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? `${fieldId}-error` : undefined}
          className="h-12 w-full rounded-2xl border border-surface-border bg-blanco px-4 text-base text-foreground outline-none transition-colors focus:border-tierra"
        />
      </div>

      {state.error ? (
        <p
          id={`${fieldId}-error`}
          role="alert"
          className="text-sm font-medium text-red-600"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full bg-tierra px-6 text-base font-semibold text-blanco shadow-sm shadow-piedra/15 transition-transform duration-150 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
      >
        {pending ? "Comprobando…" : "Entrar"}
      </button>
    </form>
  );
}
