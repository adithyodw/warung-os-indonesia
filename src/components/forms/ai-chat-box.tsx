"use client";

import { FormEvent, useMemo, useState } from "react";
import { Mic, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  role: "user" | "assistant";
  text: string;
};

type SpeechResult = {
  0: { transcript: string };
};

type SpeechEvent = {
  results: {
    0: SpeechResult;
  };
};

type SpeechRecognitionInstance = {
  lang: string;
  onresult: ((event: SpeechEvent) => void) | null;
  start: () => void;
};

type SpeechRecognitionType = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionType;
    SpeechRecognition?: SpeechRecognitionType;
  }
}

export function AiChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Halo, saya siap bantu cek penjualan, untung, dan stok warung Anda.",
    },
  ]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const hasSpeech = useMemo(
    () => typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    [],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim() || loading) return;

    const userText = prompt.trim();
    setPrompt("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userText }),
    });
    const data = await response.json().catch(() => ({}));

    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: data?.answer ?? "Maaf, AI sedang sibuk. Coba lagi sebentar." },
    ]);
    setLoading(false);
  }

  function startVoice() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = "id-ID";
    recognition.onresult = (event: SpeechEvent) => {
      const transcript = event.results[0][0].transcript;
      setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.start();
  }

  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="max-h-[50vh] space-y-2 overflow-y-auto rounded-2xl bg-zinc-50 p-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${
                message.role === "assistant"
                  ? "bg-white text-zinc-800"
                  : "ml-auto bg-green-600 text-white"
              }`}
            >
              {message.text}
            </div>
          ))}
          {loading ? <p className="text-sm text-zinc-500">AI sedang mikir...</p> : null}
        </div>

        <form onSubmit={onSubmit} className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Contoh: Hari ini saya untung berapa?"
            className="min-h-20 rounded-2xl text-base"
          />
          <div className="flex gap-2">
            <Button type="submit" className="h-11 flex-1 rounded-2xl" disabled={loading}>
              <SendHorizonal className="mr-2 h-4 w-4" />
              Kirim
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-11 rounded-2xl"
              onClick={startVoice}
              disabled={!hasSpeech}
            >
              <Mic className="mr-2 h-4 w-4" />
              Suara
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
