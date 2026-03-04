// app/sign-in/[[...sign-in]]/page.tsx
"use client";

import * as React from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(1200px 800px at 50% 20%, rgba(255,255,255,0.10), rgba(0,0,0,0))",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, width: "min(420px, 100%)" }}>
        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 30px 90px rgba(0,0,0,0.45)",
          }}
        >
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/admin"
          />
        </div>
      </div>
    </div>
  );
}
