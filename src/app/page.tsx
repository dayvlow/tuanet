"use client";

import Link from "next/link";

import { Accordion } from "@/components/ui/Accordion";
import { buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

const steps = [
  { number: "01", title: "Войди в аккаунт", desc: "Открываешь кабинет и получаешь доступ ко всем своим данным в одном месте." },
  { number: "02", title: "Скачай приложение", desc: "Выбираешь свою платформу и ставишь приложение без лишних переходов." },
  { number: "03", title: "Импортируй ключ", desc: "Добавляешь ключ в приложение и привязываешь подключение к своему кабинету." },
  { number: "04", title: "Подключись", desc: "Запускаешь подключение и дальше управляешь доступом через кабинет." },
];

const benefits = [
  { title: "Контроль устройств", desc: "В кабинете видно, какие устройства подключены и что активно прямо сейчас." },
  { title: "Установка по шагам", desc: "Скачал приложение, вошел в аккаунт и подключился без лишней возни." },
  { title: "Все платформы", desc: "Подходит для популярных платформ и не требует сложного ручного сценария." },
];

const faqItems = [
  { title: "Где скачать приложение?", content: "На странице «Скачать». Для каждой платформы есть отдельная ссылка и понятный сценарий установки." },
  { title: "Как войти в кабинет?", content: "Открой страницу входа, авторизуйся по email и паролю, после чего все данные аккаунта будут доступны в кабинете." },
  { title: "Что делать, если подключение не запускается?", content: "Проверь, что используешь актуальное приложение и корректный ключ. Если не помогает, напиши в поддержку и приложи скрин ошибки." },
  { title: "Где управлять устройствами?", content: "Внутри личного кабинета. Там видно активные устройства, ключи и связанные действия по аккаунту." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-black text-white selection:bg-brand selection:text-black">
      <Section
        container={false}
        padding="none"
        className="flex min-h-[78svh] items-center justify-center px-5 pb-16 pt-[calc(var(--nav-height,0px)+2rem)] sm:px-6 md:min-h-[88svh] md:px-12"
      >
        <Reveal width="100%" overflow="visible">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 text-center">
            <h1 className="text-[clamp(4rem,15vw,10rem)] font-black uppercase italic leading-[0.82] tracking-tighter">
              ТУАНЕТ
            </h1>
            <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "brand", size: "lg" }),
                  "h-16 w-full rounded-3xl px-10 text-base font-black uppercase tracking-[0.18em] sm:w-auto"
                )}
              >
                Войти
              </Link>
              <Link
                href="/download"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-16 w-full rounded-3xl border-2 px-10 text-base font-black uppercase tracking-[0.18em] sm:w-auto"
                )}
              >
                Скачать
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section container={false} padding="none" className="px-5 pb-10 pt-4 sm:px-6 md:px-12 md:pb-16">
        <Reveal width="100%">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="mx-auto max-w-full text-[clamp(2.5rem,10.5vw,8rem)] font-black uppercase italic leading-[0.9] tracking-[-0.05em] sm:max-w-[min(100%,18ch)]">
              Подключение
            </h2>
          </div>
        </Reveal>
      </Section>

      <Section container={false} padding="none" className="px-5 pb-20 sm:px-6 md:px-12 md:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 md:-mx-12 md:px-12">
            <div className="flex snap-x snap-mandatory gap-4 pb-2 md:gap-8">
              {steps.map((step) => (
                <Card
                  key={step.number}
                  variant="solid"
                  className="flex min-h-[25rem] w-[85vw] min-w-[85vw] snap-start flex-col justify-between border-zinc-800 p-8 sm:w-[30rem] sm:min-w-[30rem] md:min-h-[30rem] md:w-[34rem] md:min-w-[34rem] md:p-12"
                >
                  <span className="text-7xl font-black italic text-white md:text-8xl">{step.number}</span>
                  <div>
                    <h3 className="mb-5 text-2xl font-black uppercase tracking-tight sm:text-3xl md:text-[2.8rem] md:leading-[0.95]">
                      {step.title}
                    </h3>
                    <p className="text-base font-medium text-white/60 sm:text-lg md:text-2xl md:leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        container={false}
        padding="none"
        className="flex flex-col items-center justify-center px-5 pb-20 sm:px-6 md:px-12 md:pb-28"
      >
        <Reveal>
          <div className="mb-16 text-center md:mb-24">
            <h2 className="text-[clamp(3rem,10vw,7rem)] font-black uppercase italic tracking-tighter">
              Все по делу.
            </h2>
          </div>
        </Reveal>
        <div className="grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} variant="solid" className="flex flex-col gap-6 border-white/10 p-8">
              <h3 className="text-2xl font-black uppercase tracking-tight">{benefit.title}</h3>
              <p className="text-lg font-medium text-white/60">{benefit.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section container={false} padding="none" className="px-5 pb-20 sm:px-6 md:px-12 md:pb-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 border-l-8 border-brand pl-6 text-left md:mb-12 md:pl-8">
            <h2 className="text-[clamp(2.75rem,8vw,5rem)] font-black uppercase tracking-tighter">FAQ</h2>
          </div>
          <Accordion items={faqItems} />
        </div>
      </Section>
    </div>
  );
}
