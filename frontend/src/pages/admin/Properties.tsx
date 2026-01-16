import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { api } from '../../lib/api';
import {
    Plus, Edit2, Trash2, X, Star, Upload, Loader2, Image as ImageIcon,
    ArrowUp, ArrowDown, CheckCircle
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
    price_usd: number;
    total_tokens: number;
    available_tokens: number;
    rental_yield?: string; // Changed to string (can be "6-20%", "~12%", etc.)
    image_url?: string;
    images?: PropertyImage[];
    status?: string;
}

export default function Properties() {
    const lang = 'en' as const;
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        price_usd: '',
        total_tokens: '',
        available_tokens: '',
        rental_yield: '', // Changed to string
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

    // Open modal for adding new property
    const handleAddNew = () => {
        setEditingProperty(null);
        setFormData({
            title: '',
            description: '',
            location: '',
            price_usd: '',
            total_tokens: '',
            available_tokens: '', // Will be synced with total_tokens on change
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
                price_usd: fullProperty.price_usd?.toString() || '',
                total_tokens: fullProperty.total_tokens?.toString() || '',
                available_tokens: fullProperty.available_tokens?.toString() || '',
                rental_yield: fullProperty.rental_yield || '', // String value
            });
            // Set images from property_images or fallback to image_url
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
            // Reset input
            e.target.value = '';
        }
    };

    // Set main image
    const handleSetMainImage = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isMain: i === index,
        }));
        setImages(newImages);
    };

    // Remove image
    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // Move image up/down
    const handleMoveImage = (index: number, direction: 'up' | 'down') => {
        const newImages = [...images];
        if (direction === 'up' && index > 0) {
            [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
        } else if (direction === 'down' && index < newImages.length - 1) {
            [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        }
        setImages(newImages);
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate: available_tokens cannot exceed total_tokens
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
                price_usd: parseFloat(formData.price_usd),
                total_tokens: totalTokens,
                available_tokens: availableTokens,
                rental_yield: formData.rental_yield || null, // String value (can be "6-20%", "~12%", etc.)
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

    // Handle delete
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
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[#0F172A]">Property Management</h1>
                    <button
                        onClick={handleAddNew}
                        className="bg-[#009B9E] hover:bg-[#007a7d] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} /> Add New Property
                    </button>
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
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Image</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Title</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Price</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Tokens</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Expected Yield</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {properties.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                No properties found. Click "Add New Property" to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        properties.map((property) => (
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
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-[#0F172A]">
                                                        {formatCurrency(property.price_usd || 0, lang)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-slate-700">
                                                        {formatNumber(property.available_tokens || 0, lang)} / {formatNumber(property.total_tokens || 0, lang)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-green-600 font-bold">
                                                        {property.rental_yield !== null && property.rental_yield !== undefined
                                                            ? (() => {
                                                                if (typeof property.rental_yield === 'number') {
                                                                    const normalized = property.rental_yield > 1 ? property.rental_yield / 100 : property.rental_yield;
                                                                    return formatPercent(normalized, lang);
                                                                }
                                                                const parsed = parseFloat(property.rental_yield);
                                                                if (Number.isNaN(parsed)) return property.rental_yield;
                                                                return formatPercent(parsed / 100, lang);
                                                            })()
                                                            : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                        property.status === 'active' 
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

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold text-[#0F172A]">
                                {editingProperty ? 'Edit Property' : 'Add New Property'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] focus:border-transparent"
                                        placeholder="Property Title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Price (USD) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        value={formData.price_usd}
                                        onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] focus:border-transparent"
                                        placeholder="100000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] focus:border-transparent"
                                    placeholder="City, Country"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] focus:border-transparent"
                                    rows={4}
                                    placeholder="Property description..."
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Total Tokens <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.total_tokens}
                                        onChange={(e) => {
                                            const newTotal = e.target.value;
                                            setFormData({
                                                ...formData,
                                                total_tokens: newTotal,
                                                // In create mode, sync available_tokens with total_tokens
                                                available_tokens: editingProperty ? formData.available_tokens : newTotal
                                            });
                                        }}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] focus:border-transparent"
                                        placeholder="10000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Available Tokens <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.available_tokens}
                                        onChange={(e) => {
                                            const newAvailable = e.target.value;
                                            const total = parseInt(formData.total_tokens) || 0;
                                            const available = parseInt(newAvailable) || 0;
                                            
                                            // Validate: available cannot exceed total
                                            if (available > total && formData.total_tokens) {
                                                // Don't update if exceeds total
                                                return;
                                            }
                                            
                                            setFormData({ ...formData, available_tokens: newAvailable });
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#009B9E] focus:border-transparent ${
                                            formData.available_tokens && formData.total_tokens &&
                                            parseInt(formData.available_tokens) > parseInt(formData.total_tokens)
                                                ? 'border-red-300 bg-red-50' 
                                                : 'border-slate-300'
                                        }`}
                                        placeholder={formData.total_tokens || "10000"}
                                        max={formData.total_tokens || undefined}
                                    />
                                    {formData.available_tokens && formData.total_tokens &&
                                        parseInt(formData.available_tokens) > parseInt(formData.total_tokens) && (
                                        <p className="text-xs text-red-500 mt-1">Cannot exceed total tokens</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Expected Yield
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.rental_yield}
                                        onChange={(e) => setFormData({ ...formData, rental_yield: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] focus:border-transparent"
                                        placeholder="6-20% or ~12% or 10.5%"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Enter as text (e.g., "6-20%", "~12%", "10.5%")</p>
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Images
                                </label>

                                {/* Upload Button */}
                                <div className="mb-4">
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                                        <Upload size={18} />
                                        <span className="text-sm font-medium">Upload Images</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                    </label>
                                    {uploading && (
                                        <span className="ml-4 text-sm text-slate-500 flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={16} />
                                            Uploading...
                                        </span>
                                    )}
                                </div>

                                {/* Image Gallery */}
                                {images.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {images.map((img, index) => (
                                            <div
                                                key={index}
                                                className={`relative group border-2 rounded-lg overflow-hidden ${
                                                    img.isMain ? 'border-[#009B9E] ring-2 ring-[#009B9E]/20' : 'border-slate-200'
                                                }`}
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={`Image ${index + 1}`}
                                                    className="w-full h-32 object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/200x150?text=Error';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetMainImage(index)}
                                                        className={`p-2 rounded-lg ${
                                                            img.isMain
                                                                ? 'bg-[#009B9E] text-white'
                                                                : 'bg-white/90 text-slate-700 hover:bg-white'
                                                        }`}
                                                        title={img.isMain ? 'Main Image' : 'Set as Main'}
                                                    >
                                                        <Star size={16} fill={img.isMain ? 'currentColor' : 'none'} />
                                                    </button>
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveImage(index, 'up')}
                                                            className="p-2 bg-white/90 text-slate-700 hover:bg-white rounded-lg"
                                                            title="Move Up"
                                                        >
                                                            <ArrowUp size={16} />
                                                        </button>
                                                    )}
                                                    {index < images.length - 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveImage(index, 'down')}
                                                            className="p-2 bg-white/90 text-slate-700 hover:bg-white rounded-lg"
                                                            title="Move Down"
                                                        >
                                                            <ArrowDown size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg"
                                                        title="Remove"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                {img.isMain && (
                                                    <div className="absolute top-2 right-2 bg-[#009B9E] text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                        <Star size={12} fill="currentColor" />
                                                        Main
                                                    </div>
                                                )}
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

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-[#009B9E] hover:bg-[#007a7d] text-white rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            {editingProperty ? 'Update Property' : 'Create Property'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
