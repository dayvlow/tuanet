import Link from "next/link";

import { AuthPanels } from "@/components/account/AuthPanels";
import { PartnerApplicationPanel } from "@/components/account/PartnerApplicationPanel";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import type { PortalSiteKind } from "@/lib/portal-host";
import { cn } from "@/lib/utils";

interface AuthPageShellProps {
  mode: "login" | "register";
  portalSite: PortalSiteKind;
  referralCode?: string | null;
  partnerCode?: string | null;
}

export function AuthPageShell({
  mode,
  portalSite,
  referralCode = null,
  partnerCode = null,
}: AuthPageShellProps) {
  const isLogin = mode === "login";
  const isPartner = portalSite === "partner";
  const isAdmin = portalSite === "admin";

  const title = isPartner
    ? isLogin
      ? "TUANET FOR PARTNERS"
      : "Подача заявки"
    : isAdmin
      ? "TUANET TEAM"
      : isLogin
        ? "Вход в аккаунт"
        : "Создание аккаунта";

  const subtitle = isPartner
    ? isLogin
      ? ""
      : "Оставьте заявку на подключение партнёрского кабинета. После проверки администратором доступ появится в отдельном кабинете."
    : isAdmin
      ? ""
      : isLogin
        ? "Войдите, чтобы перейти к устройствам, ключам и настройкам доступа."
        : "Зарегистрируйтесь, чтобы управлять подключением, устройствами и доступом в одном кабинете.";

  const switchHref = isLogin
    ? isPartner
      ? "/register"
      : "/register"
    : isPartner
      ? "/login"
      : "/login";
  const switchLabel = isLogin ? (isPartner ? "Подать заявку" : "Создать аккаунт") : "Войти";
  const switchText = isLogin ? "Еще нет аккаунта?" : "Уже есть аккаунт?";
  const showDirectPartnerApplication = isPartner && !isLogin;

  return (
    <div className="min-h-[100svh] bg-black px-5 pb-[calc(2.5rem+var(--safe-bottom))] pt-[var(--nav-height,0px)] text-white selection:bg-brand selection:text-black sm:px-6 md:px-12">
      <Section
        container={false}
        padding="none"
        className="mx-auto flex min-h-[calc(100svh-var(--nav-height,0px))] w-full max-w-7xl items-center py-10"
      >
        <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <Reveal width="100%">
            <Card
              variant="solid"
              className="flex h-full min-w-0 flex-col justify-between border-white/10 p-8 md:p-10 lg:min-h-[40rem]"
            >
              <div>
                <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/45">
                  TUANET
                </div>
                <h1 className="mb-6 break-normal text-[clamp(2.75rem,6.2vw,5rem)] font-black uppercase italic leading-[0.9] tracking-tighter">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="max-w-xl text-base font-medium text-white/60 sm:text-lg md:text-xl">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <div className="mt-8 space-y-4">
                {!isAdmin && (
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/55">
                    <span>{switchText}</span>
                    <Link href={switchHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full border-white/15 px-5")}>
                      {switchLabel}
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </Reveal>

          <Reveal width="100%">
            <div className="grid h-full min-w-0 lg:min-h-[40rem]">
              {showDirectPartnerApplication ? (
                <PartnerApplicationPanel />
              ) : (
                <AuthPanels referralCode={referralCode} partnerCode={partnerCode} portalSite={portalSite} initialMode={mode} />
              )}
            </div>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
