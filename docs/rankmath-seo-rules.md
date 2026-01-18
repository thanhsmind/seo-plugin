# RankMath SEO Analysis Rules - Tài liệu chi tiết

## Mục lục
1. [Tổng quan hệ thống scoring](#1-tổng-quan-hệ-thống-scoring)
2. [Chi tiết từng rule](#2-chi-tiết-từng-rule)
3. [Bảng tổng hợp tất cả rules](#3-bảng-tổng-hợp-tất-cả-rules)
4. [Recommendations cho implementation](#4-recommendations-cho-implementation)

---

## 1. Tổng quan hệ thống scoring

### Đặc điểm chính
- **Tổng số rules**: 25 rules (24 có điểm + 1 informational)
- **Tổng điểm tối đa**: ~126+ điểm
- **Loại scoring**:
  - **All-or-nothing**: Đạt điều kiện = full điểm, không đạt = 0
  - **Threshold-based**: Điểm theo ngưỡng/mức độ
  - **Capped**: Có giới hạn điểm tối đa

### Phân bổ điểm theo Category

| Category | Số Rules | Điểm Tối đa | % Tổng điểm |
|----------|----------|-------------|-------------|
| Keyword Analysis | 9 | ~71 pts | ~56% |
| Content Structure | 5 | 23 pts | ~18% |
| Readability | 1 | 6 pts | ~5% |
| Title Optimization | 4 | 6 pts | ~5% |
| Link Strategy | 3 | 11 pts | ~9% |
| Schema/Product | 3 | 9 pts | ~7% |

**Nhận xét**: Keyword optimization chiếm tỷ trọng cao nhất (~56%), trong đó "Keyword in Title" là rule nặng nhất (36-38 điểm).

---

## 2. Chi tiết từng rule

### A. KEYWORD ANALYSIS (Phân tích từ khóa)

#### Rule 1: Keyword Density
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Tỷ lệ xuất hiện focus keyword trong nội dung |
| **Công thức** | `density = (keyword_occurrences / total_words) * 100%` |
| **Max Points** | 6 |
| **Type** | Threshold-based |

**Bảng điểm:**
| Mật độ | Điểm | Trạng thái |
|--------|------|------------|
| < 0.5% | 0 | Fail - Quá thấp |
| 0.5% - 0.75% | 2 | Fair |
| 0.76% - 1.0% | 3 | Good |
| 1.0% - 2.5% | 6 | Best |
| > 2.5% | 0 | Fail - Quá cao (keyword stuffing) |

---

#### Rule 2: Keyword in Content
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Focus keyword xuất hiện trong nội dung bài viết |
| **Max Points** | 3 |
| **Type** | All-or-nothing |
| **Tooltip** | "It is recommended to make the focus keyword appear in the post content too." |

---

#### Rule 3: Keyword in Title
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Focus keyword xuất hiện trong SEO title |
| **Max Points** | 36 (English), 38 (other languages) |
| **Type** | All-or-nothing |
| **Tooltip** | "Make sure the focus keyword appears in the SEO post title too." |

⚠️ **Lưu ý**: Đây là rule nặng điểm nhất, chiếm ~30% tổng điểm!

---

#### Rule 4: Keyword in Meta Description
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Focus keyword xuất hiện trong meta description |
| **Max Points** | 2 |
| **Type** | All-or-nothing |

---

#### Rule 5: Keyword in URL/Permalink
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Focus keyword xuất hiện trong URL slug |
| **Max Points** | 5 |
| **Type** | All-or-nothing |
| **Tooltip** | "Include the focus keyword in the slug (permalink) of this post." |

---

#### Rule 6: Keyword in First 10% of Content
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Focus keyword xuất hiện trong 10% đầu nội dung |
| **Prerequisite** | Content > 400 words |
| **Max Points** | 3 |
| **Type** | All-or-nothing |
| **Tooltip** | "The first 10% of the content should contain the Focus Keyword preferably at the beginning." |

---

#### Rule 7: Keyword in Subheadings
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Focus keyword xuất hiện trong H2-H6 subheadings |
| **Max Points** | 3 |
| **Type** | All-or-nothing |

---

#### Rule 8: Keyword in Image Alt
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Focus keyword xuất hiện trong image alt attribute |
| **Max Points** | 2 |
| **Type** | All-or-nothing |

---

#### Rule 9: Keyword Not Used Before
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Kiểm tra keyword đã được sử dụng ở bài viết khác chưa |
| **Max Points** | 0 (Informational only) |
| **Type** | Informational |

---

### B. CONTENT LENGTH & STRUCTURE

#### Rule 10: Content Length
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Đánh giá độ dài nội dung theo số từ |
| **Max Points** | 8 |
| **Type** | Threshold-based |
| **Recommended** | ≥ 2500 words |

**Bảng điểm:**
| Số từ | Điểm |
|-------|------|
| < 600 | 2 |
| 600 - 1000 | 3 |
| 1000 - 1500 | 4 |
| 1500 - 2000 | 5 |
| 2000 - 2500 | 5 |
| ≥ 2500 | 8 |

---

#### Rule 11: URL Length
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | URL/Permalink không quá dài |
| **Threshold** | ≤ 75 characters |
| **Max Points** | 4 |
| **Type** | All-or-nothing |

---

#### Rule 12: Short Paragraphs
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Tất cả paragraphs đều ngắn, dễ đọc |
| **Threshold** | Mỗi paragraph < 120 words |
| **Max Points** | 3 |
| **Type** | All-or-nothing |

---

#### Rule 13: Content Has Media
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Nội dung có hình ảnh và/hoặc video |
| **Max Points** | 6 (capped) |
| **Type** | Threshold-based + Capped |

**Bảng điểm:**
| Media | Điểm |
|-------|------|
| 0 images | 0 |
| 1 image | 1 |
| 2 images | 2 |
| 3+ images | 4 |
| Has video | +2 (bonus) |
| **Maximum** | 6 |

---

#### Rule 14: Table of Contents
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Có mục lục (TOC) trong bài viết |
| **Detection** | TOC plugins hoặc `wp-block-rank-math-toc-block` |
| **Max Points** | 2 |
| **Type** | All-or-nothing |

---

### C. READABILITY

#### Rule 15: Flesch Reading Ease
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Đánh giá độ dễ đọc theo thang Flesch |
| **Max Points** | 6 |
| **Type** | Threshold-based |
| **Note** | Chủ yếu cho tiếng Anh |

**Bảng điểm:**
| Score | Rating | Điểm |
|-------|--------|------|
| 90-100 | Very Easy | 6 |
| 80-90 | Easy | 5 |
| 70-80 | Fairly Easy | 5 |
| 60-70 | Okay | 4 |
| 50-60 | Fairly Difficult | 3 |
| 30-50 | Difficult | 2 |
| < 30 | Very Difficult | 1 |

**Công thức Flesch Reading Ease:**
```
FRE = 206.835 - 1.015 × (total words / total sentences) - 84.6 × (total syllables / total words)
```

---

### D. TITLE OPTIMIZATION

#### Rule 16: Title Has Number
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Title chứa số (0-9) |
| **Max Points** | 1 |
| **Type** | All-or-nothing |
| **Tooltip** | "Headlines with numbers are 36% more likely to generate clicks" |

---

#### Rule 17: Title Has Power Words
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Title chứa power words |
| **Max Points** | 1 |
| **Type** | All-or-nothing |
| **Note** | Language-dependent (cần dictionary theo locale) |

**Ví dụ Power Words (English):**
- Ultimate, Essential, Proven, Amazing, Incredible
- Secret, Exclusive, Free, Limited, Instant
- Best, Top, Expert, Complete, Guide

---

#### Rule 18: Title Sentiment
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Title có cảm xúc (positive/negative) |
| **Max Points** | 1 |
| **Type** | All-or-nothing |
| **Limitation** | English only |
| **Tooltip** | "Headlines with strong emotional sentiment tend to receive more clicks." |

---

#### Rule 19: Title Starts With Keyword
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Keyword nằm trong nửa đầu của title |
| **Max Points** | 3 |
| **Type** | Position-based |
| **Logic** | `keyword_position < title_length / 2` |

---

### E. LINK STRATEGY

#### Rule 20: Has External Links
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Nội dung có link ra ngoài (outbound links) |
| **Max Points** | 4 |
| **Type** | All-or-nothing |
| **Tooltip** | "It helps visitors read more about a topic and prevents pogosticking." |

---

#### Rule 21: Has Internal Links
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Nội dung có internal links |
| **Max Points** | 5 |
| **Type** | All-or-nothing |
| **Tooltip** | "Internal links decrease your bounce rate and improve SEO." |

---

#### Rule 22: Links Not All External DoFollow
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | External links có mix dofollow/nofollow |
| **Max Points** | 2 |
| **Type** | All-or-nothing |
| **Detection** | Parse `rel` attribute (nofollow, sponsored, ugc) |

---

### F. SCHEMA/PRODUCT

#### Rule 23: Product Schema
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Có Product schema markup |
| **Max Points** | 2 |
| **Type** | All-or-nothing |
| **Applicable** | Products only |

---

#### Rule 24: Review Enabled
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Reviews được bật cho sản phẩm |
| **Max Points** | 2 |
| **Type** | All-or-nothing |
| **Applicable** | Products only |

---

#### Rule 25: Content AI Usage
| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Sử dụng Content AI để tối ưu bài viết |
| **Max Points** | 5 |
| **Type** | All-or-nothing |
| **Note** | Premium feature |

---

## 3. Bảng tổng hợp tất cả rules

| # | Category | Rule | Threshold/Condition | Points | Type |
|---|----------|------|---------------------|--------|------|
| 1 | Keyword | Keyword Density | <0.5%=0; 0.5-0.75=2; 0.76-1=3; 1-2.5=6; >2.5=0 | max 6 | threshold |
| 2 | Keyword | Keyword in Content | keyword trong content | 3 | boolean |
| 3 | Keyword | Keyword in Title | keyword trong title | 36/38 | boolean |
| 4 | Keyword | Keyword in Meta Description | keyword trong meta desc | 2 | boolean |
| 5 | Keyword | Keyword in URL | keyword trong slug | 5 | boolean |
| 6 | Keyword | Keyword in First 10% | >400 words + keyword trong 10% đầu | 3 | conditional |
| 7 | Keyword | Keyword in Subheadings | keyword trong H2-H6 | 3 | boolean |
| 8 | Keyword | Keyword in Image Alt | keyword trong alt | 2 | boolean |
| 9 | Keyword | Keyword Not Used Before | check duplicate | 0 | info |
| 10 | Structure | Content Length | words: <600=2; 600-1k=3; 1k-1.5k=4; 1.5k-2k=5; ≥2.5k=8 | max 8 | threshold |
| 11 | Structure | URL Length | ≤75 chars | 4 | boolean |
| 12 | Structure | Short Paragraphs | all paragraphs <120 words | 3 | boolean |
| 13 | Structure | Content Has Media | images + video bonus | max 6 | capped |
| 14 | Structure | Table of Contents | có TOC | 2 | boolean |
| 15 | Readability | Flesch Reading Ease | 90-100=6; 80-90=5; 70-80=5; 60-70=4; 50-60=3; 30-50=2; <30=1 | max 6 | threshold |
| 16 | Title | Title Has Number | chứa số | 1 | boolean |
| 17 | Title | Title Has Power Words | có power word | 1 | boolean |
| 18 | Title | Title Sentiment | có cảm xúc (EN only) | 1 | boolean |
| 19 | Title | Title Starts With Keyword | keyword trong nửa đầu title | 3 | position |
| 20 | Links | Has External Links | có outbound link | 4 | boolean |
| 21 | Links | Has Internal Links | có internal link | 5 | boolean |
| 22 | Links | Mixed DoFollow/NoFollow | external links có mix | 2 | boolean |
| 23 | Schema | Product Schema | có Product schema | 2 | boolean |
| 24 | Schema | Review Enabled | reviews enabled | 2 | boolean |
| 25 | Schema | Content AI Usage | dùng AI (premium) | 5 | boolean |

---

## 4. Recommendations cho implementation

### 4.1 Thiết kế dữ liệu Rules

```typescript
interface SEORule {
  id: string;
  name: string;
  category: 'keyword' | 'structure' | 'readability' | 'title' | 'links' | 'schema';
  maxPoints: number;
  type: 'boolean' | 'threshold' | 'capped' | 'informational';
  prerequisites?: {
    minWordCount?: number;
    locale?: string;
    contentType?: string[];
  };
  thresholds?: {
    value: number;
    points: number;
    status: 'fail' | 'fair' | 'good' | 'best';
  }[];
  evaluate: (context: AnalysisContext) => RuleResult;
}
```

### 4.2 Pipeline phân tích nội dung

```
Input → Parse HTML → Extract Data → Run Rules → Calculate Score → Generate Report
```

**Dữ liệu cần extract:**
- Title, Meta description, URL/slug
- Plain text content + word count
- Headings (H1-H6) + text
- Paragraphs + word count từng đoạn
- Images + alt attributes
- Links + phân loại (internal/external) + rel attributes
- Schema markup

### 4.3 Keyword Matching

```typescript
function matchKeyword(text: string, keyword: string): boolean {
  const normalizedText = text.toLowerCase().trim();
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  // Word boundary matching để tránh false positive
  const regex = new RegExp(`\\b${escapeRegex(normalizedKeyword)}\\b`, 'gi');
  return regex.test(normalizedText);
}
```

### 4.4 Output Format

```typescript
interface AnalysisResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  categories: {
    [category: string]: {
      score: number;
      maxScore: number;
      rules: RuleResult[];
    };
  };
  recommendations: string[];
}

interface RuleResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  score: number;
  maxScore: number;
  message: string;
  suggestion?: string;
}
```

---

## References

- [RankMath Content Analyzer Repository](https://github.com/rankmath/content-analyzer)
- [RankMath SEO Plugin Repository](https://github.com/rankmath/seo-by-rank-math)
- [Flesch Reading Ease Formula](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests)
