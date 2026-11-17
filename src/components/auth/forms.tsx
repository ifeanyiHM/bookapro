"use client";

import {
  chooseRoleAction,
  confirmEmailAction,
  forgotPasswordAction,
  loginAction,
  registerAction,
  resendVerificationAction,
  resetPasswordAction,
  saveCustomerProfileAction,
  verifyAdminAction,
  type AuthState,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import {
  Eye,
  EyeSlash,
  SpinnerGap,
  Toolbox,
  UserCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Alert } from "./Alert";

type Action = (prev: AuthState, fd: FormData) => Promise<AuthState>;

function useAuthAction(action: Action, initial: AuthState = {}) {
  return useActionState<AuthState, FormData>(action, initial);
}

function Submit({
  pending,
  idle,
  busy,
}: {
  pending: boolean;
  idle: string;
  busy: string;
}) {
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full shadow-sm transition-all duration-200 hover:shadow-md"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <SpinnerGap aria-hidden="true" className="animate-spin" /> {busy}
        </>
      ) : (
        idle
      )}
    </Button>
  );
}

function Banner({ state }: { state: AuthState }) {
  return (
    <>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.notice && <Alert tone="success">{state.notice}</Alert>}
    </>
  );
}

/** Password input with a show/hide button, so people can check what they typed instead of typing it twice. */
function PasswordField({
  id,
  name,
  label,
  hint,
  error,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  error?: string;
  autoComplete: string;
}) {
  const [shown, setShown] = useState(false);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      {(a) => (
        <div className="relative">
          <input
            {...a}
            name={name}
            type={shown ? "text" : "password"}
            autoComplete={autoComplete}
            required
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            aria-label={shown ? "Hide password" : "Show password"}
            aria-pressed={shown}
            className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-md text-ink-soft hover:bg-surface-2"
          >
            {shown ? (
              <EyeSlash size={22} aria-hidden="true" />
            ) : (
              <Eye size={22} aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </Field>
  );
}

const formClass = "space-y-6 xl1:space-y-7";

export function RegisterForm() {
  const [state, action, pending] = useAuthAction(registerAction);
  const e = state.errors ?? {};
  return (
    <form action={action} className={formClass} noValidate>
      <Banner state={state} />
      <Field id="email" label="Email" error={e.email}>
        {(a) => (
          <input
            {...a}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.email}
            className={inputClass}
          />
        )}
      </Field>
      <PasswordField
        id="password"
        name="password"
        label="Password"
        hint="At least 10 characters."
        error={e.password}
        autoComplete="new-password"
      />
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="company">Leave this field empty</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <Submit
        pending={pending}
        idle="Create account"
        busy="Creating account…"
      />
    </form>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useAuthAction(loginAction);
  return (
    <form action={action} className={formClass}>
      <input type="hidden" name="next" value={next ?? ""} />
      <Banner state={state} />
      <Field id="email" label="Email">
        {(a) => (
          <input
            {...a}
            name="email"
            type="email"
            autoComplete="username"
            required
            defaultValue={state.email}
            className={inputClass}
          />
        )}
      </Field>
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
      />
      <p className="-mt-2 text-sm xl1:text-base">
        <Link
          href="/forgot-password"
          className="font-semibold text-brand underline underline-offset-4"
        >
          Forgot your password?
        </Link>
      </p>
      <Submit pending={pending} idle="Sign in" busy="Signing in…" />
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useAuthAction(forgotPasswordAction);
  return (
    <form action={action} className={formClass} noValidate>
      <Banner state={state} />
      <Field id="email" label="Email" error={state.errors?.email}>
        {(a) => (
          <input
            {...a}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.email}
            className={inputClass}
          />
        )}
      </Field>
      <Submit pending={pending} idle="Email me a reset link" busy="Sending…" />
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useAuthAction(resetPasswordAction);
  return (
    <form action={action} className={formClass} noValidate>
      <input type="hidden" name="token" value={token} />
      <Banner state={state} />
      <PasswordField
        id="password"
        name="password"
        label="New password"
        hint="At least 10 characters."
        error={state.errors?.password}
        autoComplete="new-password"
      />
      <Submit pending={pending} idle="Save new password" busy="Saving…" />
    </form>
  );
}

export function ConfirmEmailForm({ token }: { token: string }) {
  const [state, action, pending] = useAuthAction(confirmEmailAction);
  return (
    <form action={action} className={formClass}>
      <input type="hidden" name="token" value={token} />
      <Banner state={state} />
      <Submit pending={pending} idle="Confirm my email" busy="Confirming…" />
    </form>
  );
}

export function ResendVerificationForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    (prev) => resendVerificationAction(prev),
    {},
  );
  return (
    <form action={action} className={formClass}>
      <Banner state={state} />
      <Button
        type="submit"
        variant="secondary"
        size="lg"
        className="w-full"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Sending…" : "Send me a new link"}
      </Button>
    </form>
  );
}

const roleCard =
  "flex cursor-pointer gap-4 rounded-md border border-line-strong bg-surface p-4 transition has-[:checked]:border-brand has-[:checked]:bg-brand-tint " +
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand xl1:p-5 xl3:p-6";

export function RoleForm({
  current,
}: {
  current: "customer" | "technician" | null;
}) {
  const [state, action, pending] = useAuthAction(chooseRoleAction);
  return (
    <form action={action} className={formClass}>
      <Banner state={state} />
      <fieldset className="space-y-3 xl1:space-y-4">
        <legend className="sr-only">How will you use BookAPro?</legend>
        <label className={roleCard}>
          <input
            type="radio"
            name="role"
            value="customer"
            defaultChecked={current === "customer"}
            required
            className="mt-1.5 size-4 accent-brand"
          />
          <span>
            <span className="flex items-center gap-2 font-semibold xl1:text-lg">
              <UserCircle aria-hidden="true" size={24} /> I need a job done
            </span>
            <span className="mt-1 block text-sm text-ink-soft xl1:text-base">
              Book and pay for AC, electrical, plumbing or cleaning work at your
              home.
            </span>
          </span>
        </label>
        <label className={roleCard}>
          <input
            type="radio"
            name="role"
            value="technician"
            defaultChecked={current === "technician"}
            className="mt-1.5 size-4 accent-brand"
          />
          <span>
            <span className="flex items-center gap-2 font-semibold xl1:text-lg">
              <Toolbox aria-hidden="true" size={24} /> I am a technician or
              cleaner
            </span>
            <span className="mt-1 block text-sm text-ink-soft xl1:text-base">
              Apply to take jobs. You submit your details and ID, and our team
              reviews them before you get any bookings.
            </span>
          </span>
        </label>
        {state.errors?.role && (
          <p className="text-sm font-medium text-danger xl1:text-base">
            {state.errors.role}
          </p>
        )}
      </fieldset>
      <Submit pending={pending} idle="Continue" busy="Saving…" />
    </form>
  );
}

export function CustomerProfileForm({
  defaults,
  editing,
}: {
  defaults?: { name: string; phone: string };
  editing?: boolean;
}) {
  const [state, action, pending] = useAuthAction(saveCustomerProfileAction);
  const e = state.errors ?? {};
  return (
    <form action={action} className={formClass} noValidate>
      <Banner state={state} />
      <Field id="name" label="Full name" error={e.name}>
        {(a) => (
          <input
            {...a}
            name="name"
            autoComplete="name"
            required
            defaultValue={defaults?.name}
            className={inputClass}
          />
        )}
      </Field>
      <Field
        id="phone"
        label="Phone number"
        hint="The technician will call this number on the day."
        error={e.phone}
      >
        {(a) => (
          <input
            {...a}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
            required
            defaultValue={defaults?.phone}
            className={inputClass}
          />
        )}
      </Field>
      <Submit
        pending={pending}
        idle={editing ? "Save changes" : "Save and continue"}
        busy="Saving…"
      />
    </form>
  );
}

export function AdminVerifyForm({ next }: { next?: string }) {
  const [state, action, pending] = useAuthAction(verifyAdminAction);
  return (
    <form action={action} className={formClass}>
      <input type="hidden" name="next" value={next ?? ""} />
      <Banner state={state} />
      <PasswordField
        id="adminPassword"
        name="adminPassword"
        label="Admin password"
        hint="This is separate from your sign-in password."
        autoComplete="off"
      />
      <Submit pending={pending} idle="Open the dashboard" busy="Checking…" />
    </form>
  );
}
