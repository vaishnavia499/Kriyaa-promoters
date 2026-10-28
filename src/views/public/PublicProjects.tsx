import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  TreePine,
  Car,
  Heart,
  BookmarkCheck,
  MessageCircle,
  ExternalLink,
  Eye,
  Award,
  Clock,
  Landmark,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project, Property, LayoutDisplayMode, PropertyStatus, PublicTab } from '../../types';
import { MasterLayoutViewer } from '../../components/public/MasterLayoutViewer';
import { PlotInspectorCard } from '../../components/public/PlotInspectorCard';
import { PublicFooter } from '../../components/public/PublicFooter';

interface PublicProjectsProps {
  onTabChange: (tab: PublicTab) => void;
  onOpenConsultation: (prefillPlot?: Property) => void;
  onOpenCabBooking: (prefillPlot?: Property) => void;
  onOpenAdminLogin: () => void;
  initialViewingProjectId?: string | null;
}

export const PublicProjects: React.FC<PublicProjectsProps> = ({
  onTabChange,
  onOpenConsultation,
  onOpenCabBooking,
  onOpenAdminLogin,
  initialViewingProjectId,
}) => {
  const {
    projects,
    properties,
    savedPlotIds,
    toggleSavePlot,
    isPlotSaved,
    settings,
    showToast,
    isLoadingBackend,
    backendError,
    refreshBackendData,
  } = useApp();

  // Full-screen project view state (null = catalog list, string = specific project full screen)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    initialViewingProjectId || null
  );

  // Top tab switcher inside full screen project view:
  // Tab 1: 'layout' (Interactive Master Layout)
  // Tab 2: 'overview' (Project Overview & Amenities)
  // Tab 3: 'table' (Plot Inventory Table & Filter)
  const [projectSubTab, setProjectSubTab] = useState<'layout' | 'overview' | 'table'>('layout');

  // Master Layout Display Mode (topdown | blueprint | isometric | satellite)
  const [displayMode, setDisplayMode] = useState<LayoutDisplayMode>('topdown');

  // Currently inspected plot in the project view
  const [inspectedPlotId, setInspectedPlotId] = useState<string | null>(null);

  // Table filter controls for Tab 3
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('All');
  const [tableFacingFilter, setTableFacingFilter] = useState<string>('All');

  // Catalog Search, Location, and Status Filter Controls
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectLocationFilter, setProjectLocationFilter] = useState<string>('All Locations');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('All');

  // Filtered published projects for the Catalog View
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Must be published on public website
      if (project.isPublished === false) return false;
      // 1. Search Query
      if (projectSearchQuery.trim()) {
        const q = projectSearchQuery.toLowerCase().trim();
        const matchName = project.name?.toLowerCase().includes(q);
        const matchLoc = project.location?.toLowerCase().includes(q);
        const matchDist = project.district?.toLowerCase().includes(q);
        const matchDtcp = project.dtcpNumber?.toLowerCase().includes(q);
        const matchRera = project.reraNumber?.toLowerCase().includes(q);
        const matchDesc = project.description?.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchDist && !matchDtcp && !matchRera && !matchDesc) {
          return false;
        }
      }

      // 2. Location Filter
      if (projectLocationFilter !== 'All Locations') {
        const fullLoc = `${project.location} ${project.district || ''}`.toLowerCase();
        if (projectLocationFilter === 'Cuddalore') {
          if (!fullLoc.includes('cuddalore')) return false;
        } else if (projectLocationFilter === 'Chidambaram') {
          if (!fullLoc.includes('chidambaram')) return false;
        } else if (projectLocationFilter === 'Pondy / ECR') {
          if (!fullLoc.includes('pondy') && !fullLoc.includes('ecr') && !fullLoc.includes('puducherry')) {
            return false;
          }
        }
      }

      // 3. Status Filter
      if (projectStatusFilter !== 'All') {
        if (project.status !== projectStatusFilter) return false;
      }

      return true;
    });
  }, [projects, projectSearchQuery, projectLocationFilter, projectStatusFilter]);

  // Lookup active project
  const viewingProject = useMemo(() => {
    if (!activeProjectId) return null;
    return projects.find((p) => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  // Plots belonging to the viewing project
  const projectPlots = useMemo(() => {
    if (!viewingProject) return [];
    return properties.filter((p) => p.projectId === viewingProject.id);
  }, [properties, viewingProject]);

  // The active inspected plot object
  const inspectedPlot = useMemo(() => {
    if (!projectPlots.length) return null;
    if (inspectedPlotId) {
      const found = projectPlots.find((p) => p.id === inspectedPlotId);
      if (found) return found;
    }
    // Default to the first available plot or first plot
    return projectPlots.find((p) => p.status === 'Available') || projectPlots[0];
  }, [projectPlots, inspectedPlotId]);

  // Filtered plots for Tab 3 Inventory Table
  const filteredTablePlots = useMemo(() => {
    return projectPlots.filter((p) => {
      if (tableStatusFilter !== 'All' && p.status !== tableStatusFilter) return false;
      if (tableFacingFilter !== 'All' && p.facing !== tableFacingFilter) return false;
      if (tableSearchQuery.trim()) {
        const q = tableSearchQuery.toLowerCase().trim();
        const matchNum = p.plotNumber.toLowerCase().includes(q);
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDim = p.plotDimensions.toLowerCase().includes(q);
        if (!matchNum && !matchTitle && !matchDim) return false;
      }
      return true;
    });
  }, [projectPlots, tableStatusFilter, tableFacingFilter, tableSearchQuery]);

  const handleWhatsAppInquiry = (plot: Property) => {
    const text =
      `🏡 *${settings.companyName} · ${plot.projectName || 'Layout'}*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📍 *Plot #${plot.plotNumber} · ${plot.title}*\n` +
      `📐 Dimensions: *${plot.plotDimensions}*\n` +
      `📏 Extent: *${plot.areaSqFt} Sq.Ft* (${plot.areaCents} Cents)\n` +
      `🧭 Facing: *${plot.facing} Facing*\n` +
      `🛣️ Road: *${plot.roadWidth} Road*\n` +
      `💰 Total Price: *₹${(plot.totalPrice / 100000).toFixed(2)} Lakhs* (₹${plot.pricePerSqFt}/sq.ft)\n` +
      `✅ Approvals: *${plot.approvals.join(', ')}*\n` +
      `📞 Customer Inquiry for MD Rajesh RTR`;

    window.open(`https://wa.me/919443278899?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getProjectCardStats = (projectId: string) => {
    const pPlots = properties.filter((p) => p.projectId === projectId);
    const available = pPlots.filter((p) => p.status === 'Available').length;
    const reserved = pPlots.filter((p) => p.status === 'Reserved').length;
    const sold = pPlots.filter((p) => p.status === 'Sold').length;
    const lowestPrice = pPlots.reduce(
      (min, p) => (p.totalPrice < min ? p.totalPrice : min),
      pPlots[0]?.totalPrice || 2500000
    );

    return {
      total: pPlots.length,
      available,
      reserved,
      sold,
      startingLakhs: (lowestPrice / 100000).toFixed(1),
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 1. IMMERSIVE FULL-SCREEN PROJECT VIEW
  // ─────────────────────────────────────────────────────────────
  if (viewingProject) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#081B10] text-slate-900 dark:text-slate-100 flex flex-col justify-between select-none">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
          {/* Top Bar: Back Button + Project Identity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E5D32]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveProjectId(null)}
                className="min-h-[44px] min-w-[44px] rounded-2xl bg-white dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32] hover:bg-slate-100 dark:hover:bg-[#184428] text-slate-800 dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm group"
                title="Back to All Projects"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {viewingProject.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#15803D] text-white text-xs font-bold shadow-xs">
                    {viewingProject.dtcpNumber}
                  </span>
                  {viewingProject.reraNumber && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0B2516] text-[#EAB308] border border-[#EAB308]/40 text-xs font-bold">
                      {viewingProject.reraNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {viewingProject.location}, {viewingProject.district} · {viewingProject.totalAreaExtent || '12.5 Acres'}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onOpenCabBooking(inspectedPlot || undefined)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#15803D] hover:bg-[#113B24] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Car className="w-4 h-4 text-[#EAB308]" />
                <span>Book Free Site Visit Cab</span>
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TOP TAB SWITCHER (Rendered on dedicated row below title as
              responsive 3-button grid with zero cut-off text)
              ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            {/* Tab 1: Interactive Master Layout */}
            <button
              type="button"
              onClick={() => setProjectSubTab('layout')}
              className={`min-h-[48px] px-4 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer border ${
                projectSubTab === 'layout'
                  ? 'bg-[#15803D] text-white border-[#15803D] shadow-lg shadow-emerald-950/20'
                  : 'bg-white dark:bg-[#0B2516] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E5D32] hover:bg-slate-50 dark:hover:bg-[#112F1C]'
              }`}
            >
              <Layers className="w-4 h-4 text-[#EAB308]" />
              <span>Tab 1: Interactive Master Layout</span>
            </button>

            {/* Tab 2: Project Overview & Amenities */}
            <button
              type="button"
              onClick={() => setProjectSubTab('overview')}
              className={`min-h-[48px] px-4 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer border ${
                projectSubTab === 'overview'
                  ? 'bg-[#15803D] text-white border-[#15803D] shadow-lg shadow-emerald-950/20'
                  : 'bg-white dark:bg-[#0B2516] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E5D32] hover:bg-slate-50 dark:hover:bg-[#112F1C]'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#EAB308]" />
              <span>Tab 2: Overview & Amenities</span>
            </button>

            {/* Tab 3: Plot Inventory Table & Filter */}
            <button
              type="button"
              onClick={() => setProjectSubTab('table')}
              className={`min-h-[48px] px-4 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer border ${
                projectSubTab === 'table'
                  ? 'bg-[#15803D] text-white border-[#15803D] shadow-lg shadow-emerald-950/20'
                  : 'bg-white dark:bg-[#0B2516] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E5D32] hover:bg-slate-50 dark:hover:bg-[#112F1C]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#EAB308]" />
              <span>Tab 3: Plot Inventory ({projectPlots.length})</span>
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TAB 1 CONTENT: INTERACTIVE MASTER LAYOUT + INSPECTOR CARD
              ───────────────────────────────────────────────────────────── */}
          {projectSubTab === 'layout' && (
            <div className="space-y-6">
              {/* Interactive Master Layout Viewer with 4 modes */}
              <MasterLayoutViewer
                project={viewingProject}
                plots={projectPlots}
                selectedPlot={inspectedPlot}
                onSelectPlot={(p) => setInspectedPlotId(p.id)}
                displayMode={displayMode}
                onModeChange={(m) => setDisplayMode(m)}
              />

              {/* Synchronized Plot Inspector Card */}
              {inspectedPlot && (
                <div id="plot-inspector">
                  <PlotInspectorCard
                    plot={inspectedPlot}
                    project={viewingProject}
                    isSaved={isPlotSaved(inspectedPlot.id)}
                    onToggleSave={(id) => toggleSavePlot(id)}
                    onBookCab={(p) => onOpenCabBooking(p)}
                    onWhatsAppInquiry={(p) => handleWhatsAppInquiry(p)}
                  />
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2 CONTENT: PROJECT OVERVIEW & AMENITIES
              ───────────────────────────────────────────────────────────── */}
          {projectSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Hero Summary Card */}
              <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-6 sm:p-8 shadow-md space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#EAB308] uppercase tracking-wider block">
                      Approved Township Scheme
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {viewingProject.name} — Comprehensive Project Overview
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sanctioned by Director of Town & Country Planning (DTCP) under Sanction {viewingProject.dtcpNumber}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenConsultation()}
                    className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#ca8a04] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
                  >
                    <span>Download Project Brochure (PDF)</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-2">
                  {viewingProject.description} Designed with rigorous adherence to Vastu shastra and DTCP town planning norms, the community guarantees spacious road networks, independent revenue patta transfers, and round-the-clock security infrastructure.
                </p>
              </div>

              {/* Township Amenities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: '40ft & 60ft Heavy Tar Roads',
                    desc: 'Dual-lane blacktop asphalt roads designed to handle heavy vehicular transit with concrete paver walkways.',
                    icon: 'Car',
                  },
                  {
                    title: 'Tested Potable Sweet Water',
                    desc: 'Underground natural sweet water reservoir at 35-foot depth with individual plot connection lines.',
                    icon: 'Water',
                  },
                  {
                    title: '40,000 Sq.Ft OSR Children Park',
                    desc: 'Legally reserved DTCP park with children playground equipment, reflexology walking track, and landscaping.',
                    icon: 'TreePine',
                  },
                  {
                    title: 'Grand Entrance Archway',
                    desc: 'Architectural entry portal with boom barriers, 24/7 security cabin, and CCTV surveillance monitoring.',
                    icon: 'Building2',
                  },
                  {
                    title: 'Underground 3-Phase Power',
                    desc: 'Pre-laid TNEB power conduits, independent transformer yard, and solar street illumination poles.',
                    icon: 'Sparkles',
                  },
                  {
                    title: 'Individual Patta Guaranteed',
                    desc: 'Prompt name transfer in government revenue records immediately after sub-registrar registration.',
                    icon: 'ShieldCheck',
                  },
                ].map((amenity, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0B2516] border border-slate-200 dark:border-[#1E5D32] shadow-sm flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#15803D]/10 text-[#15803D] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {amenity.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {amenity.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bank Approvals Strip */}
              <div className="bg-[#113B24] rounded-3xl p-6 text-white border border-[#1E5D32] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#EAB308]">
                    <Landmark className="w-4 h-4" />
                    <span>PRE-APPROVED FINANCIAL INSTITUTIONS</span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Up to 80% Housing & Land Purchase Loans
                  </h3>
                  <p className="text-xs text-emerald-100/90 max-w-xl">
                    Pre-sanctioned credit approvals from SBI, HDFC, Indian Bank, and Canara Bank. Minimal documentation with 7-day loan processing.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenConsultation()}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#164329] text-white font-bold text-xs flex items-center gap-2 border border-emerald-400/30 shrink-0"
                >
                  <span>Check Loan Eligibility</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3 CONTENT: PLOT INVENTORY TABLE & FILTER
              ───────────────────────────────────────────────────────────── */}
          {projectSubTab === 'table' && (
            <div className="space-y-4">
              {/* Filter Controls Bar */}
              <div className="bg-white dark:bg-[#0B2516] rounded-2xl border border-slate-200 dark:border-[#1E5D32] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Search */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={tableSearchQuery}
                    onChange={(e) => setTableSearchQuery(e.target.value)}
                    placeholder="Search plot #, size, facing..."
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>

                {/* Status & Facing Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-slate-500">Status:</span>
                    <select
                      value={tableStatusFilter}
                      onChange={(e) => setTableStatusFilter(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="All">All Status ({projectPlots.length})</option>
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-slate-500">Facing:</span>
                    <select
                      value={tableFacingFilter}
                      onChange={(e) => setTableFacingFilter(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="All">All Facings</option>
                      <option value="East">East Facing</option>
                      <option value="North">North Facing</option>
                      <option value="North-East">North-East Facing</option>
                      <option value="South">South Facing</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="bg-white dark:bg-[#0B2516] rounded-2xl border border-slate-200 dark:border-[#1E5D32] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#113B24] text-white uppercase text-[10px] tracking-wider font-mono">
                      <tr>
                        <th className="py-3 px-4">Plot #</th>
                        <th className="py-3 px-4">Dimensions</th>
                        <th className="py-3 px-4">Area Extent</th>
                        <th className="py-3 px-4">Facing & Road</th>
                        <th className="py-3 px-4">Total Price</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1E5D32]">
                      {filteredTablePlots.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No plots found matching current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredTablePlots.map((plot) => {
                          const isSaved = isPlotSaved(plot.id);
                          return (
                            <tr
                              key={plot.id}
                              onClick={() => {
                                setInspectedPlotId(plot.id);
                                setProjectSubTab('layout');
                              }}
                              className="hover:bg-emerald-50/50 dark:hover:bg-[#112F1C] cursor-pointer transition-colors"
                            >
                              <td className="py-3 px-4 font-black text-sm text-[#113B24] dark:text-[#EAB308]">
                                #{plot.plotNumber}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold">
                                {plot.plotDimensions}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold">{plot.areaSqFt} Sq.Ft</span>{' '}
                                <span className="text-[10px] text-slate-400">({plot.areaCents} Cts)</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold">{plot.facing}</span> · {plot.roadWidth}
                              </td>
                              <td className="py-3 px-4 font-black text-[#15803D] dark:text-emerald-400">
                                ₹{(plot.totalPrice / 100000).toFixed(2)}L
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                    plot.status === 'Available'
                                      ? 'bg-emerald-100 text-[#15803D]'
                                      : plot.status === 'Reserved'
                                      ? 'bg-amber-100 text-[#CA8A04]'
                                      : 'bg-red-100 text-[#991B1B] line-through'
                                  }`}
                                >
                                  {plot.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div
                                  className="flex items-center justify-end gap-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleSavePlot(plot.id)}
                                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                      isSaved
                                        ? 'bg-emerald-50 border-emerald-400 text-[#15803D] dark:bg-[#113B24] dark:text-[#EAB308]'
                                        : 'bg-slate-100 dark:bg-[#112F1C] border-slate-200 dark:border-[#1E5D32] text-slate-500 hover:text-slate-900'
                                    }`}
                                    title={isSaved ? 'In My Plots' : 'Add to My Plots'}
                                  >
                                    <BookmarkCheck className={`w-3.5 h-3.5 ${isSaved ? 'text-[#15803D] dark:text-[#EAB308]' : ''}`} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleWhatsAppInquiry(plot)}
                                    className="p-2 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors cursor-pointer"
                                    title="WhatsApp MD Rajesh RTR"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Project Footer at bottom of Full-Screen View */}
        <PublicFooter
          onTabChange={onTabChange}
          onOpenConsultation={onOpenConsultation}
          onOpenAdminLogin={onOpenAdminLogin}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. PROJECT CATALOG CARDS VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#081B10] text-slate-900 dark:text-slate-100 flex flex-col justify-between select-none">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-6 sm:space-y-8">
        {/* ─────────────────────────────────────────────────────────────
            1. CLEAN HEADER (Title Only - No Subtitle)
            ───────────────────────────────────────────────────────────── */}
        <div className="text-center max-w-4xl mx-auto pt-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Ready to Find Your Ideal{' '}
            <span className="text-[#CA8A04] dark:text-[#EAB308]">Vastu-Compliant Plot?</span>
          </h1>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. RESPONSIVE SEARCH & FILTER CONTROL BAR
            ───────────────────────────────────────────────────────────── */}
        <div className="w-full max-w-4xl mx-auto space-y-3.5">
          {/* Full-width Search Input */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 dark:text-emerald-400" />
            </div>
            <input
              type="text"
              value={projectSearchQuery}
              onChange={(e) => setProjectSearchQuery(e.target.value)}
              placeholder="Search by project name, layout, or DTCP number..."
              className="w-full min-h-[50px] pl-11 pr-11 py-3 text-sm sm:text-base rounded-2xl bg-white dark:bg-[#0B2516] border-2 border-slate-200 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-xs focus:outline-none focus:border-[#15803D] dark:focus:border-[#EAB308] focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
            {projectSearchQuery && (
              <button
                type="button"
                onClick={() => setProjectSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <X className="w-3.5 h-3.5" />
                </div>
              </button>
            )}
          </div>

          {/* Filter Rows: Location Pills & Status Pills (Mobile-first with horizontal scroll & 44px tap targets) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            {/* Location Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar touch-pan-x">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
                Location:
              </span>
              {['All Locations', 'Cuddalore', 'Chidambaram', 'Pondy / ECR'].map((loc) => {
                const isActive = projectLocationFilter === loc;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setProjectLocationFilter(loc)}
                    className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center border active:scale-95 ${
                      isActive
                        ? 'bg-[#113B24] dark:bg-[#15803D] text-[#EAB308] dark:text-white border-[#EAB308]/60 dark:border-emerald-500 shadow-sm'
                        : 'bg-white dark:bg-[#0B2516] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1E5D32] hover:bg-slate-50 dark:hover:bg-[#133A23]'
                    }`}
                  >
                    <span>{loc}</span>
                  </button>
                );
              })}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar touch-pan-x">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
                Status:
              </span>
              {['All', 'Active', 'Upcoming', 'Completed'].map((st) => {
                const isActive = projectStatusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setProjectStatusFilter(st)}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center border active:scale-95 ${
                      isActive
                        ? 'bg-[#EAB308] text-slate-950 border-[#CA8A04] shadow-sm font-black'
                        : 'bg-white dark:bg-[#0B2516] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1E5D32] hover:bg-slate-50 dark:hover:bg-[#133A23]'
                    }`}
                  >
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoadingBackend && (
          <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 text-[#15803D] dark:text-emerald-400 text-xs font-bold max-w-md mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
            <span>Syncing published plot data with promoter backend...</span>
          </div>
        )}

        {/* Backend Error Alert with Retry */}
        {backendError && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 max-w-xl mx-auto shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Offline cache active. Connect to promoter backend for latest plot releases.</span>
            </div>
            <button
              type="button"
              onClick={() => refreshBackendData()}
              className="px-3 py-1.5 rounded-lg bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 font-bold text-xs hover:brightness-105 cursor-pointer whitespace-nowrap"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. PROJECT CARDS GRID (Filtered)
            ───────────────────────────────────────────────────────────── */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#CA8A04] dark:text-[#EAB308] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              No matching layouts found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Try adjusting your search keywords or switching location and status filters to view all available layouts.
            </p>
            <button
              type="button"
              onClick={() => {
                setProjectSearchQuery('');
                setProjectLocationFilter('All Locations');
                setProjectStatusFilter('All');
              }}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#113B24] dark:bg-[#15803D] text-[#EAB308] dark:text-white text-xs font-bold transition-all cursor-pointer hover:brightness-110 shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
            const stats = getProjectCardStats(project.id);
            return (
              <div
                key={project.id}
                className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Thumbnail Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={project.masterPlanImage}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[#113B24] text-[#EAB308] border border-[#EAB308]/40 text-xs font-black shadow-md flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{project.dtcpNumber}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                      {project.status}
                    </span>
                  </div>

                  {/* Bottom Title on Image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-black">{project.name}</h3>
                    <p className="text-xs text-[#EAB308] font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{project.location}, {project.district}</span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-[#1E5D32] text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Extent</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {project.totalAreaExtent || '12.5 Acres'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Available</span>
                      <span className="text-xs font-black text-[#15803D] dark:text-emerald-400">
                        {stats.available} Plots
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Starts At</span>
                      <span className="text-xs font-black text-[#CA8A04] dark:text-[#EAB308]">
                        ₹{stats.startingLakhs}L
                      </span>
                    </div>
                  </div>

                  {/* "View More" triggers Full-Screen Project View */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProjectId(project.id);
                      setProjectSubTab('layout');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full min-h-[46px] rounded-xl bg-[#15803D] hover:bg-[#113B24] active:scale-[0.99] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>View More & Explore Layout</span>
                    <Sparkles className="w-4 h-4 text-[#EAB308]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </main>

      {/* Footer */}
      <PublicFooter
        onTabChange={onTabChange}
        onOpenConsultation={onOpenConsultation}
        onOpenAdminLogin={onOpenAdminLogin}
      />
    </div>
  );
};
