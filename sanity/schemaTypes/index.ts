// Objects
import imageWithAlt from './objects/imageWithAlt'
import responsiveImage from './objects/responsiveImage'
import seo from './objects/seo'
import {variantOption, productVariant, variantAxis, productFaq} from './objects/productVariant'
import {navSubItem, navItem} from './objects/navItem'

// Documents — matches the real, already-populated Sanity project (see
// db/schema.sql and src/lib/db/* for what's Postgres instead: enquiries,
// staff users/sessions, form submissions, newsletter, customers, audit log).
import siteSettings from './siteSettings'
import homepage from './homepage'
import category from './category'
import productAttribute from './productAttribute'
import product from './product'
import page from './page'
import post from './post'
import faq from './faq'
import banner from './banner'
import navigationMenu from './navigationMenu'
import redirect from './redirect'

export const schemaTypes = [
  // objects
  imageWithAlt,
  responsiveImage,
  seo,
  variantOption,
  productVariant,
  variantAxis,
  productFaq,
  navSubItem,
  navItem,
  // documents
  siteSettings,
  homepage,
  category,
  productAttribute,
  product,
  page,
  post,
  faq,
  banner,
  navigationMenu,
  redirect,
]
