import { buttonVariants } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NotFound() {
    return (
        <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center px-6 selection:bg-brand selection:text-black">
            <Section
                container={false}
                className="flex flex-col items-center justify-center text-center"
            >
                <Reveal>
                    <h1 className="text-9xl md:text-[12rem] font-black tracking-tighter uppercase italic mb-8">404</h1>
                    <h2 className="text-5xl font-black uppercase tracking-tight mb-8">Страница не найдена</h2>
                    <p className="text-2xl text-white/60 font-medium max-w-2xl mx-auto mb-16">
                        Она либо переехала, либо никогда не существовала.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                        <Link
                            href="/"
                            className={cn(
                                buttonVariants({ variant: "brand", size: "lg" }),
                                "uppercase tracking-widest text-lg h-20 px-12 rounded-3xl font-black shadow-2xl"
                            )}
                        >
                            На главную
                        </Link>
                        <Link
                            href="/help"
                            className={cn(
                                buttonVariants({ variant: "outline", size: "lg" }),
                                "uppercase tracking-widest text-lg h-20 px-12 rounded-3xl border-2"
                            )}
                        >
                            Помощь
                        </Link>
                    </div>
                </Reveal>
            </Section>
        </div>
    );
}
