// Deep-links into the embedded Sanity Studio (mounted at /studio) so admin
// console list pages can hand off to Studio's rich editors for authoring
// content, instead of re-building block/image editors in the console.
export function studioCreateUrl(type: string) {
  return `/studio/structure/${type};new`
}

export function studioEditUrl(type: string, id: string) {
  return `/studio/structure/${type};${id}`
}

export function studioListUrl(type: string) {
  return `/studio/structure/${type}`
}
