import {defineField, defineType} from 'sanity'

// Matches the real, already-populated siteSettings singleton in this
// project (siteName, address, benefits, announcements, etc. below). The
// extra groups (analytics/spam/smtp/technical) are additive —
// operational config the console needs that this document didn't carry yet.
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    {name: 'general', title: 'General', default: true},
    {name: 'announcements', title: 'Announcements & Benefits'},
    {name: 'analytics', title: 'Analytics & Tags'},
    {name: 'spam', title: 'Spam Protection'},
    {name: 'smtp', title: 'Email / SMTP'},
    {name: 'technical', title: 'Technical'},
  ],
  fields: [
    defineField({name: 'siteName', title: 'Site name', type: 'string', group: 'general'}),
    defineField({name: 'tagline', title: 'Tagline', type: 'string', group: 'general'}),
    defineField({name: 'legalName', title: 'Legal company name', type: 'string', group: 'general'}),
    defineField({name: 'logo', title: 'Logo', type: 'imageWithAlt', group: 'general'}),
    defineField({name: 'email', title: 'Contact email', type: 'string', group: 'general'}),
    defineField({name: 'phone', title: 'Contact phone', type: 'string', group: 'general'}),
    defineField({name: 'whatsapp', title: 'WhatsApp number', type: 'string', group: 'general'}),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      group: 'general',
      fields: [
        {name: 'streetAddress', type: 'string'},
        {name: 'locality', type: 'string'},
        {name: 'region', type: 'string'},
        {name: 'country', type: 'string'},
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'general',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            {name: 'platform', type: 'string', options: {list: ['facebook', 'instagram', 'x', 'pinterest', 'youtube', 'tiktok', 'linkedin']}},
            {name: 'url', type: 'url'},
          ],
        },
      ],
    }),

    defineField({
      name: 'headerCategories',
      title: 'Categories in the header menu',
      type: 'array',
      group: 'general',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      description:
        'Controls the Product Categories flyout. Leave empty to fall back to every top-level category by sort order.',
    }),

    defineField({name: 'announcementsEnabled', title: 'Show announcement bar', type: 'boolean', group: 'announcements'}),
    defineField({name: 'announcements', title: 'Announcement messages', type: 'array', of: [{type: 'string'}], group: 'announcements'}),
    defineField({
      name: 'benefits',
      title: 'Trust badges',
      type: 'array',
      group: 'announcements',
      of: [
        {
          type: 'object',
          name: 'benefit',
          fields: [
            {name: 'icon', type: 'string'},
            {name: 'title', type: 'string'},
            {name: 'text', type: 'string'},
          ],
        },
      ],
    }),

    defineField({name: 'gaMeasurementId', title: 'Google Analytics ID', type: 'string', group: 'analytics'}),
    defineField({name: 'gtmContainerId', title: 'Google Tag Manager ID', type: 'string', group: 'analytics'}),
    defineField({name: 'metaPixelId', title: 'Meta Pixel ID', type: 'string', group: 'analytics'}),
    defineField({name: 'customHeadScripts', title: 'Custom head scripts', type: 'text', group: 'analytics'}),

    defineField({name: 'recaptchaEnabled', title: 'Enable reCAPTCHA', type: 'boolean', group: 'spam'}),
    defineField({name: 'recaptchaSiteKey', title: 'reCAPTCHA site key', type: 'string', group: 'spam'}),
    defineField({name: 'honeypotEnabled', title: 'Enable honeypot field', type: 'boolean', group: 'spam'}),
    defineField({name: 'rateLimitPerHour', title: 'Max submissions per IP / hour', type: 'number', group: 'spam'}),

    defineField({name: 'smtpHost', title: 'SMTP host', type: 'string', group: 'smtp'}),
    defineField({name: 'smtpPort', title: 'SMTP port', type: 'number', group: 'smtp'}),
    defineField({name: 'smtpUser', title: 'SMTP username', type: 'string', group: 'smtp'}),
    defineField({name: 'fromEmail', title: 'From email address', type: 'string', group: 'smtp'}),
    defineField({name: 'notifyEmails', title: 'Notify on new enquiry (emails)', type: 'array', of: [{type: 'string'}], group: 'smtp'}),

    defineField({name: 'maintenanceMode', title: 'Maintenance mode', type: 'boolean', group: 'technical'}),
    defineField({name: 'robotsTxt', title: 'robots.txt override', type: 'text', group: 'technical'}),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
