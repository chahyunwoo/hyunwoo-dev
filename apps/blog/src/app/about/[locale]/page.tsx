import { BASE_URL } from '@hyunwoo/shared/config'
import type { Locale, Params, Profile } from '@hyunwoo/shared/types'
import { notFound } from 'next/navigation'
import {
  BriefIntroduction,
  Education,
  getLocales,
  getProfile,
  PersonalProjects,
  ProfileHeader,
  RecentExperience,
  Skills,
} from '@/entities/about'
import { LanguageSwitch } from '@/features/navigation'
import { RSS_ALTERNATE_TYPES } from '@/shared/config'
import { InnerContainer } from '@/shared/ui'

export async function generateStaticParams() {
  const locales = await getLocales()
  return locales.map(l => ({ locale: l.code }))
}

export async function generateMetadata({ params }: Params<{ locale: Locale }>) {
  const { locale } = await params
  const locales = await getLocales()

  if (!locales.some(l => l.code === locale)) return {}

  const profile = await getProfile(locale)

  if (!profile) return {}

  return {
    title: `${profile.name} | ${profile.job}`,
    description: `${profile.introduction}`,
    alternates: {
      canonical: `${BASE_URL}/about/${locale}`,
      languages: {
        ko: `${BASE_URL}/about/ko`,
        en: `${BASE_URL}/about/en`,
        ja: `${BASE_URL}/about/jp`,
      },
      types: RSS_ALTERNATE_TYPES,
    },
    openGraph: {
      title: `${profile.name} | ${profile.job}`,
      description: `${profile.introduction}`,
      images: [
        {
          url: `${BASE_URL}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${profile.name} | ${profile.job}`,
        },
      ],
    },
  }
}

function getPersonJsonLd(profile: Pick<Profile, 'name' | 'job' | 'location' | 'link'>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: BASE_URL,
    jobTitle: profile.job,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location,
    },
    sameAs: profile.link.map(l => l.href),
  }
}

export default async function Page({ params }: Params<{ locale: Locale }>) {
  const { locale } = await params
  const locales = await getLocales()

  if (!locales.some(l => l.code === locale)) notFound()

  const profile = await getProfile(locale)

  if (!profile) notFound()

  return (
    <InnerContainer className="py-12" data-locale={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getPersonJsonLd(profile)),
        }}
      />
      <div className="max-w-3xl mx-auto">
        <ProfileHeader
          profile={profile}
          languageSwitch={<LanguageSwitch locales={locales.map(l => ({ code: l.code, label: l.label }))} />}
        />
        <BriefIntroduction profile={profile} />
        <Skills profile={profile} />
        <Education profile={profile} />
        <PersonalProjects profile={profile} />
        <RecentExperience profile={profile} />
      </div>
    </InnerContainer>
  )
}
