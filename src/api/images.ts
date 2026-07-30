import api from './api';

// Appwrite's CORS policy only allows a small set of trusted origins to
// fetch() file bytes directly, so anywhere the app needs the raw bytes of
// an Appwrite-hosted image (converting it to a File, force-downloading it,
// etc.) goes through the backend's proxy endpoint instead of hitting
// Appwrite from the browser.
export const buildImageProxyUrl = (appwriteUrl: string): string => {
  const base = (api.defaults.baseURL || '').replace(/\/$/, '');
  return `${base}/images/proxy?url=${encodeURIComponent(appwriteUrl)}`;
};

// Fetches an Appwrite-hosted image's bytes via the backend proxy and turns
// them into a File — used wherever an already-hosted image needs to be
// re-uploaded as part of a multipart request (e.g. the try-on flow).
export const proxiedUrlToFile = async (url: string, filename: string): Promise<File> => {
  const res = await fetch(buildImageProxyUrl(url));
  if (!res.ok) throw new Error('Could not load the image.');
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
};
