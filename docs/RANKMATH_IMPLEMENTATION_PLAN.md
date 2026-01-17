# RankMath Features Implementation Plan

> Kế hoạch triển khai các quy tắc phân tích SEO nội dung cho Directus SEO Plugin

## Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc hiện tại](#kiến-trúc-hiện-tại)
- [Phase 1: Nền tảng](#phase-1-nền-tảng)
- [Phase 2: SEO Analysis Rules](#phase-2-seo-analysis-rules)
- [Cấu trúc thư mục đề xuất](#cấu-trúc-thư-mục-đề-xuất)
- [UI/UX Design](#uiux-design)

---

## Tổng quan

### Mục tiêu
Triển khai các quy tắc phân tích SEO nội dung bài viết như RankMath, tập trung vào:
- **14 quy tắc phân tích SEO nội dung** (verify content đang viết)
- **Giữ nguyên cấu trúc plugin hiện tại**

### Nguyên tắc thiết kế
1. **Backward Compatible** - Không phá vỡ dữ liệu và cấu trúc hiện tại
2. **Content Verification** - Chỉ tập trung vào kiểm tra nội dung đang viết
3. **Real-time Analysis** - Phân tích ngay khi người dùng nhập liệu

### Ước tính thời gian
| Phase | Mô tả | Thời gian |
|-------|-------|-----------|
| Phase 1 | Nền tảng (Multiple Keywords) | 0.5 ngày |
| Phase 2 | SEO Analysis Rules (14 rules) | 2-3 ngày |
| **Tổng** | | **2.5-3.5 ngày** |

---

## Kiến trúc hiện tại

### Những gì đã có
- ✅ SEO Title với template
- ✅ Meta Description với template
- ✅ Focus Keyphrase (đơn)
- ✅ Custom additional fields
- ✅ Basic analysis (title/description length)

### Những gì cần thêm (Content Verification)
- ❌ Multiple Focus Keywords (comma-separated)
- ❌ Advanced SEO Analysis (14 rules)
- ❌ Readability Analysis

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

## Phase 2: SEO Analysis Rules

### 2.1 Tổng quan Rules

Chia thành 4 nhóm tập trung vào **verify content đang viết**:

1. **SEO Cơ bản (Basic SEO)** - 5 rules
2. **Bổ sung (Additional)** - 4 rules
3. **Khả năng đọc tiêu đề (Title Readability)** - 1 rule
4. **Khả năng đọc nội dung (Content Readability)** - 4 rules

**Tổng: 14 rules**

> ⚠️ **Đã loại bỏ (không liên quan verify content):**
> - ~~External Links~~ (cần siteUrl config phức tạp)
> - ~~Internal Links~~ (cần siteUrl config phức tạp)
> - ~~Flesch Reading Score~~ (phức tạp cho tiếng Việt)
> - ~~Passive Voice~~ (không chính xác cho tiếng Việt)

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

---

### 2.4 Khả năng đọc tiêu đề (Title Readability)

#### Rule 10: Number in Title
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

#### Rule 11: Table of Contents
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

#### Rule 12: Short Paragraphs
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

#### Rule 13: Has Media (Images/Videos)
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

#### Rule 14: Sentence Length
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

---

## Cấu trúc thư mục đề xuất

> Giữ nguyên cấu trúc hiện tại, chỉ thêm rules mới

```
src/
├── shared/
│   ├── types/
│   │   └── seo.ts                    # SeoValue, SeoInterfaceOptions (giữ nguyên)
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
│   │   │   │   └── content-length.ts
│   │   │   ├── additional/
│   │   │   │   ├── keyword-in-subheadings.ts
│   │   │   │   ├── keyword-in-image-alt.ts
│   │   │   │   ├── keyword-density.ts
│   │   │   │   └── url-length.ts
│   │   │   ├── title-readability/
│   │   │   │   └── number-in-title.ts
│   │   │   └── content-readability/
│   │   │       ├── table-of-contents.ts
│   │   │       ├── short-paragraphs.ts
│   │   │       ├── has-media.ts
│   │   │       └── sentence-length.ts
│   │   └── locales/
│   │       ├── en.ts                 # English messages
│   │       └── vi.ts                 # Vietnamese messages
│   │
│   ├── components/                   # Giữ nguyên
│   ├── composables/                  # Giữ nguyên
│   ├── styles/                       # Giữ nguyên
│   ├── rulesets.ts                   # Giữ nguyên
│   └── utils.ts                      # Giữ nguyên
│
├── seo-interface/                    # Giữ nguyên cấu trúc
│   ├── analysis/
│   │   ├── types.ts
│   │   ├── utils.ts                  # Cập nhật để sử dụng rules mới
│   │   └── components/
│   │       ├── Analysis.vue
│   │       ├── AnalysisResult.vue
│   │       ├── AnalysisGroup.vue     # NEW: Group of results
│   │       └── AnalysisScore.vue     # NEW: Overall score display
│   │
│   └── components/
│       ├── FocusKeyphrase.vue        # Cập nhật: support comma-separated
│       └── ... (giữ nguyên)
│
├── seo-display/                      # Giữ nguyên
└── lang/                             # Giữ nguyên
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
**Keyphrase Tab:** Focus Keyphrase + Analysis Results (14 rules)

### Analysis Section Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  SEO Score: 85/100  ████████████████░░░░                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🟢 SEO Cơ bản (5 rules)                    ✓ Tất cả đều tốt   │
│  ├─ ✅ Từ khóa trong Tiêu đề SEO                               │
│  ├─ ✅ Từ khóa trong Mô tả Meta                                │
│  ├─ ✅ Từ khóa trong URL                                       │
│  ├─ ✅ Từ khóa trong 10% đầu                                   │
│  └─ ✅ Nội dung dài 2450 từ                                    │
│                                                                 │
│  🟡 Bổ sung (4 rules)                       ⚠ 1 Lỗi           │
│  ├─ ✅ Từ khóa trong tiêu đề phụ                               │
│  ├─ ❌ Không có từ khóa trong alt hình ảnh                     │
│  ├─ ✅ Mật độ từ khóa: 1.2% (15 lần)                           │
│  └─ ✅ URL dài 45 ký tự                                        │
│                                                                 │
│  🔵 Khả năng đọc tiêu đề (1 rule)          ✓ Tất cả đều tốt   │
│  └─ ✅ Có số trong tiêu đề                                     │
│                                                                 │
│  🟣 Khả năng đọc nội dung (4 rules)        ✓ Tất cả đều tốt   │
│  ├─ ✅ Có mục lục                                              │
│  ├─ ✅ Đoạn văn ngắn                                           │
│  ├─ ✅ Có hình ảnh/video                                       │
│  └─ ✅ Độ dài câu phù hợp                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tóm tắt 14 Rules

| # | Rule | Nhóm | Mô tả |
|---|------|------|-------|
| 1 | Keyword in Title | Basic | Từ khóa trong tiêu đề SEO |
| 2 | Keyword in Description | Basic | Từ khóa trong mô tả meta |
| 3 | Keyword in URL | Basic | Từ khóa trong slug |
| 4 | Keyword in First 10% | Basic | Từ khóa trong 10% đầu nội dung |
| 5 | Content Length | Basic | Độ dài nội dung >= 600 từ |
| 6 | Keyword in Subheadings | Additional | Từ khóa trong H2-H6 |
| 7 | Keyword in Image Alt | Additional | Từ khóa trong alt hình ảnh |
| 8 | Keyword Density | Additional | Mật độ 0.5%-2.5% |
| 9 | URL Length | Additional | URL <= 75 ký tự |
| 10 | Number in Title | Title Readability | Có số trong tiêu đề |
| 11 | Table of Contents | Content Readability | Có mục lục (>1500 từ) |
| 12 | Short Paragraphs | Content Readability | Đoạn văn < 150 từ |
| 13 | Has Media | Content Readability | Có hình ảnh/video |
| 14 | Sentence Length | Content Readability | <= 25% câu > 20 từ |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | - | Simplified to 14 rules for content verification only |
| 1.1.0 | - | Simplified to Content SEO only (removed Social, Robots, API Extensions) |
| 1.0.0 | - | Initial plan |

---

## References

- [RankMath SEO Plugin](https://rankmath.com/)
- [RankMath GitHub](https://github.com/rankmath/seo-by-rank-math)
- [Google Search Central](https://developers.google.com/search)
