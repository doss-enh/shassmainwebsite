import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    {name: 'general', title: 'General', default: true},
    {name: 'contact', title: 'Contact'},
    {name: 'seo', title: 'SEO'},
    {name: 'analytics', title: 'Analytics & Tags'},
    {name: 'spam', title: 'Spam Protection'},
    {name: 'smtp', title: 'Email / SMTP'},
    {name: 'tax', title: 'Tax'},
    {name: 'payments', title: 'Payments'},
    {name: 'technical', title: 'Technical'},
  ],
  fields: [
    defineField({name: 'siteName', title: 'Site name', type: 'string', group: 'general', initialValue: 'Shass Gift'}),
    defineField({name: 'tagline', title: 'Tagline', type: 'string', group: 'general'}),
    defineField({name: 'logo', title: 'Logo', type: 'image', group: 'general'}),
    defineField({name: 'favicon', title: 'Favicon', type: 'image', group: 'general'}),
    defineField({name: 'currency', title: 'Display currency', type: 'string', group: 'general', initialValue: 'AED'}),

    defineField({name: 'contactEmail', title: 'Contact email', type: 'string', group: 'contact'}),
    defineField({name: 'contactPhone', title: 'Contact phone', type: 'string', group: 'contact'}),
    defineField({name: 'whatsapp', title: 'WhatsApp number', type: 'string', group: 'contact'}),
    defineField({name: 'address', title: 'Address', type: 'text', group: 'contact'}),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'contact',
      of: [
        defineField({
          name: 'socialLink',
          type: 'object',
          fields: [
            {name: 'platform', type: 'string', options: {list: ['instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'tiktok']}},
            {name: 'url', type: 'url'},
          ],
        }),
      ],
    }),

    defineField({name: 'seoTitle', title: 'Default SEO title', type: 'string', group: 'seo'}),
    defineField({name: 'seoDescription', title: 'Default SEO description', type: 'text', group: 'seo'}),
    defineField({name: 'seoImage', title: 'Default social share image', type: 'image', group: 'seo'}),

    defineField({name: 'gaMeasurementId', title: 'Google Analytics ID', type: 'string', group: 'analytics'}),
    defineField({name: 'gtmContainerId', title: 'Google Tag Manager ID', type: 'string', group: 'analytics'}),
    defineField({name: 'metaPixelId', title: 'Meta Pixel ID', type: 'string', group: 'analytics'}),
    defineField({name: 'customHeadScripts', title: 'Custom head scripts', type: 'text', group: 'analytics'}),

    defineField({name: 'recaptchaEnabled', title: 'Enable reCAPTCHA', type: 'boolean', group: 'spam', initialValue: false}),
    defineField({name: 'recaptchaSiteKey', title: 'reCAPTCHA site key', type: 'string', group: 'spam'}),
    defineField({name: 'honeypotEnabled', title: 'Enable honeypot field', type: 'boolean', group: 'spam', initialValue: true}),
    defineField({name: 'rateLimitPerHour', title: 'Max submissions per IP / hour', type: 'number', group: 'spam', initialValue: 10}),

    defineField({name: 'smtpHost', title: 'SMTP host', type: 'string', group: 'smtp'}),
    defineField({name: 'smtpPort', title: 'SMTP port', type: 'number', group: 'smtp'}),
    defineField({name: 'smtpUser', title: 'SMTP username', type: 'string', group: 'smtp'}),
    defineField({name: 'fromEmail', title: 'From email address', type: 'string', group: 'smtp'}),
    defineField({name: 'notifyEmails', title: 'Notify on new enquiry (emails)', type: 'array', of: [{type: 'string'}], group: 'smtp'}),

    defineField({name: 'taxEnabled', title: 'Show tax on quotes', type: 'boolean', group: 'tax', initialValue: false}),
    defineField({name: 'taxLabel', title: 'Tax label', type: 'string', group: 'tax', initialValue: 'VAT'}),
    defineField({name: 'taxRate', title: 'Tax rate (%)', type: 'number', group: 'tax', initialValue: 5}),

    defineField({name: 'paymentsNote', title: 'Payment terms note', type: 'text', group: 'payments'}),
    defineField({name: 'bankDetails', title: 'Bank details (for quotes)', type: 'text', group: 'payments'}),

    defineField({name: 'maintenanceMode', title: 'Maintenance mode', type: 'boolean', group: 'technical', initialValue: false}),
    defineField({name: 'robotsTxt', title: 'robots.txt override', type: 'text', group: 'technical'}),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
