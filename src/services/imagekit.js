// src/services/imagekit.js
import ImageKit from 'imagekit-javascript';

export const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
});

export const uploadImage = async (file, fileName, onProgress) => {
  // 1. Fetch auth params from Vercel endpoint (POST avoids iOS Safari caching)
  const authResponse = await fetch(import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!authResponse.ok) {
    throw new Error('Failed to get ImageKit authentication');
  }

  const { token, signature, expire } = await authResponse.json();

  // 2. Pass auth params manually to upload()
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file,
        fileName: fileName || `contact_${Date.now()}`,
        folder: '/contacts',
        useUniqueFileName: true,
        tags: ['contact-avatar'],
        token,
        signature,
        expire,
        onUploadProgress: (event) => {
          if (onProgress && event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        }
      },
      (err, result) => {
        if (err) {
          console.error('ImageKit upload error:', err);
          return reject(err);
        }
        resolve({
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          fileId: result.fileId,
          filePath: result.filePath
        });
      }
    );
  });
};

export const getTransformedUrl = (url, options = {}) => {
  if (!url || !url.includes('ik.imagekit.io')) return url;

  const transforms = [];
  if (options.width) transforms.push(`w-${options.width}`);
  if (options.height) transforms.push(`h-${options.height}`);
  if (options.quality) transforms.push(`q-${options.quality}`);
  if (options.format) transforms.push(`f-${options.format}`);

  if (transforms.length === 0) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}tr=${transforms.join(',')}`;
};