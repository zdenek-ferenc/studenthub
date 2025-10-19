"use client";

import { ShieldCheck, User, Database, Share2, Lock, FileText, Cookie, Mail, Calendar, Briefcase, GitBranch } from 'lucide-react';
import ScrollAnimator from '../../components/ScrollAnimator';

const Section = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
<ScrollAnimator delay={100} className="mb-10">
    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
    <div className="hidden md:flex flex-shrink-0 w-12 h-12 bg-white rounded-xl items-center justify-center shadow-md border border-gray-100">
        <Icon className="w-7 h-7 text-[var(--barva-primarni)]" />
    </div>
    <div className="flex-1">
        <h2 className="text-2xl font-bold text-[var(--barva-tmava)] mb-2">{title}</h2>
        <div className="prose prose-lg text-sm md:text-base leading-relaxed text-gray-700 max-w-none">
        {children}
        </div>
    </div>
    </div>
</ScrollAnimator>
);

export default function PrivacyPolicyPage() {
return (
    <div className="bg-[var(--barva-svetle-pozadi)] py-10 md:py-32">
    <div className="container mx-auto px-4 max-w-4xl">
        
        <ScrollAnimator>
        <div className="text-center mb-6 md:mb-16">
            <ShieldCheck className="w-16 h-16 mx-auto text-[var(--barva-primarni)] mb-4" />
            <h1 className="text-2xl md:text-5xl font-bold text-[var(--barva-tmava)]">Zásady Ochrany Osobních Údajů</h1>
            <p className="text-gray-500 mt-2">Platnost od: 19. října 2025</p>
        </div>
        </ScrollAnimator>

        <Section title="1. Úvod a Totožnost Správce" icon={User}>
        <p>
            Vítejte na platformě RiseHigh. Ochrana vašich osobních údajů je pro nás prioritou. Tyto Zásady ochrany osobních údajů (dále jen Zásady) vysvětlují, jaké osobní údaje o vás shromažďujeme, proč je shromažďujeme, jak je používáme a jaká jsou vaše práva.
        </p>
        <p>Správcem vašich osobních údajů je:</p>
        <ul>
            <li><strong>Název společnosti:</strong> Družstvo Virtigo</li>
            <li><strong>IČO:</strong> 22210458</li>
            <li><strong>Sídlo:</strong> Kolejní 2906/4, Královo Pole, 612 00 Brno</li>
            <li><strong>Kontaktní e-mail:</strong> podpora@risehigh.io</li>
            <li><strong>Pověřenec pro GDPR (DPO):</strong> gdpr@risehigh.io</li>
        </ul>
        </Section>

        <Section title="2. Jaké Osobní Údaje Shromažďujeme" icon={Database}>
        <p>Shromažďujeme odlišné kategorie údajů v závislosti na tom, zda vystupujete jako &quot;Talent&quot; nebo jako &quot;Startup&quot;.</p>
        <h4 className='pt-2 mt-2'>Pro uživatele z kategorie <strong>Talent</strong>:</h4>
        <ul className='pt-2 space-y-2'>
            <li><strong>Registrační údaje:</strong> Jméno, příjmení, e-mailová adresa, heslo.</li>
            <li><strong>Profilové údaje:</strong> Profilová fotografie, životopis (CV), odkazy na externí profily (LinkedIn, GitHub), popis dovedností, dosažené vzdělání a portfolio vytvořené na platformě.</li>
            <li><strong>Uživatelem generovaný obsah:</strong> Řešení výzev, které odevzdáváte (soubory, texty, zdrojové kódy, grafické návrhy), komentáře a veškerá komunikace se Startupy prostřednictvím interní komunikační platformy.</li>
        </ul>
        <h4 className='pt-4 mt-2'>Pro uživatele z kategorie <strong>Startup</strong>:</h4>
        <ul className='pt-2 space-y-2'>
            <li><strong>Registrační údaje:</strong> Jméno a příjmení kontaktní osoby, pracovní e-mailová adresa, heslo.</li>
            <li><strong>Firemní údaje:</strong> Název společnosti, IČO, adresa sídla.</li>
            <li><strong>Uživatelem generovaný obsah:</strong> Znění a popis zveřejněných výzev, zpětná vazba a hodnocení odevzdaných řešení a veškerá komunikace s Talenty prostřednictvím interní komunikační platformy.</li>
        </ul>
        </Section>
        
        <Section title="3. Účely a Právní Základy Zpracování" icon={GitBranch}>
            <p className='pb-2'>Každé zpracování vašich údajů má svůj jasný účel a opírá se o právní základ v souladu s GDPR.</p>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-2 px-4 text-left">Účel Zpracování</th>
                            <th className="py-2 px-4 text-left">Právní základ (GDPR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="py-3 px-4"><strong>Poskytování a správa služeb platformy</strong> (registrace, profily, výzvy, komunikace)</td>
                            <td className="py-3 px-4">Čl. 6 odst. 1 písm. b) – Plnění smlouvy</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-3 px-4"><strong>Zlepšování a personalizace služeb</strong> (analýza používání pro lepší UX)</td>
                            <td className="py-3 px-4">Čl. 6 odst. 1 písm. f) – Oprávněný zájem</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-3 px-4"><strong>Marketingová komunikace</strong> (newslettery, relevantní nabídky)</td>
                            <td className="py-3 px-4">Čl. 6 odst. 1 písm. a) – Váš souhlas</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-3 px-4"><strong>Bezpečnost a ochrana platformy</strong> (prevence podvodů)</td>
                            <td className="py-3 px-4">Čl. 6 odst. 1 písm. f) – Oprávněný zájem</td>
                        </tr>
                        <tr>
                            <td className="py-3 px-4"><strong>Plnění zákonných povinností</strong> (účetnictví, daně)</td>
                            <td className="py-3 px-4">Čl. 6 odst. 1 písm. c) – Zákonná povinnost</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Section>
        
        <Section title="4. Praktické Využití Vašich Údajů" icon={Briefcase}>
            <p>Vaše údaje používáme výhradně k zajištění funkčnosti a rozvoje platformy StudentHub.</p>
            <ul className='py-4 space-y-2'>
                <li><strong>Pro Talenty:</strong> Váš profil (včetně CV, dovedností a portfolia) a odevzdaná řešení jsou zpřístupněna Startupům, u kterých se ucházíte o vyřešení výzvy, aby mohly posoudit vaše schopnosti.</li>
                <li><strong>Pro Startupy:</strong> Vámi zveřejněné výzvy a profil vaší společnosti jsou viditelné pro Talenty, aby se mohli o řešení ucházet. Vaše zpětná vazba je viditelná pro Talenta, který řešení odevzdal.</li>
            </ul>
        </Section>

        <Section title="5. Komu Poskytujeme Vaše Údaje" icon={Share2}>
        <p>Vaše osobní údaje chráníme, ale pro zajištění funkčnosti platformy je můžeme poskytnout následujícím kategoriím příjemců:</p>
        <ul className='py-4 space-y-2'>
            <li><strong>Druhá strana na platformě:</strong> Startupy mají přístup k profilovým údajům a řešením Talentů, kteří reagují na jejich výzvy. Talenti vidí profilové informace Startupů, které zveřejnily výzvy.</li>
            <li><strong>Poskytovatelé infrastruktury:</strong> Využíváme externí dodavatele pro hosting našich serverů a databází (Supabase, AWS, Google Cloud), kteří jsou vázáni přísnými smlouvami o zpracování údajů.</li>
            <li><strong>Analytické a marketingové nástroje:</strong> Pro analytiku návštěvnosti můžeme použít nástroje jako Google Analytics (primárně s anonymizovanými daty). Pro marketingové nástroje vyžadujeme váš souhlas.</li>
            <li><strong>Orgány veřejné moci:</strong> V případě zákonné povinnosti můžeme vaše údaje poskytnout orgánům činným v trestním řízení nebo jiným orgánům veřejné moci.</li>
        </ul>
        </Section>

        <Section title="6. Doba Uchovávání Údajů" icon={Calendar}>
        <p>Osobní údaje uchováváme jen po dobu nezbytně nutnou ke splnění účelu, pro který byly získány.</p>
            <ul className='py-4 space-y-2'>
                <li><strong>Profilové a registrační údaje:</strong> Uchováváme je po celou dobu trvání vaší registrace na platformě.</li>
                <li><strong>Po zrušení účtu:</strong> Vaše údaje můžeme uchovávat po dobu 3 let z důvodu ochrany našich oprávněných zájmů (pro případné právní spory). Po uplynutí této lhůty jsou údaje anonymizovány nebo bezpečně smazány.</li>
                <li><strong>Zákonné povinnosti:</strong> Údaje, které musíme uchovávat na základě zákona (např. účetní doklady), uchováváme po dobu stanovenou příslušnými právními předpisy (např. 10 let).</li>
            </ul>
        </Section>

        <Section title="7. Vaše Práva Podle GDPR" icon={FileText}>
            <p>Jako subjekt údajů máte následující práva:</p>
            <ul className='py-4 space-y-2'>
                <li><strong>Právo na přístup</strong> (čl. 15 GDPR): Získat od nás potvrzení a přístup k vašim údajům.</li>
                <li><strong>Právo na opravu</strong> (čl. 16 GDPR): Opravit nesprávné a doplnit neúplné osobní údaje.</li>
                <li><strong>Právo na výmaz (`&quot;právo být zapomenut`&quot;)</strong> (čl. 17 GDPR): Nechat smazat vaše údaje, pokud již nejsou potřebné nebo pokud odvoláte souhlas.</li>
                <li><strong>Právo na omezení zpracování</strong> (čl. 18 GDPR): Omezit zpracování, například pokud zpochybníte správnost údajů.</li>
                <li><strong>Právo na přenositelnost údajů</strong> (čl. 20 GDPR): Získat vaše údaje ve strojově čitelném formátu.</li>
                <li><strong>Právo vznést námitku</strong> (čl. 21 GDPR): Vznést námitku proti zpracování na základě našeho oprávněného zájmu.</li>
                <li><strong>Právo podat stížnost:</strong> Pokud se domníváte, že zpracování vašich údajů je v rozporu s GDPR, máte právo podat stížnost u dozorového orgánu, kterým je Úřad pro ochranu osobních údajů České republiky (www.uoou.cz).</li>
            </ul>
        </Section>

        <Section title="8. Zabezpečení Údajů" icon={Lock}>
        <p>Přijímáme přiměřená technická a organizační opatření k ochraně vašich osobních údajů, včetně šifrování, pseudonymizace, pravidelného zálohování a řízení přístupů.</p>
        </Section>

        <Section title="9. Soubory Cookies" icon={Cookie}>
        <p>Naše webové stránky používají soubory cookies k zajištění funkčnosti, analýze návštěvnosti a personalizaci obsahu.</p>
            <ul className='py-4 space-y-2'>
                <li><strong>Nezbytné cookies:</strong> Jsou potřeba pro základní funkčnost stránky (např. přihlášení).</li>
                <li><strong>Analytické a marketingové cookies:</strong> Na jejich použití potřebujeme váš aktivní souhlas, který můžete spravovat prostřednictvím cookie lišty.</li>
            </ul>
        </Section>

        <Section title="10. Závěrečná ustanovení" icon={Mail}>
        <p>
            Tyto Zásady můžeme čas od času aktualizovat. O podstatných změnách vás budeme informovat. Aktuální verze je vždy dostupná na naší webové stránce. Pokud máte jakékoli dotazy, kontaktujte nás na <a href="mailto:gdpr@risehigh.io" className="text-[var(--barva-primarni)] font-semibold">gdpr@risehigh.io</a>.
        </p>
        </Section>

    </div>
    </div>
);
}