---
title: "Markdown Pipeline For Static Personal Sites"
date: 2026-03-10
tags: ["Markdown", "Node", "Static Site"]
excerpt: "A minimal content pipeline that keeps writing simple and deployment predictable."
cover: "/assets/images/covers/markdown-pipeline.jpg"
slug: "markdown-pipeline"
---

## Content Should Be Portable

Markdown gives you longevity. Keep metadata in frontmatter and body in plain text.

## Build Step Responsibilities

The build step should do exactly three things:

1. Parse frontmatter and markdown.
2. Generate sorted metadata for listing pages.
3. Generate per-slug HTML for detail pages.

## Tooling Notes

A tiny Node script is enough when your site is small.
