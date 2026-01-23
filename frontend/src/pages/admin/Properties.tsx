import { useEffect, useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import { api } from '../../lib/api';
import {
    Plus, Edit2, Trash2, X, Star, Upload, Loader2, Image as ImageIcon,
    ArrowUp, ArrowDown, CheckCircle, Search
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/format';

interface PropertyImage {
    url: string;
    isMain: boolean;
    displayOrder?: number;
}

interface Property {
    id: number;
    title: string;
    description: string;
    location?: string;
    price_usd: number; // Backend stores in Cents
    total_tokens: number;
    available_tokens: number;
    rental_yield?: string | number; // String value or number
    image_url?: string;
    images?: PropertyImage[];
    status?: string;
}

type SortDirection = 'asc' | 'desc';
interface SortConfig {
    key: keyof Property;
    direction: SortDirection;
}

export default function Properties() {
    const lang = 'en' as const;
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- SORT & FILTER STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'id', direction: 'desc' });

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        price_usd: '', // Input in Dollars
        total_tokens: '',
        available_tokens: '',
        rental_yield: '',
    });

    const [images, setImages] = useState<PropertyImage[]>([]);
    const [uploading, setUploading] = useState(false);

    // Fetch properties
    const fetchProperties = async () => {
        try {
            setLoading(true);
            const data = await api.getProperties();
            setProperties(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Failed to fetch properties:', error);
            alert('Failed to load properties: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    // --- SORTING & FILTERING LOGIC ---
    const handleSort = (key: keyof Property) => {
        let direction: SortDirection = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredProperties = useMemo(() => {
        let processedData = [...properties];

        // 1. Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            processedData = processedData.filter(p =>
                p.title.toLowerCase().includes(lowerTerm) ||
                (p.location && p.location.toLowerCase().includes(lowerTerm))
            );
        }

        // 2. Sort
        if (sortConfig) {
            processedData.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Yield için özel parsing (örn: "10%" stringini sayıya çevirme)
                if (sortConfig.key === 'rental_yield') {
                    const parseYield = (val: any) => {
                        if (typeof val === 'number') return val;
                        if (!val) return 0;
                        return parseFloat(val.toString().replace(/[^0-9.-]+/g, ""));
                    };
                    const aYield = parseYield(aValue);
                    const bYield = parseYield(bValue);
                    return sortConfig.direction === 'asc' ? aYield - bYield : bYield - aYield;
                }

                // String sorting
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                // Number sorting
                // @ts-ignore
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                // @ts-ignore
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return processedData;
    }, [properties, searchTerm, sortConfig]);

    // Helper to render sort icon
    const renderSortIcon = (key: keyof Property) => {
        if (sortConfig?.key !== key) return <div className="w-4" />; // Placeholder to prevent jump
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    };


    // Open modal for adding new property
    const handleAddNew = () => {
        setEditingProperty(null);
        setFormData({
            title: '',
            description: '',
            location: '',
            price_usd: '',
            total_tokens: '',
            available_tokens: '',
            rental_yield: '',
        });
        setImages([]);
        setIsModalOpen(true);
    };

    // Open modal for editing property
    const handleEdit = async (property: Property) => {
        try {
            // Fetch full property details with images
            const fullProperty = await api.getProperty(property.id);
            setEditingProperty(fullProperty);
            setFormData({
                title: fullProperty.title || '',
                description: fullProperty.description || '',
                location: fullProperty.location || '',
                price_usd: fullProperty.price_usd ? (fullProperty.price_usd / 100).toString() : '',
                total_tokens: fullProperty.total_tokens?.toString() || '',
                available_tokens: fullProperty.available_tokens?.toString() || '',
                rental_yield: fullProperty.rental_yield ? fullProperty.rental_yield.toString() : '',
            });
            // Set images
            if (fullProperty.images && fullProperty.images.length > 0) {
                setImages(fullProperty.images);
            } else if (fullProperty.image_url) {
                setImages([{ url: fullProperty.image_url, isMain: true }]);
            } else {
                setImages([]);
            }
            setIsModalOpen(true);
        } catch (error: any) {
            alert('Failed to load property details: ' + error.message);
        }
    };

    // Handle file upload
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const result = await api.uploadImage(file);
                return {
                    url: result.url,
                    isMain: false,
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);
            setImages([...images, ...uploadedImages]);
        } catch (error: any) {
            alert('Failed to upload images: ' + error.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSetMainImage = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isMain: i === index,
        }));
        setImages(newImages);
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleMoveImage = (index: number, direction: 'up' | 'down') => {
        const newImages = [...images];
        if (direction === 'up' && index > 0) {
            [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
        } else if (direction === 'down' && index < newImages.length - 1) {
            [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        }
        setImages(newImages);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const totalTokens = parseInt(formData.total_tokens);
            const availableTokens = formData.available_tokens
                ? parseInt(formData.available_tokens)
                : totalTokens;

            if (availableTokens > totalTokens) {
                alert('Available tokens cannot exceed total tokens');
                setIsSubmitting(false);
                return;
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                location: formData.location || null,
                price_usd: Math.round(parseFloat(formData.price_usd) * 100),
                total_tokens: totalTokens,
                available_tokens: availableTokens,
                rental_yield: formData.rental_yield || null,
                images: images.map((img, index) => ({
                    url: img.url,
                    isMain: img.isMain,
                    displayOrder: index,
                })),
            };

            if (editingProperty) {
                await api.updateProperty(editingProperty.id, payload);
            } else {
                await api.createProperty(payload);
            }

            setIsModalOpen(false);
            fetchProperties();
        } catch (error: any) {
            alert('Failed to save property: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to deactivate this property?')) return;
        try {
            await api.deleteProperty(id);
            fetchProperties();
        } catch (error: any) {
            alert('Failed to delete property: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-[#0F172A]">Property Management</h1>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        {/* 🔍 SEARCH BAR */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by title or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#009B9E] outline-none w-full md:w-64"
                            />
                        </div>

                        <button
                            onClick={handleAddNew}
                            className="bg-[#009B9E] hover:bg-[#007a7d] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                        >
                            <Plus size={20} /> Add New Property
                        </button>
                    </div>
                </div>

                {/* Properties Table */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-[#009B9E]" size={32} />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase w-24">Image</th>

                                        {/* 🔼 CLICKABLE HEADERS FOR SORTING */}
                                        <th
                                            className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 hover:text-[#009B9E] transition-colors group"
                                            onClick={() => handleSort('title')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Title {renderSortIcon('title')}
                                            </div>
                                        </th>

                                        <th
                                            className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 hover:text-[#009B9E] transition-colors"
                                            onClick={() => handleSort('price_usd')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Price {renderSortIcon('price_usd')}
                                            </div>
                                        </th>

                                        <th
                                            className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 hover:text-[#009B9E] transition-colors"
                                            onClick={() => handleSort('available_tokens')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Tokens {renderSortIcon('available_tokens')}
                                            </div>
                                        </th>

                                        <th
                                            className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 hover:text-[#009B9E] transition-colors"
                                            onClick={() => handleSort('rental_yield')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Expected Yield {renderSortIcon('rental_yield')}
                                            </div>
                                        </th>

                                        <th
                                            className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 hover:text-[#009B9E] transition-colors"
                                            onClick={() => handleSort('status')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Status {renderSortIcon('status')}
                                            </div>
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sortedAndFilteredProperties.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                {searchTerm ? 'No properties match your search.' : 'No properties found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedAndFilteredProperties.map((property) => (
                                            <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                                                        <img
                                                            src={property.image_url || 'https://placehold.co/100x100?text=No+Image'}
                                                            alt={property.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error';
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-[#0F172A]">{property.title}</div>
                                                    <div className="text-xs text-slate-500 line-clamp-2 mt-1 max-w-xs">
                                                        {property.description}
                                                    </div>
                                                    {property.location && (
                                                        <div className="text-xs text-[#009B9E] mt-1">{property.location}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-[#0F172A]">
                                                        {formatCurrency((property.price_usd || 0) / 100, lang)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-700 font-medium">
                                                            {formatNumber(property.available_tokens || 0, lang)} available
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            of {formatNumber(property.total_tokens || 0, lang)} total
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-green-600 font-bold">
                                                        {property.rental_yield !== null && property.rental_yield !== undefined
                                                            ? (() => {
                                                                if (typeof property.rental_yield === 'string') return property.rental_yield;
                                                                if (typeof property.rental_yield === 'number') {
                                                                    const val = property.rental_yield as number;
                                                                    return formatPercent(val > 1 ? val / 100 : val, lang);
                                                                }
                                                                return 'N/A';
                                                            })()
                                                            : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${property.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : property.status === 'deleted'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {property.status === 'active' ? 'Active' : property.status === 'deleted' ? 'Deleted' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(property)}
                                                            className="p-2 text-slate-600 hover:text-[#009B9E] hover:bg-slate-100 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(property.id)}
                                                            className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal (Aynı kaldı) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold text-[#0F172A]">
                                {editingProperty ? 'Edit Property' : 'Add New Property'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Title <span className="text-red-500">*</span></label>
                                    <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Price (USD) <span className="text-red-500">*</span></label>
                                    <input type="number" required step="0.01" value={formData.price_usd} onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] outline-none" rows={4} />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Total Tokens <span className="text-red-500">*</span></label>
                                    <input type="number" required value={formData.total_tokens} onChange={(e) => setFormData({ ...formData, total_tokens: e.target.value, available_tokens: editingProperty ? formData.available_tokens : e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Available Tokens <span className="text-red-500">*</span></label>
                                    <input type="number" required value={formData.available_tokens} onChange={(e) => setFormData({ ...formData, available_tokens: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Expected Yield</label>
                                    <input type="text" value={formData.rental_yield} onChange={(e) => setFormData({ ...formData, rental_yield: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] outline-none" placeholder="e.g. 12%" />
                                </div>
                            </div>
                            {/* Image Section (unchanged logic) */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Images</label>
                                <div className="mb-4">
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                                        <Upload size={18} /> <span className="text-sm font-medium">Upload Images</span>
                                        <input type="file" multiple accept="image/*" onChange={handleFileSelect} disabled={uploading} className="hidden" />
                                    </label>
                                    {uploading && <span className="ml-4 text-sm text-slate-500 flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Uploading...</span>}
                                </div>
                                {images.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {images.map((img, index) => (
                                            <div key={index} className={`relative group border-2 rounded-lg overflow-hidden ${img.isMain ? 'border-[#009B9E] ring-2 ring-[#009B9E]/20' : 'border-slate-200'}`}>
                                                <img src={img.url} alt={`Img ${index}`} className="w-full h-32 object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button type="button" onClick={() => handleSetMainImage(index)} className={`p-2 rounded-lg ${img.isMain ? 'bg-[#009B9E] text-white' : 'bg-white/90 text-slate-700 hover:bg-white'}`}><Star size={16} fill={img.isMain ? 'currentColor' : 'none'} /></button>
                                                    {index > 0 && <button type="button" onClick={() => handleMoveImage(index, 'up')} className="p-2 bg-white/90 text-slate-700 hover:bg-white rounded-lg"><ArrowUp size={16} /></button>}
                                                    {index < images.length - 1 && <button type="button" onClick={() => handleMoveImage(index, 'down')} className="p-2 bg-white/90 text-slate-700 hover:bg-white rounded-lg"><ArrowDown size={16} /></button>}
                                                    <button type="button" onClick={() => handleRemoveImage(index)} className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg"><X size={16} /></button>
                                                </div>
                                                {img.isMain && <div className="absolute top-2 right-2 bg-[#009B9E] text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Star size={12} fill="currentColor" /> Main</div>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center text-slate-400">
                                        <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No images uploaded yet</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#009B9E] hover:bg-[#007a7d] text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50">
                                    {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : <><CheckCircle size={18} /> {editingProperty ? 'Update' : 'Create'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}