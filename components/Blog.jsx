'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import styles from './Blog.module.css';
import { blogPosts } from '../lib/blogData';

export default function Blog() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const postsRef = useRef([]);

  useGSAP(() => {
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

    postsRef.current.forEach((post, idx) => {
      gsap.from(post, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        delay: idx * 0.1,
        scrollTrigger: {
          trigger: post,
          start: 'top 80%',
          end: 'top 50%',
          scrub: 0.5,
        },
      });
    });
  }, { scope: containerRef });

  return (
    <section id="blog" className={`section ${styles.section}`} ref={containerRef}>
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow" style={{ marginBottom: '1rem', color: 'var(--gold-light)' }}>
            Stories from the Mountains
          </p>
          <h2 className="heading-xl" ref={titleRef}>
            Mountain Wisdom & Travel Tales
          </h2>
          <p className="body-lg" style={{ maxWidth: '50ch', marginTop: '1rem', color: 'var(--text-secondary)' }}>
            Discover tips, stories, and insights about mountain living, Himalayan travel, and the art of finding peace in nature.
          </p>
        </div>

        <div className={styles.grid}>
          {blogPosts.map((post, idx) => (
            <article
              key={post.id}
              className={styles.card}
              ref={(el) => (postsRef.current[idx] = el)}
            >
              <div className={styles.imageContainer}>
                <img src={post.image} alt={post.title} className={styles.cardImage} />
                <div className={styles.category}>{post.category}</div>
              </div>

              <div className={styles.cardContent}>
                <p className={styles.date}>{post.date}</p>
                <h3 className={styles.cardTitle}>{post.title}</h3>
                <p className={styles.excerpt}>{post.excerpt}</p>

                <div className={styles.footer}>
                  <p className={styles.readTime}>{post.readTime} min read</p>
                  <a href={`/blog/${post.slug}`} className={styles.link}>
                    Read More →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
