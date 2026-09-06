// Converts the HTML that CKEditor stores on shassgift.com into Portable
// Text. Shared by the blog and page importers — both read the same
// .ck-content markup, which uses paragraphs, headings, lists, inline
// links/emphasis and the occasional image, and nothing more exotic.

const INLINE_MARK = {STRONG: 'strong', B: 'strong', EM: 'em', I: 'em', U: 'underline', CODE: 'code'}
const BLOCK_TAGS = /^(P|H[1-6]|UL|OL|BLOCKQUOTE|DIV|SECTION|ARTICLE|FIGURE|TABLE)$/

const ENTITIES = [
  [/&nbsp;/g, ' '],
  [/&amp;/g, '&'],
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&quot;/g, '"'],
  [/&#39;|&rsquo;|&apos;/g, "'"],
  [/&lsquo;/g, "'"],
  [/&ldquo;|&rdquo;/g, '"'],
  [/&mdash;/g, '—'],
  [/&ndash;/g, '–'],
  [/&hellip;/g, '…'],
]

export function createConverter({siteUrl, onImage}) {
  let seed = 0
  const key = () => `k${(seed++).toString(36)}`

  const decode = (s) => ENTITIES.reduce((acc, [re, to]) => acc.replace(re, to), s)

  function spansOf(node, marks = [], defs = []) {
    const spans = []
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        const text = decode(child.rawText)
        if (text.trim()) spans.push({_type: 'span', _key: key(), text, marks: [...marks]})
        continue
      }
      const tag = child.tagName
      if (!tag || tag === 'BR' || tag === 'SCRIPT' || tag === 'STYLE') continue
      if (tag === 'A') {
        const href = child.getAttribute('href')
        if (href) {
          const mk = key()
          defs.push({_type: 'link', _key: mk, href: href.startsWith('/') ? siteUrl + href : href})
          spans.push(...spansOf(child, [...marks, mk], defs))
          continue
        }
      }
      const mark = INLINE_MARK[tag]
      spans.push(...spansOf(child, mark ? [...marks, mark] : marks, defs))
    }
    return spans
  }

  function block(node, style) {
    const defs = []
    const children = spansOf(node, [], defs)
    if (!children.length) return null
    return {_type: 'block', _key: key(), style, markDefs: defs, children}
  }

  function listBlocks(node, listItem) {
    const out = []
    for (const li of node.querySelectorAll('li')) {
      const b = block(li, 'normal')
      if (b) out.push({...b, listItem, level: 1})
    }
    return out
  }

  /**
   * `onImage(src)` may return a Sanity asset id to embed the image inline;
   * returning nothing drops it. It is called for every <img> encountered.
   */
  function convert(root) {
    const blocks = []
    for (const el of root.childNodes) {
      const tag = el.tagName
      if (!tag || tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK') continue

      if (tag === 'IMG') {
        const asset = onImage?.(el.getAttribute('src') || el.getAttribute('data-src'), el.getAttribute('alt'))
        if (asset) blocks.push({_type: 'imageWithAlt', _key: key(), alt: el.getAttribute('alt') || '', asset: {_type: 'reference', _ref: asset}})
        continue
      }

      if (tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE' || tag === 'FIGURE') {
        // CKEditor wraps content in raw-html-embed containers; descend into
        // anything holding block-level children rather than flattening it
        // all into one paragraph.
        const hasBlockKids = el.childNodes.some((c) => c.tagName && (BLOCK_TAGS.test(c.tagName) || c.tagName === 'IMG'))
        if (hasBlockKids) {
          blocks.push(...convert(el))
        } else {
          const b = block(el, 'normal')
          if (b) blocks.push(b)
        }
      } else if (tag === 'P') {
        const imgs = el.querySelectorAll?.('img') || []
        const b = block(el, 'normal')
        if (b) blocks.push(b)
        for (const img of imgs) {
          const asset = onImage?.(img.getAttribute('src') || img.getAttribute('data-src'), img.getAttribute('alt'))
          if (asset) blocks.push({_type: 'imageWithAlt', _key: key(), alt: img.getAttribute('alt') || '', asset: {_type: 'reference', _ref: asset}})
        }
      } else if (/^H[1-6]$/.test(tag)) {
        const level = Math.min(4, Math.max(2, Number(tag[1])))
        const b = block(el, `h${level}`)
        if (b) blocks.push(b)
      } else if (tag === 'UL') {
        blocks.push(...listBlocks(el, 'bullet'))
      } else if (tag === 'OL') {
        blocks.push(...listBlocks(el, 'number'))
      } else if (tag === 'BLOCKQUOTE') {
        const b = block(el, 'blockquote')
        if (b) blocks.push(b)
      }
    }
    return blocks
  }

  /**
   * Bootstrap accordions repeat their question in both the toggle and the
   * panel body, so a straight walk emits every heading twice. Collapse a
   * block whose text repeats the one before it.
   */
  function convertDeduped(root) {
    const out = []
    for (const b of convert(root)) {
      const text = (b.children || []).map((c) => c.text).join('').replace(/\s+/g, ' ').trim()
      if (text) {
        const prev = out[out.length - 1]
        const prevText = prev && (prev.children || []).map((c) => c.text).join('').replace(/\s+/g, ' ').trim()
        if (prevText && prevText === text) continue
      }
      out.push(b)
    }
    return out
  }

  return {convert: convertDeduped, raw: convert, key}
}
