import {groq} from 'next-sanity'

// Enquiries, form submissions, newsletter subscribers, customers, staff
// users/roles, and the audit log live in Postgres — see src/lib/db/*.
// This file only holds queries against Sanity's content types.

// ---------- Shop ----------
export const allProductsQuery = groq`
  *[_type == "product"] | order(_createdAt desc) {
    _id, name, slug, sku, status, featured, "image": images[0],
    category->{name, slug}, brand->{name}
  }
`

export const productsByIdsQuery = groq`
  *[_type == "product" && _id in $ids]{ _id, name, sku, slug, "image": images[0] }
`

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0]{
    ..., category->{name, slug}, brand->{name, slug},
    attributes[]{ ..., attribute->{name} }
  }
`

export const allCategoriesQuery = groq`*[_type == "category"] | order(order asc) { _id, name, slug, image, parent->{name} }`
export const allBrandsQuery = groq`*[_type == "brand"] | order(name asc) { _id, name, slug, logo }`
export const allAttributesQuery = groq`*[_type == "attribute"] | order(name asc) { _id, name, slug, values }`

export const liveProductCountQuery = groq`count(*[_type == "product" && status == "live"])`
export const categoryCountQuery = groq`count(*[_type == "category"])`

// ---------- Content ----------
export const allBlogPostsQuery = groq`*[_type == "blogPost"] | order(publishedAt desc) { _id, title, slug, coverImage, author, category, publishedAt }`
export const blogPostBySlugQuery = groq`*[_type == "blogPost" && slug.current == $slug][0]`
export const allPagesQuery = groq`*[_type == "page"] | order(title asc) { _id, title, slug, published }`
export const pageBySlugQuery = groq`*[_type == "page" && slug.current == $slug][0]`
export const allFaqsQuery = groq`*[_type == "faq"] | order(order asc) { _id, question, answer, category }`
export const homepageBannerQuery = groq`*[_type == "homepageBanner"][0]{ slides[] | order(order asc) }`
export const allCataloguesQuery = groq`*[_type == "catalogue"] | order(_createdAt desc) { _id, title, coverImage, published, file }`
export const allMenusQuery = groq`*[_type == "menu"]{ _id, title, location, items }`
export const menuByLocationQuery = groq`*[_type == "menu" && location == $location][0]{ items }`

// ---------- Settings ----------
export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]`
export const allRedirectsQuery = groq`*[_type == "redirect"] | order(source asc)`
