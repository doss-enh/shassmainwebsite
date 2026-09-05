import {groq} from 'next-sanity'

// Enquiries, form submissions, newsletter subscribers, customers, staff
// users/roles, and the audit log live in Postgres — see src/lib/db/*.
// This file only holds queries against Sanity's content types, matching
// the real schema already populated in this project (product, category,
// productAttribute, page, post, faq, banner, navigationMenu, redirect,
// siteSettings). The public `client` is unauthenticated/CDN-only, so it
// never sees draft documents — no explicit draft filtering needed here.

// ---------- Shop ----------
export const allProductsQuery = groq`
  *[_type == "product"] | order(_createdAt desc) {
    _id, title, slug, sku, featured, bestSeller, newProduct, stockStatus,
    featuredImage, category->{name, slug}
  }
`

export const productsByIdsQuery = groq`
  *[_type == "product" && _id in $ids]{ _id, title, sku, slug, featuredImage, gallery }
`

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0]{
    ..., category->{name, slug}, additionalCategories[]->{name, slug}
  }
`

export const allCategoriesQuery = groq`*[_type == "category"] | order(sortOrder asc) { _id, name, slug, image, parent->{name} }`
export const topLevelCategoriesQuery = groq`*[_type == "category" && !defined(parent)] | order(sortOrder asc) { _id, name, slug, image }`
export const categoryTreeFlatQuery = groq`*[_type == "category"]{ _id, name, slug, "parentId": parent._ref }`
export const allProductAttributesQuery = groq`*[_type == "productAttribute"] | order(name asc) { _id, name, slug, showInFilters, values }`

export const productCountQuery = groq`count(*[_type == "product"])`
export const categoryCountQuery = groq`count(*[_type == "category"])`

// ---------- Content ----------
export const allPostsQuery = groq`*[_type == "post"] | order(publishedAt desc) { _id, title, slug, excerpt, publishedAt }`
export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0]`
export const allPagesQuery = groq`*[_type == "page"] | order(title asc) { _id, title, slug }`
export const pageBySlugQuery = groq`*[_type == "page" && slug.current == $slug][0]`
export const allFaqsQuery = groq`*[_type == "faq"] | order(sortOrder asc) { _id, question, answer, category }`
export const activeBannersQuery = groq`*[_type == "banner" && active == true && placement == $placement] | order(sortOrder asc)`
export const allBannersQuery = groq`*[_type == "banner"] | order(sortOrder asc) { _id, title, placement, active, image }`
export const allNavigationMenusQuery = groq`*[_type == "navigationMenu"]{ _id, title, location, items }`
export const navigationMenuByLocationQuery = groq`*[_type == "navigationMenu" && location == $location][0]{ items[]{..., category->{name, slug}, children[]{..., category->{name, slug}}} }`

// ---------- Settings ----------
export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]`
export const allRedirectsQuery = groq`*[_type == "redirect"] | order(source asc)`
