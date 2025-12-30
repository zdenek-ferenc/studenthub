    "use client";

    import React, { useState, useEffect } from 'react';
    import { useRouter } from 'next/navigation';
    import { ArrowLeft, Shield, Scale, ChevronUp } from 'lucide-react';

    export default function TermsPage() {
    const router = useRouter();
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
        if (window.scrollY > 400) {
            setShowScrollTop(true);
        } else {
            setShowScrollTop(false);
        }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
        
        <main className="max-w-3xl mx-auto px-4 pb-12 md:py-32">
            
            <header className="mb-12 text-center">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-[var(--barva-primarni)] transition-colors text-sm font-medium"
                >
                <ArrowLeft size={18} />
                Zpět
                </button>
                <div className="hidden md:flex items-center gap-2 text-gray-400 text-sm">
                <Shield size={14} />
                <span>Dokumentace RiseHigh</span>
                </div>
            </div>
            
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-[var(--barva-primarni)] mb-6 mt-4">
                <Scale size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--barva-tmava)] mb-4">
                Všeobecné obchodní podmínky
            </h1>
            <p className="text-xl text-gray-500 font-medium">Platformy RiseHigh</p>
            <div className="mt-6 inline-block bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 text-left shadow-sm">
                <p><strong>Účinnost od:</strong> 28. 12. 2025</p>
                <p className="mt-1"><strong>Provozovatel:</strong> Družstvo Virtigo, IČO: 22210458</p>
                <p className="text-gray-500 text-xs mt-1">
                se sídlem Kolejní 2906/4, Královo Pole, 612 00 Brno,<br/>
                zapsané v obchodním rejstříku vedeném u Krajského soudu v Brně pod sp. zn. Dr 5896
                </p>
            </div>
            </header>

            <article className="prose prose-blue prose-headings:text-[var(--barva-tmava)] prose-headings:font-bold text-gray-700 max-w-none space-y-12">

            <section>
                <h2 className="text-2xl border-b border-gray-200 pb-2 mb-6">ČLÁNEK I. ÚVODNÍ USTANOVENÍ A ABSOLUTNÍ VYLOUČENÍ SPOTŘEBITELE</h2>
                
                <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">1.1. Předmět a závazný právní režim</h3>
                    <p>
                    Tyto Všeobecné obchodní podmínky (dále jen &quot;VOP&quot;) komplexně upravují práva a povinnosti vznikající při užívání digitální platformy RiseHigh (dále jen &quot;Platforma&quot;).
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Charakter Platformy:</strong> Platforma je koncipována výhradně jako specializované B2B (Business-to-Business) a Professional tržiště. Neslouží k uspokojování osobních potřeb, nýbrž k propojování nabídky a poptávky v oblasti inovací, vývoje software, marketingu a náboru talentů.
                    </li>
                    <li>
                        <strong>Vyloučení spotřebitelského práva:</strong> Smluvní strany výslovně potvrzují, že vztahy založené těmito VOP se řídí zákonem č. 89/2012 Sb., občanský zákoník (dále jen &quot;NOZ&quot;), avšak s výslovným vyloučením ustanovení o ochraně spotřebitele (§ 1810 a násl. NOZ). Toto vyloučení je založeno na faktické povaze činnosti Uživatelů (výdělečná činnost, profesní rozvoj).
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">1.2. Status Uživatele a Prohlášení o profesionalitě</h3>
                    <p>
                    Registrací a každým přihlášením na Platformu Uživatel činí následující nevyvratitelná právní prohlášení, na která Provozovatel i ostatní Uživatelé spoléhají:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Student (Řešitel):</strong> Fyzická osoba, která vstupuje na Platformu. Prohlašuje, že jedná za účelem soustavné přípravy na své budoucí povolání, získávání odborné praxe a úplatného poskytování služeb. Student potvrzuje, že má dostatečné odborné znalosti k tomu, aby nebyl považován za slabší stranu ve smyslu § 433 NOZ, a je schopen samostatně posoudit ekonomická a právní rizika spojená s účastí ve Výzvách.
                    </li>
                    <li>
                        <strong>Startup (Zadavatel):</strong> Fyzická nebo právnická osoba jednající v rámci své podnikatelské činnosti. Startup odpovídá za to, že má oprávnění zadávat práci a disponuje prostředky k úhradě odměn.
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">1.3. Role Provozovatele (Limitace odpovědnosti)</h3>
                    <p>
                    Provozovatel poskytuje Platformu pouze jako technický prostředek (SaaS).
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Absence smluvního vztahu:</strong> Provozovatel není účastníkem smluv o dílo, licenčních smluv ani jiných dohod uzavřených mezi Studentem a Startupem.
                    </li>
                    <li>
                        <strong>Vyloučení garance:</strong> Provozovatel neodpovídá za (i) kvalitu, funkčnost či právní bezvadnost odevzdaných Řešení, (ii) platební neschopnost Startupu, ani (iii) pravdivost údajů uvedených Uživateli. Veškeré spory z Výzev řeší Uživatelé přímo mezi sebou.
                    </li>
                    </ul>
                </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl border-b border-gray-200 pb-2 mb-6">ČLÁNEK II. UŽIVATELSKÝ ÚČET, BEZPEČNOST A GAMIFIKACE</h2>
                
                <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1. Identifikace a prevence praní špinavých peněz (KYC/AML)</h3>
                    <p>
                    Vzhledem k tomu, že Platforma zprostředkovává finanční toky, podléhá regulaci.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Povinnost identifikace:</strong> Uživatel je povinen na vyžádání podstoupit proces identifikace (Know Your Customer) v souladu se zákonem č. 253/2008 Sb. (AML zákon) a požadavky platebního procesora (Stripe).
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2. Právní status Gamifikace (Virtual Items Policy)</h3>
                    <p>
                    Platforma motivuje uživatele prostřednictvím bodů (XP), úrovní (Levels) a grafů dovedností (Skill Radar).
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Nehmotná povaha:</strong> Tyto prvky jsou pouze informativními metadaty o aktivitě Uživatele. Nejedná se o elektronické peníze, cenné papíry, majetková práva ani virtuální měnu.
                    </li>
                    <li>
                        <strong>Nulová vymahatelnost:</strong> Uživatel nemá nárok na proplacení XP v penězích ani na jejich převod na jiný účet.
                    </li>
                    <li>
                        <strong>Právo na anulaci:</strong> Provozovatel si vyhrazuje výhradní právo (bez náhrady) smazat XP nebo snížit Level v případě, že zjistí pokus o manipulaci systému (tzv. farming), využívání botů nebo porušení VOP. Skill Radar negarantuje skutečnou odbornost studenta a Startup je povinen si schopnosti ověřit vlastním testem.
                    </li>
                    </ul>
                </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl border-b border-gray-200 pb-2 mb-6">ČLÁNEK III. VÝZVA, PRAVIDLA SPOLUPRÁCE A VZNIK SMLOUVY</h2>
                
                <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">3.1. Povaha Výzvy a Právo nevýběru</h3>
                    <p>
                    Vypsání Výzvy (Challenge) Startupem se právně kvalifikuje jako výzva k podání nabídky (invitatio ad offerendum) dle § 1780 NOZ, nikoliv jako veřejný příslib či veřejná soutěž.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Volnost rozhodování:</strong> Startup není povinen vybrat vítěze ani uzavřít smlouvu s žádným z účastníků, pokud předložená řešení neodpovídají jeho subjektivním požadavkům na kvalitu (s výjimkou ochranného mechanismu Kill Fee dle čl. 4.2).
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">3.2. Ochrana proti Švarcsystému (Zásadní doložka)</h3>
                    <p>
                    Platforma striktně slouží k dodávání výsledků (Díla), nikoliv k nájmu pracovní síly.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Zakázané znaky:</strong> Je přísně zakázáno, aby Startup ve Výzvě nebo v následné komunikaci vyžadoval znaky závislé práce, zejména: (a) dodržování pevné pracovní doby, (b) vztah nadřízenosti/podřízenosti, (c) výkon práce na pracovišti Startupu s jeho pomůckami, (d) vystupování jménem Startupu.
                    </li>
                    <li>
                        <strong>Indemnita (Odškodnění):</strong> Pokud orgány inspekce práce vyhodnotí vztah jako nelegální zaměstnávání z důvodu pokynů udělených Startupem, Startup se zavazuje uhradit veškeré pokuty a náklady řízení, a to i ty, které by byly vyměřeny Provozovateli jako zprostředkovateli.
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">3.3. Odevzdání Řešení a Generativní AI</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Závaznost odevzdání:</strong> Odesláním Řešení (Submission) Student činí neodvolatelný návrh na uzavření smlouvy.
                    </li>
                    <li>
                        <strong>AI Transparency:</strong> Student musí při odevzdání pravdivě označit, zda a v jakém rozsahu použil AI (ChatGPT, Midjourney aj.).
                    </li>
                    <li>
                        <strong>Doložka &quot;Waiver &amp; Delivery&quot;:</strong> Pokud Řešení vzniklo pomocí AI tak, že nesplňuje definici autorského díla (chybí jedinečná tvůrčí činnost autora), Student se zavazuje předat Startupu samotná data (výstup AI) a vzdává se jakýchkoli nároků na autorskou ochranu. Student garantuje, že užitím AI neporušil podmínky daného AI nástroje ani práva třetích osob.
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">3.4. Perfekce (Vznik) Smlouvy</h3>
                    <p>
                    K uzavření smlouvy mezi Studentem a Startupem nedochází odevzdáním práce, ale výlučně a teprve okamžikem, kdy Startup v rozhraní Platformy provede dvojí potvrzení:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-2">
                    <li>Označí Řešení statusem &quot;Vítěz&quot; (Winner); A</li>
                    <li>Potvrdí finální výběr tlačítkem (akceptace).</li>
                    </ol>
                    <p className="mt-2">
                    Do tohoto momentu nemá Student právní nárok na odměnu, a to ani v případě, že byl v průběhu hodnocení favoritem.
                    </p>
                </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl border-b border-gray-200 pb-2 mb-6">ČLÁNEK IV. FINANČNÍ PODMÍNKY, STRIPE CONNECT A DAC7</h2>
                
                <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1. Platební styk a role Stripe Connect</h3>
                    <p>
                    Provozovatel výslovně upozorňuje, že není poskytovatelem platebních služeb, nedrží bankovní licenci a nevstupuje do držby finančních prostředků určených pro Studenty (s výjimkou svých provizí).
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Stripe Connect:</strong> Veškeré finanční toky na Platformě jsou zajišťovány prostřednictvím služby Stripe Connect, kterou provozuje společnost Stripe Payments Europe, Ltd. (a její afilace).
                    </li>
                    <li>
                        <strong>Připojený účet:</strong> Aktivací možnosti přijímat platby Uživatel vstupuje do přímého smluvního vztahu se společností Stripe, který se řídí &quot;Stripe Connected Account Agreement&quot;. Uživatel tímto zmocňuje Provozovatele k zadávání technických pokynů jménem Uživatele vůči Stripe (např. pokyn k uvolnění platby vítězi, pokyn ke stržení provize).
                    </li>
                    <li>
                        <strong>Vyloučení odpovědnosti:</strong> Provozovatel neodpovídá za prodlení, technické výpadky nebo blokaci prostředků způsobenou přímo společností Stripe na základě jejich interních AML/Risk procesů.
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2. Povinný reporting příjmů (DAC7)</h3>
                    <p>
                    Uživatel bere na vědomí, že Provozovatel je tzv. oznamujícím provozovatelem platformy ve smyslu Směrnice Rady (EU) 2021/514 (DAC7) a související české legislativy o mezinárodní spolupráci při správě daní.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Sběr dat:</strong> Provozovatel je zákonem povinen shromažďovat, ověřovat a automaticky reportovat správci daně (Finanční správě) údaje o Prodejcích (Studentech), kteří přes Platformu realizují příjmy. Reportované údaje zahrnují zejména: jméno/název, adresu, IČO/DIČ, rodné číslo, číslo bankovního účtu a celkový objem vyplacených odměn.
                    </li>
                    <li>
                        <strong>Povinnost součinnosti:</strong> Uživatel je povinen na výzvu Platformy bezodkladně doplnit chybějící údaje (např. daňové rezidenství).
                    </li>
                    <li>
                        <strong>Sankce (Zmrazení výplat):</strong> Pokud Uživatel neposkytne požadované údaje pro DAC7 do 30 dnů od výzvy, nebo pokud uvede údaje zjevně nepravdivé, je Provozovatel oprávněn (a zákonem nucen) okamžitě zablokovat možnost vyplácení finančních prostředků na účet Uživatele a případně uzavřít jeho Uživatelský účet, a to až do doby zjednání nápravy. Uživatel nemá nárok na náhradu škody vzniklou tímto zákonným postupem.
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.3. Kill Fee (Ochrana proti zneužití)</h3>
                    <p>
                    Pokud Startup obdrží alespoň tři (3) Validní řešení a přesto nevybere vítěze do 14 dnů od konce Výzvy (nebo ji zruší), je povinen uhradit poplatek za zrušenou práci (Kill Fee) ve výši 30% z Prize Poolu.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Definice Validního řešení (Anti-Farming):</strong> Za Validní řešení se považuje pouze takové, které splňuje formální náležitostí (checklist) A SOUČASNĚ dosahuje minimální odborné úrovně obvyklé pro daný typ úkolu. Startup je oprávněn odmítnout řešení jako nevalidní (a nezapočítat jej do limitu pro Kill Fee), pokud vykazuje známky automatizovaného generování bez lidské revize, zjevné nedbalosti nebo neodpovídá zadání po obsahové stránce.
                    </li>
                    <li>
                        <strong>Rozdělení:</strong> 30% se dělí mezi autory Validních řešení.
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.4. Zneužití duševního vlastnictví (IP Theft)</h3>
                    <p>
                    Pokud Startup nevybere vítěze, jeho licence k hodnocení zaniká. Pokud však Startup v době 18 měsíců od ukončení Výzvy prokazatelně užije ve své činnosti unikátní prvky z nevybraného Řešení Studenta:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Smluvní pokuta:</strong> Startup se zavazuje zaplatit dotčenému Studentovi smluvní pokutu ve výši dvojnásobku (200%) původně stanovené Odměny (minimálně však 20.000 Kč).
                    </li>
                    <li>
                        <strong>Náhrada škody:</strong> Zaplacením pokuty není dotčeno právo Studenta na náhradu škody v plné výši přesahující smluvní pokutu.
                    </li>
                    </ul>
                </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl border-b border-gray-200 pb-2 mb-6">ČLÁNEK V. DUŠEVNÍ VLASTNICTVÍ (IP) A LICENČNÍ UJEDNÁNÍ</h2>
                
                <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">5.1. Dočasná licence pro hodnocení</h3>
                    <p>
                    Samotným nahráním Řešení uděluje Student Startupu nevýhradní, bezúplatnou licenci pouze pro účely interního posouzení a hodnocení v rámci výběrového řízení. Tato licence automaticky zaniká okamžikem, kdy Startup vybere jiného vítěze nebo Výzvu zruší.
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">5.2. Režim A: Finanční odměna (Převod s výhradou vlastnictví)</h3>
                    <p>
                    V případě Výzev s finanční odměnou se smluvní strany dohodly na převodu majetkových práv takto:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Odkládací podmínka:</strong> K převodu majetkových autorských práv k Dílu (rozmnožování, rozšiřování, sdělování veřejnosti, úpravy atd.) na Startup dochází až a výlučně okamžikem připsání Finanční odměny na virtuální účet Studenta u Stripe.
                    </li>
                    <li>
                        <strong>Důsledek:</strong> Pokud platba neproběhne, Startup nemá právo Dílo užít a Student zůstává jeho výlučným vlastníkem.
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">5.3. Režim B: Nefinanční odměna (Konverzní mechanismus)</h3>
                    <p>
                    Pokud je odměnou stáž či mentoring, práva přechází výběrem vítěze.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Anti-Ghosting pojistka:</strong> Pokud Startup neposkytne nefinanční plnění do 30 dnů (nebo v dohodnuté lhůtě), závazek poskytnout stáž zaniká a automaticky se mění (novuje) na peněžitý dluh. Výše dluhu odpovídá tržní hodnotě stáže uvedené ve Výzvě (pokud neuvedeno, platí fixní paušál 10.000 Kč). Tento dluh je splatný do 14 dnů.
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">5.4. Vyloučení neúměrného zkrácení (Bestseller Clause)</h3>
                    <p>
                    Vzhledem k rizikové povaze inovací (výsledek může mít nulovou, nebo miliardovou hodnotu) strany sjednávají, že smlouva má povahu smlouvy odvážné (§ 2756 NOZ).
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Vzdání se práv:</strong> Student prohlašuje, že sjednaná Odměna je konečná a výslovně se dle § 1794 odst. 2 NOZ vzdává práva napadnout platnost smlouvy pro neúměrné zkrácení (laesio enormis) i v případě hrubého nepoměru vzájemných plnění v budoucnu.
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">5.5. Zpětná licence pro portfolio (Portfolio Rights)</h3>
                    <p>
                    Jako výjimku z úplného převodu práv dle bodu 5.2 a 5.3, Startup tímto uděluje Studentovi nevýhradní, územně neomezenou, bezúplatnou a nepřenosnou licenci (tzv. zpětnou licenci) k užití odevzdaného Díla.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Účel užití:</strong> Licence je udělena výhradně za účelem osobní prezentace Studenta (tj. umístění do portfolia, CV, na osobní web, profil LinkedIn, Behance či GitHub) k demonstraci jeho dovedností.
                    </li>
                    <li>
                        <strong>Omezení (Safe Harbor pro Startup):</strong> Tato zpětná licence se nevztahuje na:
                        <ol className="list-decimal pl-5 mt-1 space-y-1">
                        <li>Jakékoli komerční užití (prodej Díla, sublicencování třetím stranám).</li>
                        <li>Užití těch částí Díla, které obsahují obchodní tajemství Startupu nebo jeho klientů (např. reálná klientská data, interní strategie, neveřejné API klíče), ledaže Student tato data anonymizuje.</li>
                        </ol>
                    </li>
                    <li>
                        <strong>Reference:</strong> Student je oprávněn uvádět jméno Startupu jako referenci, pokud Startup ve Výzvě výslovně nestanovil režim utajení (NDA).
                    </li>
                    </ul>
                </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl border-b border-gray-200 pb-2 mb-6">ČLÁNEK VI. DANĚ A SELF-BILLING (FAKTURACE)</h2>
                
                <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">6.1. Dohoda o vyhotovení dokladů (Self-billing)</h3>
                    <p>
                    Pro zjednodušení administrativy a automatizaci procesů Student v souladu s § 28 odst. 5 zákona č. 235/2004 Sb., o dani z přidané hodnoty, v platném znění, zmocňuje Provozovatele (resp. jeho technického partnera) k vystavování daňových dokladů za poskytnuté služby jménem Studenta a na jeho účet.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Povinnost pravdivosti údajů:</strong> Podkladem pro vystavení dokladu jsou výhradně data zadaná Studentem. Student se zavazuje udržovat ve svém profilu pravdivé, úplné a aktuální identifikační údaje, zejména své identifikační číslo (IČO), daňové identifikační číslo (DIČ) a v případě fyzických osob nepodnikajících pod IČO i rodné číslo, je-li nezbytné pro jednoznačnou daňovou identifikaci.
                    </li>
                    <li>
                        <strong>Fikce schválení:</strong> Doklad vystavený Platformou se považuje za Studentem výslovně schválený, pokud Student nevznese písemnou námitku proti jeho správnosti do 3 pracovních dnů od jeho zpřístupnění v profilu.
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">6.2. Daňová a majetková odpovědnost (Absolutní Indemnita)</h3>
                    <p>
                    Student bere na vědomí, že příjem z Platformy je předmětem daně z příjmů, případně DPH, a že Provozovatel za něj daně neodvádí.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                        <strong>Výlučná odpovědnost:</strong> Za správnost zadaného DIČ, IČO a rodného čísla odpovídá výlučně Student. Pokud Student uvede chybné, cizí nebo neplatné identifikační údaje, nebo neoznámí změnu svého statusu (např. že se stal plátcem DPH), nese veškeré právní důsledky s tím spojené.
                    </li>
                    <li>
                        <strong>Náhrada škody:</strong> Pokud Finanční úřad nebo jiný orgán vyměří Provozovateli nebo Startupu jakoukoli sankci, penále nebo doměrek daně z důvodu uvedení nesprávných údajů Studentem, Student se zavazuje tuto škodu v plné výši nahradit do 7 dnů od výzvy, a to včetně nákladů na právní zastoupení.
                    </li>
                    </ul>
                </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl border-b border-gray-200 pb-2 mb-6">ČLÁNEK VII. ZÁVĚREČNÁ USTANOVENÍ</h2>
                
                <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">7.1. Změny podmínek</h3>
                    <p>
                    Provozovatel je oprávněn VOP měnit v přiměřeném rozsahu (§ 1752 NOZ). Změnu oznámí e-mailem 14 dní předem. Pokud Uživatel účet nezruší, má se za to, že nové znění přijal.
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">7.2. Rozhodné právo a Prorogace</h3>
                    <p>
                    Vztahy se řídí českým právem. Pro řešení sporů se sjednává výlučná místní příslušnost obecného soudu Provozovatele (Městský soud v Brně, resp. Krajský soud v Brně) s vyloučením kolizních norem. Toto ujednání je platné, neboť strany jednají jako podnikatelé (§ 89a o.s.ř.).
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">7.3. Salvátorská klauzule</h3>
                    <p>
                    Je-li některé ustanovení neplatné, ostatní zůstávají v platnosti. Strany nahradí neplatné ustanovení takovým, které se nejvíce blíží jeho ekonomickému účelu.
                    </p>
                </div>
                </div>
            </section>

            </article>

            <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>© 2025 RiseHigh. Všechna práva vyhrazena.</p>
            </div>
        </main>

        <button 
            onClick={scrollToTop}
            className={`fixed left-6 bottom-28 z-50 p-3 text-white backdrop-blur-sm bg-[var(--barva-primarni)] rounded-full shadow-lg md:hidden transition-all duration-300 transform hover:scale-110 active:scale-95 ${
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
            aria-label="Zpět nahoru"
        >
            <ChevronUp size={24} />
        </button>

        </div>
    );
    }