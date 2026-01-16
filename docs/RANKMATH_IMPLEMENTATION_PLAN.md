# RankMath Features Implementation Plan

> Kế hoạch triển khai đầy đủ các chức năng RankMath SEO cho Directus SEO Plugin

## Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc hiện tại](#kiến-trúc-hiện-tại)
- [Phase 1: Nền tảng](#phase-1-nền-tảng)
- [Phase 2: SEO Analysis Rules](#phase-2-seo-analysis-rules)
- [Phase 3: Link & Image Analysis](#phase-3-link--image-analysis)
- [Cấu trúc thư mục đề xuất](#cấu-trúc-thư-mục-đề-xuất)
- [Data Schema](#data-schema)
- [UI/UX Design](#uiux-design)

---

## Tổng quan

### Mục tiêu
Triển khai các tính năng phân tích SEO nội dung bài viết như RankMath, bao gồm:
- 18 quy tắc phân tích SEO nội dung
- Schema Markup / Structured Data
- Link & Image Analysis

### Nguyên tắc thiết kế cho Headless CMS
1. **Lưu trữ intent, không lưu HTML** - JSON field chứa cấu hình SEO, frontend tự render
2. **Shared Engine** - Library dùng chung cho cả editor và frontend
3. **Backward Compatible** - Không phá vỡ dữ liệu hiện tại

### Ước tính thời gian
| Phase | Mô tả | Thời gian |
|-------|-------|-----------|
| Phase 1 | Nền tảng | 1-2 ngày |
| Phase 2 | SEO Analysis Rules | 2-3 ngày |
| Phase 3 | Link & Image Analysis | 1 ngày |
| **Tổng** | | **4-6 ngày** |

---

## Kiến trúc hiện tại

### Những gì đã có
- ✅ SEO Title với template
- ✅ Meta Description với template
- ✅ Focus Keyphrase (đơn)
- ✅ Custom additional fields
- ✅ Basic analysis (title/description length)

### Những gì cần thêm (Content SEO)
- ❌ Multiple Focus Keywords (comma-separated)
- ❌ Schema Markup / Structured Data
- ❌ Advanced SEO Analysis (18 rules)
- ❌ Readability Analysis
- ❌ Link Analysis (internal/external)
- ❌ Image SEO Analysis

---

## Phase 1: Nền tảng

### 1.1 Multiple Focus Keywords (Comma-separated)

**Mô tả:** Hỗ trợ nhiều focus keyphrases bằng cách dùng comma-separated trong field hiện tại.

**Implementation:**
```typescript
// GIỮ NGUYÊN schema hiện tại
focus_keyphrase?: string;  // Comma-separated, ví dụ: "seo plugin, directus seo, headless cms"
```

**Parsing Logic:**
```typescript
function parseKeywords(focusKeyphrase: string): { primary: string; secondary: string[] } {
  const keywords = focusKeyphrase.split(',').map(k => k.trim()).filter(Boolean);
  return {
    primary: keywords[0] || '',
    secondary: keywords.slice(1),
  };
}
```

**UI Component:** Giữ nguyên `FocusKeyphrase.vue`
- Input text với placeholder: "Từ khóa chính, từ khóa phụ 1, từ khóa phụ 2"
- Help text: "Phân cách nhiều từ khóa bằng dấu phẩy. Từ khóa đầu tiên là từ khóa chính."

**Analysis:**
- Primary keyword (đầu tiên): chạy đầy đủ rules
- Secondary keywords: chỉ hiển thị số lần xuất hiện

---

### 1.2 Schema Markup / Structured Data

**Mô tả:** Tạo JSON-LD cho các loại schema phổ biến.

**Supported Schema Types:**

| Type | Fields |
|------|--------|
| **Article** | headline, author, datePublished, dateModified, image |
| **NewsArticle** | + newsSource |
| **BlogPosting** | + wordCount |
| **Product** | name, description, image, brand, sku, price, availability, review |
| **LocalBusiness** | name, address, phone, openingHours, geo, priceRange |
| **Organization** | name, logo, url, sameAs (social links) |
| **Person** | name, image, jobTitle, sameAs |
| **FAQ** | questions[] { question, answer } |
| **HowTo** | name, description, steps[] { name, text, image } |
| **Recipe** | name, image, ingredients[], instructions[], cookTime, prepTime |
| **Event** | name, startDate, endDate, location, performer |
| **Course** | name, description, provider |
| **BreadcrumbList** | items[] { name, url } |

**Implementation:**
```typescript
// Thêm vào SeoValue
schema?: {
  enabled: boolean;
  type: SchemaType;
  data: Record<string, any>;
  // Mapping từ item fields
  fieldMappings?: Record<string, string>; // schema_field -> item_field
};
```

**UI Components:**
- `SchemaEditor/SchemaTypeSelect.vue` - Chọn loại schema
- `SchemaEditor/SchemaFieldsForm.vue` - Form động theo loại schema
- `SchemaEditor/JsonLdPreview.vue` - Preview JSON-LD output

**Builders:**
```
src/shared/schema/builders/
  article.ts
  product.ts
  localBusiness.ts
  faq.ts
  howTo.ts
  breadcrumb.ts
  index.ts (dispatcher)
```

---

### 1.3 Shared SEO Engine

**Mô tả:** Library TypeScript dùng chung cho editor và frontend.

**Public API:**
```typescript
// src/shared/engine/index.ts

export interface SeoEngine {
  // Phân tích nội dung
  analyze(config: AnalyzeConfig): AnalysisResult;
  
  // Tạo meta tags
  buildMeta(seoValue: SeoValue, itemValues: Record<string, any>): MetaTags;
  
  // Tạo JSON-LD
  buildJsonLd(seoValue: SeoValue, itemValues: Record<string, any>): JsonLd;
  
  // Tạo robots meta string
  buildRobots(seoValue: SeoValue): string;
}
```

**Modules:**
```
src/shared/engine/
  index.ts          # Public API
  text.ts           # Tokenize, word count, normalize
  html.ts           # Parse HTML, extract links/images
  templates.ts      # Apply mustache templates
  urls.ts           # Canonical URL building
  robots.ts         # Map directives to meta string
```

---

## Phase 2: SEO Analysis Rules

### 2.1 Tổng quan Rules

Chia thành 4 nhóm như RankMath:

1. **SEO Cơ bản (Basic SEO)** - 5 rules
2. **Bổ sung (Additional)** - 6 rules
3. **Khả năng đọc tiêu đề (Title Readability)** - 1 rule
4. **Khả năng đọc nội dung (Content Readability)** - 6 rules

**Tổng: 18 rules**

> ⚠️ **Đã tối ưu:**
> - Gộp "Keyword in Title" + "Keyword at Beginning of Title" → 1 rule
> - Loại bỏ "Keyword in Content" (đã bao gồm trong "Keyword Density")
> - Gộp "External Links" + "DoFollow External Link" → 1 rule
> - Loại bỏ "Unique Focus Keyword" (cần query database)

---

### 2.2 SEO Cơ bản (Basic SEO)

#### Rule 1: Keyword in SEO Title (Gộp với "Keyword at Beginning")
```typescript
{
  id: 'keyword-in-title',
  group: 'basic',
  name: 'Từ khóa trong Tiêu đề SEO',
  description: 'Từ khóa chính phải xuất hiện trong tiêu đề SEO, tốt nhất ở đầu',
  check: (context) => {
    const { title, focusKeyphrase } = context;
    const normalizedTitle = normalize(title);
    const normalizedKeyphrase = normalize(focusKeyphrase);
    
    if (!normalizedTitle.includes(normalizedKeyphrase)) {
      return { pass: false, position: 'missing' };
    }
    
    // Check if keyword is at beginning (first 50% of title)
    const halfLength = Math.ceil(normalizedTitle.length / 2);
    const firstHalf = normalizedTitle.substring(0, halfLength);
    const atBeginning = firstHalf.includes(normalizedKeyphrase);
    
    return { pass: true, atBeginning };
  },
  messages: {
    pass: (v) => v.atBeginning 
      ? 'Tuyệt vời! Từ khóa chính được sử dụng ở đầu tiêu đề SEO.'
      : 'Từ khóa chính có trong tiêu đề. Tốt hơn nếu đưa lên đầu.',
    fail: 'Từ khóa chính không có trong tiêu đề SEO. Hãy thêm vào!',
  }
}
```

#### Rule 2: Keyword in Meta Description
```typescript
{
  id: 'keyword-in-description',
  group: 'basic',
  name: 'Từ khóa trong Mô tả Meta',
  description: 'Từ khóa chính phải xuất hiện trong mô tả meta',
  check: (context) => {
    const { metaDescription, focusKeyphrase } = context;
    return normalize(metaDescription).includes(normalize(focusKeyphrase));
  },
  messages: {
    pass: 'Đã sử dụng từ khóa chính trong Mô tả Meta SEO.',
    fail: 'Mô tả Meta không chứa từ khóa chính.',
  }
}
```

#### Rule 3: Keyword in URL/Slug
```typescript
{
  id: 'keyword-in-url',
  group: 'basic',
  name: 'Từ khóa trong URL',
  description: 'Từ khóa chính nên xuất hiện trong URL/slug',
  check: (context) => {
    const { slug, focusKeyphrase } = context;
    const slugWords = slugify(focusKeyphrase).split('-');
    const urlSlug = normalize(slug);
    return slugWords.some(word => urlSlug.includes(word));
  },
  messages: {
    pass: 'Từ khóa chính đã được sử dụng trong URL.',
    fail: 'URL không chứa từ khóa chính.',
  }
}
```

#### Rule 4: Keyword in First 10% of Content
```typescript
{
  id: 'keyword-in-first-10-percent',
  group: 'basic',
  name: 'Từ khóa trong 10% đầu nội dung',
  description: 'Từ khóa chính nên xuất hiện trong 10% đầu tiên của nội dung',
  check: (context) => {
    const { content, focusKeyphrase } = context;
    const words = getWords(content);
    const first10Percent = words.slice(0, Math.ceil(words.length * 0.1)).join(' ');
    return normalize(first10Percent).includes(normalize(focusKeyphrase));
  },
  messages: {
    pass: 'Từ khóa chính xuất hiện trong 10% nội dung đầu tiên.',
    fail: 'Từ khóa chính không xuất hiện trong phần đầu nội dung.',
  }
}
```

#### Rule 5: Content Length (Word Count)
```typescript
{
  id: 'content-length',
  group: 'basic',
  name: 'Độ dài nội dung',
  description: 'Nội dung nên có ít nhất 600 từ',
  thresholds: {
    minimum: 300,    // Quá ngắn
    recommended: 600, // Tốt
    ideal: 1500,     // Rất tốt
    excellent: 2500, // Xuất sắc
  },
  check: (context) => {
    const wordCount = countWords(context.content);
    return {
      pass: wordCount >= 600,
      value: wordCount,
    };
  },
  messages: {
    pass: (value) => `Nội dung dài ${value} từ. Làm tốt lắm!`,
    fail: (value) => `Nội dung chỉ có ${value} từ. Nên có ít nhất 600 từ.`,
  }
}
```

---

### 2.3 Bổ sung (Additional)

#### Rule 6: Keyword in Subheadings (H2-H6)
```typescript
{
  id: 'keyword-in-subheadings',
  group: 'additional',
  name: 'Từ khóa trong tiêu đề phụ',
  description: 'Từ khóa chính nên xuất hiện trong ít nhất một tiêu đề phụ (H2-H6)',
  check: (context) => {
    const { content, focusKeyphrase } = context;
    const headings = extractHeadings(content); // H2, H3, H4, H5, H6
    return headings.some(h => 
      normalize(h.text).includes(normalize(focusKeyphrase))
    );
  },
  messages: {
    pass: 'Đã tìm thấy từ khóa chính trong các tiêu đề phụ.',
    fail: 'Hãy thêm từ khóa chính vào ít nhất một tiêu đề phụ (H2-H6).',
  }
}
```

#### Rule 7: Keyword in Image Alt Text
```typescript
{
  id: 'keyword-in-image-alt',
  group: 'additional',
  name: 'Từ khóa trong Alt hình ảnh',
  description: 'Từ khóa chính nên xuất hiện trong thuộc tính alt của hình ảnh',
  check: (context) => {
    const { content, focusKeyphrase } = context;
    const images = extractImages(content);
    return images.some(img => 
      img.alt && normalize(img.alt).includes(normalize(focusKeyphrase))
    );
  },
  messages: {
    pass: 'Đã tìm thấy Từ khóa chính trong (các) thuộc tính alt của hình ảnh.',
    fail: 'Không có hình ảnh nào có từ khóa chính trong thuộc tính alt.',
  }
}
```

#### Rule 8: Keyword Density (Bao gồm check keyword có trong content)
```typescript
{
  id: 'keyword-density',
  group: 'additional',
  name: 'Mật độ từ khóa',
  description: 'Mật độ từ khóa nên từ 0.5% đến 2.5%',
  thresholds: {
    min: 0.5,
    max: 2.5,
    ideal: { min: 1, max: 1.5 },
  },
  check: (context) => {
    const { content, focusKeyphrase } = context;
    const { density, count } = calculateKeywordDensity(content, focusKeyphrase);
    return {
      pass: density >= 0.5 && density <= 2.5,
      value: { density, count },
    };
  },
  messages: {
    pass: (v) => `Mật độ từ khóa là ${v.density.toFixed(2)}, từ khóa chính và sự kết hợp xuất hiện ${v.count} lần.`,
    fail: (v) => `Mật độ từ khóa ${v.density.toFixed(2)}% ${v.density < 0.5 ? 'quá thấp' : 'quá cao'}.`,
  }
}
```

#### Rule 9: URL Length
```typescript
{
  id: 'url-length',
  group: 'additional',
  name: 'Độ dài URL',
  description: 'URL nên ngắn gọn, tối ưu dưới 75 ký tự',
  thresholds: {
    ideal: 75,
    warning: 100,
    max: 120,
  },
  check: (context) => {
    const urlLength = context.url?.length || context.slug?.length || 0;
    return {
      pass: urlLength <= 75,
      value: urlLength,
    };
  },
  messages: {
    pass: (v) => `URL dài ${v} ký tự. Rất tốt!`,
    fail: (v) => `URL dài ${v} ký tự. Nên rút ngắn dưới 75 ký tự.`,
  }
}
```

#### Rule 10: External Links (Gộp với DoFollow check)
```typescript
{
  id: 'external-links',
  group: 'additional',
  name: 'Liên kết bên ngoài',
  description: 'Nội dung nên có liên kết đến tài nguyên bên ngoài, tốt nhất có ít nhất 1 dofollow',
  check: (context) => {
    const { content, siteUrl } = context;
    const links = extractLinks(content);
    const externalLinks = links.filter(l => isExternalLink(l.href, siteUrl));
    const dofollowLinks = externalLinks.filter(l => !l.rel?.includes('nofollow'));
    
    return {
      pass: externalLinks.length > 0,
      value: { 
        total: externalLinks.length, 
        dofollow: dofollowLinks.length 
      },
    };
  },
  messages: {
    pass: (v) => v.dofollow > 0
      ? `Tuyệt vời! Có ${v.total} liên kết bên ngoài (${v.dofollow} dofollow).`
      : `Có ${v.total} liên kết bên ngoài nhưng không có dofollow.`,
    fail: 'Hãy thêm ít nhất một liên kết đến tài nguyên bên ngoài uy tín.',
  }
}
```

#### Rule 11: Internal Links
```typescript
{
  id: 'internal-links',
  group: 'additional',
  name: 'Liên kết nội bộ',
  description: 'Nội dung nên có liên kết đến các trang khác trên website',
  check: (context) => {
    const { content, siteUrl } = context;
    const links = extractLinks(content);
    const internalLinks = links.filter(l => isInternalLink(l.href, siteUrl));
    return {
      pass: internalLinks.length > 0,
      value: internalLinks.length,
    };
  },
  messages: {
    pass: 'Bạn đang liên kết đến các tài nguyên khác trên trang web của mình, điều này thật tuyệt.',
    fail: 'Hãy thêm liên kết đến các trang khác trên website của bạn.',
  }
}
```

---

### 2.4 Khả năng đọc tiêu đề (Title Readability)

> ℹ️ "Keyword at Beginning of Title" đã được gộp vào Rule 1.

#### Rule 12: Number in Title
```typescript
{
  id: 'number-in-title',
  group: 'title-readability',
  name: 'Số trong tiêu đề',
  description: 'Tiêu đề có chứa số thường thu hút hơn',
  check: (context) => {
    const { title } = context;
    return /\d+/.test(title);
  },
  messages: {
    pass: 'Bạn đang sử dụng một số trong tiêu đề SEO của mình.',
    fail: 'Cân nhắc thêm số vào tiêu đề (ví dụ: "10 cách...", "Top 5...").',
  }
}
```

---

### 2.5 Khả năng đọc nội dung (Content Readability)

#### Rule 13: Table of Contents
```typescript
{
  id: 'table-of-contents',
  group: 'content-readability',
  name: 'Mục lục',
  description: 'Nội dung dài nên có mục lục để dễ điều hướng',
  check: (context) => {
    const { content } = context;
    const wordCount = countWords(content);
    // Only check for long content
    if (wordCount < 1500) return { pass: true, skipped: true };
    
    // Check for TOC patterns
    const hasToc = detectTableOfContents(content);
    return hasToc;
  },
  messages: {
    pass: 'Có vẻ như bạn đang sử dụng Table of Contents plugin để chia nhỏ văn bản của mình.',
    fail: 'Nội dung dài, hãy cân nhắc thêm mục lục.',
  }
}
```

#### Rule 14: Short Paragraphs
```typescript
{
  id: 'short-paragraphs',
  group: 'content-readability',
  name: 'Đoạn văn ngắn',
  description: 'Các đoạn văn nên ngắn gọn, dưới 150 từ',
  thresholds: {
    maxWordsPerParagraph: 150,
  },
  check: (context) => {
    const { content } = context;
    const paragraphs = extractParagraphs(content);
    const longParagraphs = paragraphs.filter(p => countWords(p) > 150);
    return {
      pass: longParagraphs.length === 0,
      value: longParagraphs.length,
    };
  },
  messages: {
    pass: 'Bạn đang sử dụng các đoạn văn ngắn.',
    fail: (v) => `Có ${v} đoạn văn quá dài (>150 từ). Hãy chia nhỏ hơn.`,
  }
}
```

#### Rule 15: Has Media (Images/Videos)
```typescript
{
  id: 'has-media',
  group: 'content-readability',
  name: 'Có hình ảnh/video',
  description: 'Nội dung nên có hình ảnh hoặc video để tăng tương tác',
  check: (context) => {
    const { content } = context;
    const images = extractImages(content);
    const videos = extractVideos(content);
    return images.length > 0 || videos.length > 0;
  },
  messages: {
    pass: 'Nội dung của bạn chứa hình ảnh và / hoặc video.',
    fail: 'Hãy thêm hình ảnh hoặc video vào nội dung.',
  }
}
```

#### Rule 16: Flesch Reading Score
```typescript
{
  id: 'flesch-reading-score',
  group: 'content-readability',
  name: 'Điểm đọc Flesch',
  description: 'Nội dung nên dễ đọc với điểm Flesch >= 60',
  thresholds: {
    veryEasy: 90,      // 90-100
    easy: 80,          // 80-89
    fairlyEasy: 70,    // 70-79
    standard: 60,      // 60-69
    fairlyDifficult: 50, // 50-59
    difficult: 30,     // 30-49
    veryDifficult: 0,  // 0-29
  },
  check: (context) => {
    const { content } = context;
    const score = calculateFleschScore(content);
    return {
      pass: score >= 60,
      value: score,
    };
  },
  messages: {
    pass: (v) => `Điểm đọc Flesch: ${v.toFixed(1)}. Nội dung dễ đọc.`,
    fail: (v) => `Điểm đọc Flesch: ${v.toFixed(1)}. Nội dung khó đọc, hãy đơn giản hóa.`,
  }
}
```

#### Rule 17: Sentence Length
```typescript
{
  id: 'sentence-length',
  group: 'content-readability',
  name: 'Độ dài câu',
  description: 'Không quá 25% câu nên dài hơn 20 từ',
  thresholds: {
    maxWordsPerSentence: 20,
    maxLongSentencePercentage: 25,
  },
  check: (context) => {
    const { content } = context;
    const sentences = extractSentences(content);
    const longSentences = sentences.filter(s => countWords(s) > 20);
    const percentage = (longSentences.length / sentences.length) * 100;
    return {
      pass: percentage <= 25,
      value: { percentage, longCount: longSentences.length, total: sentences.length },
    };
  },
  messages: {
    pass: 'Độ dài câu phù hợp.',
    fail: (v) => `${v.percentage.toFixed(0)}% câu quá dài (>20 từ). Nên dưới 25%.`,
  }
}
```

#### Rule 18: Passive Voice
```typescript
{
  id: 'passive-voice',
  group: 'content-readability',
  name: 'Câu bị động',
  description: 'Không quá 10% câu nên ở thể bị động',
  thresholds: {
    maxPassivePercentage: 10,
  },
  check: (context) => {
    const { content } = context;
    const sentences = extractSentences(content);
    const passiveSentences = sentences.filter(s => isPassiveVoice(s));
    const percentage = (passiveSentences.length / sentences.length) * 100;
    return {
      pass: percentage <= 10,
      value: percentage,
    };
  },
  messages: {
    pass: 'Sử dụng câu chủ động tốt.',
    fail: (v) => `${v.toFixed(0)}% câu ở thể bị động. Nên dưới 10%.`,
  }
}
```

---

## Phase 3: Link & Image Analysis

### 3.1 Link Extraction & Analysis

**Functions:**
```typescript
interface ExtractedLink {
  href: string;
  text: string;
  rel?: string;
  isExternal: boolean;
  isDoFollow: boolean;
}

function extractLinks(html: string): ExtractedLink[];
function isExternalLink(href: string, siteUrl: string): boolean;
function isInternalLink(href: string, siteUrl: string): boolean;
function countLinksByType(links: ExtractedLink[]): LinkStats;
```

**UI Display:**
- Số lượng internal links
- Số lượng external links
- Số lượng dofollow/nofollow links
- Danh sách links (expandable)

---

### 3.2 Image Analysis

**Functions:**
```typescript
interface ExtractedImage {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

function extractImages(html: string): ExtractedImage[];
function analyzeImageAlt(images: ExtractedImage[]): ImageAltStats;
```

**Rules:**
- Images without alt text
- Alt text too short (< 5 chars)
- Alt text too long (> 125 chars)
- Alt text contains keyword

---

## Cấu trúc thư mục đề xuất

```
src/
├── shared/
│   ├── types/
│   │   ├── seo.ts                    # SeoValue, SeoInterfaceOptions
│   │   ├── schema.ts                 # Schema types (Article, Product, etc.)
│   │   └── analysis.ts               # AnalysisResult, Rule types
│   │
│   ├── engine/
│   │   ├── index.ts                  # Public API: analyze(), buildMeta(), buildJsonLd()
│   │   ├── text.ts                   # Text utilities: tokenize, normalize, countWords
│   │   ├── html.ts                   # HTML parser: extractLinks, extractImages, extractHeadings
│   │   └── templates.ts              # Mustache template processing
│   │
│   ├── analysis/
│   │   ├── index.ts                  # Analysis runner
│   │   ├── types.ts                  # Rule interface, RuleResult
│   │   ├── rules/
│   │   │   ├── basic/
│   │   │   │   ├── keyword-in-title.ts
│   │   │   │   ├── keyword-in-description.ts
│   │   │   │   ├── keyword-in-url.ts
│   │   │   │   ├── keyword-in-first-10-percent.ts
│   │   │   │   ├── keyword-in-content.ts
│   │   │   │   └── content-length.ts
│   │   │   ├── additional/
│   │   │   │   ├── keyword-in-subheadings.ts
│   │   │   │   ├── keyword-in-image-alt.ts
│   │   │   │   ├── keyword-density.ts
│   │   │   │   ├── url-length.ts
│   │   │   │   ├── external-links.ts
│   │   │   │   ├── dofollow-external-link.ts
│   │   │   │   ├── internal-links.ts
│   │   │   │   └── unique-focus-keyword.ts
│   │   │   ├── title-readability/
│   │   │   │   ├── keyword-at-title-beginning.ts
│   │   │   │   └── number-in-title.ts
│   │   │   └── content-readability/
│   │   │       ├── table-of-contents.ts
│   │   │       ├── short-paragraphs.ts
│   │   │       ├── has-media.ts
│   │   │       ├── flesch-reading-score.ts
│   │   │       ├── sentence-length.ts
│   │   │       └── passive-voice.ts
│   │   └── locales/
│   │       ├── en.ts                 # English messages
│   │       └── vi.ts                 # Vietnamese messages
│   │
│   ├── schema/
│   │   ├── index.ts                  # Schema dispatcher
│   │   ├── types.ts                  # Schema type definitions
│   │   ├── validators.ts             # Schema validation
│   │   └── builders/
│   │       ├── article.ts
│   │       ├── product.ts
│   │       ├── local-business.ts
│   │       ├── organization.ts
│   │       ├── person.ts
│   │       ├── faq.ts
│   │       ├── how-to.ts
│   │       ├── recipe.ts
│   │       ├── event.ts
│   │       ├── course.ts
│   │       └── breadcrumb.ts
│   │
│   ├── components/
│   │   ├── ProgressBar.vue
│   │   ├── SearchPreview.vue
│   │   └── ScoreBadge.vue           # NEW: Score badge component
│   │
│   ├── composables/
│   │   ├── useSeoField.ts
│   │   └── useAnalysis.ts           # NEW: Analysis composable
│   │
│   ├── styles/
│   │   └── shared.scss
│   │
│   ├── rulesets.ts
│   └── utils.ts
│
├── seo-interface/
│   ├── index.ts
│   ├── interface.vue
│   ├── fields.ts
│   ├── shims.d.ts
│   │
│   ├── analysis/
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── components/
│   │       ├── Analysis.vue          # Main analysis component
│   │       ├── AnalysisResult.vue    # Individual result
│   │       ├── AnalysisGroup.vue     # NEW: Group of results (Basic, Additional, etc.)
│   │       └── AnalysisScore.vue     # NEW: Overall score display
│   │
│   └── components/
│       ├── FocusKeyphrase.vue        # Updated: support comma-separated keywords
│       ├── MetaDescriptionField.vue
│       ├── SeoFieldWrapper.vue
│       ├── TitleField.vue
│       ├── CustomFields.vue
│       │
│       └── schema/                   # NEW
│           ├── SchemaTypeSelect.vue
│           ├── SchemaFieldsForm.vue
│           ├── SchemaFieldMapping.vue
│           └── JsonLdPreview.vue
│
├── seo-display/
│   ├── index.ts
│   ├── display.vue
│   └── shims.d.ts
│
└── lang/
    └── translations/
        ├── en-US.yaml
        └── vi-VN.yaml               # NEW: Vietnamese translations
```

---

## Data Schema

### SeoValue Interface (Content SEO Focus)

```typescript
// src/shared/types/seo.ts

export interface SeoValue {
  title: string;
  meta_description: string;
  focus_keyphrase?: string;           // Comma-separated cho multiple keywords
  additional_fields?: Record<string, string>;
}
```

### Dữ liệu mới lưu trong `additional_fields`

```typescript
// Ví dụ cấu trúc additional_fields cho các tính năng mới
additional_fields: {
  // Schema Markup (JSON string)
  schema_markup: '{"enabled":true,"type":"Article","data":{...}}',
  
  // Breadcrumbs (JSON string)
  breadcrumbs: '[{"name":"Home","url":"/"},{"name":"Blog","url":"/blog"}]',
  
  // Các field custom khác...
}
```

### Parsing Utilities

```typescript
// src/shared/utils/additional-fields.ts

export function getSchemaMarkup(seoValue: SeoValue): SchemaMarkup | undefined {
  const json = seoValue.additional_fields?.schema_markup;
  return json ? JSON.parse(json) : undefined;
}

export function getBreadcrumbs(seoValue: SeoValue): Breadcrumb[] | undefined {
  const json = seoValue.additional_fields?.breadcrumbs;
  return json ? JSON.parse(json) : undefined;
}
```

### Type Definitions

```typescript
export interface SchemaMarkup {
  enabled: boolean;
  type: SchemaType;
  data: Record<string, any>;
  field_mappings?: Record<string, string>;
}

export interface Breadcrumb {
  name: string;
  url: string;
}

export type SchemaType = 
  | 'Article'
  | 'NewsArticle'
  | 'BlogPosting'
  | 'Product'
  | 'LocalBusiness'
  | 'Organization'
  | 'Person'
  | 'FAQ'
  | 'HowTo'
  | 'Recipe'
  | 'Event'
  | 'Course'
  | 'BreadcrumbList'
  | 'WebPage';
```

---

## UI/UX Design

### Giữ nguyên cấu trúc tabs hiện tại

```
┌─────────────────────────────────────────────────────────────────┐
│  Basic  │  Advanced  │  Custom Fields  │  Keyphrase  │          │
├─────────────────────────────────────────────────────────────────┤
```

**Basic Tab:** Title, Meta Description, Search Preview, OG Image
**Advanced Tab:** Sitemap Settings, Search Engine Controls (noindex/nofollow)
**Custom Fields Tab:** Additional custom fields
**Keyphrase Tab:** Focus Keyphrase + Analysis Results (18 rules)

### Analysis Section Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  SEO Score: 85/100  ████████████████░░░░                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🟢 SEO Cơ bản                              ✓ Tất cả đều tốt   │
│  ├─ ✅ Từ khóa trong Tiêu đề SEO                               │
│  ├─ ✅ Từ khóa trong Mô tả Meta                                │
│  ├─ ✅ Từ khóa trong URL                                       │
│  ├─ ✅ Từ khóa trong 10% đầu                                   │
│  ├─ ✅ Từ khóa trong nội dung                                  │
│  └─ ✅ Nội dung dài 2450 từ                                    │
│                                                                 │
│  🟡 Bổ sung                                  ⚠ 1 Lỗi           │
│  ├─ ✅ Từ khóa trong tiêu đề phụ                               │
│  ├─ ❌ Không có từ khóa trong alt hình ảnh                     │
│  ├─ ✅ Mật độ từ khóa: 1.2% (15 lần)                           │
│  └─ ...                                                         │
│                                                                 │
│  🔵 Khả năng đọc tiêu đề                    ✓ Tất cả đều tốt   │
│  ├─ ✅ Từ khóa ở đầu tiêu đề                                   │
│  └─ ✅ Có số trong tiêu đề                                     │
│                                                                 │
│  🟣 Khả năng đọc nội dung                   ✓ Tất cả đều tốt   │
│  ├─ ✅ Có mục lục                                              │
│  ├─ ✅ Đoạn văn ngắn                                           │
│  └─ ✅ Có hình ảnh/video                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | - | Simplified to Content SEO only (removed Social, Robots, API Extensions) |
| 1.0.0 | - | Initial plan |

---

## References

- [RankMath SEO Plugin](https://rankmath.com/)
- [RankMath GitHub](https://github.com/rankmath/seo-by-rank-math)
- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Flesch Reading Ease](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests)
