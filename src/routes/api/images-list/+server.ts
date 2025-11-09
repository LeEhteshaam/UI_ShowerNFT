import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const imageDir = path.resolve(process.cwd(), 'static/images');
    try {
        const allFiles = fs.readdirSync(imageDir);
        const imageFiles = allFiles.filter(file => /\.(jpe?g|png|gif)$/i.test(file));
        const imageUrls = imageFiles.map(file => `/images/${file}`);
        return json(imageUrls);
    } catch (error) {
        console.error("Could not read the images directory:", error);
        return json({ error: 'Failed to load images.' }, { status: 500 });
    }
}
