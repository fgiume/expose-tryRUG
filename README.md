# EXPOSE — Website version 5

This is the **new experimental version** of the EXPOSE website. It was copied from [expose-try4](https://github.com/fgiume/expose-try4), which is intentionally left unchanged as a working reference.

## Changes in version 5

- A single **Database** navigation item replaces the separate Database and Document Search tabs.
- **Search the Evidence** combines full-text search of the team's 69 episode research documents with the case, episode, sanction, strategy, tactic, report-year and record-type filters of the existing coded database.
- **Explore the Data** offers a configurable matrix (sanctions, strategies, tactics, cases and episodes as rows/columns). A **YES** requires both selected variables to appear in the **same coded excerpt**. Click a YES cell to view up to 15 supporting examples and continue to all matches in the search view.
- **NO** means no co-coded example found in informative coding, **not** that the combination was impossible or never occurred.
- **NO DATA** means that the available episode coding cannot support a comparison. The matrix uses the exact 0/1/9 coding from `OVERVIEW DATABASE 3.0-2.xlsx`, worksheet `irene is working here`, for the 69 episodes and variables V6–V104.
- The **Home page Case Spotlight remains unchanged**, as requested.

## Research data

- `data/coded-cases.js`: the team's structured coding of 69 episode research documents.
- `data/episode-search.js`: full-text index of the same documents.
- `data/matrix-codes.js`: compact, lossless representation of 0/1/9 status codes from the project's Excel workbook.
- `documents/`: the 69 underlying episode Word documents.

The research database does **not** retrieve examples from web search or third-party reporting. Public links to UN documents are source references.

## Publishing to GitHub Pages

GitHub Actions contains a deployment workflow at `.github/workflows/static.yml`. **GitHub Pages must first be enabled by an administrator in this repository**:

1. Open **Settings → Pages** for `fgiume/expose-try5`.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Open **Actions → Deploy EXPOSE to GitHub Pages** and select **Run workflow**.

After deployment succeeds, the expected website URL is:
https://fgiume.github.io/expose-try5/

The EXPOSE Contact page uses an external form service that requires activation of `expose@rug.nl` before message delivery can be assumed to work.

## Validation

GitHub Actions → **Verify EXPOSE website** checks required files, document counts, JavaScript syntax, the 0/1/9 data structure and a DOM smoke test of the integrated Database.

The original [expose-try4](https://github.com/fgiume/expose-try4) is deliberately not modified by this workflow.
