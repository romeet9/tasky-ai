export interface TranscriptionSegment {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

export interface TranscriptionResult {
  transcript: string;
  segments: TranscriptionSegment[];
  language: string;
  duration: number;
}

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
  { code: "ta", name: "Tamil" },
  { code: "bn", name: "Bengali" },
];

export async function transcribeAudio(
  audioBuffer: ArrayBuffer,
  language: string = "en"
): Promise<TranscriptionResult> {
  const apiKey = process.env.SARVAM_API_KEY;

  if (!apiKey) {
    // Placeholder: Return mock transcription for development
    console.warn("SARVAM_API_KEY not set, using placeholder transcription");
    return getPlaceholderTranscription(language);
  }

  // Real Sarvam API call (ready for production)
  const response = await fetch("https://api.sarvam.ai/speech-to-text", {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
      "Content-Type": "audio/webm",
    },
    body: audioBuffer,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Sarvam API request failed");
  }

  const data = await response.json();
  return {
    transcript: data.transcript || "",
    segments: data.segments || [],
    language: data.language || language,
    duration: data.duration || 0,
  };
}

function getPlaceholderTranscription(language: string): TranscriptionResult {
  const placeholders: Record<string, TranscriptionResult> = {
    en: {
      transcript: "This is a placeholder transcript. Configure SARVAM_API_KEY for real transcription.",
      segments: [
        { speaker: "Speaker 1", text: "Let's discuss the sprint progress.", start: 0, end: 5 },
        { speaker: "Speaker 2", text: "I've completed the auth module.", start: 5, end: 10 },
        { speaker: "Speaker 1", text: "Great, let's review the PRs tomorrow.", start: 10, end: 15 },
      ],
      language: "en",
      duration: 15,
    },
    hi: {
      transcript: "यह एक प्लेसहोल्डर ट्रांसक्रिप्ट है। वास्तविक ट्रांसक्रिप्शन के लिए SARVAM_API_KEY कॉन्फ़िगर करें।",
      segments: [
        { speaker: "वक्ता 1", text: "आइए स्प्रिंट प्रगति पर चर्चा करें।", start: 0, end: 5 },
        { speaker: "वक्ता 2", text: "मैंने ऑथ मॉड्यूल पूरा कर लिया है।", start: 5, end: 10 },
      ],
      language: "hi",
      duration: 10,
    },
  };

  return placeholders[language] || placeholders.en;
}
