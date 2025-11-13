"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const { data: session, status } = useSession();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success" | ""; text: string }>({
    type: "",
    text: "",
  });

  // Auto-logout if token expired
  useEffect(() => {
    if (session?.expires && new Date(session.expires) < new Date()) {
      signOut();
    }
  }, [session]);

  // Fetch phone number from DB
  useEffect(() => {
    const fetchPhone = async () => {
      if (session?.user?.email) {
        const res = await fetch(`/api/getPhone?email=${session.user.email}`);
        const data = await res.json();
        if (data.phone) setPhone(data.phone);
      }
    };
    fetchPhone();
  }, [session]);

  const handleSavePhone = async () => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMessage({
        type: "error",
        text: "Enter a valid 10-digit Indian mobile number (e.g., 9876543210).",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email: session?.user?.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessage({ type: "success", text: "Phone number saved successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // Clear phone on sign out
  const handleSignOut = async () => {
    try {
      if (session?.user?.email) {
        await fetch("/api/clearPhone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
      }
    } catch (err) {
      console.error("Error clearing phone before sign-out:", err);
    } finally {
      signOut();
    }
  };

  if (status === "loading")
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );

  if (status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <main className="w-full max-w-md p-4">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {session.user?.name}</CardTitle>
              <CardDescription>
                Signed in as {session.user?.email}.
                <br />
                Token expires at: <b>{new Date(session.expires).toLocaleString()}</b>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button className="w-full" onClick={handleSavePhone} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Phone Number"}
              </Button>
              {message.text && (
                <p
                  className={`text-sm ${
                    message.type === "error" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {message.text}
                </p>
              )}
            </CardContent>

            <CardContent className="flex justify-center border-t pt-4">
              <Button variant="ghost" onClick={handleSignOut}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-sm p-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Google Calendar Alerter
            </CardTitle>
            <CardDescription>
              Sign in to get phone call reminders for your events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => signIn("google")}>
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
