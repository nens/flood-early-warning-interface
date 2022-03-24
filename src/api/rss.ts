// Read and parse the EWN (early warning network) RSS feed.
// Use React Query around it so it is re-fetched regularly.

import { useQuery } from "react-query";
import { QUERY_OPTIONS, FetchError } from "./hooks";

export interface RssItem {
  title: string;
  warning: string;
  area: string;
  link: string;
  description: string;
  pubDate: string;
}

export function useRSSFeed() {
  const rssResponse = useQuery(
    ["rss"],
    async () => {
      const response = await fetch("/proxy/https://www.ewn.com.au/alerts/COPrss.aspx", {
        method: "GET",
        headers: {
          "Content-Type": "application/rss+xml",
          Accept: "application/rss+xml",
        },
      });

      if (!response.ok) {
        throw new FetchError(
          response,
          `Getting RSS feed failed: ${response.status} ${response.statusText} ${response.body}`
        );
      }

      const body = await response.text();
      const parsed = new window.DOMParser().parseFromString(body, "text/xml");
      const items = parsed.getElementsByTagName("item");
      const parsedItems: RssItem[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items.item(i);
        if (!item) continue;

        console.log(item.innerHTML);

        // Title is of the form "Minor Flood Warning: Darling Mills Creek" so split it
        const title = item.querySelector("title")!.innerHTML;
        const [warning, area] = title.split(": ");

        parsedItems.push({
          title,
          warning,
          area,
          link: item.querySelector("link")!.innerHTML,
          description: item.querySelector("description")!.innerHTML,
          pubDate: item.querySelector("pubDate")!.innerHTML,
        });
      }
      return parsedItems;
    },
    QUERY_OPTIONS
  );

  return rssResponse;
}

export function useRssItemsForArea(area: string) {
  const rssResponse = useRSSFeed();

  if (rssResponse.isSuccess && rssResponse.data) {
    return rssResponse.data.filter((item) => item.area === area);
  } else {
    return [];
  }
}

export function useLatestItemForArea(area: string) {
  const itemsForArea = useRssItemsForArea(area);

  return itemsForArea.length ? itemsForArea[0] : null;
}
