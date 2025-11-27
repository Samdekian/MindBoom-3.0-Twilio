
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface TherapistRegistrationFormProps {
  onSubmit: (email: string, password: string, name: string, credentials: string) => Promise<void>;
  isSubmitting: boolean;
}

const TherapistRegistrationForm = ({ onSubmit, isSubmitting }: TherapistRegistrationFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [credentials, setCredentials] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!credentials.trim()) {
      setError("Professional credentials are required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      await onSubmit(email.trim(), password, name.trim(), credentials.trim());
    } catch (error: any) {
      setError(error.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            placeholder="Dr. Jane Smith" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Professional Email</Label>
          <Input 
            id="email" 
            placeholder="dr.smith@clinic.com" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="credentials">Professional Credentials</Label>
          <Textarea 
            id="credentials" 
            placeholder="Licensed Clinical Psychologist, Ph.D. in Psychology, License #123456" 
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            required
            disabled={isSubmitting}
            className="min-h-[80px]"
          />
          <p className="text-xs text-gray-500">
            Please provide your license number and credentials for verification.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required
            disabled={isSubmitting}
            minLength={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            id="confirmPassword" 
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required
            disabled={isSubmitting}
            minLength={6}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating therapist account...
            </span>
          ) : "Create therapist account"}
        </Button>
      </div>
    </form>
  );
};

export default TherapistRegistrationForm;
