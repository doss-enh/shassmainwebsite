export type NavItem = {
  label: string
  href: string
  badgeKey?: 'needsReply'
}

export type NavSection = {
  title: string
  items: NavItem[]
}

export const adminNav: NavSection[] = [
  {
    title: 'Overview',
    items: [{label: 'Dashboard', href: '/admin/dashboard'}],
  },
  {
    title: 'Enquiries',
    items: [
      {label: 'Product enquiries', href: '/admin/enquiries', badgeKey: 'needsReply'},
      {label: 'Form submissions', href: '/admin/form-submissions'},
      {label: 'Newsletter', href: '/admin/newsletter'},
    ],
  },
  {
    title: 'Shop',
    items: [
      {label: 'Products', href: '/admin/products'},
      {label: 'Categories', href: '/admin/categories'},
      {label: 'Attributes', href: '/admin/attributes'},
    ],
  },
  {
    title: 'Content',
    items: [
      {label: 'Banners', href: '/admin/banners'},
      {label: 'Media', href: '/admin/media'},
      {label: 'Pages', href: '/admin/pages'},
      {label: 'Blog posts', href: '/admin/blog-posts'},
      {label: 'FAQs', href: '/admin/faqs'},
    ],
  },
  {
    title: 'Navigation',
    items: [{label: 'Menus', href: '/admin/menus'}],
  },
  {
    title: 'Settings',
    items: [
      {label: 'Site settings', href: '/admin/settings/site'},
      {label: 'Analytics & tags', href: '/admin/settings/analytics'},
      {label: 'Spam protection', href: '/admin/settings/spam'},
      {label: 'Email / SMTP', href: '/admin/settings/smtp'},
      {label: 'Webhooks', href: '/admin/settings/webhooks'},
      {label: 'Technical', href: '/admin/settings/technical'},
      {label: 'Redirects', href: '/admin/settings/redirects'},
    ],
  },
  {
    title: 'People & access',
    items: [
      {label: 'Customers', href: '/admin/customers'},
      {label: 'Users', href: '/admin/users'},
      {label: 'Roles', href: '/admin/roles'},
    ],
  },
  {
    title: 'System',
    items: [
      {label: 'Audit log', href: '/admin/audit-log'},
      {label: 'Health', href: '/admin/health'},
    ],
  },
]
