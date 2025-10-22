// src/components/GDPRModal.tsx
"use client";
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

const GDPRContent = () => (
    <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
        <div>
            <h3 className="text-lg font-semibold text-[var(--barva-tmava)] mb-2">1. Úvod a Totožnost Správce</h3>
            <p>
                Vítejte na platformě RiseHigh. Ochrana vašich osobních údajů je pro nás prioritou. Tyto Zásady ochrany osobních údajů (dále jen Zásady) vysvětlují, jaké osobní údaje o vás shromažďujeme, proč je shromažďujeme, jak je používáme a jaká jsou vaše práva.
            </p>
            <p>Správcem vašich osobních údajů je:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Název společnosti:</strong> Družstvo Virtigo</li>
                <li><strong>IČO:</strong> 22210458</li>
                <li><strong>Sídlo:</strong> Kolejní 2906/4, Královo Pole, 612 00 Brno</li>
                <li><strong>Kontaktní e-mail:</strong> podpora@risehigh.io</li>
                <li><strong>Pověřenec pro GDPR (DPO):</strong> gdpr@risehigh.io</li>
            </ul>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-[var(--barva-tmava)] mb-2">2. Jaké Osobní Údaje Shromažďujeme</h3>
            <p>Shromažďujeme odlišné kategorie údajů v závislosti na tom, zda vystupujete jako Talent nebo jako Startup.</p>
            <h4 className='font-semibold mt-3 mb-1'>Pro uživatele z kategorie <strong>Talent</strong>:</h4>
            <ul className='list-disc pl-5 space-y-1'>
                <li><strong>Registrační údaje:</strong> Jméno, příjmení, e-mailová adresa, heslo.</li>
                <li><strong>Profilové údaje:</strong> Profilová fotografie (volitelně), životopis (CV - volitelně), odkazy na externí profily (LinkedIn, GitHub, Dribbble, osobní web - volitelně), popis (bio), dovednosti, jazyky, dosažené vzdělání a portfolio (dokončené výzvy).</li>
                <li><strong>Uživatelem generovaný obsah:</strong> Řešení výzev, které odevzdáváte (odkazy, soubory, texty), komentáře k řešení, dotazy Startupům.</li>
            </ul>
            <h4 className='font-semibold mt-3 mb-1'>Pro uživatele z kategorie <strong>Startup</strong>:</h4>
            <ul className='list-disc pl-5 space-y-1'>
                <li><strong>Registrační údaje:</strong> Jméno a příjmení kontaktní osoby, pracovní e-mailová adresa, heslo.</li>
                <li><strong>Firemní údaje:</strong> Název společnosti, IČO (volitelně), webová stránka (volitelně), adresa sídla (volitelně), logo (volitelně), popis firmy, kategorie firmy, používané technologie (volitelně), popis ideálního kandidáta (volitelně).</li>
                <li><strong>Uživatelem generovaný obsah:</strong> Znění a popis zveřejněných výzev, zpětná vazba a hodnocení odevzdaných řešení, odpovědi na dotazy talentů.</li>
            </ul>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-[var(--barva-tmava)] mb-2">3. Účely a Právní Základy Zpracování</h3>
            <p className='pb-2'>Každé zpracování vašich údajů má svůj jasný účel a opírá se o právní základ v souladu s GDPR.</p>
            <div className="overflow-x-auto text-xs">
                <table className="min-w-full border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-2 px-3 text-left border-b bg-[var(--barva-primarni)]/15">Účel Zpracování</th>
                            <th className="py-2 px-3 text-left border-b bg-[var(--barva-svetle-pozadi)]">Právní základ (GDPR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="py-2 px-3"><strong>Poskytování a správa služeb platformy</strong> (registrace, profily, výzvy, komunikace, hodnocení, XP systém)</td>
                            <td className="py-2 px-3">Čl. 6 odst. 1 písm. b) – Plnění smlouvy</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3"><strong>Zlepšování a personalizace služeb</strong> (analýza používání pro lepší UX, doporučování výzev)</td>
                            <td className="py-2 px-3">Čl. 6 odst. 1 písm. f) – Oprávněný zájem</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3"><strong>Marketingová komunikace</strong> (newslettery, relevantní nabídky - pokud udělíte souhlas)</td>
                            <td className="py-2 px-3">Čl. 6 odst. 1 písm. a) – Váš souhlas</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3"><strong>Bezpečnost a ochrana platformy</strong> (prevence podvodů, zabezpečení účtů)</td>
                            <td className="py-2 px-3">Čl. 6 odst. 1 písm. f) – Oprávněný zájem</td>
                        </tr>
                        <tr>
                            <td className="py-2 px-3"><strong>Plnění zákonných povinností</strong> (např. účetnictví v případě odměn)</td>
                            <td className="py-2 px-3">Čl. 6 odst. 1 písm. c) – Zákonná povinnost</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-[var(--barva-tmava)] mb-2">4. Praktické Využití Vašich Údajů</h3>
            <p>Vaše údaje používáme výhradně k zajištění funkčnosti a rozvoje platformy StudentHub.</p>
            <ul className='list-disc pl-5 space-y-1 mt-2'>
                <li><strong>Pro Studenty:</strong> Váš profil (jméno, příjmení, username, bio, vzdělání, dovednosti, jazyky, level, odkazy, portfolio - pokud je zveřejněno) je viditelný pro přihlášené Startupy. Vaše odevzdaná řešení jsou přístupná (anonymně až do vyhlášení výsledků) Startupům, u kterých se ucházíte o vyřešení výzvy.</li>
                <li><strong>Pro Startupy:</strong> Vámi zveřejněné výzvy a profil vaší společnosti jsou viditelné pro přihlášené Studenty. Vaše zpětná vazba je viditelná pro Talent, který řešení odevzdal. Váš popis ideálního kandidáta a Q&A sekce jsou viditelné na vašem profilu.</li>
            </ul>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-[var(--barva-tmava)] mb-2">5. Komu Poskytujeme Vaše Údaje</h3>
            <p>Vaše osobní údaje chráníme, ale pro zajištění funkčnosti platformy je můžeme poskytnout následujícím kategoriím příjemců:</p>
            <ul className='list-disc pl-5 space-y-1 mt-2'>
                <li><strong>Druhá strana na platformě:</strong> Jak je popsáno v bodě 4.</li>
                <li><strong>Poskytovatelé infrastruktury:</strong> Využíváme Supabase pro databázi, autentizaci, ukládání souborů a backendové funkce. Supabase je vázán standardními smluvními doložkami EU pro ochranu dat.</li>
                <li><strong>Analytické a marketingové nástroje:</strong> Aktuálně nevyužíváme externí nástroje, které by zpracovávaly osobní údaje nad rámec nezbytných cookies.</li>
                <li><strong>Orgány veřejné moci:</strong> V případě zákonné povinnosti můžeme vaše údaje poskytnout orgánům činným v trestním řízení nebo jiným orgánům veřejné moci.</li>
            </ul>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-[var(--barva-tmava)] mb-2">6. Doba Uchovávání Údajů</h3>
            <p>Osobní údaje uchováváme jen po dobu nezbytně nutnou ke splnění účelu, pro který byly získány.</p>
            <ul className='list-disc pl-5 space-y-1 mt-2'>
                <li><strong>Profilové a registrační údaje:</strong> Uchováváme je po celou dobu trvání vaší aktivní registrace na platformě.</li>
                <li><strong>Uživatelský obsah (řešení, výzvy, komunikace):</strong> Zůstává na platformě i po deaktivaci účtu, pokud není explicitně požádáno o smazání (a pokud to není v rozporu s oprávněnými zájmy druhé strany, např. historie pro Startup).</li>
                <li><strong>Po zrušení účtu:</strong> Základní identifikační údaje můžeme uchovávat po dobu 3 let z důvodu ochrany našich oprávněných zájmů (pro případné právní spory). Po uplynutí této lhůty jsou údaje anonymizovány nebo bezpečně smazány.</li>
                <li><strong>Zákonné povinnosti:</strong> Údaje nutné pro plnění zákonných povinností (např. účetnictví) uchováváme po dobu stanovenou příslušnými právními předpisy.</li>
            </ul>
        </div>

        {/* Sekce 7: Vaše Práva Podle GDPR */}
        <div>
            <h3 className="text-lg font-semibold text-[var(--barva-tmava)] mb-2">7. Vaše Práva Podle GDPR</h3>
            <p>Jako subjekt údajů máte následující práva:</p>
            <ul className='list-disc pl-5 space-y-1 mt-2'>
                <li><strong>Právo na přístup</strong> (čl. 15 GDPR): Získat od nás potvrzení a přístup k vašim údajům.</li>
                <li><strong>Právo na opravu</strong> (čl. 16 GDPR): Opravit nesprávné a doplnit neúplné osobní údaje (většinu údajů můžete upravit přímo ve svém profilu).</li>
                <li><strong>Právo na výmaz (právo být zapomenut)</strong> (čl. 17 GDPR): Nechat smazat vaše údaje, pokud již nejsou potřebné, odvoláte souhlas, nebo vznesete námitku proti zpracování a neexistují převažující oprávněné důvody.</li>
                <li><strong>Právo na omezení zpracování</strong> (čl. 18 GDPR): Omezit zpracování, například pokud zpochybníte správnost údajů.</li>
                <li><strong>Právo na přenositelnost údajů</strong> (čl. 20 GDPR): Získat vaše údaje ve strojově čitelném formátu (na vyžádání).</li>
                <li><strong>Právo vznést námitku</strong> (čl. 21 GDPR): Vznést námitku proti zpracování na základě našeho oprávněného zájmu.</li>
                <li><strong>Právo odvolat souhlas:</strong> Pokud je zpracování založeno na vašem souhlasu (např. marketing), můžete jej kdykoli odvolat.</li>
                <li><strong>Právo podat stížnost:</strong> Pokud se domníváte, že zpracování vašich údajů je v rozporu s GDPR, máte právo podat stížnost u dozorového orgánu, kterým je Úřad pro ochranu osobních údajů České republiky (<a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer" className="text-[var(--barva-primarni)] underline">www.uoou.cz</a>).</li>
            </ul>
            <p className="mt-2">Svá práva můžete uplatnit kontaktováním nás na e-mailu <a href="mailto:gdpr@risehigh.io" className="text-[var(--barva-primarni)] font-semibold">gdpr@risehigh.io</a>.</p>
        </div>

        {/* Sekce 8: Zabezpečení Údajů */}
        <div>
            <h3 className="text-lg font-semibold text-[var(--barva-tmava)] mb-2">8. Zabezpečení Údajů</h3>
            <p>Přijímáme přiměřená technická a organizační opatření k ochraně vašich osobních údajů před ztrátou, zneužitím, neoprávněným přístupem, zveřejněním, úpravou nebo zničením. Využíváme zabezpečení poskytované platformou Supabase, včetně šifrování hesel a zabezpečeného ukládání dat.</p>
        </div>

        {/* Sekce 9: Soubory Cookies */}
        <div>
            <h3 className="text-lg font-semibold text-[var(--barva-tmava)] mb-2">9. Soubory Cookies</h3>
            <p>Naše webové stránky používají soubory cookies k zajištění funkčnosti a analýze návštěvnosti.</p>
            <ul className='list-disc pl-5 space-y-1 mt-2'>
                <li><strong>Nezbytné cookies:</strong> Jsou potřeba pro základní funkčnost stránky, zejména pro správu přihlášení (session cookies spravované Supabase Auth). Bez nich nelze platformu používat.</li>
                <li><strong>Analytické a marketingové cookies:</strong> Aktuálně nevyužíváme cookies třetích stran pro tyto účely. Pokud bychom je v budoucnu zavedli, budeme k jejich použití vyžadovat váš aktivní souhlas prostřednictvím cookie lišty.</li>
            </ul>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-[var(--barva-tmava)] mb-2">10. Závěrečná ustanovení</h3>
            <p>
                Tyto Zásady můžeme čas od času aktualizovat, například v reakci na změny legislativy nebo funkcí platformy. O podstatných změnách vás budeme informovat (např. e-mailem nebo oznámením na platformě).
            </p>
            <p className="mt-2">
                Pokud máte jakékoli dotazy týkající se ochrany vašich osobních údajů, neváhejte nás kontaktovat na <a href="mailto:gdpr@risehigh.io" className="text-[var(--barva-primarni)] font-semibold">gdpr@risehigh.io</a>.
            </p>
        </div>
    </div>
);

type GDPRModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function GDPRModal({ isOpen, onClose }: GDPRModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* První Transition.Child pro backdrop */}
        <Transition.Child
          // Odstraněno: as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Druhý Transition.Child pro panel */}
            <Transition.Child
              // Odstraněno: as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                   <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                    Zásady ochrany osobních údajů
                   </Dialog.Title>
                   <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                     <X size={20} />
                   </button>
                </div>
                <div className="mt-2 max-h-[75vh] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
                  <GDPRContent />
                </div>
                <div className="mt-6 pt-4 border-t flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-transparent bg-[var(--barva-primarni)] px-6 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Rozumím a zavřít
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}