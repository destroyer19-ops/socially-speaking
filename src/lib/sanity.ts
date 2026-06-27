import { createClient } from "@sanity/client";

// This is a placeholder for your actual Sanity project ID and dataset.
// Once you deploy the Sanity Studio (Option B), you will replace these
// with your actual values, or use environment variables like import.meta.env.VITE_SANITY_PROJECT_ID
export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || "ny1i8c8u",
  dataset: import.meta.env.VITE_SANITY_DATASET || "production",
  useCdn: true, // Use CDN for faster response times
  apiVersion: "2024-03-01", // Use current date
});

// Helper function to build image URLs from Sanity image records
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}
