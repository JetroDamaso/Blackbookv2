"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, User } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginPage = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!employeeId.trim() || !password.trim()) {
      setError("Please enter both employee ID and password.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        employeeId: employeeId.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid employee ID or password. Please try again.");
      } else if (result?.ok) {
        // Get the session to verify login
        const session = await getSession();
        if (session) {
          // Redirect to event calendar page after successful login
          router.push("/event_calendar");
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Please contact your administrator to reset your password.");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 bg-gray-50 -mt-12">
        <div className="w-full max-w-sm space-y-4">
          <div className="flex flex-col justify-center items-center gap-4">
            <Image
              src={`/susings_and_rufins_logo.png`}
              alt="Susings and Rufins Logo"
              width={200}
              height={200}
            />
            <h1 className="font-medium text-3xl text-center text-gray-900 mb-6">
              Log in to your account
            </h1>
          </div>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="employee-id"
                className="text-sm font-normal text-gray-700 justify-between flex"
              >
                Employee ID (First 8 characters)
              </Label>
              <InputGroup>
                <InputGroupInput
                  id="employee-id"
                  type="text"
                  placeholder="e.g. a1b2c3d4"
                  maxLength={8}
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <InputGroupAddon>
                  <User />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="password"
                className="text-sm font-normal text-gray-700 justify-between flex"
              >
                Password
                <span>
                  <a
                    className="text-xs font-normal underline text-primary hover:text-primary/70 cursor-pointer select-none"
                    onClick={handleForgotPassword}
                  >
                    Forgot your password?
                  </a>
                </span>
              </Label>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <InputGroupAddon>
                  <Lock />
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default LoginPage;
