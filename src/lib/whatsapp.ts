export async function sendWhatsAppMessage(to: string, message: string) {
  const apiKey = process.env.WHATSAPP_API_KEY;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!apiKey || !phoneNumberId) {
    return { ok: false, message: "WhatsApp env belum lengkap." };
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { ok: false, message: errorText };
  }

  return { ok: true };
}
