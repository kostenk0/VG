import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

interface SEOProps {
  title: string
  description?: string
}

export function SEO({ title, description }: SEOProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language.split('-')[0]

  return (
    <Helmet htmlAttributes={{ lang }}>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:image" content="/vg/og-image.png" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  )
}
