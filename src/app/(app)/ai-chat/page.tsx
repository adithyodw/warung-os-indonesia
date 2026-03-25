import { AiChatBox } from "@/components/forms/ai-chat-box";

export default function AiChatPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Asisten AI Warung</h1>
      <p className="text-sm text-zinc-600">Tanya pakai Bahasa Indonesia. Bisa ketik atau pakai suara.</p>
      <AiChatBox />
    </div>
  );
}
