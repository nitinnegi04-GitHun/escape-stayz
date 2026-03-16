/**
 * client-side image compression and conversion to WebP
 */

export const compressImage = async (file: File, quality = 0.8): Promise<File> => {
    // If it's not an image, return original
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // If it's already WebP, return original
    if (file.type === 'image/webp') {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');

                // Calculate new dimensions (max 1920px width/height to be safe)
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 1920;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // Fallback
                    return;
                }

                // Draw image to canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to WebP
                canvas.toBlob((blob) => {
                    if (!blob) {
                        resolve(file); // Fallback
                        return;
                    }

                    // Create new File from Blob
                    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                        type: 'image/webp',
                        lastModified: Date.now(),
                    });

                    resolve(newFile);
                }, 'image/webp', quality);
            };

            img.onerror = (err) => {
                console.error("Image loading failed:", err);
                resolve(file); // Fallback
            };
        };

        reader.onerror = (err) => {
            console.error("FileReader failed:", err);
            resolve(file); // Fallback
        };
    });
};
