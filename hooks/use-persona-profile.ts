import { useEffect, useState } from "react";

const STORAGE_KEY = "therapy_persona_profile";

export type PersonaProfile = {
  name?: string; // Optional: "My father", "My mentor"
  description: string; // Traits, emotional tone, speech style
  boundaries?: string; // Optional: things to avoid
};

export function usePersonaProfile() {
  const [persona, setPersona] = useState<PersonaProfile | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setPersona(JSON.parse(saved));
  }, []);

  const savePersona = (profile: PersonaProfile) => {
    setPersona(profile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  };

  return { persona, savePersona };
}
