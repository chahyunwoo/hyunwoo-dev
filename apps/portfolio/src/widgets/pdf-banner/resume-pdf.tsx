import { Document, Font, Link, Page, pdf, StyleSheet, Text, View } from '@react-pdf/renderer'

Font.register({
  family: 'NotoSans',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-400-normal.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.ttf',
      fontWeight: 'bold',
    },
  ],
})

Font.register({
  family: 'NotoSansJP',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-400-normal.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-700-normal.ttf',
      fontWeight: 'bold',
    },
  ],
})

function getFontFamily(locale: string) {
  if (locale === 'jp') return 'NotoSansJP'
  if (locale === 'ko') return 'NotoSans'
  return 'Helvetica'
}

function getSectionLabels(locale: string) {
  if (locale === 'ko') return { work: '경력', skills: '기술', education: '학력' }
  if (locale === 'jp') return { work: '職歴', skills: 'スキル', education: '学歴' }
  return { work: 'Work Experience', skills: 'Skills', education: 'Education' }
}

const createStyles = (locale: string) =>
  StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 10,
      fontFamily: getFontFamily(locale),
      color: '#1a1a2e',
    },
    header: {
      marginBottom: 20,
      borderBottomWidth: 2,
      borderBottomColor: '#6c63ff',
      paddingBottom: 12,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    jobTitle: {
      fontSize: 12,
      color: '#6c63ff',
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: 'row',
      gap: 16,
      fontSize: 9,
      color: '#666',
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#6c63ff',
      marginTop: 16,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      paddingBottom: 4,
    },
    workItem: {
      marginBottom: 12,
    },
    workHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 2,
    },
    workTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      // 폭을 나눠 주지 않으면 긴 제목이 기간을 밀어내 글자가 겹친다.
      // flexShrink 로는 부족했다 — Text 가 줄바꿈 대신 넘쳐 흐른다.
      // 명시적 width 를 줘야 제목이 두 줄로 감싸진다.
      width: '76%',
      paddingRight: 8,
    },
    workPeriod: {
      fontSize: 9,
      color: '#888',
      width: '24%',
      textAlign: 'right',
    },
    workRole: {
      fontSize: 9,
      color: '#666',
      marginBottom: 4,
    },
    highlight: {
      fontSize: 9,
      color: '#444',
      marginBottom: 2,
      paddingLeft: 8,
    },
    techStack: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: 4,
    },
    techBadge: {
      fontSize: 7,
      backgroundColor: '#f0f0ff',
      color: '#6c63ff',
      padding: '2 6',
      borderRadius: 3,
      // 긴 스택 문자열이 배지 밖으로 흘러 다른 배지와 겹치는 것을 막는다.
      maxWidth: 240,
    },
    skillCategory: {
      marginBottom: 8,
    },
    skillCategoryName: {
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 3,
    },
    skillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    skillName: {
      fontSize: 9,
      color: '#444',
    },
    educationItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    link: {
      fontSize: 9,
      color: '#6c63ff',
    },
  })

interface ResumeData {
  name: string
  jobTitle: string
  location: string
  socialLinks: { name: string; href: string }[]
  works: {
    title: string
    role: string | null
    startDate: string | null
    endDate: string | null
    isCurrent: boolean
    techStack: string[]
    highlights: string[]
  }[]
  skills: { category: string; items: { name: string; proficiency: number }[] }[]
  education: { institution: string; degree: string; period: string }[]
}

function ResumeDocument({ data, locale }: { data: ResumeData; locale: string }) {
  const styles = createStyles(locale)
  const labels = getSectionLabels(locale)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.jobTitle}>{data.jobTitle}</Text>
          <View style={styles.contactRow}>
            <Text>{data.location}</Text>
            {data.socialLinks.map(link => (
              <Link key={link.name} src={link.href} style={styles.link}>
                {link.name}
              </Link>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>{labels.work}</Text>
        {data.works.map(work => {
          const period = work.startDate
            ? `${work.startDate.slice(0, 7)} - ${work.isCurrent ? 'Present' : (work.endDate?.slice(0, 7) ?? '')}`
            : ''

          return (
            // wrap={false} 가 없으면 항목이 페이지 경계에서 쪼개진다 —
            // 제목만 다음 장으로 넘어가고 기간이 앞 장에 홀로 남는 일이 실제로 났다.
            <View key={work.title} style={styles.workItem} wrap={false}>
              <View style={styles.workHeader}>
                <Text style={styles.workTitle}>{work.title}</Text>
                <Text style={styles.workPeriod}>{period}</Text>
              </View>
              {work.role && <Text style={styles.workRole}>{work.role}</Text>}
              {work.highlights.map(h => (
                <Text key={h} style={styles.highlight}>
                  - {h}
                </Text>
              ))}
              <View style={styles.techStack}>
                {work.techStack.map(tech => (
                  <Text key={tech} style={styles.techBadge}>
                    {tech}
                  </Text>
                ))}
              </View>
            </View>
          )
        })}

        <Text style={styles.sectionTitle}>{labels.skills}</Text>
        {data.skills.map(group => (
          <View key={group.category} style={styles.skillCategory} wrap={false}>
            <Text style={styles.skillCategoryName}>{group.category}</Text>
            <View style={styles.skillRow}>
              {group.items.map(skill => (
                <Text key={skill.name} style={styles.skillName}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>{labels.education}</Text>
        {data.education.map(edu => (
          <View key={edu.institution} style={styles.educationItem} wrap={false}>
            <View>
              <Text style={styles.workTitle}>{edu.institution}</Text>
              <Text style={styles.workRole}>{edu.degree}</Text>
            </View>
            <Text style={styles.workPeriod}>{edu.period}</Text>
          </View>
        ))}
      </Page>
    </Document>
  )
}

export async function generateResumePdf(locale = 'ko') {
  // entities의 조회 함수를 쓴다 — widgets가 서버 리소스를 직접 다루지 않는다.
  // 동적 import는 유지한다. PDF 생성은 이 배너를 실제로 누를 때만 필요한 경로라
  // 초기 번들에서 떼어내는 것이 목적이고, 그건 어느 계층을 거치든 그대로다.
  const { getEducation, getProfile, getSkills, getWorks } = await import('@/entities/portfolio')

  const [profile, works, skills, education] = await Promise.all([
    getProfile(locale),
    getWorks(locale),
    getSkills(),
    getEducation(locale),
  ])

  if (!profile) return

  const data: ResumeData = {
    name: profile.name,
    jobTitle: profile.jobTitle,
    location: profile.location,
    socialLinks: profile.socialLinks ?? [],
    works: works ?? [],
    skills: skills ?? [],
    education: education ?? [],
  }

  const blob = await pdf(<ResumeDocument data={data} locale={locale} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `resume-cha-hyunwoo-${locale}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
