'use client'

import {PortableText as PortableTextBase, type PortableTextComponents} from '@portabletext/react'
import {urlFor} from '@sanity-lib/lib/image'

const components: PortableTextComponents = {
  types: {
    imageWithAlt: ({value}) => {
      const url = urlFor(value)?.width(900).url()
      if (!url) return null
      return <img src={url} alt={value?.alt || ''} className="my-4 rounded-lg" />
    },
    image: ({value}) => {
      const url = urlFor(value)?.width(900).url()
      if (!url) return null
      return <img src={url} alt="" className="my-4 rounded-lg" />
    },
  },
}

export function PortableText({value}: {value: any}) {
  return <PortableTextBase value={value} components={components} />
}
