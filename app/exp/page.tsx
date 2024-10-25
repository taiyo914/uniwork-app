"use client";
import {dictionary} from "./locales/dictionary";

import { useState } from "react";
const IndexPage = () => {
  const [lang, setLang] = useState("en");
  const translations = dictionary[lang];

  return (
    <div>
      <LanguageSwitcher onChange={setLang} />
      <h1>{translations.greeting}</h1>
      <p>{translations.welcome}</p>
    </div>
  );
};

export default IndexPage;

const LanguageSwitcher = ({ onChange }: { onChange: (lang: string) => void }) => {
  return (
    <select onChange={(e) => onChange(e.target.value)} defaultValue="en">
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
  );
};