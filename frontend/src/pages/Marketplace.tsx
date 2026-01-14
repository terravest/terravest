import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { Loader2, AlertCircle, Search, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '../components/PropertyCard'; // 👈 Yeni oluşturduğumuz bileşeni import ettik

export default function Marketplace() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Function to fetch data from API
    const fetchProperties = async () => {
        try {
            const data = await api.getProperties();
            setProperties(data || []);
        } catch (err: any) {
            console.error("Marketplace Error:", err);
            setError(err.message || "Failed to load properties");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    // Search filter
    const filteredProperties = properties.filter((p: any) => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans pb-20" data-testid="marketplace-page">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header and Search Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <span className="text-[#009B9E] font-bold tracking-widest text-xs uppercase bg-[#009B9E]/10 px-3 py-1 rounded-full">
                            Live Opportunities
                        </span>
                        <h1 className="text-4xl font-extrabold text-[#0F172A] mt-3 tracking-tight">
                            Curated U.S. Properties
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Invest in premium real estate starting from $50.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto">
                        <Search className="text-slate-400 ml-2" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search properties..." 
                            className="bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition">
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-32">
                        <Loader2 className="animate-spin text-[#009B9E]" size={48} />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center text-red-500 py-10 bg-red-50 rounded-xl border border-red-200">
                        <AlertCircle className="mx-auto mb-2" /> {error}
                    </div>
                )}

                {/* If List is Empty */}
                {!loading && !error && filteredProperties.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-500 text-lg">No properties found.</p>
                    </div>
                )}

                {/* Property List (Grid) */}
                {!loading && !error && filteredProperties.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProperties.map((property) => (
                            // 🔥 NOW THE CODE IS THIS SIMPLE AND CLEAN:
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}