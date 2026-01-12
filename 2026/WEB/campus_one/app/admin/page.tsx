"use client";

import { useState } from "react";
import { 
  Users, 
  ShoppingCart, 
  Settings, 
  Activity, 
  LogOut, 
  ShieldAlert, 
  Search,
  CheckCircle,
  AlertTriangle,
  Database,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Mock Data
  const stats = [
    { label: "Total Students", value: "2,543", change: "+12%", icon: Users },
    { label: "Weekly Revenue", value: "$45,200", change: "+8.5%", icon: ShoppingCart },
    { label: "System Load", value: "34%", change: "-2%", icon: Activity },
  ];

  const recentOrders = [
    { id: "ORD-7842", student: "alice@rutgers.edu", item: "Campus Laptop Pro", status: "Shipped", amount: "$899.00" },
    { id: "ORD-7843", student: "bob@rutgers.edu", item: "CS 101 Textbook", status: "Processing", amount: "$45.00" },
    { id: "ORD-7844", student: "charlie@rutgers.edu", item: "Headphones", status: "Delivered", amount: "$120.00" },
    { id: "ORD-7845", student: "diana@rutgers.edu", item: "Mechanical Keyboard", status: "Processing", amount: "$150.00" },
    { id: "ORD-7846", student: "eve@rutgers.edu", item: "Ultra-Wide Monitor", status: "Shipped", amount: "$349.00" },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data.results) {
        setSearchResults(data.results);
      } else if (data.error) {
        setSearchError(data.error);
      }
    } catch (e: any) {
      setSearchError("Search failed: " + e.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-800 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col fixed h-full">
        <div className="p-6 border-b border-stone-800">
             <div className="flex items-center gap-3 text-white">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-none">Admin</h1>
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider">Console v4.2</span>
                </div>
             </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            <button 
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'hover:bg-stone-800'}`}
            >
                <Activity className="w-5 h-5" />
                <span>Overview</span>
            </button>
            <button 
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'hover:bg-stone-800'}`}
            >
                <ShoppingCart className="w-5 h-5" />
                <span>Orders</span>
            </button>
            <button 
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'hover:bg-stone-800'}`}
            >
                <Settings className="w-5 h-5" />
                <span>System Settings</span>
            </button>
        </nav>

        <div className="p-4 border-t border-stone-800">
            <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30">
                    <CheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-white font-medium">System Online</p>
                    <p className="text-xs text-stone-500">Uptime: 99.9%</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-stone-900 capitalize">{activeTab}</h2>
                <p className="text-stone-500 text-sm">Welcome back, Administrator.</p>
            </div>
            <div className="flex items-center gap-4">
                <Link href="/">
                    <button className="p-2 text-stone-400 hover:text-red-500 transition-colors" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                </Link>
            </div>
        </header>

        {/* Dynamic Content */}
        <div className="animate-in fade-in duration-500">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((s) => (
                            <div key={s.label} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <s.icon className="w-6 h-6" />
                                    </div>
                                    <span className={`text-sm font-semibold px-2 py-1 rounded-md ${s.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {s.change}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-bold text-stone-800 mb-1">{s.value}</h3>
                                <p className="text-stone-500 text-sm">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ORDERS TAB - With Vulnerable Search */}
            {activeTab === "orders" && (
                <div className="space-y-6">
                    {/* Search Box */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                        <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Order Search
                        </h3>
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search by Order ID, customer email, or item..."
                                    className="w-full pl-4 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <button 
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                Search
                            </button>
                        </div>
                        
                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Search Results ({searchResults.length})</p>
                                <div className="overflow-x-auto">
                                    <pre className="text-xs text-stone-700 font-mono whitespace-pre-wrap">
                                        {JSON.stringify(searchResults, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {searchError && (
                            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                                <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Error</p>
                                <p className="text-sm text-red-700 font-mono">{searchError}</p>
                            </div>
                        )}
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-stone-50 border-b border-stone-100">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Order ID</th>
                                    <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Student</th>
                                    <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Item</th>
                                    <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50">
                                {recentOrders.map((o) => (
                                    <tr key={o.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="p-4 font-mono text-sm text-stone-600">{o.id}</td>
                                        <td className="p-4 text-sm text-stone-800 font-medium">{o.student}</td>
                                        <td className="p-4 text-sm text-stone-600">{o.item}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                o.status === "Delivered" ? "bg-green-100 text-green-700" : 
                                                o.status === "Processing" ? "bg-blue-100 text-blue-700" :
                                                "bg-yellow-100 text-yellow-700"
                                            }`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-stone-800">{o.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
                <div className="space-y-6 max-w-2xl">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
                        <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            General Configuration
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                                <div>
                                    <p className="font-medium text-stone-800">Maintenance Mode</p>
                                    <p className="text-xs text-stone-500">Disable store access for students</p>
                                </div>
                                <div className="w-12 h-6 bg-stone-200 rounded-full relative cursor-not-allowed">
                                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                                <div>
                                    <p className="font-medium text-stone-800">Debug Logging</p>
                                    <p className="text-xs text-stone-500">Verbose error reporting</p>
                                </div>
                                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                    <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-8 rounded-2xl border border-amber-200">
                        <h3 className="text-lg font-bold text-amber-800 mb-6 flex items-center gap-2">
                             <Database className="w-5 h-5" />
                             Secure Configuration Storage
                        </h3>
                        
                        <div className="space-y-4">
                            <p className="text-sm text-amber-700">
                                Sensitive configuration keys have been migrated to an encrypted database table for enhanced security.
                            </p>
                            <div className="bg-white p-4 rounded-xl border border-amber-200">
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Storage Location</p>
                                <code className="font-mono text-sm text-stone-600">
                                    campus.db → secrets table
                                </code>
                            </div>
                            <p className="text-xs text-amber-600 italic">
                                Note: The master flag is now stored securely in the database. Use the Order Search to query system data.
                            </p>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </main>
    </div>
  );
}
