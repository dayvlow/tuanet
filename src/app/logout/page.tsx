import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LogoutPage() {
    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 selection:bg-brand selection:text-black">
            <Section className="max-w-3xl mx-auto text-center">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic">Вы вышли</h1>
                <p className="text-2xl text-white/60 mt-6">Если нужно вернуться, войди снова.</p>
                <div className="mt-10">
                    <Link
                        href="/account"
                        className={cn(
                            buttonVariants({ variant: "brand", size: "lg" }),
                            "h-16 px-12 rounded-3xl uppercase tracking-widest text-sm font-bold"
                        )}
                    >
                        Войти
                    </Link>
                </div>
            </Section>
        </div>
    );
}
