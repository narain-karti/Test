
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile, Workout, BotMode, MediaItem, AspectRatio, WorkoutType } from "../types";

const getSystemInstruction = (profile: UserProfile, currentWorkout: Workout | null) => {
  const context = `
    User Profile: ${JSON.stringify(profile)}
    Current Workout: ${JSON.stringify(currentWorkout)}
    Goal: ${profile.goal}
    Fitness Level: ${profile.level}
    Streak: ${profile.streak} days.
  `;
  return `You are FlowBot, a living, emotionally intelligent AI fitness companion for FitFlow AI.
  You provide adaptive workout advice that is always EXPLAINED (Explainable AI).
  Tone: Empathetic, supportive, futuristic, concise.
  Core Mandate: 
  1. Trust over intensity. Emotion over metrics.
  2. Explain every adaptation (e.g. "We're reducing volume because your recovery score is low").
  3. Never shame. Always validate effort.
  4. Context-aware of user's fatigue, burnout, and recovery.
  Context: ${context}`;
};

export const generateAdaptiveWorkout = async (profile: UserProfile, type: WorkoutType): Promise<Workout> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{
        parts: [{
          text: `Generate a highly personalized, futuristic ${type} workout for a user with these stats: ${JSON.stringify(profile)}.
          Include a futuristic title, difficulty, estimated time, a supportive explanation of WHY this was chosen, 3 exercises (name, reps/duration, instructions, muscles), tags, and a short poetic "neural insight" (emotional hook).
          Respond strictly in JSON format matching the Workout interface.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            estimatedTime: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            neuralInsight: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  reps: { type: Type.STRING },
                  duration: { type: Type.NUMBER },
                  instructions: { type: Type.STRING },
                  muscles: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          },
          required: ["id", "title", "type", "difficulty", "estimatedTime", "explanation", "exercises", "tags", "neuralInsight"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to generate adaptive workout:", error);
    // Fallback to static initial data if API fails
    const { INITIAL_WORKOUTS } = await import('../constants');
    return INITIAL_WORKOUTS[type] || INITIAL_WORKOUTS['Strength'];
  }
};

export const getBotResponse = async (
  message: string,
  mode: BotMode,
  profile: UserProfile,
  currentWorkout: Workout | null,
  media: MediaItem[] = [],
  location?: { latitude: number; longitude: number }
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let modelName = 'gemini-3-pro-preview';
    const config: any = {
      systemInstruction: getSystemInstruction(profile, currentWorkout),
      temperature: 0.7,
    };

    if (mode === 'lite') {
      modelName = 'gemini-flash-lite-latest';
    } else if (mode === 'thinking') {
      modelName = 'gemini-3-pro-preview';
      config.thinkingConfig = { thinkingBudget: 32768 };
    } else if (mode === 'search') {
      modelName = 'gemini-3-flash-preview';
      config.tools = [{ googleSearch: {} }];
    } else if (mode === 'maps') {
      modelName = 'gemini-2.5-flash';
      config.tools = [{ googleMaps: {} }];
      if (location) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        };
      }
    }

    const contents: any[] = [];
    const parts: any[] = [{ text: message }];
    media.forEach(m => {
      parts.push({
        inlineData: {
          data: m.data.split(',')[1] || m.data,
          mimeType: m.mimeType
        }
      });
    });
    contents.push({ parts });

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    const urls: { uri: string; title: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) urls.push({ uri: chunk.web.uri, title: chunk.web.title });
        if (chunk.maps) urls.push({ uri: chunk.maps.uri, title: chunk.maps.title });
      });
    }

    return {
      text: response.text || "",
      urls: urls.length > 0 ? urls : undefined
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Protocol interference. I'm having trouble connecting to the neural core. Let's stay focused on your breath." };
  }
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      imageConfig: {
        aspectRatio,
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Neural synthesis failed to return image bytes.");
};

export const editImageWithPrompt = async (base64Image: string, prompt: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Modifier core failed to return result.");
};

export const transcribeAudioData = async (base64Audio: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [{ 
        inlineData: { 
          data: base64Audio.split(',')[1] || base64Audio, 
          mimeType 
        } 
      }, { text: "Transcribe this audio exactly. Just the text." }]
    }
  });
  return response.text;
};

export const generateTTS = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say in a warm, encouraging voice: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};
