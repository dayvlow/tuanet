"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";

import { maskEmailAddress } from "@/lib/backend";
import { Modal } from "@/components/account/Modal";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { PartnerApplicationPanel } from "@/components/account/PartnerApplicationPanel";
import { TurnstileCaptcha } from "@/components/security/TurnstileCaptcha";
import type { PortalSiteKind } from "@/lib/portal-host";
import { getPortalLoginRedirectHref, normalizePortalParam } from "@/lib/session-portal";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

interface AuthState {
    email: string;
    password: string;
    error: string | null;
    captchaToken: string | null;
}

interface AuthSuccessPayload {
    home_path?: string | null;
    portal?: string | null;
    requires_2fa?: boolean;
    code_already_sent?: boolean;
    challenge_token?: string;
    masked_email?: string | null;
    expires_at?: string | null;
    detail?: string;
}

type QuickLoginKind = "admin" | "client" | "partner";

interface Login2FAState {
    token: string | null;
    code: string;
    maskedEmail: string | null;
    expiresAt: string | null;
}

interface PasswordResetState {
    email: string;
    code: string;
    newPassword: string;
    repeatPassword: string;
    token: string | null;
    maskedEmail: string | null;
    expiresAt: string | null;
    error: string | null;
}

type PasswordResetStep = "request" | "verify" | "set_password";

const initialState: AuthState = {
    email: "",
    password: "",
    error: null,
    captchaToken: null,
};

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY?.trim() ?? "";

const initialLogin2FAState: Login2FAState = {
    token: null,
    code: "",
    maskedEmail: null,
    expiresAt: null,
};

const initialPasswordResetState: PasswordResetState = {
    email: "",
    code: "",
    newPassword: "",
    repeatPassword: "",
    token: null,
    maskedEmail: null,
    expiresAt: null,
    error: null,
};

function translateAuthError(detail: string): string {
    switch (detail) {
        case "Email not found":
            return "Аккаунт с таким email не найден.";
        case "Invalid password":
            return "Пароль указан неверно.";
        case "Email already registered":
            return "Аккаунт с таким email уже существует.";
        case "email_reuse_blocked":
            return "Этот email временно нельзя использовать для новой регистрации после удаления аккаунта.";
        case "email_not_found":
            return "Аккаунт с таким email не найден.";
        case "Referral code not found":
            return "Реферальный код не найден.";
        case "Partner code not found":
            return "Партнерский код не найден.";
        case "email_code_recently_sent":
            return "Код уже отправлен недавно. Попробуй еще раз примерно через минуту.";
        case "email_code_invalid":
            return "Код неверный. Проверь письмо и попробуй еще раз.";
        case "email_code_expired":
            return "Срок действия кода истек. Запроси новый.";
        case "email_code_not_found":
        case "email_code_consumed":
            return "Этот код уже неактуален. Запроси новый.";
        case "email_code_temporarily_blocked":
            return "Слишком много отправок кода за короткое время. Попробуй позже.";
        case "email_delivery_failed":
            return "Не получилось отправить письмо с кодом. Попробуй еще раз чуть позже.";
        case "captcha_required":
            return "Сначала подтверди капчу.";
        case "password_too_short":
            return "Пароль должен быть не короче 6 символов.";
        case "password_must_change":
            return "Новый пароль должен отличаться от текущего.";
        default:
            return detail;
    }
}

async function submitAuth(
    mode: AuthMode,
    email: string,
    password: string,
    captchaToken: string | null,
    referralCode?: string | null,
    partnerCode?: string | null,
): Promise<AuthSuccessPayload> {
    const response = await fetch(`/api/auth/email/${mode}`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
            captcha_token: captchaToken,
            referral_code: mode === "register" ? referralCode : undefined,
            partner_code: mode === "register" ? partnerCode : undefined,
        }),
    });

    const payload = (await response.json().catch(() => ({}))) as AuthSuccessPayload & {
        detail?: string;
    };

    if (!response.ok) {
        throw new Error(payload.detail ?? "Не удалось выполнить запрос");
    }

    return payload;
}

async function submitQuickLogin(kind: QuickLoginKind): Promise<AuthSuccessPayload> {
    const response = await fetch("/api/auth/dev/quick-login", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({ kind }),
    });

    const payload = (await response.json().catch(() => ({}))) as AuthSuccessPayload & {
        detail?: string;
    };

    if (!response.ok) {
        throw new Error(payload.detail ?? "Не удалось выполнить быстрый вход");
    }

    return payload;
}

function resolveAuthDestination(payload: AuthSuccessPayload): string {
    const portal = normalizePortalParam(payload.portal);
    if (portal) {
        return getPortalLoginRedirectHref(portal);
    }

    if (payload.home_path && payload.home_path.startsWith("/account")) {
        return payload.home_path;
    }

    return getPortalLoginRedirectHref("customer");
}

interface AuthPanelsProps {
    referralCode?: string | null;
    partnerCode?: string | null;
    portalSite?: PortalSiteKind;
    initialMode?: AuthMode;
}

export function AuthPanels({
    referralCode = null,
    partnerCode = null,
    portalSite = "main",
    initialMode,
}: AuthPanelsProps) {
    const [loginState, setLoginState] = useState<AuthState>(initialState);
    const [registerState, setRegisterState] = useState<AuthState>(initialState);
    const [login2FAState, setLogin2FAState] = useState<Login2FAState>(initialLogin2FAState);
    const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
    const [passwordResetState, setPasswordResetState] = useState<PasswordResetState>(initialPasswordResetState);
    const [passwordResetStep, setPasswordResetStep] = useState<PasswordResetStep>("request");
    const [loginNotice, setLoginNotice] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const showUserRegistration = portalSite === "main" || portalSite === "local";
    const showPartnerApplication = portalSite === "partner";
    const showQuickPreviewButtons = portalSite === "local";
    const shellMode = Boolean(initialMode);
    const showLoginCard = initialMode !== "register";
    const showRegisterCard = showUserRegistration && initialMode !== "login";
    const showPartnerApplicationCard = showPartnerApplication && initialMode !== "login";
    const [loginCaptchaResetKey, setLoginCaptchaResetKey] = useState(0);
    const [registerCaptchaResetKey, setRegisterCaptchaResetKey] = useState(0);

    function resetLoginCaptcha() {
        setLoginCaptchaResetKey((current) => current + 1);
        setLoginState((current) => ({
            ...current,
            captchaToken: null,
        }));
    }

    function resetRegisterCaptcha() {
        setRegisterCaptchaResetKey((current) => current + 1);
        setRegisterState((current) => ({
            ...current,
            captchaToken: null,
        }));
    }

    function handleSubmit(mode: AuthMode, event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const state = mode === "login" ? loginState : registerState;
        const setState = mode === "login" ? setLoginState : setRegisterState;
        if (TURNSTILE_SITE_KEY && !state.captchaToken) {
            setState((current) => ({
                ...current,
                error: "Дождись завершения проверки капчи.",
            }));
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    setLoginNotice(null);
                    const payload = await submitAuth(mode, state.email, state.password, state.captchaToken, referralCode, partnerCode);
                    if (
                        mode === "login"
                        && payload.requires_2fa
                        && typeof payload.challenge_token === "string"
                        && payload.challenge_token
                    ) {
                        setLoginNotice(payload.code_already_sent ? "Код уже у вас на почте." : null);
                        setLogin2FAState({
                            token: payload.challenge_token,
                            code: "",
                            maskedEmail: payload.masked_email ?? maskEmailAddress(state.email),
                            expiresAt: payload.expires_at ?? null,
                        });
                        setLoginState((current) => ({
                            ...current,
                            error: null,
                        }));
                        resetLoginCaptcha();
                        return;
                    }

                    const destination = resolveAuthDestination(payload);
                    // A hard navigation avoids a Safari/Next router loop where the new
                    // httpOnly auth cookie is not picked up quickly enough for the
                    // immediate server render of /account.
                    window.location.assign(destination);
                } catch (error) {
                    setState((current) => ({
                        ...current,
                        error: error instanceof Error ? translateAuthError(error.message) : "Не удалось войти",
                    }));
                    if (mode === "login") {
                        resetLoginCaptcha();
                    } else {
                        resetRegisterCaptcha();
                    }
                }
            })();
        });
    }

    function runQuickLogin(kind: QuickLoginKind) {
        startTransition(() => {
            void (async () => {
                try {
                    setLoginNotice(null);
                    const payload = await submitQuickLogin(kind);
                    const destination = resolveAuthDestination(payload);
                    window.location.assign(destination);
                } catch (error) {
                    setLoginState((current) => ({
                        ...current,
                        error: error instanceof Error ? error.message : "Не удалось открыть демо-кабинет",
                    }));
                }
            })();
        });
    }

    function submitLogin2FA() {
        if (!login2FAState.token) {
            setLoginState((current) => ({
                ...current,
                error: "Сначала запроси вход с кодом.",
            }));
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    const response = await fetch("/api/auth/email/login/2fa/confirm", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            token: login2FAState.token,
                            code: login2FAState.code,
                        }),
                    });

                    const payload = (await response.json().catch(() => ({}))) as AuthSuccessPayload;
                    if (!response.ok) {
                        throw new Error(payload.detail ?? "Не удалось подтвердить код");
                    }

                    const destination = resolveAuthDestination(payload);
                    window.location.assign(destination);
                } catch (error) {
                    setLoginState((current) => ({
                        ...current,
                        error: error instanceof Error ? translateAuthError(error.message) : "Не удалось подтвердить код",
                    }));
                }
            })();
        });
    }

    function resendLogin2FA() {
        startTransition(() => {
            void (async () => {
                try {
                    if (!loginState.captchaToken) {
                        throw new Error("captcha_required");
                    }
                    const payload = await submitAuth("login", loginState.email, loginState.password, loginState.captchaToken, referralCode, partnerCode);
                    if (
                        !payload.requires_2fa
                        || typeof payload.challenge_token !== "string"
                        || !payload.challenge_token
                    ) {
                        throw new Error("Не удалось повторно отправить код");
                    }

                    setLogin2FAState({
                        token: payload.challenge_token,
                        code: "",
                        maskedEmail: payload.masked_email ?? maskEmailAddress(loginState.email),
                        expiresAt: payload.expires_at ?? null,
                    });
                    setLoginState((current) => ({
                        ...current,
                        error: null,
                    }));
                    resetLoginCaptcha();
                } catch (error) {
                    setLoginState((current) => ({
                        ...current,
                        error: error instanceof Error ? translateAuthError(error.message) : "Не удалось повторно отправить код",
                    }));
                    resetLoginCaptcha();
                }
            })();
        });
    }

    function resetLogin2FA() {
        setLogin2FAState(initialLogin2FAState);
        setLoginState((current) => ({
            ...current,
            error: null,
        }));
    }

    function openPasswordResetModal() {
        setPasswordResetState({
            ...initialPasswordResetState,
            email: loginState.email,
        });
        setPasswordResetStep("request");
        setShowPasswordResetModal(true);
        setLoginNotice(null);
    }

    function closePasswordResetModal() {
        setShowPasswordResetModal(false);
        setPasswordResetState(initialPasswordResetState);
        setPasswordResetStep("request");
    }

    function requestPasswordResetCode() {
        startTransition(() => {
            void (async () => {
                try {
                    const response = await fetch("/api/auth/email/password-reset/request", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            email: passwordResetState.email,
                        }),
                    });
                    const payload = (await response.json().catch(() => ({}))) as {
                        detail?: string;
                        challenge_token?: string | null;
                        masked_email?: string | null;
                        expires_at?: string | null;
                    };
                    if (!response.ok) {
                        throw new Error(payload.detail ?? "Не удалось отправить код");
                    }

                    setPasswordResetState((current) => ({
                        ...current,
                        token: payload.challenge_token ?? null,
                        maskedEmail: payload.masked_email ?? maskEmailAddress(current.email),
                        expiresAt: payload.expires_at ?? null,
                        code: "",
                        newPassword: "",
                        repeatPassword: "",
                        error: null,
                    }));
                    setPasswordResetStep("verify");
                } catch (error) {
                    setPasswordResetState((current) => ({
                        ...current,
                        error: error instanceof Error ? translateAuthError(error.message) : "Не удалось отправить код",
                    }));
                }
            })();
        });
    }

    function verifyPasswordResetCode() {
        if (!passwordResetState.token) {
            setPasswordResetState((current) => ({
                ...current,
                error: "Сначала запроси код для восстановления пароля.",
            }));
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    const response = await fetch("/api/auth/email/password-reset/verify", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            token: passwordResetState.token,
                            code: passwordResetState.code,
                        }),
                    });
                    const payload = (await response.json().catch(() => ({}))) as {
                        detail?: string;
                        challenge_token?: string | null;
                        masked_email?: string | null;
                    };
                    if (!response.ok) {
                        throw new Error(payload.detail ?? "Не удалось подтвердить код");
                    }

                    setPasswordResetState((current) => ({
                        ...current,
                        token: payload.challenge_token ?? current.token,
                        maskedEmail: payload.masked_email ?? current.maskedEmail,
                        error: null,
                    }));
                    setPasswordResetStep("set_password");
                } catch (error) {
                    setPasswordResetState((current) => ({
                        ...current,
                        error: error instanceof Error ? translateAuthError(error.message) : "Не удалось подтвердить код",
                    }));
                }
            })();
        });
    }

    function confirmPasswordReset() {
        if (!passwordResetState.token) {
            setPasswordResetState((current) => ({
                ...current,
                error: "Сначала запроси код для восстановления пароля.",
            }));
            return;
        }

        if (passwordResetState.newPassword.length < 6) {
            setPasswordResetState((current) => ({
                ...current,
                error: "Пароль должен быть не короче 6 символов.",
            }));
            return;
        }

        if (passwordResetState.newPassword !== passwordResetState.repeatPassword) {
            setPasswordResetState((current) => ({
                ...current,
                error: "Пароли не совпадают.",
            }));
            return;
        }

        startTransition(() => {
            void (async () => {
                try {
                    const response = await fetch("/api/auth/email/password-reset/confirm", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            token: passwordResetState.token,
                            new_password: passwordResetState.newPassword,
                        }),
                    });
                    const payload = (await response.json().catch(() => ({}))) as { detail?: string };
                    if (!response.ok) {
                        throw new Error(payload.detail ?? "Не удалось сохранить новый пароль");
                    }

                    setShowPasswordResetModal(false);
                    setPasswordResetState(initialPasswordResetState);
                    setPasswordResetStep("request");
                    setLoginState((current) => ({
                        ...current,
                        email: passwordResetState.email,
                        password: "",
                        error: null,
                    }));
                    setLoginNotice("Пароль обновлён. Теперь войди с новым паролем.");
                } catch (error) {
                    setPasswordResetState((current) => ({
                        ...current,
                        error: error instanceof Error ? translateAuthError(error.message) : "Не удалось сохранить новый пароль",
                    }));
                }
            })();
        });
    }

    return (
        <div className={cn("grid grid-cols-1 gap-6", !shellMode && "mt-12 md:grid-cols-2")}>
            {showLoginCard && (
            <Card variant="solid" className="flex h-full flex-col border-white/10 p-5 sm:p-8">
                <div className="mb-6 space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight sm:text-[2rem]">Вход в аккаунт</h2>
                    <p className="text-base text-white/60 sm:text-lg">
                        Войди, чтобы управлять устройствами, ключами и оплатой в одном кабинете.
                    </p>
                </div>
                <form
                    className="flex h-full flex-col gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (login2FAState.token) {
                            submitLogin2FA();
                            return;
                        }
                        void handleSubmit("login", event);
                    }}
                >
                    {loginNotice && (
                        <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                            {loginNotice}
                        </div>
                    )}
                    {login2FAState.token ? (
                        <>
                            <div className="rounded-2xl border-2 border-brand/30 bg-brand/10 px-4 py-3 text-sm text-white/85">
                                {loginNotice
                                    ? <>Код уже у вас на почте: <span className="font-bold">{login2FAState.maskedEmail ?? loginState.email}</span>.</>
                                    : <>Код входа отправили на <span className="font-bold">{login2FAState.maskedEmail ?? loginState.email}</span>.</>}
                            </div>
                            <div>
                                <label htmlFor="login-2fa-code" className="block text-sm font-bold uppercase tracking-widest mb-2 text-white/50">Код из письма</label>
                                <input
                                    id="login-2fa-code"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    value={login2FAState.code}
                                    onChange={(event) => {
                                        setLogin2FAState((current) => ({
                                            ...current,
                                            code: event.target.value.replace(/\D/g, "").slice(0, 6),
                                        }));
                                        setLoginState((current) => ({
                                            ...current,
                                            error: null,
                                        }));
                                    }}
                                    className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium tracking-[0.3em] text-white placeholder:text-white/40 focus-visible:outline-none"
                                    placeholder="000000"
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm text-white/50">
                                <span>Код нужен только для этого входа.</span>
                                <Link href="/help#contact" className="hover:text-white">Нужна помощь?</Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label htmlFor="login-email" className="block text-sm font-bold uppercase tracking-widest mb-2 text-white/50">Email</label>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={loginState.email}
                                    onChange={(event) => setLoginState((current) => ({
                                        ...current,
                                        email: event.target.value,
                                        error: null,
                                    }))}
                                    className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                                    placeholder="user@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="login-password" className="block text-sm font-bold uppercase tracking-widest mb-2 text-white/50">Пароль</label>
                                <input
                                    id="login-password"
                                    type="password"
                                    value={loginState.password}
                                    onChange={(event) => setLoginState((current) => ({
                                        ...current,
                                        password: event.target.value,
                                        error: null,
                                    }))}
                                    className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="rounded-2xl border-2 border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
                                <div className="flex items-center justify-between gap-4">
                                    <span>Сессия сохранится в браузере.</span>
                                    <button
                                        type="button"
                                        onClick={openPasswordResetModal}
                                        className="font-semibold text-white/75 transition hover:text-white"
                                    >
                                        Забыл пароль?
                                    </button>
                                </div>
                            </div>
                            {TURNSTILE_SITE_KEY ? (
                                <TurnstileCaptcha
                                    resetSignal={loginCaptchaResetKey}
                                    onTokenChange={(token) => setLoginState((current) => ({
                                        ...current,
                                        captchaToken: token,
                                        error: token ? null : current.error,
                                    }))}
                                />
                            ) : null}
                        </>
                    )}
                    {loginState.error && (
                        <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {loginState.error}
                        </div>
                    )}
                    {showQuickPreviewButtons && !login2FAState.token && (
                        <div className="rounded-2xl border-2 border-white/10 bg-white/[0.03] p-4">
                            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-white/45">
                                Быстрый просмотр кабинетов
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => runQuickLogin("client")}
                                    className={cn(
                                        buttonVariants({ variant: "outline", size: "sm" }),
                                        "h-11 border-2 text-xs uppercase tracking-widest disabled:opacity-60"
                                    )}
                                >
                                    Клиент
                                </button>
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => runQuickLogin("partner")}
                                    className={cn(
                                        buttonVariants({ variant: "outline", size: "sm" }),
                                        "h-11 border-2 text-xs uppercase tracking-widest disabled:opacity-60"
                                    )}
                                >
                                    Партнёр
                                </button>
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => runQuickLogin("admin")}
                                    className={cn(
                                        buttonVariants({ variant: "outline", size: "sm" }),
                                        "h-11 border-2 text-xs uppercase tracking-widest disabled:opacity-60"
                                    )}
                                >
                                    Админ
                                </button>
                            </div>
                        </div>
                    )}
                    {login2FAState.token ? (
                        <div className="mt-auto flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={isPending || login2FAState.code.trim().length < 6}
                                className={cn(
                                    buttonVariants({ variant: "brand", size: "lg" }),
                                    "w-full h-14 rounded-3xl uppercase tracking-widest text-sm font-bold disabled:opacity-60"
                                )}
                            >
                                {isPending ? "Проверяем..." : "Подтвердить вход"}
                            </button>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={resendLogin2FA}
                                    className={cn(
                                        buttonVariants({ variant: "outline", size: "lg" }),
                                        "h-12 w-full rounded-3xl border-2 text-xs font-bold uppercase tracking-widest disabled:opacity-60 sm:flex-1"
                                    )}
                                >
                                    Отправить код еще раз
                                </button>
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={resetLogin2FA}
                                    className={cn(
                                        buttonVariants({ variant: "ghost", size: "lg" }),
                                        "h-12 w-full rounded-3xl text-xs font-bold uppercase tracking-widest disabled:opacity-60 sm:flex-1"
                                    )}
                                >
                                    Назад
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            disabled={isPending || (Boolean(TURNSTILE_SITE_KEY) && !loginState.captchaToken)}
                            className={cn(
                                buttonVariants({ variant: "brand", size: "lg" }),
                                "mt-auto h-14 w-full rounded-3xl uppercase tracking-widest text-sm font-bold disabled:opacity-60"
                            )}
                        >
                            {isPending ? "Входим..." : "Войти"}
                        </button>
                    )}
                </form>
            </Card>
            )}

            {showPartnerApplication && !shellMode && (
                <Card variant="outline" className="border-brand/20 bg-brand/5 p-5 sm:p-8">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight sm:text-[2rem]">Нужен партнёрский кабинет?</h2>
                            <p className="mt-3 text-base text-white/70 sm:text-lg">
                                Если у тебя ещё нет доступа, отправь заявку. Она уйдёт в админку на рассмотрение, и после одобрения появится отдельный партнёрский вход.
                            </p>
                        </div>
                        <a
                            href="#partner-application"
                            className={cn(
                                buttonVariants({ variant: "brand", size: "lg" }),
                                "h-14 w-full rounded-3xl text-sm font-bold uppercase tracking-widest"
                            )}
                        >
                            Подать заявку на партнёрку
                        </a>
                    </div>
                </Card>
            )}

            {showRegisterCard && (
                <Card variant="outline" className="flex h-full flex-col border-white/15 p-5 sm:p-8">
                    <div className="mb-6 space-y-3">
                        <h2 className="text-2xl font-black uppercase tracking-tight sm:text-[2rem]">Создать аккаунт</h2>
                        <p className="text-base text-white/60 sm:text-lg">
                            Создай аккаунт, чтобы управлять устройствами, ключами и оплатой в одном кабинете.
                        </p>
                    </div>
                    <form className="flex h-full flex-col gap-4" onSubmit={(event) => void handleSubmit("register", event)}>
                        {(referralCode || partnerCode) && (
                            <div className="rounded-2xl border-2 border-brand/30 bg-brand/10 px-4 py-3 text-sm text-white/85">
                                {partnerCode ? (
                                    <>Регистрация идёт по партнёрской ссылке <span className="font-bold">{partnerCode}</span>.</>
                                ) : (
                                    <>Регистрация идёт по реферальному коду <span className="font-bold">{referralCode}</span>.</>
                                )}
                            </div>
                        )}
                        <div>
                            <label htmlFor="register-email" className="block text-sm font-bold uppercase tracking-widest mb-2 text-white/50">Email</label>
                            <input
                                id="register-email"
                                type="email"
                                value={registerState.email}
                                onChange={(event) => setRegisterState((current) => ({
                                    ...current,
                                    email: event.target.value,
                                    error: null,
                                }))}
                                className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                                placeholder="new@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="register-password" className="block text-sm font-bold uppercase tracking-widest mb-2 text-white/50">Пароль</label>
                            <input
                                id="register-password"
                                type="password"
                                value={registerState.password}
                                onChange={(event) => setRegisterState((current) => ({
                                    ...current,
                                    password: event.target.value,
                                    error: null,
                                }))}
                                className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                                placeholder="минимум 6 символов"
                                minLength={6}
                                required
                            />
                        </div>
                        {TURNSTILE_SITE_KEY ? (
                            <TurnstileCaptcha
                                resetSignal={registerCaptchaResetKey}
                                onTokenChange={(token) => setRegisterState((current) => ({
                                    ...current,
                                    captchaToken: token,
                                    error: token ? null : current.error,
                                }))}
                            />
                        ) : null}
                        {registerState.error && (
                            <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {registerState.error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isPending || (Boolean(TURNSTILE_SITE_KEY) && !registerState.captchaToken)}
                            className={cn(
                                buttonVariants({ variant: "outline", size: "lg" }),
                                "mt-auto h-14 w-full rounded-3xl border-2 uppercase tracking-widest text-sm font-bold disabled:opacity-60"
                            )}
                        >
                            {isPending ? "Создаём..." : "Создать аккаунт"}
                        </button>
                    </form>
                </Card>
            )}

            {showPartnerApplicationCard && <PartnerApplicationPanel />}

            {!showUserRegistration && !showPartnerApplication && !shellMode && (
                <Card variant="outline" className="border-white/15 p-5 sm:p-8">
                    <h2 className="mb-6 text-2xl font-black uppercase tracking-tight sm:text-[2rem]">Вход для команды</h2>
                    <div className="space-y-4 text-white/70">
                        <p className="text-base sm:text-lg">
                            Здесь входят только администраторы и модераторы сервиса.
                        </p>
                        <div className="rounded-2xl border-2 border-white/10 bg-white/5 px-4 py-3 text-sm">
                            Новые рабочие аккаунты создаются отдельно. Обычная пользовательская регистрация на этом домене отключена.
                        </div>
                        <div className="rounded-2xl border-2 border-brand/30 bg-brand/10 px-4 py-3 text-sm text-white/85">
                            Используй выданные email и пароль для входа в рабочий кабинет.
                        </div>
                    </div>
                </Card>
            )}

            <Modal
                open={showPasswordResetModal}
                onClose={() => !isPending && closePasswordResetModal()}
                title="Восстановить пароль"
                size="sm"
                footer={
                    <div className="flex flex-wrap gap-3">
                        {passwordResetStep === "request" ? (
                            <button
                                type="button"
                                onClick={requestPasswordResetCode}
                                disabled={isPending || passwordResetState.email.trim().length < 3}
                                className="inline-flex h-11 min-w-[156px] items-center justify-center whitespace-nowrap rounded-full bg-black px-6 text-xs font-bold uppercase tracking-normal text-white shadow-[0_10px_30px_rgba(15,15,15,0.18)] transition hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/30 disabled:text-black/35 disabled:shadow-none"
                                style={{ backgroundColor: "#050505", color: "#ffffff" }}
                            >
                                {isPending ? "Отправляем..." : "Получить код"}
                            </button>
                        ) : passwordResetStep === "verify" ? (
                            <button
                                type="button"
                                onClick={verifyPasswordResetCode}
                                disabled={isPending || passwordResetState.code.trim().length < 6}
                                className="inline-flex h-11 min-w-[156px] items-center justify-center whitespace-nowrap rounded-full bg-black px-6 text-xs font-bold uppercase tracking-normal text-white shadow-[0_10px_30px_rgba(15,15,15,0.18)] transition hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/30 disabled:text-black/35 disabled:shadow-none"
                                style={{ backgroundColor: "#050505", color: "#ffffff" }}
                            >
                                {isPending ? "Проверяем..." : "Проверить код"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={confirmPasswordReset}
                                disabled={isPending || passwordResetState.newPassword.trim().length < 6}
                                className="inline-flex h-11 min-w-[156px] items-center justify-center whitespace-nowrap rounded-full bg-black px-6 text-xs font-bold uppercase tracking-normal text-white shadow-[0_10px_30px_rgba(15,15,15,0.18)] transition hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/30 disabled:text-black/35 disabled:shadow-none"
                                style={{ backgroundColor: "#050505", color: "#ffffff" }}
                            >
                                {isPending ? "Сохраняем..." : "Сохранить пароль"}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={closePasswordResetModal}
                            disabled={isPending}
                            className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "h-11 border-black/15 px-6 text-xs uppercase tracking-normal text-black hover:!bg-black hover:!text-white hover:!border-black"
                            )}
                        >
                            Закрыть
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {passwordResetStep === "request" ? (
                        <>
                            <p className="text-lg text-black/70">
                                Введи email от аккаунта, и мы отправим код для восстановления пароля.
                            </p>
                            <div>
                                <label htmlFor="password-reset-email" className="mb-2 block text-sm font-bold uppercase tracking-widest text-black/45">
                                    Email
                                </label>
                                <input
                                    id="password-reset-email"
                                    type="email"
                                    value={passwordResetState.email}
                                    onChange={(event) => setPasswordResetState((current) => ({
                                        ...current,
                                        email: event.target.value,
                                        error: null,
                                    }))}
                                    className="h-14 w-full rounded-2xl border-2 border-black/15 bg-white px-4 text-base font-medium text-black focus-visible:outline-none"
                                    placeholder="user@example.com"
                                    required
                                />
                            </div>
                        </>
                    ) : passwordResetStep === "verify" ? (
                        <>
                            <p className="text-lg text-black/70">
                                Сначала введи код из письма. Окно смены пароля откроется только после успешной проверки.
                            </p>
                            <div className="rounded-2xl border-2 border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black/65">
                                Код отправили на <span className="font-bold text-black">{passwordResetState.maskedEmail ?? passwordResetState.email}</span>.
                            </div>
                            <div>
                                <label htmlFor="password-reset-code" className="mb-2 block text-sm font-bold uppercase tracking-widest text-black/45">
                                    Код из письма
                                </label>
                                <input
                                    id="password-reset-code"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    value={passwordResetState.code}
                                    onChange={(event) => setPasswordResetState((current) => ({
                                        ...current,
                                        code: event.target.value.replace(/\D/g, "").slice(0, 6),
                                        error: null,
                                    }))}
                                    className="h-14 w-full rounded-2xl border-2 border-black/15 bg-white px-4 text-lg font-semibold tracking-[0.3em] text-black focus-visible:outline-none"
                                    placeholder="000000"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="rounded-2xl border-2 border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black/65">
                                Код подтвержден. Теперь задай новый пароль для входа в аккаунт.
                            </div>
                            <div>
                                <label htmlFor="password-reset-new-password" className="mb-2 block text-sm font-bold uppercase tracking-widest text-black/45">
                                    Новый пароль
                                </label>
                                <input
                                    id="password-reset-new-password"
                                    type="password"
                                    value={passwordResetState.newPassword}
                                    onChange={(event) => setPasswordResetState((current) => ({
                                        ...current,
                                        newPassword: event.target.value,
                                        error: null,
                                    }))}
                                    className="h-14 w-full rounded-2xl border-2 border-black/15 bg-white px-4 text-base font-medium text-black focus-visible:outline-none"
                                    placeholder="минимум 6 символов"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password-reset-repeat-password" className="mb-2 block text-sm font-bold uppercase tracking-widest text-black/45">
                                    Повтори пароль
                                </label>
                                <input
                                    id="password-reset-repeat-password"
                                    type="password"
                                    value={passwordResetState.repeatPassword}
                                    onChange={(event) => setPasswordResetState((current) => ({
                                        ...current,
                                        repeatPassword: event.target.value,
                                        error: null,
                                    }))}
                                    className="h-14 w-full rounded-2xl border-2 border-black/15 bg-white px-4 text-base font-medium text-black focus-visible:outline-none"
                                    placeholder="повтори новый пароль"
                                    minLength={6}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {passwordResetState.error && (
                        <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                            {passwordResetState.error}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
