"use client";

import React, { useState } from 'react';
import Button from "@/components/button/button";
import Link from "next/link";
import Input from "@/components/input/input";

export default function SigninForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    console.log("Submitting:", { email, password });
    // API call logic will go here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <>
      <div>
        <h2 className="h3 text-center mb-16px">Sign in to manage your lists</h2>
        <p className="text-center">
          Sign in to your account to share your passions and interests with the world.
        </p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
        <Input
          type="email"
          placeholder="Email"
          autoFocus={true}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="interactive" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
      <div className="text-center py-24px">
        <span className="text-bold">Not a member yet? <Link href="/signup" scroll={false} replace>Join today</Link></span>
      </div>
    </>
  );
}
