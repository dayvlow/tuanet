"use client";

import { FormEvent, useState, useTransition } from "react";

import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { TurnstileCaptcha } from "@/components/security/TurnstileCaptcha";
import { BackendPartnerApplication } from "@/lib/backend";
import { cn } from "@/lib/utils";

interface PartnerApplicationState {
    email: string;
    password: string;
    comment: string;
    statusEmail: string;
    error: string | null;
    success: string | null;
    application: BackendPartnerApplication | null;
    captchaToken: string | null;
}

const initialState: PartnerApplicationState = {
    email: "",
    password: "",
    comment: "",
    statusEmail: "",
    error: null,
    success: null,
    application: null,
    captchaToken: null,
};

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY?.trim() ?? "";

function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return "Нет данных";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Нет данных";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function getFriendlyApplicationError(detail: string): string {
    switch (detail) {
        case "email_required":
            return "Укажи email.";
        case "password_too_short":
            return "Пароль должен быть не короче 6 символов.";
        case "email_already_registered":
            return "Этот email уже зарегистрирован. Если партнёрский кабинет уже одобрен, просто войди по своему логину и паролю.";
        case "email_reuse_blocked":
            return "Этот email временно нельзя использовать для новой регистрации после удаления аккаунта.";
        case "partner_application_pending":
            return "По этому email уже есть заявка на рассмотрении. Ниже можно сразу проверить её статус.";
        case "captcha_required":
            return "Сначала подтверди капчу.";
        default:
            return detail || "Не удалось выполнить запрос";
    }
}

function getApplicationTone(status: string): string {
    switch (status) {
        case "approved":
            return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
        case "rejected":
            return "border-red-500/25 bg-red-500/10 text-red-200";
        default:
            return "border-amber-500/25 bg-amber-500/10 text-amber-100";
    }
}

function getApplicationTitle(status: string): string {
    switch (status) {
        case "approved":
            return "Заявка одобрена";
        case "rejected":
            return "Заявка отклонена";
        default:
            return "Заявка на рассмотрении";
    }
}

function getApplicationDescription(application: BackendPartnerApplication): string {
    switch (application.status) {
        case "approved":
            return "Партнёрский кабинет уже создан. Можно входить по email и паролю, которые были указаны в заявке.";
        case "rejected":
            return "Администратор отклонил заявку. Можно исправить комментарий и отправить новую.";
        default:
            return "Заявка сохранена и ждёт решения администратора. Как только её рассмотрят, статус обновится здесь.";
    }
}

export function PartnerApplicationPanel() {
    const [state, setState] = useState<PartnerApplicationState>(initialState);
    const [isPending, startTransition] = useTransition();
    const [captchaResetKey, setCaptchaResetKey] = useState(0);

    function resetCaptcha() {
        setCaptchaResetKey((current) => current + 1);
        setState((current) => ({
            ...current,
            captchaToken: null,
        }));
    }

    async function fetchApplicationStatus(email: string) {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            throw new Error("Укажи email для проверки статуса.");
        }

        const response = await fetch(`/api/partner-applications?email=${encodeURIComponent(normalizedEmail)}`, {
            method: "GET",
        });
        const payload = (await response.json().catch(() => ({}))) as {
            application?: BackendPartnerApplication | null;
            detail?: string;
        };
        if (!response.ok) {
            throw new Error(getFriendlyApplicationError(payload.detail ?? ""));
        }

        return payload.application ?? null;
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    if (TURNSTILE_SITE_KEY && !state.captchaToken) {
                        throw new Error("captcha_required");
                    }
                    const normalizedEmail = state.email.trim().toLowerCase();
                    const response = await fetch("/api/partner-applications", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            email: normalizedEmail,
                            password: state.password,
                            comment: state.comment,
                            captcha_token: state.captchaToken,
                        }),
                    });
                    const payload = (await response.json().catch(() => ({}))) as {
                        application?: BackendPartnerApplication;
                        detail?: string;
                    };
                    if (!response.ok) {
                        if ((payload.detail ?? "") === "partner_application_pending") {
                            const existingApplication = await fetchApplicationStatus(normalizedEmail);
                            setState((current) => ({
                                ...current,
                                statusEmail: normalizedEmail,
                                application: existingApplication,
                                error: getFriendlyApplicationError(payload.detail ?? ""),
                                success: null,
                            }));
                            return;
                        }
                        throw new Error(getFriendlyApplicationError(payload.detail ?? ""));
                    }

                    setState({
                        ...initialState,
                        statusEmail: normalizedEmail,
                        application: payload.application ?? null,
                        success: "Заявка отправлена. Ниже можно отслеживать её статус по email.",
                    });
                } catch (error) {
                    setState((current) => ({
                        ...current,
                        error: error instanceof Error ? error.message : "Не удалось отправить заявку",
                        success: null,
                    }));
                    resetCaptcha();
                }
            })();
        });
    }

    function handleStatusCheck(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(() => {
            void (async () => {
                try {
                    const application = await fetchApplicationStatus(state.statusEmail);
                    if (!application) {
                        setState((current) => ({
                            ...current,
                            application: null,
                            error: null,
                            success: "По этому email заявка пока не найдена. Можно отправить новую заявку выше.",
                        }));
                        return;
                    }

                    setState((current) => ({
                        ...current,
                        application,
                        error: null,
                        success: "Статус заявки обновлён.",
                    }));
                } catch (error) {
                    setState((current) => ({
                        ...current,
                        error: error instanceof Error ? error.message : "Не удалось проверить статус заявки",
                        success: null,
                    }));
                }
            })();
        });
    }

    return (
        <Card id="partner-application" variant="outline" className="border-white/15 p-5 sm:p-8">
            <h2 className="mb-6 text-2xl font-black uppercase tracking-tight sm:text-[2rem]">Заявка на партнёрку</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <p className="text-base text-white/60 sm:text-lg">
                    Оставь email, пароль и короткий комментарий. После одобрения админом будет создан отдельный партнёрский кабинет.
                </p>
                <div>
                    <label htmlFor="partner-apply-email" className="mb-2 block text-sm font-bold uppercase tracking-widest text-white/50">Email</label>
                    <input
                        id="partner-apply-email"
                        type="email"
                        value={state.email}
                        onChange={(event) => setState((current) => ({
                            ...current,
                            email: event.target.value,
                            error: null,
                            success: null,
                        }))}
                        className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                        placeholder="partner@example.com"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="partner-apply-password" className="mb-2 block text-sm font-bold uppercase tracking-widest text-white/50">Пароль</label>
                    <input
                        id="partner-apply-password"
                        type="password"
                        value={state.password}
                        onChange={(event) => setState((current) => ({
                            ...current,
                            password: event.target.value,
                            error: null,
                            success: null,
                        }))}
                        className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-lg font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                        placeholder="минимум 6 символов"
                        minLength={6}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="partner-apply-comment" className="mb-2 block text-sm font-bold uppercase tracking-widest text-white/50">Комментарий</label>
                    <textarea
                        id="partner-apply-comment"
                        rows={5}
                        value={state.comment}
                        onChange={(event) => setState((current) => ({
                            ...current,
                            comment: event.target.value,
                            error: null,
                            success: null,
                        }))}
                        className="flex w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-3 text-base font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                        placeholder="Кто вы, откуда трафик или почему хотите получить партнёрский кабинет"
                    />
                </div>
                {TURNSTILE_SITE_KEY ? (
                    <TurnstileCaptcha
                        resetSignal={captchaResetKey}
                        onTokenChange={(token) => setState((current) => ({
                            ...current,
                            captchaToken: token,
                            error: token ? null : current.error,
                        }))}
                    />
                ) : null}
                {state.error && (
                    <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {state.error}
                    </div>
                )}
                {state.success && (
                    <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {state.success}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={isPending || (Boolean(TURNSTILE_SITE_KEY) && !state.captchaToken)}
                    className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "h-14 w-full rounded-3xl border-2 text-sm font-bold uppercase tracking-widest disabled:opacity-60"
                    )}
                >
                    {isPending ? "Отправляем..." : "Отправить заявку"}
                </button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-8">
                <h3 className="text-lg font-black uppercase tracking-tight">Проверить статус</h3>
                <form className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={handleStatusCheck}>
                    <input
                        type="email"
                        value={state.statusEmail}
                        onChange={(event) => setState((current) => ({
                            ...current,
                            statusEmail: event.target.value,
                            error: null,
                            success: null,
                        }))}
                        className="flex h-14 w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-2 text-base font-medium text-white placeholder:text-white/40 focus-visible:outline-none"
                        placeholder="Тот же email, что был в заявке"
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                            buttonVariants({ variant: "brand", size: "lg" }),
                            "h-14 rounded-3xl px-6 text-sm font-bold uppercase tracking-widest disabled:opacity-60"
                        )}
                    >
                        Проверить
                    </button>
                </form>

                {state.application && (
                    <div className={cn("mt-5 rounded-2xl border-2 p-5 text-sm", getApplicationTone(state.application.status))}>
                        <div className="text-xs font-bold uppercase tracking-widest">Статус заявки</div>
                        <div className="mt-3 text-2xl font-black uppercase tracking-tight">{getApplicationTitle(state.application.status)}</div>
                        <div className="mt-2 text-sm text-white/80">{getApplicationDescription(state.application)}</div>
                        <div className="mt-4 space-y-2 text-white/75">
                            <div>Создана: {formatDateTime(state.application.created_at)}</div>
                            <div>Обновлена: {formatDateTime(state.application.updated_at)}</div>
                            {state.application.reviewed_at && (
                                <div>Решение принято: {formatDateTime(state.application.reviewed_at)}</div>
                            )}
                            {state.application.created_partner_account_id && (
                                <div>Создан партнёрский аккаунт #{state.application.created_partner_account_id}</div>
                            )}
                        </div>
                        {state.application.admin_comment && (
                            <div className="mt-4 rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white/80 whitespace-pre-wrap">
                                {state.application.admin_comment}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
