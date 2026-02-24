import { useEffect, useState } from "react";

const STORAGE_KEY = "therapy_personality";

export function useTherapyPersonality() {
  const [personality, setPersonality] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setPersonality(saved);
  }, []);

  const savePersonality = (value: string) => {
    setPersonality(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  return { personality, savePersonality };
}
