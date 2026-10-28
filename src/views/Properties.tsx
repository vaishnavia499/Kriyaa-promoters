import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Sparkles,
  Compass,
  MapPin,
  CheckCircle2,
  Check,
  ShieldCheck,
  ExternalLink,
  Phone,
  MessageCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Property, PropertyStatus } from '../types';

export const Properties: React.FC = () => {
  const {
    properties,
    filteredProperties: contextFilteredProperties,
    selectedProject,
    setSelectedProjectId,
    openAddPropertyModal,
    openEditPropertyModal,
    updatePropertyStatus,
    deleteProperty,
    settings,
  } = useApp();

  // State management: when selectedPropertyId is null, show card list. When not null, show full-screen in-page detail.
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // Filter pills per prompt specifications
  const filterPills = ['All', 'Land/Plots', 'Commercial', 'Available', 'Sold'];

  const filteredProperties = useMemo(() => {
    return contextFilteredProperties.filter((prop) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = prop.title.toLowerCase().includes(q);
        const matchPlot = prop.plotNumber.toLowerCase().includes(q);
        const matchAddress = prop.address.toLowerCase().includes(q);
        if (!matchTitle && !matchPlot && !matchAddress) return false;
      }

      // Filter pills
      if (selectedFilter === 'Land/Plots' && prop.category !== 'Land/Plots') return false;
      if (selectedFilter === 'Commercial' && prop.category !== 'Commercial') return false;
      if (selectedFilter === 'Available' && prop.status !== 'Available') return false;
      if (selectedFilter === 'Sold' && prop.status !== 'Sold') return false;

      return true;
    });
  }, [contextFilteredProperties, searchQuery, selectedFilter]);

  // Lookup the currently selected property for in-page detail view
  const activeProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return properties.find((p) => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 border border-[#15803D]/30 text-[#15803D] font-bold dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-600';
      case 'Reserved':
        return 'bg-amber-50 border border-[#EAB308]/40 text-[#CA8A04] font-bold dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-600';
      case 'Sold':
        return 'bg-red-50 border border-red-200 text-[#991B1B] font-bold line-through dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300';
    }
  };

  const handleDeleteProperty = (property: Property) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${property.title}" (Plot #${property.plotNumber})?\n\nThis action cannot be undone.`
    );
    if (confirmed) {
      deleteProperty(property.id);
      setSelectedPropertyId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FULL-SCREEN IN-PAGE DETAIL VIEW
  // ─────────────────────────────────────────────────────────────
  if (selectedPropertyId !== null) {
    if (!activeProperty) {
      return (
        <div className="w-full max-w-full overflow-x-hidden space-y-4">
          <button
            type="button"
            onClick={() => setSelectedPropertyId(null)}
            className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-emerald-700 stroke-[2.5]" />
          </button>
          <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">Property Not Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              The property you are looking for may have been deleted or does not exist.
            </p>
          </div>
        </div>
      );
    }

    const galleryImages =
      activeProperty.images && activeProperty.images.length > 0
        ? activeProperty.images
        : [
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          ];

    const currentImage = galleryImages[activeImageIndex] || galleryImages[0];
    const contactPhone = settings.contactNumber || '9443275727';
    const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
    const waMessage = encodeURIComponent(
      `Hello ${settings.ownerName || 'Kriyaa Promoters'}, I am interested in inquiring about ${activeProperty.title} (Plot #${activeProperty.plotNumber}, ${activeProperty.areaSqFt} sq.ft). Could you please share more details?`
    );

    return (
      <div className="w-full max-w-full p-0 sm:p-2 overflow-x-hidden space-y-5 animate-in fade-in duration-200">
        {/* Top Header Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3 w-full max-w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setSelectedPropertyId(null)}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
            </button>

            {/* Quick Actions (Edit placed cleanly on right, delete kept only at end of page) */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => openEditPropertyModal(activeProperty)}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Pencil className="w-4 h-4 text-[#CA8A04]" />
                <span>Edit Property</span>
              </button>
            </div>
          </div>

          {/* Title and Badges Bar */}
          <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shrink-0">
                  Plot #{activeProperty.plotNumber}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold shrink-0">
                  {activeProperty.category}
                </span>
                {activeProperty.isCornerPlot && (
                  <span className="px-2.5 py-1 rounded-md bg-amber-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3" />
                    Corner Plot
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-md text-xs font-bold border shrink-0 ${getStatusBadge(
                    activeProperty.status
                  )}`}
                >
                  {activeProperty.status}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 break-words">
                {activeProperty.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1 flex-wrap">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="break-words">{activeProperty.address}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Responsive Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full max-w-full">
          {/* ─────────────────────────────────────────────────────────────
              LEFT / PRIMARY COLUMN (High-res gallery, specs, approvals)
              ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 w-full max-w-full min-w-0">
            {/* High-Resolution Image Gallery */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 w-full max-w-full">
              {/* Featured Large Image */}
              <div className="relative h-64 sm:h-80 md:h-[380px] w-full rounded-xl overflow-hidden bg-slate-900">
                <img
                  src={currentImage}
                  alt={activeProperty.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur text-white text-xs font-bold">
                    Plot #{activeProperty.plotNumber}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                    {activeProperty.facing} Facing
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs text-slate-200">
                    Image {activeImageIndex + 1} of {galleryImages.length}
                  </p>
                  <p className="text-sm font-semibold truncate drop-shadow">
                    {activeProperty.title}
                  </p>
                </div>
              </div>

              {/* Selectable Thumbnail Row */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 max-w-full">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 sm:w-20 h-12 sm:h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Comprehensive Property Specifications */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4 w-full max-w-full">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Property Specifications & Technical Dimensions
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Plot Dimensions
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {activeProperty.plotDimensions}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Extent / Area
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {activeProperty.areaSqFt} sq.ft{' '}
                    <span className="text-xs text-slate-500 font-normal">
                      ({activeProperty.areaCents} Cts)
                    </span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Road Width
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                    {activeProperty.roadWidth}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Facing Direction
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    {activeProperty.facing}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Corner Plot
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {activeProperty.isCornerPlot ? 'Yes (Corner Unit)' : 'Standard Plot'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Gated Community
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {activeProperty.isGatedCommunity ? 'Yes (Secured Layout)' : 'Individual Layout'}
                  </span>
                </div>
              </div>

              {/* Description */}
              {activeProperty.description && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">
                    Layout Overview & Description
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {activeProperty.description}
                  </p>
                </div>
              )}
            </div>

            {/* Approvals Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4 w-full max-w-full">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Government Approvals & Title Legality
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                      DTCP Approval
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {settings.dtcpNumber || 'DTCP No. 182/2023'}
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Approved & Clear</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                      RERA Registration
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {settings.reraNumber || 'TN/RERA/0428/2024'}
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Registered Layout</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                      Patta Status
                    </span>
                    <span className="text-xs font-bold text-slate-900">Subdivided Patta</span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Immediate Transfer</span>
                  </div>
                </div>
              </div>

              {/* Badges List */}
              {activeProperty.approvals && activeProperty.approvals.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-xs font-semibold text-slate-500">Verified Badges:</span>
                  {activeProperty.approvals.map((appr) => (
                    <span
                      key={appr}
                      className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      <Check className="w-3 h-3" />
                      {appr}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT / SIDEBAR COLUMN (Pricing, Location, Contact, Danger Zone)
              ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 w-full max-w-full min-w-0">
            {/* Pricing & Financials Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 w-full max-w-full">
              <span className="text-[11px] uppercase font-bold text-slate-400 block">
                Pricing & Valuation Breakdown
              </span>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  ₹{(activeProperty.totalPrice / 100000).toFixed(2)} Lakhs
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Exact: ₹{activeProperty.totalPrice.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Unit Rate:</span>
                <span className="text-sm font-bold text-emerald-700 tabular-nums">
                  ₹{activeProperty.pricePerSqFt} / sq.ft
                </span>
              </div>

              {/* Status Selector */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Change Property Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Available', 'Reserved', 'Sold'] as PropertyStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updatePropertyStatus(activeProperty.id, st)}
                      className={`min-h-[38px] px-2 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        activeProperty.status === st
                          ? getStatusBadge(st) + ' ring-2 ring-emerald-500/30 font-extrabold shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location & Map Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5 w-full max-w-full">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Location & Map Details
                </h2>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Full Site Address
                </span>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed break-words">
                  {activeProperty.address}
                </p>
                {activeProperty.projectName && (
                  <p className="text-xs text-emerald-700 font-semibold pt-0.5">
                    Layout: {activeProperty.projectName}
                  </p>
                )}
              </div>

              {/* Google Maps External Link */}
              <a
                href={
                  activeProperty.googleMapsUrl ||
                  `https://maps.google.com/?q=${encodeURIComponent(activeProperty.address)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                <span>Open in Google Maps</span>
              </a>
            </div>

            {/* Quick Contact Actions Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5 w-full max-w-full">
              <span className="text-[11px] uppercase font-bold text-slate-400 block">
                Quick Buyer Assistance & Inquiries
              </span>

              <div className="text-xs text-slate-600">
                Connect directly with{' '}
                <strong className="text-slate-900">{settings.ownerName || 'Rajesh RTR'}</strong>{' '}
                ({settings.companyName || 'Kriyaa Promoters'}):
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${contactPhone}`}
                  className="min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </a>

                <a
                  href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-3 py-2 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm border border-[#1E5C31]"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Danger Zone Action */}
            <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-5 shadow-sm space-y-2.5 w-full max-w-full">
              <span className="text-[11px] uppercase font-bold text-rose-800 block">
                Danger Zone
              </span>
              <p className="text-xs text-slate-600">
                Permanently delete this property record and all its associated plot specifications.
              </p>
              <button
                type="button"
                onClick={() => handleDeleteProperty(activeProperty)}
                className="w-full min-h-[44px] px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Property</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RESPONSIVE ROW CARDS LIST VIEW (When selectedPropertyId === null)
  // No Wide Tables, Zero Horizontal Scroll
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-5">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & CONTROL BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4 w-full max-w-full">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>Properties & Plot Inventory</span>
            </h1>
          </div>
        </div>

        {/* Active Context Filter Banner */}
        {selectedProject && (
          <div className="p-2.5 px-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center justify-between gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                Active Layout Filter: <strong>{selectedProject.name}</strong> ({selectedProject.location})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedProjectId('all')}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0 cursor-pointer"
            >
              Show All Projects
            </button>
          </div>
        )}

        {/* Stacked Search & Filter Controls (Row 1: Full-Width Search, Row 2: Filter Pills + Add Property Under Search) */}
        <div className="flex flex-col gap-3 w-full pt-2 border-t border-slate-100">
          {/* Row 1: Full-Width Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by plot number, title, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Row 2: Status Filter Buttons in Single Horizontal Row + Add Property on the Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap text-xs">
              {filterPills.map((pill) => (
                <button
                  key={pill}
                  onClick={() => setSelectedFilter(pill)}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    selectedFilter === pill
                      ? 'bg-[#15803D] text-white shadow-sm border border-[#15803D]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Add Property Button Positioned Under Search on the Right */}
            <button
              type="button"
              onClick={() => openAddPropertyModal(selectedProject?.id)}
              className="min-h-[40px] px-4 py-2 bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm border border-[#CA8A04]/40 hover:border-[#EAB308] transition-all cursor-pointer whitespace-nowrap shrink-0 self-stretch sm:self-auto"
            >
              <Plus className="w-4 h-4 text-[#EAB308]" />
              <span>Add Property</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ZERO-OVERFLOW RESPONSIVE PROPERTY ROW CARDS
          Replaces multi-column <table> with clean full-width cards
          ───────────────────────────────────────────────────────────── */}
      {filteredProperties.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-full">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No properties found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or filter pill.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-full space-y-3">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full p-4 rounded-xl border border-slate-200 bg-white max-w-full shadow-sm hover:shadow transition-shadow"
            >
              {/* Left Side: Thumbnail image + Property Details */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1 w-full">
                {/* Thumbnail Image */}
                <div
                  onClick={() => {
                    setSelectedPropertyId(prop.id);
                    setActiveImageIndex(0);
                  }}
                  className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group relative"
                  title="Click to view details"
                >
                  <img
                    src={
                      prop.images[0] ||
                      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={prop.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {prop.isCornerPlot && (
                    <div
                      className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white"
                      title="Corner Plot"
                    />
                  )}
                </div>

                {/* Info & Metadata Chips */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  {/* Property Title & Plot Number (bold, wrap text naturally) */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPropertyId(prop.id);
                        setActiveImageIndex(0);
                      }}
                      className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors cursor-pointer text-left break-words"
                    >
                      {prop.title}
                    </button>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
                      Plot #{prop.plotNumber}
                    </span>
                    {prop.isCornerPlot && (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 shrink-0">
                        <Sparkles className="w-2.5 h-2.5" />
                        Corner
                      </span>
                    )}
                  </div>

                  {/* Location/Address with MapPin icon */}
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="break-words line-clamp-1">{prop.address}</span>
                  </div>

                  {/* Key Specs as inline chips/pills (Dimensions, Category, Road width, Facing) */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold shrink-0">
                      {prop.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono shrink-0">
                      {prop.plotDimensions}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                      {prop.areaSqFt} sq.ft ({prop.areaCents} Cts)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shrink-0">
                      {prop.roadWidth} Road
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                      {prop.facing} Facing
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Price, Status dropdown, Action buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Price */}
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-base font-extrabold text-slate-900 whitespace-nowrap">
                    ₹{(prop.totalPrice / 100000).toFixed(2)}L
                  </div>
                  <div className="text-[11px] text-slate-500 whitespace-nowrap">
                    ₹{prop.pricePerSqFt}/sq.ft
                  </div>
                </div>

                {/* Status pill with quick-toggle dropdown */}
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={prop.status}
                    onChange={(e) => updatePropertyStatus(prop.id, e.target.value as PropertyStatus)}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border shadow-sm cursor-pointer focus:outline-none whitespace-nowrap ${getStatusBadge(
                      prop.status
                    )}`}
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>

                {/* Action buttons: "View" button and "Edit" icon */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedPropertyId(prop.id);
                      setActiveImageIndex(0);
                    }}
                    className="min-h-[36px] px-3 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap border border-[#1E5C31]"
                    title="View More Details"
                  >
                    <Eye className="w-3.5 h-3.5 text-white" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => openEditPropertyModal(prop)}
                    className="min-h-[36px] px-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                    title="Edit Property"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
