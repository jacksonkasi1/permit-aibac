import { logger } from "@repo/logs";
import { getGroundXClient } from "../client";
import { Document, WebsiteCrawlParams, websiteCrawlSchema } from "../types";

/**
 * Crawl a website and ingest its content into GroundX
 * @param params Website crawl parameters
 * @returns Array of generated documents from the crawl
 */
export async function crawlWebsite(params: WebsiteCrawlParams): Promise<Document[]> {
  // Validate input
  websiteCrawlSchema.parse(params);

  try {
    const client = getGroundXClient().getClient();

    // Use the crawlWebsite method from the documents resource of the GroundX SDK
    const response = await client.documents.crawlWebsite({
      websites: [
        {
          bucketId: params.bucketId,
          sourceUrl: params.sourceUrl,
          cap: params.cap,
          depth: params.depth,
          searchData: params.searchData,
        },
      ],
    });

    logger.info(
      {
        sourceUrl: params.sourceUrl,
        bucketId: params.bucketId,
        cap: params.cap,
        depth: params.depth,
      },
      "Website crawl initiated in GroundX",
    );

    return response as unknown as Document[];
  } catch (error) {
    logger.error(
      {
        sourceUrl: params.sourceUrl,
        bucketId: params.bucketId,
        error,
      },
      "Failed to crawl website with GroundX",
    );
    throw error;
  }
}

/**
 * Simplified website crawl function
 * @param url Website URL to crawl
 * @param bucketId Target bucket ID
 * @param depth Optional crawl depth (default: 2)
 * @param cap Optional maximum pages to crawl (default: 10)
 * @returns Array of generated documents from the crawl
 */
export async function crawl(
  url: string,
  bucketId: number,
  depth = 2,
  cap = 10,
): Promise<Document[]> {
  return crawlWebsite({
    bucketId,
    sourceUrl: url,
    depth,
    cap,
  });
}
