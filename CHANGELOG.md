# Changelog

## 1.2.1 - 2025-04-22

### Improvements

-   **Internationalization (i18n):** Added full Vietnamese and English translations for UI tabs, labels, tooltips, and messages
-   **Unified Schema Types:** Consolidated `SchemaMarkup` and `SchemaMarkupValue` types for better type consistency
-   **Interface Locales:** New locale system for interface components with support for vi/en languages
-   **Analysis Engine:** Fixed status handling for `warning` and `neutral` rule results
-   **18 SEO Rules:** All rules fully operational with proper status mapping (pass/fail/warning/neutral)

---

## 1.2.0 - 2025-04-22

### Features

-   **Schema Markup / Structured Data:** Added full Schema.org JSON-LD support with 14 schema types (Article, Product, FAQ, HowTo, LocalBusiness, Organization, Person, Event, Course, Recipe, BreadcrumbList, etc.)
-   **Schema Editor UI:** New tab with schema type selector, dynamic form builder, and live JSON-LD preview
-   **18 SEO Analysis Rules:** Complete RankMath-style SEO analysis with 4 groups (Basic SEO, Additional, Title Readability, Content Readability)

### Improvements

-   **Shared SEO Engine:** Added reusable text, HTML, and keyword analysis utilities
-   **Multiple Focus Keywords:** Support comma-separated keywords for comprehensive analysis

---

## 1.1.0 - 2025-04-21

### Features

-   **SEO Analysis & Focus Keyphrase:** Introduced a new "Keyphrase" tab with functionality to set a focus keyphrase and analyze its usage in the title, meta description, URL slug, and content fields. Includes detailed feedback on problems, improvements, and good results.
-   **Social Media Previews:** Added an "Open Graph Image" field and a preview component (`OgImagePreview`) to visualize how shared content will appear on social media platforms.
-   **New Interface Options:** Added interface options to configure the focus keyphrase functionality, including selecting the relevant slug and content fields.

### Improvements

-   **Interface Redesign:** Refactored the SEO interface into tabs (Basic, Advanced, Custom Fields, Keyphrase) for better organization.
-   **Search Preview:** Enhanced the `SearchPreview` component with improved styling, text handling, and error handling.
-   **Field Updates:** Renamed "Title" field to "Page Title". Updated other field names for clarity (e.g., "Search Engine Controls", "Sitemap Controls").
-   **Dependencies:** Updated various dependencies, including Directus packages and adding `reka-ui`.

### Refactoring & Internal Changes

-   Updated Docker configuration (Directus image version, volume mapping, cache settings).
-   Refactored image handling (`OgImage.vue`) to support preview mode and updated related types and utilities.



## 1.0.0 - 2025-02-08

### Initial Release
