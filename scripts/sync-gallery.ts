
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncGallery() {
    console.log("Starting Picture Gallery Sync...");

    // 1. List all files/folders in the 'gallery' bucket (root level)
    const { data: rootItems, error: listError } = await supabase.storage.from('gallery').list();

    if (listError) {
        console.error("Error listing bucket:", listError);
        return;
    }

    if (!rootItems || rootItems.length === 0) {
        console.log("Bucket 'gallery' is empty.");
        return;
    }

    console.log(`Found ${rootItems.length} items in root.`);

    for (const item of rootItems) {
        // metadata is null for folders usually, or we check if it has no extension? 
        // Supabase list returns objects. If it's a folder, it might not have metadata like mimetype.
        // Actually, .list() returns folders as items with id: null (sometimes) or just name.

        // Let's assume items without a dot in the name are folders, or check specific properties.
        // Better strategy: Treat everything as a potential folder and try to list ITS content.
        // If we find files inside, it was a folder.

        if (item.id === null) {
            // Likely a folder placeholder in some storage implementations, but let's try listing inside it.
        }

        // Attempt to treat it as a folder
        const folderName = item.name;
        console.log(`Processing potential folder: ${folderName}`);

        // Check if folder exists in DB
        let folderId: string;
        const { data: existingFolder } = await supabase.from('gallery_folders').select('id').eq('name', folderName).single();

        if (existingFolder) {
            folderId = existingFolder.id;
            console.log(`  - Folder exists in DB: ${folderName} (${folderId})`);
        } else {
            // Create folder in DB
            // We only create if it actually has content or looks like a folder?
            // Let's check checks inside first.
            const { data: files } = await supabase.storage.from('gallery').list(folderName);

            if (!files || files.length === 0) {
                console.log(`  - Skipping ${folderName} (empty or not a folder)`);
                continue;
            }

            // It has files, so it is a folder. Create in DB.
            const { data: newFolder, error: createError } = await supabase
                .from('gallery_folders')
                .insert([{ name: folderName }])
                .select()
                .single();

            if (createError) {
                console.error(`  - Failed to create folder ${folderName}:`, createError);
                continue;
            }
            folderId = newFolder.id;
            console.log(`  - Created DB Entry for: ${folderName}`);
        }

        // Now Sync Images in this folder
        const { data: files } = await supabase.storage.from('gallery').list(folderName);
        if (!files) continue;

        for (const file of files) {
            if (file.name === '.emptyFolderPlaceholder') continue; // Skip placeholder

            const storagePath = `${folderName}/${file.name}`;

            // Check if image exists in DB
            const { data: existingImage } = await supabase.from('gallery_images').select('id').eq('storage_path', storagePath).single();

            if (!existingImage) {
                const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(storagePath);

                const { error: insertError } = await supabase.from('gallery_images').insert([{
                    folder_id: folderId,
                    storage_path: storagePath,
                    public_url: publicUrl,
                    title: file.name,
                    alt_text: folderName
                }]);

                if (insertError) {
                    console.error(`    - Failed to insert image ${file.name}:`, insertError);
                } else {
                    console.log(`    - Synced Image: ${file.name}`);
                }
            }
        }
    }

    console.log("Sync Complete.");
}

syncGallery().catch(console.error);
