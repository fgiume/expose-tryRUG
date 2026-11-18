# Publishing news on the EXPOSE website

The **News** page is powered by `data/news.json`. Only collaborators with GitHub repository write access can publish items. The public site does not provide an anonymous posting form.

## How to publish

1. Open [data/news.json](https://github.com/fgiume/expose-try5/blob/main/data/news.json) on GitHub.
2. Select the pencil icon **Edit this file** (sign in to an account with repository write access).
3. Add a new object at the beginning of the `posts` array using the example below.
4. Commit the change to `main` (or propose a pull request, if you want review before publication).
5. When GitHub Pages deploys the change, the news item appears automatically, newest first.

## Example template — do not publish this as actual news

```json
{
  "posts": [
    {
      "id": "example-announcement",
      "date": "2026-11-18",
      "category": "Project update",
      "title": "Your headline",
      "summary": "One or two sentences that introduce the update.",
      "body": [
        "The first paragraph of the news item.",
        "An optional second paragraph."
      ],
      "link": "https://www.rug.nl/",
      "linkLabel": "More information",
      "published": false
    }
  ]
}
```

- **Date:** ISO format `YYYY-MM-DD`.
- **id:** A unique lowercase slug used for linking to individual posts, for example `conference-november-2026`.
- **Category:** e.g. `Project update`, `Event`, `Publication`, or `Announcement`.
- **body:** An array of plain-text paragraphs. HTML is not rendered.
- **link/linkLabel:** Optional. Remove these fields if there is no further link.
- **published:** Set to `true` to show the post, or `false` to keep it hidden.

Never insert unverified research findings or unpublished confidential information. News items are not added automatically from other websites or Google.
