"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../contexts/AuthContext";
import IdealCandidateCard from "../[id]/components/IdealCandidateCard";
import TechnologySelectorEdit from "../edit/components/EditTechnologySelector";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";

const STORAGE_KEY = "idealCandidateFormPersistent";

const idealCandidateSchema = z.object({
  ideal_candidate_description: z
    .string()
    .min(10, { message: "Popis musí mít alespoň 10 znaků." }),
  technologies: z
    .array(z.string())
    .min(1, { message: "Vyberte alespoň jednu technologii." }),
});

type FormData = z.infer<typeof idealCandidateSchema>;
type Technology = { id: string; name: string };

export default function IdealCandidateForm() {
  const { user, showToast } = useAuth();
  const [allTechnologies, setAllTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const hasFetchedFromDB = useRef(false); 

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<FormData>({
    resolver: zodResolver(idealCandidateSchema),
    defaultValues: {
      ideal_candidate_description: "",
      technologies: [],
    },
  });

  const watchedData = watch();
  const hasExistingData =
    !!watchedData.ideal_candidate_description ||
    watchedData.technologies.length > 0;

  const technologiesForPreview = useMemo(() => {
    return watchedData.technologies
      .map((id) => allTechnologies.find((tech) => tech.id === id))
      .filter((t): t is Technology => !!t)
      .map((t) => ({ Technology: { name: t.name } }));
  }, [watchedData.technologies, allTechnologies]);

useEffect(() => {
      if (!user || hasFetchedFromDB.current) return;
      hasFetchedFromDB.current = true;

      const loadData = async () => {
        try {
          setLoading(true);
          const { data: allTechData, error: allTechError } = await supabase
            .from("Technology")
            .select("id, name");
          if (allTechError) throw allTechError;
          if (allTechData) setAllTechnologies(allTechData);
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              reset(parsed);
              console.log("Data formuláře načtena z localStorage.");
              return; 
            } catch {
              console.warn("Neplatná data v localStorage, mažu a načítám z DB.");
              localStorage.removeItem(STORAGE_KEY); 
            }
          }
          console.log("localStorage prázdná, načítám z DB...");
          const [profileRes, techRes] = await Promise.all([
            supabase
              .from("StartupProfile")
              .select("ideal_candidate_description")
              .eq("user_id", user.id)
              .single(),
            supabase
              .from("StartupTechnology")
              .select("technology_id")
              .eq("startup_id", user.id),
          ]);
          
        if (profileRes.data && techRes.data) {
            const data: FormData = {
                ideal_candidate_description:
                profileRes.data.ideal_candidate_description || "",
                technologies: techRes.data.map((t) => t.technology_id),
            };
            reset(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
        } catch (err) {
          console.error("Chyba při načítání dat:", err);
          showToast("Nepodařilo se načíst data profilu.", "error");
        } finally {
          setLoading(false);
        }
      };

      loadData();
}, [user, reset, showToast]);

  useEffect(() => {
    const sub = watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => sub.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (!user || hasFetchedFromDB.current) return;
    hasFetchedFromDB.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, techRes, allTechRes] = await Promise.all([
          supabase
            .from("StartupProfile")
            .select("ideal_candidate_description")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("StartupTechnology")
            .select("technology_id")
            .eq("startup_id", user.id),
          supabase.from("Technology").select("id, name"),
        ]);

        if (allTechRes.data) setAllTechnologies(allTechRes.data);

        if (profileRes.data && techRes.data) {
          const data: FormData = {
            ideal_candidate_description:
              profileRes.data.ideal_candidate_description || "",
            technologies: techRes.data.map((t) => t.technology_id),
          };
          reset(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, reset]);

  const onSubmit = async (formData: FormData) => {
    if (!user) return;

    const [profileResult, techResult] = await Promise.all([
      supabase
        .from("StartupProfile")
        .update({
          ideal_candidate_description: formData.ideal_candidate_description,
        })
        .eq("user_id", user.id),
      (async () => {
        await supabase.from("StartupTechnology").delete().eq("startup_id", user.id);
        const toInsert = formData.technologies.map((techId) => ({
          startup_id: user.id,
          technology_id: techId,
        }));
        return supabase.from("StartupTechnology").insert(toInsert);
      })(),
    ]);

    if (profileResult.error || techResult.error) {
      showToast("Uložení se nezdařilo.", "error");
    } else {
      showToast("Profil ideálního kandidáta byl úspěšně uložen!", "success");
      reset(formData, { keepDirty: false });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleteModalOpen(false);

    const [profileResult, techResult] = await Promise.all([
      supabase
        .from("StartupProfile")
        .update({ ideal_candidate_description: null })
        .eq("user_id", user.id),
      supabase.from("StartupTechnology").delete().eq("startup_id", user.id),
    ]);

    if (profileResult.error || techResult.error) {
      showToast("Smazání se nezdařilo.", "error");
    } else {
      const empty: FormData = {
        ideal_candidate_description: "",
        technologies: [],
      };
      reset(empty);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
      showToast('Sekce "Ideální kandidát" byla smazána.', "success");
    }
  };

  const hasPreviewData =
    !!watchedData.ideal_candidate_description &&
    technologiesForPreview.length > 0;

  if (loading && Object.keys(dirtyFields).length === 0)
    return <p>Načítám...</p>;

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
      >
        <div className="bg-white p-6 rounded-2xl shadow-xs border space-y-6">
          <div>
            <label
              htmlFor="ideal_candidate_description"
              className="block text-lg font-bold text-[var(--barva-tmava)] mb-2"
            >
              Popis ideálního kandidáta
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Popište, jaký typ talentu hledáte a jaké vlastnosti jsou pro vás
              klíčové.
            </p>
            <textarea
              id="ideal_candidate_description"
              {...register("ideal_candidate_description")}
              rows={6}
              className="input !font-normal"
            />
            {errors.ideal_candidate_description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.ideal_candidate_description.message}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-bold text-[var(--barva-tmava)]">
              Klíčové technologie (Tech Stack)
            </h3>
            <Controller
              name="technologies"
              control={control}
              render={({ field }) => (
                <TechnologySelectorEdit
                  onSelectionChange={field.onChange}
                  initialSelectedIds={field.value}
                />
              )}
            />
            {errors.technologies && (
              <p className="text-red-500 text-sm">
                {errors.technologies.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting || !Object.keys(dirtyFields).length}
              className="flex-grow px-5 py-3 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-lg cursor-pointer hover:opacity-90 transition-all ease-in-out duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Ukládám..." : "Uložit změny"}
            </button>
            {hasExistingData && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                title="Smazat a skrýt z profilu"
                className="p-3 rounded-full font-semibold cursor-pointer text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Živý náhled:</h3>
          <IdealCandidateCard
            description={watchedData.ideal_candidate_description}
            technologies={technologiesForPreview}
            isOwner={true}
            hasData={hasPreviewData}
            isPreview={true}
          />
        </div>
      </form>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Opravdu smazat?"
        message='Tato akce trvale odstraní popis ideálního kandidáta a přiřazené technologie z vašeho profilu. Tuto sekci nebudou studenti na vašem profilu vidět.'
      />
    </>
  );
}
