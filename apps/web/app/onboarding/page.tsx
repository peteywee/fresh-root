import Link from 'next/link'

export default function OnboardingIndex() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Onboarding Wizard</h1>
      <p className="mt-2 text-sm text-muted-foreground">Start the onboarding flow</p>
      <ul className="mt-4 space-y-2">
        <li>
          <Link href="/onboarding/profile" className="text-blue-600 underline">Profile</Link>
        </li>
        <li>
          <Link href="/onboarding/intent" className="text-blue-600 underline">Intent</Link>
        </li>
        <li>
          <Link href="/onboarding/join" className="text-blue-600 underline">Join</Link>
        </li>
        <li>
          <Link href="/onboarding/create-network-org" className="text-blue-600 underline">Create Network (Org)</Link>
        </li>
        <li>
          <Link href="/onboarding/create-network-corporate" className="text-blue-600 underline">Create Network (Corporate)</Link>
        </li>
        <li>
          <Link href="/onboarding/admin-responsibility" className="text-blue-600 underline">Admin Responsibility Form</Link>
        </li>
      </ul>
    </main>
  )
}
