import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  MapPin,
  ChevronDown,
  Sun,
  Moon,
  Bell,
  Plus,
  Building2,
  Users,
  Layers,
  Check,
  Clock,
  ExternalLink,
  LogOut,
  User,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  isRead: boolean;
  type: 'inquiry' | 'visit' | 'token' | 'approval';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New inquiry for Golden City Plot #42',
    subtitle: 'S. Murugan requested DTCP approval documents & pricing',
    time: '10m ago',
    isRead: false,
    type: 'inquiry',
  },
  {
    id: 'notif-2',
    title: 'Site visit scheduled for Plot #18',
    subtitle: 'Anitha R. confirmed visit for Sunday 10:30 AM',
    time: '45m ago',
    isRead: false,
    type: 'visit',
  },
  {
    id: 'notif-3',
    title: 'Allotment token received for Plot #05',
    subtitle: 'Dr. K. Venkat deposited ₹50,000 reservation advance',
    time: '2h ago',
    isRead: false,
    type: 'token',
  },
  {
    id: 'notif-4',
    title: 'RERA Compliance Verified',
    subtitle: 'Golden City Phase 2 docs synced with Tamil Nadu RERA portal',
    time: 'Yesterday',
    isRead: true,
    type: 'approval',
  },
];

export const TopHeaderBar: React.FC = () => {
  const {
    projects,
    selectedProjectId,
    selectedProject,
    setSelectedProjectId,
    openAddProjectModal,
    openAddPropertyModal,
    setActiveTab,
    properties,
    settings,
    showToast,
    logout,
  } = useApp();

  // 1. THEME MODE STATE & PERSISTENCE
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('kriyaa_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('kriyaa_theme', theme);
    } catch (e) {
      console.error('Failed to persist theme:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  // 2. DROPDOWN POPUP STATES
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'info');
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setIsNotificationsOpen(false);
    if (item.type === 'inquiry' || item.type === 'visit') {
      setActiveTab('leads');
    } else {
      setActiveTab('properties');
    }
  };

  // Click outside to dismiss all dropdowns
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false);
        setIsNotificationsOpen(false);
        setIsActionMenuOpen(false);
        setIsProfileOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProjectDropdownOpen(false);
        setIsNotificationsOpen(false);
        setIsActionMenuOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getProjectPlotStats = (projectId: string) => {
    const projProps = properties.filter((p) => p.projectId === projectId);
    const available = projProps.filter((p) => p.status === 'Available').length;
    return {
      total: projProps.length,
      available,
    };
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-40 w-full shadow-md text-white select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. MOBILE TOP HEADER (DEEP FOREST GREEN #113B24)
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#113B24] border-b border-[#1E5D32]/60 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2">
        {/* Top Left: Rectangular Brand Logo badge + Title + Italic Gold Tagline */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0B2516] border border-[#EAB308]/40 flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Kriyaa Promoters" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center relative w-full h-full">
                <span className="font-black text-sm text-white tracking-tighter drop-shadow">
                  <span className="text-[#22C55E]">K</span>
                  <span className="text-[#EAB308]">P</span>
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-white font-extrabold tracking-wide text-xs sm:text-sm uppercase leading-tight truncate">
              {settings.companyName || 'KRIYAA PROMOTERS'}
            </span>
            <span className="text-[#EAB308] italic text-[10px] sm:text-[11px] font-medium tracking-tight leading-tight">
              Your dream, our priority
            </span>
          </div>
        </div>

        {/* Top Right Action Group: Theme + Outlined Golden Bell + Deep Forest Green & Gold Action Button ("+ ▾") */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#1E5D32] bg-[#0B2516] flex items-center justify-center text-[#EAB308] hover:bg-[#164329] transition cursor-pointer active:scale-95 shadow-xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-[#EAB308]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-white/90 stroke-[2]" />
            )}
          </button>

          {/* Outlined Golden Notification Bell with Active Amber Dot on Top */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProjectDropdownOpen(false);
                setIsActionMenuOpen(false);
                setIsProfileOpen(false);
              }}
              aria-label="View notifications"
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#EAB308]/60 bg-[#0B2516] flex items-center justify-center text-[#EAB308] hover:bg-[#164329] transition cursor-pointer active:scale-95 shadow-xs"
            >
              <Bell className="w-4 h-4 stroke-[2.2] text-[#EAB308]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#EAB308] ring-2 ring-[#113B24]" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-slate-100"
                >
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Recent Alerts & Inquiries
                      </h4>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-3 ${
                          !item.isRead ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !item.isRead
                              ? 'bg-[#15803D] ring-2 ring-emerald-200 dark:ring-emerald-900'
                              : 'bg-transparent'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className={`text-xs truncate ${
                                !item.isRead
                                  ? 'font-bold text-slate-900 dark:text-white'
                                  : 'font-medium text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {item.title}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        setActiveTab('leads');
                      }}
                      className="w-full text-center py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>View All Leads & Inquiries</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Deep Forest Green and Gold Bordered Action Button ("+ ▾") */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsActionMenuOpen(!isActionMenuOpen);
                setIsProjectDropdownOpen(false);
                setIsNotificationsOpen(false);
                setIsProfileOpen(false);
              }}
              aria-expanded={isActionMenuOpen}
              title="Quick Actions"
              className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-[#0B2516] hover:bg-[#164329] text-[#EAB308] border border-[#EAB308]/60 shadow-xs font-bold transition active:scale-95 cursor-pointer text-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#EAB308] stroke-[2.8]" />
              <ChevronDown
                className={`w-3 h-3 text-[#EAB308] stroke-[2.5] transition-transform duration-150 ${
                  isActionMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Quick Creation Dropdown Menu */}
            <AnimatePresence>
              {isActionMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-slate-100 p-2 space-y-1"
                >
                  <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Quick Actions
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsActionMenuOpen(false);
                      openAddPropertyModal();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer text-slate-800 dark:text-slate-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#15803D] dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold">Add Property / Plot</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Add plot with dimensions & price</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsActionMenuOpen(false);
                      openAddProjectModal();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer text-slate-800 dark:text-slate-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold">Add Project / Layout</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Create new DTCP layout</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsActionMenuOpen(false);
                      setActiveTab('leads');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer text-slate-800 dark:text-slate-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#15803D] dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold">Manage Customer Leads</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">View pipeline & inquiries</p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Optional Profile Avatar Button (Compact) */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsActionMenuOpen(false);
                setIsNotificationsOpen(false);
                setIsProjectDropdownOpen(false);
              }}
              aria-expanded={isProfileOpen}
              title="Account Profile"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#EAB308]/40 bg-[#0B2516] flex items-center justify-center text-[#EAB308] font-black text-xs hover:bg-[#164329] transition cursor-pointer"
            >
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.companyName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>KP</span>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-slate-100"
                >
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-emerald-500/60 flex items-center justify-center text-emerald-300 font-extrabold text-sm shrink-0">
                      <span>KP</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          Rajesh RTR
                        </h4>
                        <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                      </div>
                      <span className="inline-block px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Super Admin
                      </span>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        setActiveTab('settings');
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span>Business Settings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SELECT / FILTER BAR (Underneath, bg-[#0B2516] Dark Forest Green Base)
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#0B2516] border-b border-[#1E5D32] px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-between gap-2 shadow-xs">
        {/* Left: Rounded "Golden City ▾" Dropdown Selector with Green MapPin */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProjectDropdownOpen(!isProjectDropdownOpen);
              setIsNotificationsOpen(false);
              setIsActionMenuOpen(false);
              setIsProfileOpen(false);
            }}
            aria-expanded={isProjectDropdownOpen}
            title="Select Project / Layout"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#113B24] border border-[#1E5D32] text-xs font-semibold text-white hover:bg-[#164329] transition truncate cursor-pointer active:scale-98 shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-[#22C55E] shrink-0 stroke-[2.2]" />
            <span className="truncate max-w-[130px] sm:max-w-[220px]">
              {selectedProject?.name || 'Golden City'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#EAB308] shrink-0 transition-transform duration-150 ${
                isProjectDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Project Switcher Dropdown Menu */}
          <AnimatePresence>
            {isProjectDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 mt-2 w-80 sm:w-88 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-slate-100"
              >
                {/* Header */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#15803D] dark:text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      Select Layout / Project
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {projects.length} Layouts
                  </span>
                </div>

                {/* Project List */}
                <div className="p-2 max-h-72 overflow-y-auto space-y-1">
                  {/* Option: All Projects */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId('all');
                      setIsProjectDropdownOpen(false);
                      showToast('Viewing All Projects', 'info');
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      selectedProjectId === 'all'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedProjectId === 'all'
                            ? 'bg-[#15803D] text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          All Projects
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          All DTCP approved residential sites
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                        {properties.length} Plots
                      </span>
                      {selectedProjectId === 'all' && (
                        <div className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                  {/* Individual Layouts */}
                  {projects.map((proj) => {
                    const isSelected = selectedProjectId === proj.id;
                    const stats = getProjectPlotStats(proj.id);

                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(proj.id);
                          setIsProjectDropdownOpen(false);
                          showToast(`Switched to ${proj.name}`, 'info');
                        }}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 relative">
                            <img
                              src={proj.masterPlanImage}
                              alt={proj.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {proj.name}
                              </p>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {proj.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-semibold text-[#15803D] dark:text-emerald-400">
                                {proj.dtcpNumber}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block tabular-nums">
                              {stats.total} Plots
                            </span>
                            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 block tabular-nums">
                              {stats.available} Avail
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Action: + Add New Project / Layout */}
                <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      openAddProjectModal();
                    }}
                    className="w-full min-h-[40px] px-3 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Project / Layout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Label "• DTCP Approved Layouts" styled in golden-green text */}
        <div className="flex items-center gap-1 text-[#76B084] font-medium text-[11px] shrink-0 select-none">
          <span className="text-[#EAB308] font-bold text-xs leading-none">•</span>
          <span>DTCP Approved Layouts</span>
        </div>
      </div>
    </header>
  );
};
