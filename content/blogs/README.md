# HackUnion Blog Content

Add new posts as .md files in this folder.

## Author registry

Use existing authors from authors.json through authorId.

Example IDs:
- abdul-vasay
- sana-khan
- rohan-iyer
- neha-verma
- team-hackunion

## Frontmatter template

```yaml
---
slug: your-clean-slug
title: "Post title"
excerpt: Short summary used in cards and SEO.
coverImage: Images/gallery/example.jpg
coverImageAlt: Describe the image for accessibility
authorId: team-hackunion
publishedDate: 2026-08-28
updatedDate: 2026-08-28
category: Technology
tags:
  - Building
  - Community
featured: false
---
```

## Validation rules

- slug must be unique.
- title, excerpt, category, tags, and body are required.
- body must include at least one H1 and one H2.
- updatedDate cannot be before publishedDate.
- coverImage and author image must exist in the repository.
- Only one post may have featured: true.

## Commands

- Validate content: npm run blogs:validate
- Generate pages/data: npm run blogs:generate
- Full build: npm run build
