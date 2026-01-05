    // src/types/academic.ts

    export type AcademicRequestStatus = 'open' | 'matched' | 'closed' | 'draft';

    // --- NOVÉ DEFINICE PRO PROJEKTY ---

    export type ProjectTypeKey = 
    | 'marketing_strategy'
    | 'market_research'
    | 'brand_identity'
    | 'social_media'
    | 'software_development'
    | 'web_development'
    | 'mobile_app'
    | 'ux_ui_design'
    | 'data_analysis'
    | 'business_plan'
    | 'custom';

    export interface ProjectTypeDefinition {
    type: ProjectTypeKey;
    title: string;
    description?: string;
    defaultDeliverables: string[];
    }

    // Struktura JSON objektu uloženého v DB v sloupci project_types
    export interface ProjectDefinition {
    type: ProjectTypeKey;
    custom_title?: string;
    deliverables: string[];
    }

    export interface ProjectTimeline {
    start_date?: string;
    deadline_application?: string; 
    deadline_delivery?: string;
    }

    // Konfigurace pro UI (tohle chybělo a způsobovalo error)
    export const PROJECT_TYPES_CONFIG: Record<ProjectTypeKey, ProjectTypeDefinition> = {
    marketing_strategy: { type: 'marketing_strategy', title: 'Marketingová strategie', defaultDeliverables: ['Analýza trhu', 'Marketingový mix', 'Akční plán'] },
    market_research: { type: 'market_research', title: 'Průzkum trhu', defaultDeliverables: ['Dotazníkové šetření', 'Vyhodnocení dat', 'Závěrečná zpráva'] },
    brand_identity: { type: 'brand_identity', title: 'Brand Identity', defaultDeliverables: ['Logo manuál', 'Design systém', 'Klíčové vizuály'] },
    social_media: { type: 'social_media', title: 'Správa sociálních sítí', defaultDeliverables: ['Content plán', 'Návrh příspěvků', 'Grafika'] },
    software_development: { type: 'software_development', title: 'Vývoj software', defaultDeliverables: ['Zdrojový kód', 'Dokumentace', 'Nasazení'] },
    web_development: { type: 'web_development', title: 'Tvorba webu', defaultDeliverables: ['Wireframy', 'Design', 'Funkční web'] },
    mobile_app: { type: 'mobile_app', title: 'Mobilní aplikace', defaultDeliverables: ['Prototyp', 'MVP aplikace', 'Testování'] },
    ux_ui_design: { type: 'ux_ui_design', title: 'UX/UI Design', defaultDeliverables: ['Uživatelský výzkum', 'Wireframy', 'High-fidelity prototyp'] },
    data_analysis: { type: 'data_analysis', title: 'Datová analýza', defaultDeliverables: ['Čištění dat', 'Vizualizace', 'Interpretace'] },
    business_plan: { type: 'business_plan', title: 'Business Plán', defaultDeliverables: ['Finanční model', 'Business Canvas', 'Strategie'] },
    custom: { type: 'custom', title: 'Vlastní zadání', defaultDeliverables: ['Dle domluvy'] },
    };

    // --- STÁVAJÍCÍ INTERFACE ROZŠÍŘENÝ O NOVÁ DATA ---

    export interface AcademicRequest {
        id: string;
        professor_id: string;
        subject_name: string;
        student_count: number;
        description: string;
        semester: string;
        status: AcademicRequestStatus;
        join_code: string;
        created_at?: string;
        
        // Nová pole
        project_types?: ProjectDefinition[]; // JSONB
        requirements?: string[]; // JSONB
        timeline?: ProjectTimeline; // JSONB
        is_public?: boolean;
    }