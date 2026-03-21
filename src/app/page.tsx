"use client";

import { buttonVariants } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const shouldReduceMotion = useReducedMotion();

  const [maxTranslate, setMaxTranslate] = useState(0);

  // ref to the horizontal content to measure total width
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function update() {
      const totalWidth = scrollContainerRef.current?.scrollWidth ?? 0;
      const viewport = typeof window !== 'undefined' ? window.innerWidth : 0;
      const max = Math.max(0, totalWidth - viewport);
      setMaxTranslate(max);
    }

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const rawX = useTransform(scrollYProgress, [0.38, 0.92], [0, -maxTranslate], {
    clamp: true,
  });
  const x = useSpring(rawX, {
    stiffness: 140,
    damping: 28,
    mass: 0.2,
  });

  const pinTrackHeight = `calc(100vh + ${Math.round(maxTranslate)}px + 40vh)`;
  const sectionGap = "py-20 md:py-28";
  const steps = [
    { title: "Скачай приложение", desc: "Открой свою платформу и установи приложение по короткой инструкции." },
    { title: "Войди в аккаунт", desc: "Все ключи и устройства будут привязаны к одному кабинету." },
    { title: "Создай ключ", desc: "Добавь устройство, выбери регион и сохрани удобный тег для себя." },
    { title: "Подключись", desc: "Запусти доступ и возвращайся в кабинет, если нужно что-то изменить." },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-brand selection:text-black">
      <Section container={false} className="hero-block min-h-screen flex flex-col items-center justify-center pb-20 px-6 md:px-12">
        <Reveal width="100%" overflow="visible">
          <div className="flex flex-col items-center gap-8 max-w-4xl w-full text-center mx-auto">
            <h1 className="text-7xl md:text-[10rem] font-black leading-[0.85] tracking-tighter uppercase italic">
              ТУАНЕТ
            </h1>
            <p className="max-w-3xl mx-auto text-2xl text-white/70 font-medium">
              Простой VPN для работы и повседневного использования.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/download"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "uppercase tracking-widest text-lg h-20 px-12 rounded-3xl border-2 border-white bg-transparent text-white"
                )}
              >
                Скачать приложение
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "uppercase tracking-widest text-lg h-20 px-12 rounded-3xl border-2"
                )}
              >
                Войти в кабинет
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>

      <Reveal width="100%">
        <div className={`${sectionGap} w-full flex items-center justify-center text-center px-6 md:px-12`}>
          <h2 className="mx-auto text-6xl md:text-9xl font-black tracking-tighter uppercase italic">
            Подключение<br /> <span className="text-brand">по понятному сценарию</span>
          </h2>
        </div>
      </Reveal>

      {shouldReduceMotion ? (
        <Section container={false} padding="none" className={`${sectionGap} px-6 md:px-12`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {steps.map((feature, i) => (
              <Card key={i} variant="solid" className="flex flex-col justify-between p-10 border-zinc-800">
                <span className="text-6xl font-black text-brand/20 italic">{`0${i + 1}`}</span>
                <div>
                  <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-xl font-medium text-white/60">{feature.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ) : (
        <section ref={targetRef} className="relative" style={{ height: pinTrackHeight }}>
          <div className="sticky top-0 h-screen flex items-center">
            <div className="overflow-hidden w-full">
              <motion.div
                ref={scrollContainerRef}
                style={{ x }}
                className="flex gap-6 px-6 md:px-12"
              >
                {steps.map((feature, i) => (
                  <Card key={i} variant="solid" className="w-[80vw] md:w-[45vw] h-[70vh] flex flex-col justify-between p-12 md:p-16 shrink-0 border-zinc-800">
                    <span className="text-8xl font-black text-brand/20 italic">{`0${i + 1}`}</span>
                    <div>
                      <h3 className="text-5xl font-black mb-6 uppercase tracking-tight">{feature.title}</h3>
                      <p className="text-2xl font-medium text-white/60">{feature.desc}</p>
                    </div>
                  </Card>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      <Section
        container={false}
        padding="none"
        className={`${sectionGap} flex flex-col items-center justify-center px-6 md:px-12`}
      >
        <Reveal>
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 uppercase italic">Все по делу.</h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
            {([
            { title: "Контроль устройств", desc: "Сразу видно, где сервис уже включен и что сейчас активно." },
            { title: "Ключи без путаницы", desc: "Регионы, типы устройств и статусы собраны в одной таблице." },
            { title: "Подключение без лишнего", desc: "Не нужно долго разбираться, чтобы дойти до рабочего доступа." },
            { title: "Понятные платформы", desc: "Windows, iPhone и Android идут по одинаково ясному сценарию." },
            { title: "Быстрое создание ключа", desc: "Новый ключ добавляется за пару шагов прямо в кабинете." },
            { title: "Настройки под рукой", desc: "Сессии и параметры доступа можно проверить в любой момент." },
          ] as { title: string; desc: string }[]).map((benefit, i) => (
              <Card key={i} variant="solid" className={`flex flex-col gap-6 p-8 border-white/10`}>
                <h3 className="text-2xl font-black uppercase tracking-tight">{benefit.title}</h3>
                <p className="text-lg font-medium text-white/60">{benefit.desc}</p>
              </Card>
          ))}
        </div>
      </Section>

      <Section container={false} padding="none" className={`${sectionGap} px-6 md:px-12`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Понятные условия", desc: "Условия использования, возврат и документы доступны прямо на сайте." },
            { title: "Поддержка по делу", desc: "Если что-то не сходится, можно быстро перейти в помощь и разобраться." },
            { title: "Возврат без сюрпризов", desc: "Первый платеж можно вернуть в течение 7 дней, если сервис не подошел." },
          ].map((item, i) => (
            <Card key={i} variant="outline" className="p-8 border-white/15">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{item.title}</h3>
              <p className="text-lg text-white/60">{item.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        container={false}
        padding="none"
        className={`${sectionGap} flex flex-col items-center justify-center px-6 md:px-12`}
      >
          <div className="flex flex-col lg:flex-row gap-20 items-center justify-center w-full">
          <div className="w-[450px] flex-none min-h-[500px]">
            <Reveal>
              <div className="mb-12 border-l-8 border-brand pl-8 text-left">
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">FAQ</h2>
              </div>
            </Reveal>
            <div className="space-y-4 h-full overflow-auto">
              <Accordion items={[
                { title: "Сколько устройств можно подключить?", content: "До 5 устройств. Лимит и активные подключения всегда видны в кабинете." },
                { title: "Как отключить доступ?", content: "Если ключ больше не нужен, его можно отозвать в кабинете за пару кликов." },
                { title: "Где скачать приложение?", content: "На странице «Скачать». Для каждой платформы есть отдельная инструкция." },
                { title: "Есть ли возвраты?", content: "Да, первый платеж можно вернуть в течение 7 дней. Подробности есть в разделе «Возвраты»." },
                { title: "Что делать, если не подключается?", content: "Сначала проверь статус сервиса, ключ и лимит устройств. Если не помогло, напиши в поддержку." },
              ]} />
            </div>
          </div>

          <div className="lg:w-[450px] w-full shrink-0">
            <Reveal>
              <Card variant="solid" padding="lg" className="bg-brand text-black border-none relative overflow-visible h-full flex flex-col items-center text-center justify-center min-h-[500px]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="relative z-10 flex flex-col items-center gap-10">
                  <div className="max-w-xs">
                    <h2 className="text-7xl font-black tracking-tighter mb-4 uppercase italic leading-[0.8] text-white">Старт</h2>
                    <p className="text-xl font-bold text-white">Открой загрузку, установи приложение и подключись по понятному сценарию.</p>
                  </div>
                  <Link
                    href="/download"
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "h-24 px-12 text-2xl bg-white text-black hover:bg-white/90 hover:scale-105 transition-all rounded-3xl uppercase font-black tracking-widest shadow-2xl"
                    )}
                  >
                    Скачать
                  </Link>
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </Section>
    </div>
  );
}
