interface Dictionary {
  [key: string]: {
    greeting: string;
    welcome: string;
  };
}

export const dictionary: Dictionary = {
  en: {
    greeting: "Hello",
    welcome: "Welcome to our website!",
  },
  ja: {
    greeting: "こんにちは",
    welcome: "私たちのウェブサイトへようこそ！",
  },
};
