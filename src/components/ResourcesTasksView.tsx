import React, { useState } from 'react';
import { CareerTask, SharedResource, UserProfile } from '../types/index.ts';
import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  ThumbsUp,
  PlusCircle,
  Share2,
  FileText,
  Github,
  BookMarked,
  Bookmark,
  BookmarkCheck,
  Search,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';

interface ResourcesTasksViewProps {
  tasks: CareerTask[];
  resources: SharedResource[];
  currentUser: UserProfile | null;
  onToggleTask: (taskId: string) => Promise<void>;
  onShareResource: (resource: {
    title: string;
    category: string;
    description: string;
    linkUrl: string;
    fileType: 'PDF' | 'GitHub' | 'Notes' | 'CheatSheet';
  }) => Promise<void>;
  onUpvoteResource: (resourceId: string) => Promise<void>;
  onBookmarkResource?: (resourceId: string) => Promise<void>;
}

export const ResourcesTasksView: React.FC<ResourcesTasksViewProps> = ({
  tasks,
  resources,
  currentUser,
  onToggleTask,
  onShareResource,
  onUpvoteResource,
  onBookmarkResource,
}) => {
  const [activeSection, setActiveSection] = useState<'tasks' | 'resources' | 'saved'>('tasks');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [submittingResource, setSubmittingResource] = useState(false);

  // New resource form state
  const [resTitle, setResTitle] = useState('');
  const [resCategory, setResCategory] = useState('Frontend Engineering');
  const [resType, setResType] = useState<'PDF' | 'GitHub' | 'Notes' | 'CheatSheet'>('CheatSheet');
  const [resLink, setResLink] = useState('');
  const [resDescription, setResDescription] = useState('');

  // User bookmark lookup
  const userBookmarkIds = currentUser?.bookmarkedResourceIds || [];
  const isResourceBookmarked = (res: SharedResource) =>
    res.isBookmarked ?? userBookmarkIds.includes(res.id);

  const savedResources = resources.filter(isResourceBookmarked);

  // Filter logic
  const filterList = (list: SharedResource[]) => {
    return list.filter((r) => {
      if (
        selectedCategory !== 'all' &&
        !r.category.toLowerCase().includes(selectedCategory.toLowerCase())
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.authorName.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  };

  const filteredCommunityResources = filterList(resources);
  const filteredSavedResources = filterList(savedResources);

  const categories = ['all', 'Frontend', 'Backend', 'Databases', 'Machine Learning'];

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle || !resDescription) return;
    setSubmittingResource(true);
    try {
      await onShareResource({
        title: resTitle,
        category: resCategory,
        fileType: resType,
        linkUrl: resLink || 'https://github.com/career-genius',
        description: resDescription,
      });
      setShowShareModal(false);
      setResTitle('');
      setResDescription('');
      setResLink('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingResource(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'GitHub':
        return <Github className="w-4 h-4 text-slate-800" />;
      case 'PDF':
        return <FileText className="w-4 h-4 text-rose-600" />;
      case 'CheatSheet':
        return <BookMarked className="w-4 h-4 text-amber-600" />;
      default:
        return <Share2 className="w-4 h-4 text-indigo-600" />;
    }
  };

  const renderResourceCard = (res: SharedResource) => {
    const isSaved = isResourceBookmarked(res);

    return (
      <div
        key={res.id}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
      >
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <div className="flex items-center gap-2">
              {getFileIcon(res.fileType)}
              <span className="font-semibold text-slate-700">{res.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[11px] font-mono">{res.fileType}</span>
            </div>
            <span className="text-[11px]">{res.date}</span>
          </div>

          <h4 className="text-base font-bold text-slate-900 leading-snug">
            {res.title}
          </h4>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {res.description}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            <span>By <strong className="text-slate-800">{res.authorName}</strong></span>
            <span className="text-slate-400 text-[10px] block">({res.authorRole})</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Upvote Button */}
            <button
              onClick={() => onUpvoteResource(res.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                res.userUpvoted
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${res.userUpvoted ? 'fill-indigo-700' : ''}`} />
              <span className="tabular-nums">{res.upvotes}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => onBookmarkResource?.(res.id)}
              title={isSaved ? 'Remove from Saved Resources' : 'Save to Personal Vault'}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isSaved
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bookmark</span>
                </>
              )}
            </button>

            {/* Access Link */}
            <a
              href={res.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>Access</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Section Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Practical Execution & Community
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Career Tasks & Curated Resources
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Build production portfolio deliverables and access peer-reviewed technical notes, interview guides, and your personal bookmarks.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveSection('tasks')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeSection === 'tasks'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Milestone Tasks ({currentUser ? currentUser.completedTaskIds.length : 0}/{tasks.length})
          </button>
          <button
            onClick={() => setActiveSection('resources')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeSection === 'resources'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Community Resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveSection('saved')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'saved'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${activeSection === 'saved' ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span>Saved Resources ({savedResources.length})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Career Tasks */}
      {activeSection === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                Proof of Competency
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">
                Hands-On Engineering Challenges
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
                Recruiters prioritize demonstrable code over theory. Complete each deliverable and link your GitHub repository to earn XP and boost role readiness.
              </p>
            </div>

            <div className="text-center sm:text-right shrink-0 p-4 bg-slate-800 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 block font-medium">Completed Progress</span>
              <div className="text-2xl font-extrabold text-white mt-0.5 tabular-nums">
                {currentUser ? currentUser.completedTaskIds.length : 0} / {tasks.length}
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">
                {tasks.length > 0 ? Math.round(((currentUser?.completedTaskIds.length || 0) / tasks.length) * 100) : 0}% Verified
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.map((task) => {
              const isDone = currentUser ? currentUser.completedTaskIds.includes(task.id) : false;

              return (
                <div
                  key={task.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                    isDone
                      ? 'bg-white border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {task.track}
                      </span>
                      <span className="font-extrabold text-emerald-600 tabular-nums">
                        +{task.points} XP
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {task.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                      <strong className="text-slate-900 block mb-0.5">Required Deliverable:</strong>
                      {task.deliverable}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Est. {task.estimatedHours} Hours</span>
                    </div>

                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-slate-400" />
                          <span>Mark as Completed</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: Shared Resources Hub */}
      {activeSection === 'resources' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveSection('saved')}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors bg-white shadow-xs"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>View Saved ({savedResources.length})</span>
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Share Technical Resource (+50 XP)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCommunityResources.map((res) => renderResourceCard(res))}
          </div>
        </div>
      )}

      {/* SECTION 3: Saved Resources Tab */}
      {activeSection === 'saved' && (
        <div className="space-y-6">
          {/* Saved Vault Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md border border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Bookmark className="w-3.5 h-3.5 fill-amber-400" />
                <span>Curated Learning Vault</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                Your Bookmarked Technical Assets
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Quick-access vault of your pinned cheatsheets, architecture diagrams, and system design mock interview notes.
              </p>
            </div>

            <div className="shrink-0 p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-center sm:text-right backdrop-blur-xs">
              <span className="text-xs text-slate-400 block font-medium">Curated Items</span>
              <div className="text-2xl font-extrabold text-white mt-0.5 tabular-nums">
                {savedResources.length}
              </div>
              <span className="text-[11px] text-amber-300 font-medium">
                Personalized Library
              </span>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Saved' : cat}
                </button>
              ))}
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search saved materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-xs"
              />
            </div>
          </div>

          {/* Render List or Empty State */}
          {savedResources.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto space-y-4 my-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">No Saved Resources Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Curate your personal study and interview prep collection by bookmarking technical guides, notes, or repositories from the community.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setActiveSection('resources');
                }}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                <span>Browse Community Resources</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : filteredSavedResources.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto space-y-3">
              <p className="text-xs text-slate-600">
                No saved resources match the filter "{selectedCategory !== 'all' ? selectedCategory : searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSavedResources.map((res) => renderResourceCard(res))}
            </div>
          )}
        </div>
      )}

      {/* Share Resource Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Share Resource with Students</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. System Design Interview Patterns 2026"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Frontend Engineering">Frontend Engineering</option>
                    <option value="Backend Systems">Backend Systems</option>
                    <option value="Databases">Databases & SQL</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resource Type</label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="CheatSheet">CheatSheet</option>
                    <option value="GitHub">GitHub Repository</option>
                    <option value="Notes">Notes / Doc</option>
                    <option value="PDF">PDF Guide</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL / Link</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={resLink}
                  onChange={(e) => setResLink(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Context</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what this covers and how it helps students prepare for interviews or projects..."
                  value={resDescription}
                  onChange={(e) => setResDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {submittingResource ? 'Publishing...' : 'Share Resource (+50 XP)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
