import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  image?: string;           // OG/Twitter image
  type?: 'website' | 'article' | 'product';
  jsonLd?: object;          // structured data
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private renderer: Renderer2;

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document,
    rf: RendererFactory2
  ) {
    this.renderer = rf.createRenderer(null, null);
  }

  update(config: SeoConfig) {
    if (config.title) this.title.setTitle(config.title);
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
      this.meta.updateTag({ name: 'twitter:description', content: config.description });
    }
    if (config.keywords) this.meta.updateTag({ name: 'keywords', content: config.keywords });
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });

    // Canonical
    if (config.canonicalUrl) this.setCanonical(config.canonicalUrl);

    // JSON-LD structured data
    this.setJsonLd(config.jsonLd);
  }

  private setCanonical(url: string) {
    let link: HTMLLinkElement | null = this.doc.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'canonical');
      this.renderer.appendChild(this.doc.head, link);
    }
    this.renderer.setAttribute(link, 'href', url);
  }

  private setJsonLd(data?: object) {
    // remove old scripts
    const old = Array.from(this.doc.head.querySelectorAll('script[type="application/ld+json"].seo-jsonld'));
    old.forEach(s => this.renderer.removeChild(this.doc.head, s));
    if (!data) return;

    const script = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    this.renderer.addClass(script, 'seo-jsonld');
    script.text = JSON.stringify(data);
    this.renderer.appendChild(this.doc.head, script);
  }
}
