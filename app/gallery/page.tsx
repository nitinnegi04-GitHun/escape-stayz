
import { Metadata } from 'next';
import { Layout } from '../../components/Layout';
// import { SEO } from '../../components/SEO'; // SEO components are replaced by Metadata API

export const metadata: Metadata = {
    title: 'Visual Showcase | Escape Stayz',
    description: 'Immerse yourself in the beauty of Escape Stayz through our high-definition gallery.',
    openGraph: {
        title: 'Visual Showcase | Escape Stayz',
        description: 'Immerse yourself in the beauty of Escape Stayz through our high-definition gallery.',
        type: 'website',
    }
};

const GALLERY_IMAGES = [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1493246507139-91e8bef99c1e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800"
];

export default function GalleryPage() {
    return (
        <Layout>
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="text-left mb-16 max-w-2xl">
                        <h1 className="text-5xl font-bold mb-4">Immersive Views</h1>
                        <p className="text-slate-500">A curated collection of moments from across our global properties.</p>
                    </div>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {GALLERY_IMAGES.map((img, idx) => (
                            <div key={idx} className="break-inside-avoid rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all group">
                                <img src={img} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
