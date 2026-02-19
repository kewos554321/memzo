function detectLang(text: string): string {
  if (/[\u4e00-\u9fff]/.test(text)) return "zh-TW";
  if (/[\u3040-\u30ff]/.test(text)) return "ja-JP";
  if (/[\uac00-\ud7af]/.test(text)) return "ko-KR";
  return "en-US";
}

export function useSpeech() {
  const speak = (text: string) => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = detectLang(text);
    window.speechSynthesis.speak(utterance);
  };

  return { speak };
}
