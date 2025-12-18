import Image from 'next/image'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import styles from './lawn-products-blog.module.css'

export const metadata = {
  title: 'Lawn Products Blog',
  description: ' list of lawn care products',
}

export default async function LawnProductsPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/lawn-care-products?limit=100`,
    { cache: 'no-store' },
  )
  const data = await res.json()
  const products = data.docs || []

  const formattedProducts = products.map((p: any) => ({
    ...p,
    htmlDescription: convertLexicalToHTML({ data: p.description }),
  }))

  return (
    <div className={styles.container}>
      <h1>Lawn Care Products Blog</h1>
      <div className={styles.postList}>
        {formattedProducts.map((p: any) => (
          <div key={p.id} className={styles.postCard}>
            {p.image?.url && (
              <div className={styles.postImage}>
                <Image
                  src={p.image.url}
                  alt={p.name}
                  width={300}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
            <div className={styles.postContent}>
              <h2>{p.name}</h2>
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: p.htmlDescription }}
              />
              <p>
                <strong>Price:</strong> ₹{p.price}
              </p>
              <p>
                <strong>Category:</strong> {p.category}
              </p>
              <p>
                <strong>Stock:</strong> {p.stock}
              </p>
              <p>
                <strong>Rating:</strong> ⭐ {p.rating}
              </p>
              {p.tags?.length > 0 && (
                <div className={styles.tags}>
                  {p.tags.map((t: any, i: number) => (
                    <span key={i}>{t.tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
