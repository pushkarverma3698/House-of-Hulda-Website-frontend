'use client';
import { useParams } from 'next/navigation';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { blogPosts } from '@/lib/blogData';
import Link from 'next/link';
import styles from './BlogPost.module.css';

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug;

  const post = blogPosts.find((p) => p.slug === slug);
  const postIndex = blogPosts.findIndex((p) => p.slug === slug);
  const relatedPosts = blogPosts
    .filter((_, idx) => idx !== postIndex)
    .slice(0, 3);

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    gsap.from(imageRef.current, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 50%',
        end: 'top 20%',
        scrub: 1.5,
      },
    });

    gsap.from(titleRef.current, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 60%',
        end: 'top 30%',
        scrub: 1,
      },
    });

    gsap.from(contentRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: contentRef.current,
        start: 'top 70%',
        end: 'top 40%',
        scrub: 1,
      },
    });
  }, { scope: containerRef });

  if (!post) {
    return (
      <section className={styles.notFound}>
        <div className="container">
          <h1>Post not found</h1>
          <Link href="/blog" className={styles.backLink}>← Back to Blog</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <article ref={containerRef} className={styles.article}>
        <div className={styles.hero}>
          <img
            ref={imageRef}
            src={post.image}
            alt={post.title}
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <Link href="/" className={styles.backNav}>← House of Hulda</Link>
            <div className={styles.heroBadge}>{post.category}</div>
          </div>
        </div>

        <div className="container">
          <div className={styles.header}>
            <h1 className="heading-xl" ref={titleRef}>
              {post.title}
            </h1>
            <div className={styles.meta}>
              <span className={styles.date}>{post.date}</span>
              <span className={styles.separator}>•</span>
              <span className={styles.readTime}>{post.readTime} min read</span>
            </div>
          </div>

          <div ref={contentRef} className={styles.content}>
            <p className="body-lg">{post.excerpt}</p>
            <div className={styles.contentBody}>
              {post.content}
            </div>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className="container">
            <h2 className="heading-lg" style={{ marginBottom: '2rem' }}>More Stories from the Mountains</h2>
            <div className={styles.relatedGrid}>
              {relatedPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className={styles.relatedCard}>
                  <img src={post.image} alt={post.title} className={styles.relatedImage} />
                  <div className={styles.relatedContent}>
                    <p className={styles.relatedCategory}>{post.category}</p>
                    <h3 className={styles.relatedTitle}>{post.title}</h3>
                    <p className={styles.relatedExcerpt}>{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
