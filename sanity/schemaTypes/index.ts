import siteSettings from './siteSettings'
import category from './category'
import brand from './brand'
import attribute from './attribute'
import product from './product'
import page from './page'
import blogPost from './blogPost'
import faq from './faq'
import homepageBanner from './homepageBanner'
import catalogue from './catalogue'
import menu from './menu'
import redirect from './redirect'

// Enquiries, form submissions, newsletter subscribers, customers, staff
// users/roles, and the audit log live in Postgres (see db/schema.sql) —
// Sanity here is content-only, per the build spec's data-layer split.
export const schemaTypes = [
  siteSettings,
  category,
  brand,
  attribute,
  product,
  page,
  blogPost,
  faq,
  homepageBanner,
  catalogue,
  menu,
  redirect,
]
