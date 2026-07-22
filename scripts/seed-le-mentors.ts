import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { users, mentorProfiles } from '../db/schema.js'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

const db = drizzle(neon(process.env.DATABASE_URL))

const MENTORS = [
  // Leadership Team
  {
    name: 'Aditya Jhunjhunwala',
    email: 'aditya@letsenterprise.in',
    headline: 'Coaching Mindset & Business Catalyst',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2025/02/IMG_0430.jpg',
    topics: ['Entrepreneurship', 'Business Strategy', 'Coaching', 'Leadership'],
  },
  {
    name: 'Yusuf Hakim',
    email: 'yusuf@letsenterprise.in',
    headline: 'Business & Technology Catalyst',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2025/02/IMG_0416.jpg',
    topics: ['Business Strategy', 'Technology', 'Innovation', 'Product'],
  },
  {
    name: 'Ankita Parashar',
    email: 'ankita@letsenterprise.in',
    headline: 'Business & Communication Catalyst',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2025/02/IMG_0432.jpg',
    topics: ['Communication', 'Business Strategy', 'Personal Development'],
  },
  {
    name: 'Palak Krishnamurthy',
    email: 'palak@letsenterprise.in',
    headline: 'Inner Work & Process Design Catalyst',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2025/02/Palak-1-rotated.jpg',
    topics: ['Personal Development', 'Process Design', 'Coaching'],
  },
  // Program Catalysts
  {
    name: 'Jonathan Pimento',
    email: 'jonathan@letsenterprise.in',
    headline: 'Media & Brand Catalyst',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2025/02/IMG_0425.jpg',
    topics: ['Media', 'Branding', 'Marketing', 'Content'],
  },
  {
    name: 'Rohini Mistry',
    email: 'rohini@letsenterprise.in',
    headline: 'Program Coordinator',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2025/02/IMG_0429.jpg',
    topics: ['Program Management', 'Operations', 'Coordination'],
  },
  {
    name: 'Nikita Juneja',
    email: 'nikita@letsenterprise.in',
    headline: 'Student Journey Catalyst',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2024/04/Group-1729.png',
    topics: ['Student Development', 'Mentorship', 'Coaching'],
  },
  {
    name: 'Sharjeel Shaikh',
    email: 'sharjeel@letsenterprise.in',
    headline: 'Associate Program Director (MED)',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2025/02/IMG_0417.jpg',
    topics: ['Program Management', 'Leadership', 'Education'],
  },
  {
    name: 'Aastha Srivastava',
    email: 'aastha@letsenterprise.in',
    headline: 'Program Facilitator',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2025/12/1517866651813.jpeg',
    topics: ['Facilitation', 'Education', 'Learning Design'],
  },
  {
    name: 'Anu Pazhayannur',
    email: 'anu@letsenterprise.in',
    headline: 'Associate Director - Student Success',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2025/12/1660907267776.jpeg',
    topics: ['Student Success', 'Coaching', 'Leadership'],
  },
  {
    name: 'Gargi Shinde',
    email: 'gargi@letsenterprise.in',
    headline: 'Outreach Catalyst',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2025/12/1750137103400.jpeg',
    topics: ['Outreach', 'Marketing', 'Community Building'],
  },
  {
    name: 'Jay Sahastrabudhe',
    email: 'jay@letsenterprise.in',
    headline: 'Marketing Manager',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-27-at-16.04.47.jpeg',
    topics: ['Marketing', 'Branding', 'Growth Strategy'],
  },
  {
    name: 'Raunaq Amarnani',
    email: 'raunaq@letsenterprise.in',
    headline: 'Video Editor',
    avatarUrl: 'https://letsenterprise.in/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-08-at-11.14.47.jpeg',
    topics: ['Video Production', 'Content Creation', 'Media'],
  },
]

let inserted = 0
let updated = 0

for (const mentor of MENTORS) {
  const [user] = await db
    .insert(users)
    .values({
      name: mentor.name,
      email: mentor.email,
      role: 'alumni',
      headline: mentor.headline,
      company: "Let's Enterprise",
      location: 'Pune, India',
      avatarUrl: mentor.avatarUrl,
      visibility: 'members',
      isVerified: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: mentor.name,
        headline: mentor.headline,
        company: "Let's Enterprise",
        location: 'Pune, India',
        avatarUrl: mentor.avatarUrl,
        isVerified: true,
        updatedAt: new Date(),
      },
    })
    .returning({ id: users.id, name: users.name })

  const [existing] = await db
    .select({ userId: mentorProfiles.userId })
    .from(mentorProfiles)
    .where(eq(mentorProfiles.userId, user.id))
    .limit(1)

  await db
    .insert(mentorProfiles)
    .values({
      userId: user.id,
      category: 'lets_enterprise_mentor',
      topics: mentor.topics,
      capacity: 3,
      isAvailable: true,
    })
    .onConflictDoUpdate({
      target: mentorProfiles.userId,
      set: {
        category: 'lets_enterprise_mentor',
        topics: mentor.topics,
        isAvailable: true,
      },
    })

  if (existing) {
    updated++
    console.log(`  Updated: ${user.name}`)
  } else {
    inserted++
    console.log(`  Inserted: ${user.name}`)
  }
}

console.log(`\nDone — ${inserted} inserted, ${updated} updated.`)
