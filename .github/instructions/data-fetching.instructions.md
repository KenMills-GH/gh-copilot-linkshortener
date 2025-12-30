---
description: Read this file to understand the data fetching standards for the project.
---

# Data Fetching Instructions

This document outlines the data fetching standards and best practices for the project. Adhering to these guidelines will ensure consistency, performance, and maintainability across the codebase.

## 1 Use Server Components for Data Fetching

In Next.js, ALWAYS use Server Components to fetch data whenever possible. This allows for better performance and SEO benefits. NEVER use Client Components for data fetching unless absolutely necessary.

## 2 Data Fetching Methods

ALWAYS use the helper functions in the /data directory for data fetching. NEVER write raw queries or fetch calls directly in components.

ALL helper functions in the /data directory should use Drizzle ORM for database interactions.
