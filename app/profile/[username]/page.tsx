// Generate static paths for usernames
// export async function generateStaticParams() {
//   // Return a list of possible username values for static generation
//   // You can customize this list based on your actual usernames
//   return [
//     { username: 'john' },
//     { username: 'jane' },
//     { username: 'alice' },
//     { username: 'bob' },
//     { username: 'charlie' }
//   ]
// }

import ProfilePageClient from './ProfilePageClient'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return <ProfilePageClient username={username} />
}