// src/context/LanguageProvider.jsx
import { createContext, useState, useEffect, useContext } from "react";

export const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("Bangla"); // default

  // পেজ লোড হলে localStorage থেকে ভাষা নিয়ে আসা
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang === "Bangla" || savedLang === "English") {
      setLanguage(savedLang);
    }
  }, []);

  // ভাষা চেঞ্জ হলে localStorage-এ সেভ করা + state আপডেট
  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const value = {
    language,
    changeLanguage,
    isBangla: language === "Bangla",
    isEnglish: language === "English",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// custom hook (সহজে ব্যবহার করার জন্য)
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
};