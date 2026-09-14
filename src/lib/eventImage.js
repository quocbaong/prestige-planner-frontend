export const resolveMediaUrl = (path, baseURL) => {
  const url = path?.trim();
  if (!url || /^https?:\/\//i.test(url)) return url;
  return new URL(url, baseURL).toString();
};

// Prefer uploaded thumbnails while retaining legacy banner-only events.
export const resolveEventImage = (event, baseURL) =>
  resolveMediaUrl(event?.thumbnailUrl?.trim() || event?.bannerUrl?.trim(), baseURL);
