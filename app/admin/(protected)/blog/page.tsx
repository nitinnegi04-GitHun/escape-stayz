
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ImagePicker } from '../../../../components/Admin/ImagePicker';
import { supabase } from '../../../../lib/supabase';
import { getBlogPosts, getDestinations } from '../../../../lib/queries';

interface BlogPost {
    id?: string;
    slug: string;
    title: string;
    content: string;
    excerpt: string;
    author: string;
    featured_image: string;
    category: string;
    destination_slug?: string;
    related_ids?: string[];
    tags?: string[];
    meta_title?: string;
    meta_description?: string;
    published: boolean;
    created_at?: string;
}

const CATEGORIES = [
    'Travel Guide',
    'Experiences',
    'Culinary Journey',
    'Alpine Culture',
    'Retreat Highlight',
    'Adventure',
    'Photography',
    'Wellness',
    'Wildlife',
    'Heritage',
];

// ─── Reusable field label ──────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/50 mb-2">{children}</label>
);

// ─── Reusable text input ───────────────────────────────────────────────────────
const Field = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className={`w-full bg-cream rounded-xl px-4 py-3 text-sm text-charcoal outline-none border border-transparent focus:border-forest/20 transition-colors placeholder:text-charcoal/25 ${props.className || ''}`} />
);

// ─── Reusable select ───────────────────────────────────────────────────────────
const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
    <select {...props} className="w-full bg-cream rounded-xl px-4 py-3 text-sm font-medium text-charcoal border border-transparent outline-none focus:border-forest/20 transition-colors cursor-pointer" />
);

// ─── Toolbar Button ────────────────────────────────────────────────────────────
const ToolBtn = ({ title, onClick, children, active }: { title: string; onClick: () => void; active?: boolean; children: React.ReactNode }) => (
    <button
        title={title}
        onMouseDown={e => { e.preventDefault(); onClick(); }}
        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all text-sm ${active ? 'bg-white text-charcoal shadow' : 'text-white/60 hover:text-white hover:bg-white/15'}`}
    >
        {children}
    </button>
);
const Sep = () => <div className="w-px h-6 bg-white/10 mx-0.5" />;

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [destinations, setDestinations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSourceMode, setIsSourceMode] = useState(false);
    const [sidebarTab, setSidebarTab] = useState<'publish' | 'seo' | 'tags'>('publish');
    const [tagInput, setTagInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const editorRef = useRef<HTMLDivElement>(null);
    // ── Gallery picker state (for inline image insertion) ──────────────────────
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryFolders, setGalleryFolders] = useState<{ id: string; name: string }[]>([]);
    const [galleryCurrentFolder, setGalleryCurrentFolder] = useState<{ id: string; name: string } | null>(null);
    const [galleryImages, setGalleryImages] = useState<{ id: string; public_url: string; title: string; media_type?: string }[]>([]);
    const [galleryLoading, setGalleryLoading] = useState(false);
    // ── Crop tool state ────────────────────────────────────────────────────────
    const [cropSource, setCropSource] = useState<{ src: string; domImg: HTMLImageElement; natW: number; natH: number; cropId: string } | null>(null);
    const [cropBox, setCropBox] = useState({ x: 25, y: 25, w: 50, h: 50 }); // % of displayed image
    const cropImgRef = useRef<HTMLImageElement>(null);
    const cropDrag = useRef<{ mode: 'move' | 'nw' | 'ne' | 'sw' | 'se'; startX: number; startY: number; startBox: typeof cropBox } | null>(null);
    const lastContentRef = useRef<string>('');
    const lastPostIdRef = useRef<string | undefined>(undefined);
    const [activeFormats, setActiveFormats] = useState<string[]>([]);

    const updateActiveFormats = useCallback(() => {
        const formats: string[] = [];
        if (typeof document !== 'undefined') {
            if (document.queryCommandState('bold')) formats.push('bold');
            if (document.queryCommandState('italic')) formats.push('italic');
            if (document.queryCommandState('underline')) formats.push('underline');

            const block = document.queryCommandValue('formatBlock')?.toLowerCase();
            if (block) {
                // Standardize: formatBlock might return "h1" or "<h1>" depending on browser
                const clean = block.replace(/[<>]/g, '');
                formats.push(clean.toUpperCase());
            }
        }
        setActiveFormats(formats);
    }, []);

    // Stability: sync state TO editor only when changed externally (e.g. loading post or switching from Source Mode)
    useEffect(() => {
        if (!isSourceMode && editorRef.current && currentPost && isEditorOpen) {
            const editorHTML = editorRef.current.innerHTML;
            const stateHTML = currentPost.content || '';
            const isNewPost = currentPost.id !== lastPostIdRef.current;
            const isDomEmpty = editorHTML === '' || editorHTML === '<p><br></p>';

            // Update the DOM if:
            // 1. It's a different post entirely (ID change)
            // 2. OR the state content is NEW (different from DOM AND different from what we last synced)
            // 3. OR the DOM is unexpectedly empty (e.g. just remounted)
            if (isNewPost || (stateHTML !== editorHTML && stateHTML !== lastContentRef.current) || isDomEmpty) {
                editorRef.current.innerHTML = stateHTML;
            }
            // Always keep the ref in sync with the state to track the last known state value
            lastContentRef.current = stateHTML;
            lastPostIdRef.current = currentPost.id;
        }
    }, [currentPost?.content, isSourceMode, currentPost?.id, isEditorOpen]);

    const closeEditor = useCallback(() => {
        setIsEditorOpen(false);
        setIsSourceMode(false);
        // Clear memory refs so next time we open, it triggers a fresh sync
        lastPostIdRef.current = undefined;
        lastContentRef.current = '';
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        const [postsData, destsData] = await Promise.all([getBlogPosts(), getDestinations()]);
        setPosts(postsData || []);
        setDestinations(destsData || []);
        setLoading(false);
    };
    useEffect(() => { fetchPosts(); }, []);

    // ── Editor helpers ────────────────────────────────────────────────────────
    const syncContent = useCallback(() => {
        if (editorRef.current && !isSourceMode) {
            const el = editorRef.current;
            const newHTML = el.innerHTML;
            setCurrentPost(p => p ? { ...p, content: newHTML } : null);
        }
    }, [isSourceMode]);

    const exec = useCallback((cmd: string, val?: string) => {
        if (!editorRef.current) return;
        editorRef.current.focus();

        let commandValue = val;
        // Standardize formatBlock tags to use <tag> syntax for maximum browser compatibility
        if (cmd === 'formatBlock' && val && !val.startsWith('<')) {
            commandValue = `<${val}>`;
        }

        document.execCommand(cmd, false, commandValue);
        updateActiveFormats();
        syncContent();
    }, [updateActiveFormats, syncContent]);

    const addLink = () => {
        const url = prompt('Enter URL (include https://):');
        if (url) exec('createLink', url);
    };


    // ── Gallery helpers ───────────────────────────────────────────────────────
    const openGalleryForInsert = () => {
        setGalleryCurrentFolder(null);
        setGalleryImages([]);
        setIsGalleryOpen(true);
        fetchGalleryFolders();
    };

    const fetchGalleryFolders = async () => {
        setGalleryLoading(true);
        const { data } = await supabase.from('gallery_folders').select('*').order('name');
        setGalleryFolders(data || []);
        setGalleryLoading(false);
    };

    const fetchGalleryImages = async (folderId: string) => {
        setGalleryLoading(true);
        const { data } = await supabase
            .from('gallery_images')
            .select('*')
            .eq('folder_id', folderId)
            .order('created_at', { ascending: false });
        setGalleryImages(data || []);
        setGalleryLoading(false);
    };

    const insertImageFromGallery = (url: string) => {
        setIsGalleryOpen(false);
        const html = `<figure style="margin:24px 0;"><img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:12px;display:block;" /></figure><p><br></p>`;
        exec('insertHTML', html);
    };

    // ── Crop tool ─────────────────────────────────────────────────────────────
    const openCropModal = (imgEl: HTMLImageElement) => {
        const cropId = 'crop-' + Date.now();
        imgEl.setAttribute('data-crop-id', cropId);

        const open = (natW: number, natH: number) => {
            setCropSource({ src: imgEl.src, domImg: imgEl, natW, natH, cropId });
            setCropBox({ x: 10, y: 10, w: 80, h: 80 });
        };
        if (imgEl.naturalWidth > 0) {
            open(imgEl.naturalWidth, imgEl.naturalHeight);
        } else {
            const tmp = new Image();
            tmp.crossOrigin = 'anonymous';
            tmp.onload = () => open(tmp.naturalWidth, tmp.naturalHeight);
            tmp.src = imgEl.src;
        }
    };


    const applyCrop = async () => {
        if (!cropSource || !cropImgRef.current || !editorRef.current) return;

        const { cropId, natW, natH, src: originalSrc } = cropSource;
        const box = { ...cropBox };

        const cropImg = cropImgRef.current;
        const rect = cropImg.getBoundingClientRect();
        if (rect.width === 0) return;

        const scaleX = natW / rect.width;
        const scaleY = natH / rect.height;

        const sw = Math.max(1, Math.round((box.w / 100) * rect.width * scaleX));
        const sh = Math.max(1, Math.round((box.h / 100) * rect.height * scaleY));
        const sx = Math.max(0, Math.round((box.x / 100) * rect.width * scaleX));
        const sy = Math.max(0, Math.round((box.y / 100) * rect.height * scaleY));

        const canvas = document.createElement('canvas');
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

        const img = new Image();
        if (!originalSrc.startsWith('data:')) img.crossOrigin = 'anonymous';

        img.onload = () => {
            console.log('Generating crop from:', originalSrc.substring(0, 30));
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

            // ── CONVERT TO BLOB & UPLOAD TO STORAGE ──
            canvas.toBlob(async (blob) => {
                if (!blob) return;

                try {
                    const uniqueId = Math.random().toString(36).substring(2, 8);
                    const filename = `crop-${Date.now()}-${uniqueId}.jpg`;
                    const path = `crops/${filename}`;

                    console.log(`Uploading crop to: ${path}`);
                    const { error: upErr } = await supabase.storage.from('gallery').upload(path, blob, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                    if (upErr) throw upErr;

                    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);

                    // 1. Find the target image in the CURRENT editor DOM using the unique ID
                    const targetImg = editorRef.current?.querySelector(`img[data-crop-id="${cropId}"]`) as HTMLImageElement;

                    if (targetImg) {
                        console.log('Target image found by ID, applying public URL crop...');
                        targetImg.src = publicUrl;
                        targetImg.removeAttribute('srcset');
                        targetImg.removeAttribute('data-crop-id'); // Clean up
                        targetImg.style.width = 'auto';
                        targetImg.style.height = 'auto';

                        // 2. Focus and trigger input to sync state
                        editorRef.current?.focus();
                        const event = new Event('input', { bubbles: true });
                        editorRef.current?.dispatchEvent(event);
                    } else {
                        throw new Error('Could not find image to update in the editor.');
                    }

                    setCropSource(null);
                } catch (err: any) {
                    console.error('Crop upload failed:', err);
                    alert(`Failed to save cropped image: ${err.message}`);
                    setCropSource(null);
                }
            }, 'image/jpeg', 0.90);
        };
        img.onerror = () => {
            alert('Failed to process image for cropping.');
            setCropSource(null);
        };
        img.src = originalSrc;
    };

    const onCropMouseDown = (e: React.MouseEvent, mode: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
        e.preventDefault();
        cropDrag.current = { mode, startX: e.clientX, startY: e.clientY, startBox: { ...cropBox } };
    };

    const onCropMouseMove = (e: React.MouseEvent) => {
        if (!cropDrag.current || !cropImgRef.current) return;
        const { mode, startX, startY, startBox } = cropDrag.current;
        const dispW = cropImgRef.current.clientWidth;
        const dispH = cropImgRef.current.clientHeight;
        const dx = ((e.clientX - startX) / dispW) * 100;
        const dy = ((e.clientY - startY) / dispH) * 100;
        setCropBox(prev => {
            let { x, y, w, h } = startBox;
            const MIN = 5;
            if (mode === 'move') {
                x = Math.max(0, Math.min(100 - w, x + dx));
                y = Math.max(0, Math.min(100 - h, y + dy));
            } else {
                if (mode === 'nw') { const nx = Math.min(x + w - MIN, x + dx); const nw = w - (nx - x); x = nx; w = nw; const ny = Math.min(y + h - MIN, y + dy); const nh = h - (ny - y); y = ny; h = nh; }
                if (mode === 'ne') { w = Math.max(MIN, w + dx); const ny = Math.min(y + h - MIN, y + dy); const nh = h - (ny - y); y = ny; h = nh; }
                if (mode === 'sw') { h = Math.max(MIN, h + dy); const nx = Math.min(x + w - MIN, x + dx); const nw = w - (nx - x); x = nx; w = nw; }
                if (mode === 'se') { w = Math.max(MIN, w + dx); h = Math.max(MIN, h + dy); }
                // Clamp to image bounds
                if (x < 0) { w += x; x = 0; } if (y < 0) { h += y; y = 0; }
                if (x + w > 100) w = 100 - x; if (y + h > 100) h = 100 - y;
                if (w < MIN) w = MIN; if (h < MIN) h = MIN;
            }
            return { x, y, w, h };
        });
    };


    const insertCalloutBlock = () => {
        const selection = window.getSelection();
        const selectedText = selection?.toString() || '';
        const html = `<div class="callout-block">${selectedText || 'Add your callout text here…'}</div><p><br></p>`;
        exec('insertHTML', html);
    };

    const insertTOCBlock = () => {
        // Insert a placeholder that the public page replaces with a live-generated TOC
        const html = `<div class="toc-placeholder" data-auto-toc="true" contenteditable="false">
  <div class="toc-placeholder-header">
<span class="toc-placeholder-icon">&#9776;</span>
<span class="toc-placeholder-title">Table of Contents</span>
  </div>
  <p class="toc-placeholder-note">Section links will be auto-generated from your H1 &amp; H2 headings when the post is published.</p>
</div><p><br></p>`;
        exec('insertHTML', html);
    };

    const toggleSource = () => {
        if (!isSourceMode && editorRef.current)
            setCurrentPost(p => p ? { ...p, content: editorRef.current!.innerHTML } : null);
        setIsSourceMode(v => !v);
    };

    const handleTitleChange = (val: string) => {
        setCurrentPost(p => {
            if (!p) return null;
            const slug = p.id ? p.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            return { ...p, title: val, slug: p.id ? p.slug : slug };
        });
    };

    // ── Tags ──────────────────────────────────────────────────────────────────
    const addTag = (raw: string) => {
        const tag = raw.trim().toLowerCase().replace(/\s+/g, '-');
        if (!tag) return;
        setCurrentPost(p => {
            if (!p) return null;
            const tags = p.tags || [];
            return tags.includes(tag) ? p : { ...p, tags: [...tags, tag] };
        });
        setTagInput('');
    };
    const removeTag = (t: string) => setCurrentPost(p => p ? { ...p, tags: (p.tags || []).filter(x => x !== t) } : null);

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const handleEdit = (post: any) => {
        lastPostIdRef.current = undefined; // Force sync on next effect run
        lastContentRef.current = '';
        setCurrentPost(post);
        setIsEditorOpen(true);
        setIsSourceMode(false);
        setSidebarTab('publish');
        setTagInput('');
    };

    const handleNew = () => {
        lastPostIdRef.current = undefined; // Force sync on next effect run
        lastContentRef.current = '';
        setCurrentPost({
            title: '', slug: '', content: '', excerpt: '',
            author: 'Escape Concierge', featured_image: '',
            category: 'Travel Guide', published: false,
            related_ids: [], tags: [], meta_title: '', meta_description: '',
        });
        setIsEditorOpen(true);
        setIsSourceMode(false);
        setSidebarTab('publish');
        setTagInput('');
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Permanently delete this post?')) return;
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) { alert(error.message); return; }
        setPosts(posts.filter(p => p.id !== id));
    };

    const savePost = async () => {
        if (!currentPost) return;
        setIsSaving(true);

        // Final, definitive sync from DOM
        let finalContent = currentPost.content;
        if (!isSourceMode && editorRef.current) {
            syncContent();
            finalContent = editorRef.current.innerHTML;
        }

        const payload = { ...currentPost, content: finalContent };
        try {
            let result;
            if (payload.id) {
                result = await supabase.from('blog_posts').update(payload).eq('id', payload.id).select().single();
            } else {
                result = await supabase.from('blog_posts').insert([payload]).select().single();
            }

            if (result.error) throw result.error;

            // Optimistic local update: update the posts list immediately with the fresh data
            if (result.data) {
                const fresh = result.data;
                setPosts(prev => {
                    const exists = prev.find(p => p.id === fresh.id);
                    if (exists) {
                        return prev.map(p => p.id === fresh.id ? fresh : p);
                    }
                    return [fresh, ...prev];
                });
            }

            closeEditor();
            // background re-fetch for absolute consistency
            fetchPosts();
        } catch (err: any) {
            console.error('Save error:', err);
            alert(`Save failed: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = posts.filter(p => {
        const s = !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const c = !filterCategory || p.category === filterCategory;
        return s && c;
    });

    return (
        <>
            {/* ═══════════════════════════════════════════════════════════════
          POST LIST
        ═══════════════════════════════════════════════════════════════ */}
            {!isEditorOpen ? (
                <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">

                    {/* Header */}
                    <div className="px-10 py-8 border-b border-charcoal/5 flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-charcoal">Blog Posts</h2>
                            <p className="text-sm text-charcoal/40 mt-1">{posts.length} total posts</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="relative">
                                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30 text-xs"></i>
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-3 bg-cream rounded-2xl text-sm outline-none w-56 text-charcoal placeholder:text-charcoal/30"
                                />
                            </div>
                            <select
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                className="bg-cream rounded-2xl px-4 py-3 text-sm font-medium text-charcoal outline-none cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button
                                onClick={handleNew}
                                className="bg-charcoal text-white px-7 py-3.5 rounded-full text-sm font-bold shadow-lg hover:bg-forest transition-all"
                            >
                                + New Post
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#f8f9fa] border-b border-charcoal/5">
                                    {['Title & Slug', 'Category', 'Tags', 'Destination', 'Status', ''].map(h => (
                                        <th key={h} className="px-8 py-4 text-xs font-bold uppercase tracking-wide text-charcoal/40">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-charcoal/5">
                                {loading ? (
                                    [...Array(4)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-6"><div className="h-4 bg-charcoal/5 rounded w-48"></div><div className="h-3 bg-charcoal/5 rounded w-24 mt-2"></div></td>
                                            {[...Array(4)].map((_, j) => <td key={j} className="px-8 py-6"><div className="h-4 bg-charcoal/5 rounded w-20"></div></td>)}
                                            <td></td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="px-8 py-16 text-center text-charcoal/30 text-sm italic">No posts found</td></tr>
                                ) : filtered.map(post => (
                                    <tr key={post.id} onClick={() => handleEdit(post)} className="hover:bg-[#fafafa] transition-colors cursor-pointer group">
                                        <td className="px-8 py-5 max-w-sm">
                                            <p className="font-semibold text-charcoal text-sm leading-snug">{post.title || '(Untitled)'}</p>
                                            <p className="text-xs text-charcoal/35 mt-1 font-mono">/{post.slug}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="bg-cream text-charcoal/70 px-3 py-1.5 rounded-full text-xs font-medium">
                                                {post.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-wrap gap-1">
                                                {(post.tags || []).slice(0, 2).map((t: string) => (
                                                    <span key={t} className="bg-forest/8 text-forest text-xs font-medium px-2.5 py-1 rounded-full">#{t}</span>
                                                ))}
                                                {(post.tags || []).length > 2 && (
                                                    <span className="text-xs text-charcoal/30">+{(post.tags || []).length - 2}</span>
                                                )}
                                                {!(post.tags?.length) && <span className="text-xs text-charcoal/20">—</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm text-charcoal/50 font-medium">
                                                {post.destination_slug || '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${post.published ? 'bg-forest' : 'bg-charcoal/20'}`}></div>
                                                <span className={`text-xs font-semibold ${post.published ? 'text-forest' : 'text-charcoal/35'}`}>
                                                    {post.published ? 'Live' : 'Draft'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button title="Edit" onClick={() => handleEdit(post)} className="w-9 h-9 rounded-xl border border-charcoal/8 flex items-center justify-center text-charcoal/40 hover:text-forest hover:border-forest/20 transition-colors">
                                                    <i className="fas fa-pen text-xs"></i>
                                                </button>
                                                <button title="Delete" onClick={e => handleDelete(post.id, e)} className="w-9 h-9 rounded-xl border border-charcoal/8 flex items-center justify-center text-charcoal/40 hover:text-red-400 hover:border-red-200 transition-colors">
                                                    <i className="fas fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            ) : (
                /* ═══════════════════════════════════════════════════════════════
                  EDITOR
                ═══════════════════════════════════════════════════════════════ */
                <div className="flex flex-col gap-5" style={{ minHeight: 'calc(100vh - 180px)' }}>

                    {/* Editor top bar */}
                    <div className="flex items-center justify-between">
                        <button onClick={closeEditor} className="flex items-center gap-2 text-sm text-charcoal/40 hover:text-charcoal transition-colors font-medium">
                            <i className="fas fa-arrow-left text-xs"></i> All Posts
                        </button>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-4 py-2 rounded-full ${currentPost?.published ? 'bg-forest/10 text-forest' : 'bg-charcoal/8 text-charcoal/50'}`}>
                                {currentPost?.published ? '● Live' : '○ Draft'}
                            </span>
                            <button onClick={savePost} disabled={isSaving} className="bg-forest text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg shadow-forest/20 hover:bg-forest/85 transition-all disabled:opacity-50">
                                {isSaving ? 'Saving…' : 'Save Post'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

                        {/* ── Main content column ── */}
                        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-5">

                            {/* Title + Slug card */}
                            <div className="bg-white rounded-3xl border border-charcoal/5 px-10 pt-8 pb-6">
                                <input
                                    type="text"
                                    value={currentPost?.title || ''}
                                    onChange={e => handleTitleChange(e.target.value)}
                                    placeholder="Post Title"
                                    className="w-full text-4xl font-bold text-charcoal border-none outline-none placeholder:text-charcoal/15 mb-4 leading-tight"
                                />
                                <div className="flex items-center gap-2 text-sm text-charcoal/40 border-t border-charcoal/5 pt-4">
                                    <span className="font-medium">Slug:</span>
                                    <span className="font-mono">/blog/</span>
                                    <input
                                        type="text"
                                        value={currentPost?.slug || ''}
                                        onChange={e => setCurrentPost(p => p ? { ...p, slug: e.target.value } : null)}
                                        className="font-mono bg-transparent border-b-2 border-charcoal/10 focus:border-forest/30 outline-none text-charcoal/70 flex-1 pb-0.5 transition-colors text-sm"
                                        placeholder="post-slug"
                                    />
                                </div>
                            </div>

                            {/* Rich text editor card */}
                            <div className="bg-white rounded-3xl border border-charcoal/5 flex flex-col" style={{ minHeight: '540px' }}>

                                {/* Toolbar — sticky so it follows as you scroll */}
                                <div className="flex flex-wrap items-center gap-1 px-4 py-3 bg-charcoal rounded-t-3xl sticky top-0 z-10">

                                    <div className="flex items-center gap-0.5 bg-white/8 rounded-xl p-1">
                                        <ToolBtn title="Undo" onClick={() => exec('undo')}><i className="fas fa-undo text-xs"></i></ToolBtn>
                                        <ToolBtn title="Redo" onClick={() => exec('redo')}><i className="fas fa-redo text-xs"></i></ToolBtn>
                                    </div>
                                    <Sep />
                                    <div className="flex items-center gap-0.5 bg-white/8 rounded-xl p-1">
                                        {(['H1', 'H2', 'H3', 'H4'] as const).map(h => {
                                            const isActive = activeFormats.includes(h);
                                            return (
                                                <ToolBtn
                                                    key={h}
                                                    title={`Heading ${h[1]}`}
                                                    onClick={() => exec('formatBlock', isActive ? 'p' : h.toLowerCase())}
                                                    active={isActive}
                                                >
                                                    <span className="text-xs font-bold">{h}</span>
                                                </ToolBtn>
                                            );
                                        })}
                                        <ToolBtn title="Paragraph" onClick={() => exec('formatBlock', 'p')} active={activeFormats.includes('P') || activeFormats.includes('DIV')}>
                                            <span className="text-sm">¶</span>
                                        </ToolBtn>
                                    </div>
                                    <Sep />
                                    <div className="flex items-center gap-0.5 bg-white/8 rounded-xl p-1">
                                        <ToolBtn title="Bold" onClick={() => exec('bold')} active={activeFormats.includes('bold')}><i className="fas fa-bold text-xs"></i></ToolBtn>
                                        <ToolBtn title="Italic" onClick={() => exec('italic')} active={activeFormats.includes('italic')}><i className="fas fa-italic text-xs"></i></ToolBtn>
                                        <ToolBtn title="Underline" onClick={() => exec('underline')} active={activeFormats.includes('underline')}><i className="fas fa-underline text-xs"></i></ToolBtn>
                                        <ToolBtn title="Strikethrough" onClick={() => exec('strikeThrough')} active={activeFormats.includes('STRIKETHROUGH')}><i className="fas fa-strikethrough text-xs"></i></ToolBtn>
                                    </div>
                                    <Sep />
                                    <div className="flex items-center bg-white/8 rounded-xl p-1">
                                        <select title="Font Size" onChange={e => exec('fontSize', e.target.value)} defaultValue="" className="bg-transparent text-white/70 text-xs outline-none cursor-pointer h-9 px-2">
                                            <option value="" disabled>Size</option>
                                            {[['XS', '1'], ['SM', '2'], ['MD', '3'], ['LG', '4'], ['XL', '5'], ['2XL', '6'], ['3XL', '7']].map(([l, v]) => (
                                                <option key={v} value={v}>{l}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Sep />
                                    <div className="flex items-center gap-0.5 bg-white/8 rounded-xl p-1">
                                        <ToolBtn title="Left" onClick={() => exec('justifyLeft')}><i className="fas fa-align-left text-xs"></i></ToolBtn>
                                        <ToolBtn title="Centre" onClick={() => exec('justifyCenter')}><i className="fas fa-align-center text-xs"></i></ToolBtn>
                                        <ToolBtn title="Right" onClick={() => exec('justifyRight')}><i className="fas fa-align-right text-xs"></i></ToolBtn>
                                    </div>
                                    <Sep />
                                    <div className="flex items-center gap-0.5 bg-white/8 rounded-xl p-1">
                                        <ToolBtn title="Bullet list" onClick={() => exec('insertUnorderedList')}><i className="fas fa-list-ul text-xs"></i></ToolBtn>
                                        <ToolBtn title="Numbered list" onClick={() => exec('insertOrderedList')}><i className="fas fa-list-ol text-xs"></i></ToolBtn>
                                        <ToolBtn title="Blockquote" onClick={() => exec('formatBlock', 'BLOCKQUOTE')}><i className="fas fa-quote-left text-xs"></i></ToolBtn>
                                        <ToolBtn title="Callout Block" onClick={insertCalloutBlock}>
                                            <i className="fas fa-square text-xs opacity-80"></i>
                                        </ToolBtn>
                                        <ToolBtn title="Insert Table of Contents" onClick={insertTOCBlock}>
                                            <span className="text-[10px] font-bold leading-none">TOC</span>
                                        </ToolBtn>
                                        <ToolBtn title="Divider" onClick={() => exec('insertHorizontalRule')}><span className="text-xs font-mono">—</span></ToolBtn>
                                    </div>
                                    <Sep />
                                    <div className="flex items-center gap-0.5 bg-white/8 rounded-xl p-1">
                                        <ToolBtn title="Indent" onClick={() => exec('indent')}><i className="fas fa-indent text-xs"></i></ToolBtn>
                                        <ToolBtn title="Outdent" onClick={() => exec('outdent')}><i className="fas fa-outdent text-xs"></i></ToolBtn>
                                    </div>
                                    <Sep />
                                    <div className="flex items-center gap-0.5 bg-white/8 rounded-xl p-1">
                                        <ToolBtn title="Insert link" onClick={addLink}><i className="fas fa-link text-xs"></i></ToolBtn>
                                        <ToolBtn title="Remove link" onClick={() => exec('unlink')}><i className="fas fa-unlink text-xs"></i></ToolBtn>
                                        <ToolBtn title="Insert image from gallery" onClick={openGalleryForInsert}><i className="fas fa-image text-xs"></i></ToolBtn>
                                    </div>
                                    <Sep />
                                    <div className="flex items-center gap-2 bg-white/8 rounded-xl px-3 py-1">
                                        <span className="text-xs text-white/40">Color</span>
                                        <input type="color" title="Text colour" defaultValue="#1A1A1A" onChange={e => exec('foreColor', e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border-none outline-none" />
                                        <input type="color" title="Highlight" defaultValue="#ffffff" onChange={e => exec('hiliteColor', e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border-none outline-none" />
                                    </div>
                                    <div className="flex-1 min-w-[8px]" />
                                    <button
                                        onMouseDown={e => { e.preventDefault(); toggleSource(); }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${isSourceMode ? 'bg-terracotta text-white' : 'bg-white/10 text-white/50 hover:text-white'}`}
                                    >
                                        <i className={`fas fa-${isSourceMode ? 'eye' : 'code'}`}></i>
                                        {isSourceMode ? 'Preview' : 'HTML'}
                                    </button>
                                </div>

                                {/* Editable body */}
                                <div className="flex-1 overflow-y-auto" style={{ minHeight: '400px' }}>
                                    {isSourceMode ? (
                                        <textarea
                                            className="w-full h-full min-h-[400px] bg-[#1a1a2e] text-green-300 p-8 font-mono text-sm outline-none resize-none leading-relaxed"
                                            value={currentPost?.content || ''}
                                            onChange={e => setCurrentPost(p => p ? { ...p, content: e.target.value } : null)}
                                        />
                                    ) : (
                                        <div
                                            ref={editorRef}
                                            contentEditable
                                            suppressContentEditableWarning
                                            className="min-h-full outline-none p-10 prose prose-slate prose-lg max-w-none
                                            prose-headings:font-heading prose-headings:text-charcoal prose-headings:font-bold
                                            prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
                                            prose-p:text-charcoal/80 prose-p:leading-relaxed prose-p:text-base
                                            prose-blockquote:border-l-4 prose-blockquote:border-terracotta prose-blockquote:bg-terracotta/5 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:text-charcoal/70
                                            prose-a:text-forest prose-a:underline prose-a:font-medium
                                            prose-img:rounded-2xl prose-img:shadow-lg
                                            prose-li:text-charcoal/80 prose-li:text-base
                                            prose-strong:text-charcoal"
                                            onInput={syncContent}
                                            onKeyUp={updateActiveFormats}
                                            onMouseUp={updateActiveFormats}
                                            onClick={(e) => {
                                                const t = e.target as HTMLElement;
                                                if (t.tagName === 'IMG') openCropModal(t as HTMLImageElement);
                                                updateActiveFormats();
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Live callout-block + toc-placeholder styles so the editor preview matches the public page */}
                                <style>{`
                                .callout-block {
                                    background: #f8f4ee;
                                    border-left: 4px solid #c84b31;
                                    border-radius: 14px;
                                    padding: 18px 22px;
                                    margin: 20px 0;
                                    font-size: 0.95rem;
                                    line-height: 1.75;
                                    color: #2a2a2a;
                                }
                                .callout-block strong, .callout-block b { color: #c84b31; }
                                .callout-block a { color: #c84b31; font-weight: 600; text-decoration: underline; }
                                h1[id],h2[id],h3[id],h4[id] { scroll-margin-top: 80px; }

                                /* ── TOC Placeholder (editor preview) ── */
                                .toc-placeholder {
                                    border: 2px dashed #d1c9be;
                                    border-radius: 14px;
                                    padding: 16px 20px;
                                    margin: 20px 0;
                                    background: #fdfcfb;
                                    user-select: none;
                                    cursor: default;
                                }
                                .toc-placeholder-header {
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    margin-bottom: 6px;
                                }
                                .toc-placeholder-icon {
                                    font-size: 14px;
                                    color: #216e39;
                                }
                                .toc-placeholder-title {
                                    font-weight: 700;
                                    font-size: 13px;
                                    color: #216e39;
                                    text-transform: uppercase;
                                    letter-spacing: 0.08em;
                                }
                                .toc-placeholder-note {
                                    font-size: 11px;
                                    color: #9a9389;
                                    margin: 0;
                                    line-height: 1.5;
                                    font-style: italic;
                                }
                            `}</style>
                            </div>

                            {/* Excerpt */}
                            <div className="bg-white rounded-3xl border border-charcoal/5 p-8">
                                <Label>Excerpt / Summary</Label>
                                <textarea
                                    value={currentPost?.excerpt || ''}
                                    onChange={e => setCurrentPost(p => p ? { ...p, excerpt: e.target.value } : null)}
                                    placeholder="A concise summary shown in post listings and social previews…"
                                    rows={3}
                                    className="w-full bg-cream rounded-2xl px-5 py-4 text-sm text-charcoal/80 outline-none resize-none leading-relaxed placeholder:text-charcoal/25 border border-transparent focus:border-forest/20 transition-colors"
                                />
                            </div>
                        </div>

                        {/* ── Sidebar ── */}
                        <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
                            <div className="bg-white rounded-3xl border border-charcoal/5 overflow-hidden sticky top-6">

                                {/* Tab switcher */}
                                <div className="flex border-b border-charcoal/5">
                                    {([['publish', '⚙'], ['seo', '◎ SEO'], ['tags', '# Tags']] as const).map(([id, label]) => (
                                        <button
                                            key={id}
                                            onClick={() => setSidebarTab(id)}
                                            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wide transition-colors ${sidebarTab === id ? 'text-forest border-b-2 border-forest -mb-px bg-forest/3' : 'text-charcoal/40 hover:text-charcoal/70'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                                    {/* ── PUBLISH TAB ── */}
                                    {sidebarTab === 'publish' && <>
                                        <ImagePicker
                                            label="Cover Image"
                                            value={currentPost?.featured_image || ''}
                                            onChange={url => setCurrentPost(p => p ? { ...p, featured_image: url } : null)}
                                        />

                                        <div>
                                            <Label>Category</Label>
                                            <Select value={currentPost?.category || ''} onChange={e => setCurrentPost(p => p ? { ...p, category: e.target.value } : null)}>
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Author</Label>
                                            <Field
                                                type="text"
                                                value={currentPost?.author || ''}
                                                onChange={e => setCurrentPost(p => p ? { ...p, author: e.target.value } : null)}
                                                placeholder="Author name"
                                            />
                                        </div>

                                        <div>
                                            <Label>Link to Destination</Label>
                                            <Select value={currentPost?.destination_slug || ''} onChange={e => setCurrentPost(p => p ? { ...p, destination_slug: e.target.value } : null)}>
                                                <option value="">— None —</option>
                                                {destinations.map(d => <option key={d.id} value={d.slug}>{d.name}</option>)}
                                            </Select>
                                        </div>

                                        {/* Publish toggle */}
                                        <div
                                            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-colors ${currentPost?.published ? 'bg-forest/8 border border-forest/15' : 'bg-cream border border-transparent'}`}
                                            onClick={() => setCurrentPost(p => p ? { ...p, published: !p.published } : null)}
                                        >
                                            <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${currentPost?.published ? 'bg-forest' : 'bg-charcoal/20'}`}>
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${currentPost?.published ? 'left-6' : 'left-1'}`}></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-charcoal">{currentPost?.published ? 'Published' : 'Draft'}</p>
                                                <p className="text-xs text-charcoal/40">{currentPost?.published ? 'Visible to public' : 'Not visible yet'}</p>
                                            </div>
                                        </div>
                                    </>}

                                    {/* ── SEO TAB ── */}
                                    {sidebarTab === 'seo' && <>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <Label>SEO Title</Label>
                                                <span className={`text-xs ${(currentPost?.meta_title || '').length > 60 ? 'text-red-400' : 'text-charcoal/30'}`}>
                                                    {(currentPost?.meta_title || '').length}/70
                                                </span>
                                            </div>
                                            <Field
                                                type="text"
                                                value={currentPost?.meta_title || ''}
                                                onChange={e => setCurrentPost(p => p ? { ...p, meta_title: e.target.value } : null)}
                                                placeholder="Override title for search engines…"
                                                maxLength={70}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <Label>Meta Description</Label>
                                                <span className={`text-xs ${(currentPost?.meta_description || '').length > 150 ? 'text-red-400' : 'text-charcoal/30'}`}>
                                                    {(currentPost?.meta_description || '').length}/160
                                                </span>
                                            </div>
                                            <textarea
                                                value={currentPost?.meta_description || ''}
                                                onChange={e => setCurrentPost(p => p ? { ...p, meta_description: e.target.value } : null)}
                                                rows={4}
                                                maxLength={160}
                                                placeholder="Description shown in search results (150–160 chars)…"
                                                className="w-full bg-cream rounded-2xl px-4 py-3 text-sm text-charcoal/80 outline-none resize-none leading-relaxed placeholder:text-charcoal/25 border border-transparent focus:border-forest/20 transition-colors"
                                            />
                                        </div>

                                        {/* SERP Preview */}
                                        <div className="bg-cream rounded-2xl p-5 space-y-1.5">
                                            <p className="text-xs font-bold uppercase tracking-wide text-charcoal/30 mb-3">Search Preview</p>
                                            <p className="text-blue-600 text-sm font-medium leading-snug">
                                                {currentPost?.meta_title || currentPost?.title || 'Post Title'}
                                            </p>
                                            <p className="text-green-700 text-xs">escapestayz.com › blog › {currentPost?.slug || 'slug'}</p>
                                            <p className="text-charcoal/55 text-xs leading-relaxed mt-1 line-clamp-3">
                                                {currentPost?.meta_description || currentPost?.excerpt || 'No description set yet.'}
                                            </p>
                                        </div>
                                    </>}

                                    {/* ── TAGS TAB ── */}
                                    {sidebarTab === 'tags' && <>
                                        <div>
                                            <Label>Add Tags</Label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={tagInput}
                                                    onChange={e => setTagInput(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); } }}
                                                    placeholder="Type a tag + Enter…"
                                                    className="flex-1 bg-cream rounded-xl px-4 py-3 text-sm text-charcoal outline-none placeholder:text-charcoal/25"
                                                />
                                                <button onClick={() => addTag(tagInput)} className="bg-charcoal text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-forest transition-colors">+</button>
                                            </div>
                                            <p className="text-xs text-charcoal/30 mt-2">Tags are used to surface this post on destination pages under "Experiences".</p>
                                        </div>

                                        {/* Current tags */}
                                        <div className="min-h-[64px] p-4 bg-cream rounded-2xl flex flex-wrap gap-2">
                                            {!(currentPost?.tags?.length) && <p className="text-sm text-charcoal/25 italic self-center w-full text-center">No tags yet</p>}
                                            {(currentPost?.tags || []).map(tag => (
                                                <div key={tag} className="flex items-center gap-1.5 bg-white border border-charcoal/8 rounded-full px-3 py-2">
                                                    <span className="text-sm font-medium text-charcoal">#{tag}</span>
                                                    <button onClick={() => removeTag(tag)} className="text-charcoal/30 hover:text-red-400 transition-colors text-base leading-none ml-0.5">×</button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Destination suggestions */}
                                        {destinations.length > 0 && (
                                            <div>
                                                <Label>Quick-add Destinations</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {destinations.map(d => (
                                                        <button
                                                            key={d.slug}
                                                            onClick={() => addTag(d.slug)}
                                                            disabled={(currentPost?.tags || []).includes(d.slug)}
                                                            className="text-sm px-3 py-1.5 rounded-full border border-charcoal/10 text-charcoal/50 hover:border-forest hover:text-forest transition-colors disabled:opacity-25 disabled:cursor-not-allowed font-medium"
                                                        >
                                                            {d.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>}
                                </div>

                                {/* Footer actions */}
                                <div className="px-6 pb-6 grid grid-cols-2 gap-3 border-t border-charcoal/5 pt-5 mx-0">
                                    <button onClick={closeEditor} className="py-4 text-sm font-bold text-charcoal/40 hover:bg-charcoal/5 rounded-2xl transition-all">
                                        Discard
                                    </button>
                                    <button onClick={savePost} disabled={isSaving} className="bg-forest text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-forest/20 hover:bg-forest/85 transition-all disabled:opacity-50">
                                        {isSaving ? 'Saving…' : 'Save Post'}
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            )}
            {/* ── Crop Modal ──────────────────────────────────────────────── */}
            {cropSource && (
                <div
                    className="fixed inset-0 z-[350] flex items-center justify-center p-6 bg-charcoal/90 backdrop-blur-md"
                    onMouseMove={onCropMouseMove}
                    onMouseUp={() => { cropDrag.current = null; }}
                >
                    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-w-4xl w-full max-h-[90vh]" style={{ animation: 'scale-in-center 0.2s ease forwards' }}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-5 border-b border-charcoal/5 flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-serif italic text-charcoal">Crop Image</h3>
                                <p className="text-xs text-charcoal/40 mt-0.5">Drag the crop area or resize from corners · Click Apply to confirm</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-charcoal/30 font-mono">
                                    {Math.round(cropBox.w)}% × {Math.round(cropBox.h)}%
                                </span>
                                <button
                                    onClick={() => setCropBox({ x: 0, y: 0, w: 100, h: 100 })}
                                    className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-colors px-3 py-1.5 rounded-lg hover:bg-charcoal/5"
                                >
                                    Reset
                                </button>
                                <button onClick={() => setCropSource(null)} className="w-8 h-8 rounded-full bg-charcoal/5 hover:bg-charcoal/10 flex items-center justify-center text-charcoal transition-colors">
                                    <i className="fas fa-times text-xs" />
                                </button>
                            </div>
                        </div>

                        {/* Crop canvas area */}
                        <div className="flex-grow overflow-auto p-8 bg-[#1a1a1a] flex items-center justify-center">
                            <div className="relative inline-block select-none" style={{ userSelect: 'none' }}>
                                <img
                                    ref={cropImgRef}
                                    src={cropSource.src}
                                    alt="Crop preview"
                                    draggable={false}
                                    style={{ display: 'block', maxWidth: '100%', maxHeight: '55vh', width: 'auto', height: 'auto' }}
                                />
                                {/* Dark overlay — 4 shadow regions around crop rect */}
                                {cropImgRef.current && (() => {
                                    const { x, y, w, h } = cropBox;
                                    return (
                                        <>
                                            {/* Top */}
                                            <div className="absolute top-0 left-0 right-0 bg-black/55 pointer-events-none" style={{ height: `${y}%` }} />
                                            {/* Bottom */}
                                            <div className="absolute left-0 right-0 bottom-0 bg-black/55 pointer-events-none" style={{ top: `${y + h}%` }} />
                                            {/* Left */}
                                            <div className="absolute left-0 bg-black/55 pointer-events-none" style={{ top: `${y}%`, height: `${h}%`, width: `${x}%` }} />
                                            {/* Right */}
                                            <div className="absolute right-0 bg-black/55 pointer-events-none" style={{ top: `${y}%`, height: `${h}%`, left: `${x + w}%` }} />
                                        </>
                                    );
                                })()}
                                {/* Crop rect */}
                                <div
                                    className="absolute border-2 border-white cursor-move"
                                    style={{ left: `${cropBox.x}%`, top: `${cropBox.y}%`, width: `${cropBox.w}%`, height: `${cropBox.h}%`, boxShadow: '0 0 0 9999px transparent' }}
                                    onMouseDown={e => onCropMouseDown(e, 'move')}
                                >
                                    {/* Rule of thirds grid lines */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute top-[33%] left-0 right-0 border-t border-white/25" />
                                        <div className="absolute top-[66%] left-0 right-0 border-t border-white/25" />
                                        <div className="absolute left-[33%] top-0 bottom-0 border-l border-white/25" />
                                        <div className="absolute left-[66%] top-0 bottom-0 border-l border-white/25" />
                                    </div>
                                    {/* Corner handles */}
                                    {(['nw', 'ne', 'sw', 'se'] as const).map(dir => (
                                        <div
                                            key={dir}
                                            onMouseDown={e => { e.stopPropagation(); onCropMouseDown(e, dir); }}
                                            className="absolute w-4 h-4 bg-white rounded-sm shadow-md cursor-nwse-resize"
                                            style={{
                                                top: dir.startsWith('n') ? '-7px' : 'auto',
                                                bottom: dir.startsWith('s') ? '-7px' : 'auto',
                                                left: dir.endsWith('w') ? '-7px' : 'auto',
                                                right: dir.endsWith('e') ? '-7px' : 'auto',
                                                cursor: dir === 'nw' || dir === 'se' ? 'nwse-resize' : 'nesw-resize',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-charcoal/5 flex-shrink-0 bg-white">
                            <button onClick={() => setCropSource(null)} className="px-6 py-3 rounded-full text-sm font-bold text-charcoal/50 hover:text-charcoal hover:bg-charcoal/5 transition-all">
                                Cancel
                            </button>
                            <button onClick={applyCrop} className="px-8 py-3 rounded-full text-sm font-bold bg-forest text-white shadow-lg shadow-forest/20 hover:bg-forest/85 transition-all flex items-center gap-2">
                                <i className="fas fa-crop-alt text-xs" /> Apply Crop
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Gallery Picker Modal (for inline image insertion) ──── */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                    <div
                        className="absolute inset-0 bg-charcoal/80 backdrop-blur-md"
                        onClick={() => setIsGalleryOpen(false)}
                    />
                    <div className="bg-white w-full max-w-5xl h-[80vh] rounded-3xl relative z-10 flex flex-col overflow-hidden shadow-2xl" style={{ animation: 'scale-in-center 0.25s ease forwards' }}>

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-charcoal/5 flex justify-between items-center bg-white flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xl font-serif italic text-charcoal">Insert from Gallery</h3>
                                <div className="h-6 w-px bg-charcoal/10" />
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                    <button
                                        onClick={() => { setGalleryCurrentFolder(null); setGalleryImages([]); fetchGalleryFolders(); }}
                                        className={galleryCurrentFolder ? 'text-charcoal/30 hover:text-charcoal transition-colors' : 'text-forest'}
                                    >
                                        Collections
                                    </button>
                                    {galleryCurrentFolder && (
                                        <>
                                            <i className="fas fa-chevron-right text-[8px] text-charcoal/20" />
                                            <span className="text-forest">{galleryCurrentFolder.name}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsGalleryOpen(false)}
                                className="w-8 h-8 rounded-full bg-charcoal/5 hover:bg-charcoal/10 flex items-center justify-center text-charcoal transition-colors"
                            >
                                <i className="fas fa-times text-xs" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto p-8 bg-[#faf9f6]">
                            {galleryLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : !galleryCurrentFolder ? (
                                // Folder grid
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {galleryFolders.map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => { setGalleryCurrentFolder(folder); fetchGalleryImages(folder.id); }}
                                            className="aspect-[4/3] bg-white rounded-3xl border border-charcoal/5 hover:border-forest/20 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-3 group"
                                        >
                                            <i className="fas fa-folder text-3xl text-forest/20 group-hover:text-forest transition-colors" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/60 group-hover:text-charcoal">{folder.name}</span>
                                        </button>
                                    ))}
                                    {galleryFolders.length === 0 && (
                                        <div className="col-span-full py-20 text-center">
                                            <p className="text-charcoal/30 text-sm">No collections found.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Image grid
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
                                    {galleryImages.map(img => (
                                        <button
                                            key={img.id}
                                            onClick={() => insertImageFromGallery(img.public_url)}
                                            className="group relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                        >
                                            <img
                                                src={img.public_url}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={img.title}
                                            />
                                            <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/20 transition-all" />
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-white truncate">{img.title}</p>
                                            </div>
                                        </button>
                                    ))}
                                    {galleryImages.length === 0 && (
                                        <div className="col-span-full py-20 text-center">
                                            <p className="text-charcoal/30 text-sm">No images in this collection.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <style>{`
                        @keyframes scale-in-center {
                            0% { transform: scale(0.95); opacity: 0 }
                            100% { transform: scale(1); opacity: 1 }
                        }
                        /* Heading visual hierarchy in editor */
                        .prose h1 { font-size: 2.5rem !important; line-height: 1.2; font-weight: 800; margin-bottom: 1rem; display: block; }
                        .prose h2 { font-size: 2rem !important; line-height: 1.3; font-weight: 700; margin-bottom: 0.75rem; display: block; }
                        .prose h3 { font-size: 1.5rem !important; line-height: 1.4; font-weight: 600; margin-bottom: 0.5rem; display: block; }
                        .prose h4 { font-size: 1.25rem !important; line-height: 1.4; font-weight: 600; margin-bottom: 0.5rem; display: block; }
                        .prose p { margin-bottom: 1rem; }
                    `}</style>
                </div>
            )}
        </>
    );
}
