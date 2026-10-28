import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Upload,
  FileSpreadsheet,
  Layers,
  Save,
  CheckCircle2,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Compass,
  Building2,
  ShieldCheck,
  MousePointer,
  HelpCircle,
  AlertTriangle,
  Globe,
  FileText,
  X,
  Lock,
  ArrowRight,
  Maximize2,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property, PropertyStatus, Project } from '../../types';
import { parseCsvText, ParsedPlotRow } from '../../utils/spreadsheetParser';
import { MasterLayoutViewer } from '../../components/public/MasterLayoutViewer';

export const OwnerHotspotSimulator: React.FC = () => {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    properties,
    showToast,
    publishProject,
    unpublishProject,
    uploadProjectLayout,
    importSpreadsheetPlots,
    savePlotBoundaries,
    openAddProjectModal,
  } = useApp();

  // Active Project Context
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Plots belonging to current project
  const currentPlots = useMemo(() => {
    if (!activeProject) return [];
    return properties.filter((p) => p.projectId === activeProject.id);
  }, [properties, activeProject]);

  // Selected plot for boundary marking / editing
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const activePlot = useMemo(() => {
    return currentPlots.find((p) => p.id === selectedPlotId) || currentPlots[0] || null;
  }, [currentPlots, selectedPlotId]);

  // Local boundary state for active project
  const [localBoundaries, setLocalBoundaries] = useState<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});

  // Sync initial boundaries from properties
  React.useEffect(() => {
    const map: Record<string, { x: number; y: number; width: number; height: number }> = {};
    currentPlots.forEach((p) => {
      if (p.boundary) {
        map[p.id] = { ...p.boundary };
      }
    });
    setLocalBoundaries(map);
    if (currentPlots.length > 0 && !selectedPlotId) {
      setSelectedPlotId(currentPlots[0].id);
    }
  }, [currentPlots]);

  // Layout Image / PDF upload state
  const [isUploadingLayout, setIsUploadingLayout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Spreadsheet upload state & validation
  const spreadsheetInputRef = useRef<HTMLInputElement>(null);
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);
  const [spreadsheetText, setSpreadsheetText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedPlotRow[]>([]);
  const [spreadsheetErrors, setSpreadsheetErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Customer Preview Modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Publish confirmation modal state
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Handle Canvas click to position or draw boundary for selected plot
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !activePlot) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const currentB = localBoundaries[activePlot.id] || { width: 11, height: 14 };
    const newX = Math.max(0, Math.min(100 - currentB.width, Math.round(clickX - currentB.width / 2)));
    const newY = Math.max(0, Math.min(100 - currentB.height, Math.round(clickY - currentB.height / 2)));

    setLocalBoundaries((prev) => ({
      ...prev,
      [activePlot.id]: {
        ...currentB,
        x: newX,
        y: newY,
      },
    }));

    if (isDrawingMode) {
      setIsDrawingMode(false);
      showToast(`Positioned boundary for Plot #${activePlot.plotNumber}`, 'success');
    }
  };

  // Save all boundary coordinates to backend
  const handleSaveAllBoundaries = async () => {
    if (!activeProject) return;

    const payload = Object.entries(localBoundaries).map(([plotId, b]) => {
      const plot = currentPlots.find((p) => p.id === plotId);
      return {
        plotId,
        plotNumber: plot?.plotNumber,
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
      };
    });

    await savePlotBoundaries(activeProject.id, payload);
  };

  // Layout blueprint upload handler
  const handleLayoutFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProject) return;

    setIsUploadingLayout(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await uploadProjectLayout(activeProject.id, dataUrl);
      }
      setIsUploadingLayout(false);
    };

    reader.onerror = () => {
      showToast('Failed to read file', 'error');
      setIsUploadingLayout(false);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Spreadsheet file upload handler
  const handleSpreadsheetFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSpreadsheetText(content);
        const { rows, fatalError } = parseCsvText(content);
        if (fatalError) {
          setSpreadsheetErrors([fatalError]);
          setParsedRows([]);
        } else {
          setParsedRows(rows);
          const allErrors = rows.flatMap((r) => r.errors);
          setSpreadsheetErrors(allErrors);
        }
        setIsSpreadsheetModalOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Import parsed rows
  const handleExecuteImport = async () => {
    if (!activeProject || parsedRows.length === 0) return;

    setIsImporting(true);
    try {
      await importSpreadsheetPlots(activeProject.id, parsedRows);
      setIsSpreadsheetModalOpen(false);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  // Publish Project Handler with confirmation
  const handleConfirmPublish = async () => {
    if (!activeProject) return;
    setIsPublishing(true);
    await publishProject(activeProject.id);
    setIsPublishing(false);
    setIsPublishConfirmOpen(false);
  };

  // Unpublish Project Handler
  const handleUnpublish = async () => {
    if (!activeProject) return;
    await unpublishProject(activeProject.id);
  };

  // Sample CSV template generator for admin
  const handleDownloadSampleCsv = () => {
    const sample = `Plot Number,Dimensions,Area SqFt,Facing,Road Width,Price Per SqFt,Status\n101,30x40 ft,1200,North,40 ft,2100,Available\n102,30x40 ft,1200,East,40 ft,2100,Available\n103,40x60 ft,2400,North-East,60 ft,2400,Reserved\n104,30x50 ft,1500,South,30 ft,2100,Sold`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kriyaa_plots_sample_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#081B10] text-slate-900 dark:text-slate-100 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER WITH PROJECT SWITCHER & PUBLISH STATUS RIBBON
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 sm:p-6 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#15803D]/10 text-[#15803D] dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Plot Management &amp; Layout Studio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control layout blueprints, spreadsheet imports, manual boundary marking, and live public website publishing.
          </p>
        </div>

        {/* Project Switcher & Status Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Project Dropdown Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">Project:</span>
            <select
              value={activeProject?.id || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]"
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name} ({proj.isPublished ? '● Published' : '○ Draft'})
                </option>
              ))}
            </select>
          </div>

          {/* New Project Button */}
          <button
            type="button"
            onClick={openAddProjectModal}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#164329] dark:hover:bg-[#1d5735] text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Layout</span>
          </button>

          {/* Published vs Draft Pill */}
          {activeProject?.isPublished ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#15803D] dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 text-xs font-black">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] dark:text-emerald-400" />
              <span>LIVE PUBLISHED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-[#EAB308] border border-amber-300 dark:border-amber-700 text-xs font-black">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>UNPUBLISHED DRAFT</span>
            </span>
          )}

          {/* Preview Customer View */}
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#112F1C] dark:hover:bg-[#164329] text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#EAB308]" />
            <span>Customer Preview</span>
          </button>

          {/* Publish / Unpublish CTA */}
          {activeProject?.isPublished ? (
            <button
              type="button"
              onClick={handleUnpublish}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:text-slate-300 dark:hover:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Unpublish Layout
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsPublishConfirmOpen(true)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#15803D] to-[#113B24] hover:brightness-110 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>Publish to Live Site</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. WORKFLOW ACTION TOOLBAR: UPLOAD BLUEPRINT, IMPORT CSV, SAVE
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action 1: Upload Layout Blueprint / PDF */}
        <div className="bg-white dark:bg-[#0B2516] rounded-2xl border border-slate-200 dark:border-[#1E5D32] p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[11px] font-black uppercase text-[#15803D] dark:text-emerald-400">Step 1: Layout Image</span>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Upload Blueprint / PDF</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {activeProject?.layoutVersion ? `v${activeProject.layoutVersion} Active` : 'JPG, PNG or PDF blueprint'}
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLayoutFileSelect}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <button
            type="button"
            disabled={isUploadingLayout}
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-[#15803D] hover:bg-[#113B24] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploadingLayout ? 'Uploading...' : 'Upload Image'}</span>
          </button>
        </div>

        {/* Action 2: Import Spreadsheet */}
        <div className="bg-white dark:bg-[#0B2516] rounded-2xl border border-slate-200 dark:border-[#1E5D32] p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[11px] font-black uppercase text-[#CA8A04] dark:text-[#EAB308]">Step 2: Plot Data</span>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Import Excel / CSV</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {currentPlots.length} plots recorded in database
            </p>
          </div>

          <input
            type="file"
            ref={spreadsheetInputRef}
            onChange={handleSpreadsheetFileSelect}
            accept=".csv,.txt,.tsv"
            className="hidden"
          />

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              title="Download Sample CSV Template"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#164329] text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => spreadsheetInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#EAB308] to-[#CA8A04] hover:brightness-105 active:scale-95 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>
          </div>
        </div>

        {/* Action 3: Save Boundaries to Database */}
        <div className="bg-white dark:bg-[#0B2516] rounded-2xl border border-slate-200 dark:border-[#1E5D32] p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[11px] font-black uppercase text-sky-600 dark:text-sky-400">Step 3: Geometry</span>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Sync Boundaries</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Save 2D/3D coordinates to server
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAllBoundaries}
            className="px-4 py-2 rounded-xl bg-[#113B24] hover:bg-[#164329] border border-[#EAB308]/60 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Save className="w-3.5 h-3.5 text-[#EAB308]" />
            <span>Save Coordinates</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN STUDIO CANVAS & PLOT SPECIFICATION EDITOR (2-COLUMN GRID)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Interactive Visual Layout Canvas */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1E5D32]/60">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Interactive Boundary Marking Canvas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click on the blueprint to position or adjust the boundary for Plot #{activePlot?.plotNumber || ''}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDrawingMode
                    ? 'bg-[#EAB308] text-slate-950 font-black shadow-md'
                    : 'bg-slate-100 dark:bg-[#112F1C] text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span>{isDrawingMode ? 'Click on Layout to Place' : 'Mark Boundary'}</span>
              </button>

              <div className="flex items-center gap-2 text-[11px] font-bold pl-2 border-l border-slate-200 dark:border-[#1E5D32]">
                <span className="flex items-center gap-1 text-[#15803D] dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-[#15803D]" /> Available
                </span>
                <span className="flex items-center gap-1 text-[#CA8A04] dark:text-[#EAB308]">
                  <span className="w-2 h-2 rounded-full bg-[#EAB308]" /> Reserved
                </span>
                <span className="flex items-center gap-1 text-[#991B1B] dark:text-red-400">
                  <span className="w-2 h-2 rounded-full bg-[#991B1B]" /> Sold
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Layout Viewport */}
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="relative w-full aspect-[16/10] sm:aspect-[16/11] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-[#1E5D32] cursor-crosshair group shadow-inner"
          >
            {/* Base Master Plan Image */}
            <img
              src={activeProject?.layoutImageUrl || activeProject?.masterPlanImage}
              alt={activeProject?.name}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />

            {/* Render Boundaries Over Blueprint */}
            {currentPlots.map((plot) => {
              const b = localBoundaries[plot.id] || plot.boundary || { x: 20, y: 20, width: 11, height: 14 };
              const isSelected = activePlot?.id === plot.id;

              const statusColor =
                plot.status === 'Sold'
                  ? 'border-red-500 bg-red-500/25 text-red-200'
                  : plot.status === 'Reserved'
                  ? 'border-amber-400 bg-amber-400/25 text-amber-200'
                  : 'border-emerald-400 bg-emerald-400/25 text-emerald-100';

              return (
                <div
                  key={plot.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlotId(plot.id);
                  }}
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: `${b.width}%`,
                    height: `${b.height}%`,
                  }}
                  className={`absolute rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-center p-1 text-center font-bold backdrop-blur-xs select-none ${statusColor} ${
                    isSelected ? 'ring-2 ring-white scale-105 z-20 shadow-xl' : 'hover:scale-102 z-10'
                  }`}
                >
                  <span className="text-[10px] sm:text-xs font-black drop-shadow-md">
                    #{plot.plotNumber}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-semibold opacity-90 truncate max-w-full">
                    {plot.facing}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-black text-[#EAB308]">
                    ₹{(plot.totalPrice / 100000).toFixed(1)}L
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (4 cols): Selected Plot Properties & Quick Match */}
        <div className="lg:col-span-4 space-y-4">
          {/* Plot Details Card */}
          <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E5D32]/60">
              <div>
                <span className="text-[10px] font-black uppercase text-[#15803D] dark:text-emerald-400">
                  Plot Boundary Inspector
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Plot #{activePlot?.plotNumber || '—'}
                </h3>
              </div>

              {/* Status Select */}
              {activePlot && (
                <select
                  value={activePlot.status}
                  onChange={(e) => {
                    const status = e.target.value as PropertyStatus;
                    activePlot.status = status;
                    showToast(`Plot #${activePlot.plotNumber} status updated to ${status}`, 'success');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32] text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              )}
            </div>

            {activePlot ? (
              <div className="space-y-3 text-xs">
                {/* Dimensions & Area */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#112F1C]">
                    <span className="text-[9.5px] text-slate-400 block uppercase font-bold">Dimensions</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activePlot.plotDimensions}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#112F1C]">
                    <span className="text-[9.5px] text-slate-400 block uppercase font-bold">Extent</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activePlot.areaSqFt} Sq.Ft</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#112F1C]">
                    <span className="text-[9.5px] text-slate-400 block uppercase font-bold">Facing</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activePlot.facing}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#112F1C]">
                    <span className="text-[9.5px] text-slate-400 block uppercase font-bold">Price</span>
                    <span className="font-black text-[#15803D] dark:text-emerald-400">
                      ₹{(activePlot.totalPrice / 100000).toFixed(2)} Lakhs
                    </span>
                  </div>
                </div>

                {/* Boundary Coordinates Tuning */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1E5D32]/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Boundary Size &amp; Position
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Width (%)</label>
                      <input
                        type="number"
                        min="5"
                        max="30"
                        value={localBoundaries[activePlot.id]?.width || 11}
                        onChange={(e) => {
                          const w = Number(e.target.value);
                          setLocalBoundaries((prev) => ({
                            ...prev,
                            [activePlot.id]: {
                              ...(prev[activePlot.id] || { x: 20, y: 20, height: 14 }),
                              width: w,
                            },
                          }));
                        }}
                        className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Height (%)</label>
                      <input
                        type="number"
                        min="5"
                        max="35"
                        value={localBoundaries[activePlot.id]?.height || 14}
                        onChange={(e) => {
                          const h = Number(e.target.value);
                          setLocalBoundaries((prev) => ({
                            ...prev,
                            [activePlot.id]: {
                              ...(prev[activePlot.id] || { x: 20, y: 20, width: 11 }),
                              height: h,
                            },
                          }));
                        }}
                        className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Plot Switcher List */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#1E5D32]/60 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    All Plots in {activeProject?.name} ({currentPlots.length})
                  </span>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {currentPlots.map((plot) => (
                      <button
                        key={plot.id}
                        type="button"
                        onClick={() => setSelectedPlotId(plot.id)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          activePlot?.id === plot.id
                            ? 'bg-[#15803D] text-white font-bold'
                            : 'bg-slate-50 dark:bg-[#112F1C] hover:bg-slate-100 dark:hover:bg-[#164329] text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span>Plot #{plot.plotNumber} · {plot.facing}</span>
                        <span className="text-[10px] opacity-80">₹{(plot.totalPrice / 100000).toFixed(1)}L</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No plots found in this project. Use "Import CSV" to upload plots from a spreadsheet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. SPREADSHEET REVIEW & VALIDATION MODAL
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSpreadsheetModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-4xl bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] shadow-2xl p-6 space-y-5 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E5D32]/60">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Spreadsheet Validation &amp; Plot Import
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target Project: <span className="font-bold text-[#15803D] dark:text-emerald-400">{activeProject?.name}</span> · {parsedRows.length} rows parsed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSpreadsheetModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#112F1C] flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Validation Errors Box if any */}
              {spreadsheetErrors.length > 0 && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Validation Warnings Detected ({spreadsheetErrors.length}):</span>
                  </div>
                  <ul className="list-disc pl-5 max-h-24 overflow-y-auto space-y-0.5 text-[11px]">
                    {spreadsheetErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Parsed Rows Table */}
              <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 dark:border-[#1E5D32]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-[#112F1C] text-slate-700 dark:text-slate-300 uppercase text-[10px] font-black">
                    <tr>
                      <th className="p-2.5">Plot No</th>
                      <th className="p-2.5">Dimensions</th>
                      <th className="p-2.5">Extent</th>
                      <th className="p-2.5">Facing</th>
                      <th className="p-2.5">Road</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1E5D32]/50">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#112F1C]/60">
                        <td className="p-2.5 font-black text-slate-900 dark:text-white">#{row.plotNumber}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.plotDimensions}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.areaSqFt} Sq.Ft</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.facing}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.roadWidth}</td>
                        <td className="p-2.5 font-bold text-[#15803D] dark:text-emerald-400">
                          ₹{(row.totalPrice / 100000).toFixed(2)}L
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === 'Sold'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                                : row.status === 'Reserved'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1E5D32]/60">
                <button
                  type="button"
                  onClick={() => setIsSpreadsheetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#112F1C] text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isImporting || parsedRows.length === 0}
                  onClick={handleExecuteImport}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#15803D] to-[#113B24] hover:brightness-110 active:scale-95 text-white font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#EAB308]" />
                  <span>{isImporting ? 'Importing...' : `Confirm & Import ${parsedRows.length} Plots`}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          5. PUBLISH CONFIRMATION MODAL
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPublishConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] shadow-2xl p-6 space-y-4 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 mx-auto flex items-center justify-center">
                <Globe className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Publish "{activeProject?.name}"?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  This will make this layout, its blueprint image, and all {currentPlots.length} plot specifications visible to public visitors on the website.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32] text-xs text-left space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Layout DTCP No:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeProject?.dtcpNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Total Plots:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentPlots.length}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Available Plots:</span>
                  <span className="font-bold text-[#15803D] dark:text-emerald-400">
                    {currentPlots.filter((p) => p.status === 'Available').length}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPublishConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#112F1C] text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handleConfirmPublish}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#15803D] to-[#113B24] hover:brightness-110 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#EAB308]" />
                  <span>{isPublishing ? 'Publishing...' : 'Yes, Publish Live'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          6. LIVE CUSTOMER PREVIEW MODAL
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPreviewModalOpen && activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-5xl bg-white dark:bg-[#081B10] rounded-3xl border border-slate-200 dark:border-[#1E5D32] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E5D32]">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#15803D] dark:bg-emerald-950/80 dark:text-emerald-400 text-xs font-black">
                    Live Customer Simulation View
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {activeProject.name} — Interactive Plot Explorer
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#112F1C] flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Render Public MasterLayoutViewer */}
              <MasterLayoutViewer
                project={activeProject}
                plots={currentPlots}
                selectedPlot={activePlot}
                onSelectPlot={(p) => setSelectedPlotId(p.id)}
                displayMode="topdown"
                onModeChange={() => {}}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
