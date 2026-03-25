"use client";

import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      const detail = error.message ? ` (${error.message})` : "";
      setMessage(`Gagal kirim link login.${detail}`);
      console.error("Supabase OTP error:", error);
    } else {
      setMessage("Link login sudah dikirim. Cek email ya.");
    }

    setLoading(false);
  }

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Masuk Warung OS</CardTitle>
        <CardDescription>
          Pakai email dulu untuk MVP. Nanti bisa pakai nomor HP/OTP juga.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              placeholder="contoh@warung.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-2xl text-base"
            />
          </div>
          <Button type="submit" className="h-12 w-full rounded-2xl text-base" disabled={loading}>
            <Mail className="mr-2 h-5 w-5" />
            {loading ? "Kirim link..." : "Kirim link login"}
          </Button>
          {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
