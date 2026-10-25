# Data sources: what is real, what is not

| Wanted | Reality | What ParkBites does |
| --- | --- | --- |
| Item list, prices, photos from the Disney app/site | No public API. Scraping the Disney app or site is against their terms and breaks often. | Hand-curated seed data in `src/data.ts`, marked approximate, with a link to the official listing. |
| Instagram posts for an item | The Instagram API does not offer public hashtag/keyword search to apps like this. Scraping violates their terms. | Deep link to the hashtag page. |
| TikTok videos for an item | TikTok's research API is restricted; scraping violates terms. | Deep link to TikTok search. |
| "Trending" | Needs real post counts. | `trend` is a curated 0 to 100 score today. Backlog ticket 04 replaces it with real signals. |
| Ratings | No central source. | Sample ratings today. Backlog ticket 03 adds in-app guest ratings. |
| Auto-detect purchases | Disney does not expose purchase history. | Location dwell prompt plus manual logging. Ticket 06 adds receipt screenshot reading. |
| Posting to Instagram/TikTok | Neither allows a web app to post directly without app review. | Generate image + caption, hand off via the OS share sheet. |

If you integrate a data provider later, check its terms first and record it here.
