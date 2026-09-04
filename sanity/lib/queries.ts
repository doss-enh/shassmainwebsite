import {groq} from 'next-sanity'

// ---------- Dashboard ----------
export const dashboardEnquiryCountsQuery = groq`{
  "needsReply": count(*[_type == "enquiry" && status == "new"]),
  "inProgress": count(*[_type == "enquiry" && status in ["contacted", "quoted", "negotiation"]]),
  "last7Days": count(*[_type == "enquiry" && dateTime(createdAt) > dateTime(now()) - 60*60*24*7]),
  "prev7Days": count(*[_type == "enquiry" && dateTime(createdAt) <= dateTime(now()) - 60*60*24*7 && dateTime(createdAt) > dateTime(now()) - 60*60*24*14]),
  "won": count(*[_type == "enquiry" && status == "won"]),
  "lost": count(*[_type == "enquiry" && status == "lost"]),
  "subscribers": count(*[_type == "newsletterSubscriber" && status == "subscribed"]),
  "productsLive": count(*[_type == "product" && status == "live"]),
  "categoriesCount": count(*[_type == "category"]),
  "formSubmissions": count(*[_type == "formSubmission"]),
  "pipelineNew": count(*[_type == "enquiry" && status == "new"]),
  "pipelineContacted": count(*[_type == "enquiry" && status == "contacted"]),
  "pipelineQuoted": count(*[_type == "enquiry" && status == "quoted"]),
  "pipelineNegotiation": count(*[_type == "enquiry" && status == "negotiation"]),
  "pipelineWon": count(*[_type == "enquiry" && status == "won"]),
  "pipelineLost": count(*[_type == "enquiry" && status == "lost"]),
  "totalEnquiries": count(*[_type == "enquiry"])
}`

export const recentEnquiriesQuery = groq`
  *[_type == "enquiry"] | order(createdAt desc) [0...6] {
    _id, enquiryNumber, customerName, company, status, createdAt,
    "itemCount": count(items)
  }
`

export const enquiriesOver14DaysQuery = groq`
  *[_type == "enquiry" && dateTime(createdAt) > dateTime(now()) - 60*60*24*14] {
    createdAt
  }
`

// ---------- Enquiries ----------
export const allEnquiriesQuery = groq`
  *[_type == "enquiry"] | order(createdAt desc) {
    _id, enquiryNumber, customerName, company, email, phone, status, createdAt,
    "itemCount": count(items)
  }
`

export const enquiryByIdQuery = groq`
  *[_type == "enquiry" && _id == $id][0]{
    ..., items[]{ ..., product->{_id, name, slug, "image": images[0]} }
  }
`

// ---------- Form submissions / Newsletter ----------
export const allFormSubmissionsQuery = groq`
  *[_type == "formSubmission"] | order(createdAt desc) {
    _id, formType, name, email, phone, status, createdAt
  }
`

export const allNewsletterSubscribersQuery = groq`
  *[_type == "newsletterSubscriber"] | order(subscribedAt desc) {
    _id, email, status, subscribedAt
  }
`

// ---------- Shop ----------
export const allProductsQuery = groq`
  *[_type == "product"] | order(_createdAt desc) {
    _id, name, slug, sku, status, featured, "image": images[0],
    category->{name}, brand->{name}
  }
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
export const allWebhooksQuery = groq`*[_type == "webhook"] | order(name asc)`

// ---------- People & access ----------
export const allCustomersQuery = groq`*[_type == "customer"] | order(createdAt desc)`
export const allConsoleUsersQuery = groq`*[_type == "consoleUser"]{ _id, name, email, active, role->{name} }`
export const allRolesQuery = groq`*[_type == "role"]{ _id, name, permissions }`

// ---------- System ----------
export const recentAuditLogQuery = groq`*[_type == "auditLogEntry"] | order(createdAt desc) [0...50]`
