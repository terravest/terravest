import { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface PropertyImage {
    id: number | null;
    url: string;
    isMain: boolean;
    displayOrder: number;
}

interface PropertyGalleryProps {
    images: PropertyImage[];
    propertyTitle?: string;
}

export default function PropertyGallery({ images, propertyTitle = 'Property' }: PropertyGalleryProps) {

    // --- DURUM 1: HİÇ RESİM YOKSA ---
    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-[4/3] md:aspect-[16/9] bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-slate-400">
                <ImageIcon size={48} className="mb-2 opacity-20" />
                <span className="text-sm font-medium">No images available</span>
            </div>
        );
    }

    // --- SORTING: Ana resim en başa, diğerleri sıraya göre ---
    const sortedImages = [...images].sort((a, b) => {
        if (a.isMain && !b.isMain) return -1;
        if (!a.isMain && b.isMain) return 1;
        return a.displayOrder - b.displayOrder;
    });

    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedImage = sortedImages[selectedIndex];

    // Navigasyon
    const handlePrevious = () => {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1));
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className="w-full space-y-4 select-none">

            {/* --- ANA SAHNE (BÜYÜK RESİM) --- */}
            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-slate-100 rounded-2xl overflow-hidden group shadow-sm border border-slate-100">
                <img
                    src={selectedImage.url}
                    alt={`${propertyTitle} - View ${selectedIndex + 1}`}
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x600?text=Image+Error"; }}
                />

                {/* Ok Tuşları (Sadece birden fazla resim varsa) */}
                {sortedImages.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 hover:scale-110"
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 hover:scale-110"
                            aria-label="Next image"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}

                {/* Resim Sayacı */}
                {sortedImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                        {selectedIndex + 1} / {sortedImages.length}
                    </div>
                )}
            </div>

            {/* --- THUMBNAIL ŞERİDİ (KÜÇÜK RESİMLER) --- */}
            {sortedImages.length > 1 && (
                <div className="relative">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-1 snap-x">
                        {sortedImages.map((image, index) => (
                            <button
                                key={image.id || index}
                                onClick={() => setSelectedIndex(index)}
                                className={`
                                    flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 snap-start
                                    ${index === selectedIndex
                                        ? 'border-[#009B9E] ring-2 ring-[#009B9E]/20 opacity-100 scale-95'
                                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-300'}
                                `}
                            >
                                <img
                                    src={image.url}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Err"; }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}