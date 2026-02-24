import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            M
          </div>
          <span>Maand</span>
        </Link>
      </div>
      <SignupForm />
    </div>
  )
}
