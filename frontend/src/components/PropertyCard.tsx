import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

interface Property {
    id: number;
    title: string;
    location: string;
    price_usd: number;
    total_tokens: number;
    available_tokens: number;
    rental_yield: string;
    image_url?: string;
    images?: { url: string }[];
}

export default function PropertyCard({ property }: { property: Property }) {
    // Resim Seçimi: Backend URL > Array İlk Eleman > Placeholder
    const displayImage = property.image_url || property.images?.[0]?.url || "https://placehold.co/600x400?text=No+Image";

    // Progress Bar Hesabı
    const soldTokens = property.total_tokens - property.available_tokens;
    const progressPercent = Math.min(100, Math.max(0, (soldTokens / property.total_tokens) * 100));

    return (
        <Link to={`/properties/${property.id}`} className="block group h-full">
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                
                {/* Resim Alanı */}
                <div className="relative h-48 overflow-hidden">
                    <img 
                        src={displayImage} 
                        alt={property.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                        {property.rental_yield} Yield
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                {/* İçerik */}
                <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-[#009B9E] transition-colors">
                        {property.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm mb-4">
                        <MapPin size={14} />
                        <span className="truncate">{property.location}</span>
                    </div>

                    <div className="mt-auto space-y-3">
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div className="bg-[#009B9E] h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                        </div>
                        
                        <div className="flex justify-between text-xs font-medium text-slate-500">
                            <span>{soldTokens} Sold</span>
                            <span>{property.total_tokens} Total</span>
                        </div>
                        
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Token Price</p>
                                <p className="text-lg font-bold text-[#009B9E]">
                                    ${(property.price_usd / property.total_tokens).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-full text-slate-400 group-hover:bg-[#009B9E] group-hover:text-white transition-all">
                                <ArrowRight size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
