import React, { useState, useRef } from 'react';
import { UserProfile } from '../types/index.ts';
import {
  Camera,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Shield,
  User,
  RefreshCw,
} from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSavePhoto: (newPhotoUrl: string) => Promise<void>;
}

// Curated high-resolution academic student & faculty avatar presets
const PRESET_AVATARS = [
  {
    id: 'preset-student-1',
    category: 'Student',
    label: 'AI & Systems Scholar',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=faces',
  },
  {
    id: 'preset-student-2',
    category: 'Student',
    label: 'Engineering Student',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
  },
  {
    id: 'preset-student-3',
    category: 'Student',
    label: 'Backend Developer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
  },
  {
    id: 'preset-student-4',
    category: 'Student',
    label: 'Full Stack Engineer',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
  },
  {
    id: 'preset-student-5',
    category: 'Student',
    label: 'Data Science Researcher',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces',
  },
  {
    id: 'preset-faculty-1',
    category: 'Faculty',
    label: 'CS & Systems Professor',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces',
  },
  {
    id: 'preset-faculty-2',
    category: 'Faculty',
    label: 'Software Systems Faculty',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
  },
  {
    id: 'preset-faculty-3',
    category: 'Faculty',
    label: 'Cloud & DevOps Lead',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
  },
  {
    id: 'preset-faculty-4',
    category: 'Faculty',
    label: 'Principal AI Faculty',
    url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&h=400&fit=crop&crop=faces',
  },
  {
    id: 'preset-owner-1',
    category: 'Academic Dean',
    label: 'Website Owner & Admin',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces',
  },
];

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSavePhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(currentUser.photoURL || '');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Compress & convert uploaded image to optimal base64 data URL
  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose an image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setErrorMessage('Image size is too large (max 12MB). Please select a smaller photo.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Render to square canvas (max 320x320)
          const canvas = document.createElement('canvas');
          const maxDim = 320;
          canvas.width = maxDim;
          canvas.height = maxDim;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setPreviewUrl(img.src);
            setIsProcessing(false);
            return;
          }

          // Center crop to square aspect ratio
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;

          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxDim, maxDim);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setPreviewUrl(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas compression fallback to raw data URL:', err);
          setPreviewUrl(String(e.target?.result || ''));
        } finally {
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setErrorMessage('Failed to read image data.');
        setIsProcessing(false);
      };
      img.src = String(e.target?.result);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file from device.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage('Please paste a valid image URL.');
      return;
    }
    setErrorMessage(null);
    setPreviewUrl(trimmed);
  };

  const handleRemovePhoto = () => {
    setPreviewUrl('');
    setUrlInput('');
    setErrorMessage(null);
  };

  const handleSave = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await onSavePhoto(previewUrl);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save profile photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get user initials
  const initials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CG';

  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm ${
                isTeacher
                  ? 'bg-indigo-600'
                  : isAdmin
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-600'
              }`}
            >
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 id="photo-modal-title" className="text-base font-extrabold text-slate-900">
                {currentUser.photoURL ? 'Update Profile Photo' : 'Add Profile Photo'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isTeacher
                  ? 'Faculty & Instructor Identity'
                  : isAdmin
                  ? 'Platform Owner Identity'
                  : 'Verified Student Identity'}{' '}
                · {currentUser.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Live Profile Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative shrink-0">
              <div
                className={`w-24 h-24 rounded-2xl overflow-hidden ring-4 flex items-center justify-center font-bold text-2xl shadow-md transition-all ${
                  isTeacher
                    ? 'ring-indigo-500/30 bg-indigo-900 text-indigo-100'
                    : isAdmin
                    ? 'ring-amber-500/30 bg-amber-500 text-slate-950'
                    : 'ring-emerald-500/30 bg-emerald-900 text-emerald-100'
                }`}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setErrorMessage('The image URL could not be loaded. Please check the link or choose another image.');
                    }}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Status Badge */}
              <div
                className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-lg text-white flex items-center justify-center shadow-md ${
                  isTeacher
                    ? 'bg-indigo-600'
                    : isAdmin
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-600'
                }`}
              >
                {isTeacher ? (
                  <BookOpen className="w-3.5 h-3.5" />
                ) : isAdmin ? (
                  <Shield className="w-3.5 h-3.5" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5" />
                )}
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isTeacher
                      ? 'bg-indigo-100 text-indigo-800'
                      : isAdmin
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isTeacher ? 'Verified Faculty' : isAdmin ? 'Website Owner' : 'Verified Student'}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-semibold text-slate-600 truncate">
                  {currentUser.college}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base truncate">{currentUser.name}</h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {currentUser.areaOfInterest}
                {currentUser.cgpa ? ` · ${currentUser.cgpa.toFixed(2)} CGPA` : ''}
              </p>

              {previewUrl ? (
                <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Photo Ready to Save</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 font-semibold px-2 py-0.5 rounded hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Photo</span>
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 mt-2">
                  Currently showing default initials avatar. Choose an option below to add your photo.
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'preset'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Preset Avatars</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Image URL</span>
            </button>
          </div>

          {/* TAB 1: DEVICE / FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-file-input"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/60'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 text-sm block">
                    Choose an image from your computer or phone
                  </span>
                  <p className="text-xs text-slate-500">
                    Drag and drop your photo here, or click to browse files
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Supports JPG, PNG, WebP · Auto-optimized for crisp display
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: PRESET AVATARS */}
          {activeTab === 'preset' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Select a high-resolution portrait matching your academic profile:</span>
                <span className="font-semibold text-slate-700">{PRESET_AVATARS.length} Available</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = previewUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setPreviewUrl(preset.url);
                        setErrorMessage(null);
                      }}
                      className={`group p-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-xs ring-1 ring-slate-200">
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center text-white">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="w-full">
                        <span className="text-[11px] font-bold text-slate-900 block truncate">
                          {preset.label}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {preset.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE URL */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Paste Direct Image Address (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://github.com/user.png"
                    className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* Quick Preset URLs */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2 uppercase tracking-wider">
                  Quick Avatar Services
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const ghUrl = 'https://github.com/torvalds.png';
                      setUrlInput(ghUrl);
                      setPreviewUrl(ghUrl);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-700 transition-colors"
                  >
                    GitHub Avatar Example
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces';
                      setUrlInput(sampleUrl);
                      setPreviewUrl(sampleUrl);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-700 transition-colors"
                  >
                    Unsplash Portrait Example
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {currentUser.photoURL && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isProcessing}
                className="px-3 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
              >
                Reset to Initials
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 ${
                isTeacher
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : isAdmin
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Photo...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Profile Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
