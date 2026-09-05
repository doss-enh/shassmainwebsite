import {groq} from 'next-sanity'

// Enquiries, form submissions, newsletter subscribers, customers, staff
// users/roles, and the audit log live in Postgres — see src/lib/db/*.
// This file only holds queries against Sanity's content types, matching
// the real schema already populated in this project (product, category,
// productAttribute, page, post, faq, banner, navigationMenu, redirect,
// siteSettings). The public `client` is unauthenticated/CDN-only, so it
// never sees draft documents — no explicit draft filtering needed here.

// ---------- Shop ----------
// Listing projection stays to what a card draws — the data cache has a 2MB
// ceiling and a fatter projection over 1,687 products blows past it, so the
// query is never cached and refetches on every render.
export const allProductsQuery = groq`
  *[_type == "product" && status != "draft"] | order(_createdAt desc) {
    _id, title, slug, sku, featured, newProduct, _createdAt,
    featuredImage, category->{name, slug}
  }
`

export const productsByIdsQuery = groq`
  *[_type == "product" && _id in $ids]{ _id, title, sku, slug, featuredImage, gallery }
`

// Ancestry is projected three deep because the tree is three levels: the
// breadcrumb and the "Categories:" meta line both walk it.
export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug && status != "draft"][0]{
    ...,
    category->{name, slug, parent->{name, slug, parent->{name, slug}}},
    additionalCategories[]->{name, slug},
    "related": *[
      _type == "product" && _id != ^._id && defined(featuredImage) && status != "draft" &&
      (category._ref == ^.category._ref || _id in ^.relatedProducts[]._ref)
    ] | order(featured desc)[0...6]{ _id, title, sku, slug, featuredImage }
  }
`

export const allCategoriesQuery = groq`*[_type == "category"] | order(sortOrder asc) { _id, name, slug, image, parent->{name} }`
export const topLevelCategoriesQuery = groq`*[_type == "category" && !defined(parent)] | order(sortOrder asc) { _id, name, slug, image }`

// The storefront's nine roots are curated in siteSettings, because the
// dataset also carries an unused parallel taxonomy (Home & Kitchen,
// Electronics, Fashion …) left over from an earlier import. Anything that
// renders "the categories" to a visitor should use getStorefrontRoots()
// in src/lib/storefrontRoots.ts rather than topLevelCategoriesQuery.
export const storefrontRootsQuery = groq`
  *[_type == "siteSettings"][0].headerCategories[]->{ _id, name, slug, image }
`
export const categoryTreeFlatQuery = groq`*[_type == "category"]{ _id, name, slug, "parentId": parent._ref }`
// Roots carry the listing banner; descendants inherit it (see getStorefrontRoots).
export const rootBannersQuery = groq`*[_type == "category" && !defined(parent) && defined(banner)]{ _id, name, banner }`
export const allProductAttributesQuery = groq`*[_type == "productAttribute"] | order(name asc) { _id, name, slug, showInFilters, values }`

export const productCountQuery = groq`count(*[_type == "product" && status != "draft"])`
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

export const homepageQuery = groq`*[_type == "homepage"][0]{
  ...,
  categoryRow[]->{_id, name, slug, image}
}`

// ---------- Settings ----------
export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  ...,
  headerCategories[]->{_id, name, slug}
}`
export const allRedirectsQuery = groq`*[_type == "redirect"] | order(source asc)`
