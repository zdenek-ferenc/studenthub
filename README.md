# StudentHUB: Platforma pro praxi a talenty

**StudentHUB je moderní webová platforma, která propojuje inovativní startupy s talentovanými studenty skrze reálné businessové výzvy. Cílem je poskytnout studentům cennou praxi a startupům přístup k novým talentům a svěžím nápadům.**

---

## ✨ Klíčové funkce

Platforma nabízí oddělené, na míru šité rozhraní pro dva typy uživatelů:

### Pro Studenty 🎓
* **Objevování výzev**: Pokročilé filtrování a řazení výzev podle dovedností, odměny nebo termínu.
* **Tvorba portfolia**: Každá dokončená výzva se automaticky přidává do profilu studenta jako reference.
* **Interaktivní profily**: Možnost prezentovat své dovednosti, vzdělání a jazyky.
* **Proces odevzdání**: Jednoduché nahrávání řešení a přidávání komentářů k práci.
* **Férová zpětná vazba**: Každé řešení je startupem ohodnoceno a okomentováno.

### Pro Startupy 🚀
* **Správa životního cyklu výzvy**: Jednoduchý formulář pro vytvoření výzvy, její správu a finální uzavření.
* **Katalog talentů**: Možnost procházet profily studentů a filtrovat je podle specifických dovedností.
* **Anonymní hodnocení**: Proces hodnocení je plně anonymizovaný, což zajišťuje objektivitu a soustředění na kvalitu práce.
* **Výběr vítězů**: Intuitivní drag-and-drop rozhraní pro výběr a seřazení vítězných řešení.
* **Automatizované notifikace**: Systém upozornění na blížící se termíny a výzvy vyžadující pozornost.

---

## 🛠️ Použité technologie

Projekt je postaven na moderním a efektivním technologickém stacku:

* **Framework**: [Next.js](https://nextjs.org/) (React)
* **Jazyk**: [TypeScript](https://www.typescriptlang.org/)
* **Backend & Databáze**: [Supabase](https://supabase.io/) (PostgreSQL, Auth, Storage)
* **Stylování**: [Tailwind CSS](https://tailwindcss.com/)
* **Stavový management**: React Context API
* **Animace**: [Framer Motion](https://www.framer.com/motion/)
* **UI Komponenty**: [Headless UI](https://headlessui.dev/)

---

## 🚀 Zprovoznění projektu

Pro spuštění lokální verze aplikace postupujte následovně:

### 1. Instalace závislostí

```bash
npm install
```

### 2. Konfigurace prostředí

Vytvořte v kořenovém adresáři soubor .env.local a vložte do něj klíče ze svého Supabase

```bash
NEXT_PUBLIC_SUPABASE_URL=[https://xxxxxxxx.supabase.co](https://xxxxxxxx.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxxxxxxx
```

### 2. Spuštění vývojového serveru

```bash
npm run dev
```

## 📁 Struktura projektu

```bash
/src
├── /app/          # Všechny stránky a routy (Next.js App Router)
│   ├── /(api)/    # API routes
│   ├── /challenges/
│   ├── /profile/
│   └── ...
├── /components/   # Znovupoužitelné React komponenty (karty, modály, ...)
├── /contexts/     # React Contexty pro globální stav (Auth, Data, ...)
├── /hooks/        # Vlastní React hooky (např. useDebounce)
├── /lib/          # Pomocné funkce a inicializace klientů (supabaseClient)
└── /styles/       # Globální CSS styly
```

## 🔮 Možná budoucí vylepšení

Aplikace má solidní základ, ale existuje zde prostor pro další rozvoj:

Robustní Error Handling: Implementace globálních Error Boundaries a centrálního systému pro ošetření chyb z API.

Testování: Přidání jednotkových (Jest, RTL) a E2E testů (Cypress, Playwright) pro zajištění stability.

Refaktorizace a DRY: Sjednocení podobných komponent (např. SkillSelector, CategorySelector) do jedné generické.

Optimalizace datových dotazů: Využití databázových VIEW pro předpočítání statistik a zrychlení načítání seznamů.