
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <SignUp 
        path="/sign-up" 
        routing="path" 
        signInUrl="/sign-in"
        redirectUrl="/home"
        appearance={{
          baseTheme: dark, // Example: using Clerk's dark theme
        }}
      />
    </div>
  );
}
