import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Job } from '../types';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showAddJobModal, setShowAddJobModal] = useState<boolean>(false);

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newExp, setNewExp] = useState('Mid-Level');
  const [newSalary, setNewSalary] = useState('$110,000 - $140,000');
  const [newDesc, setNewDesc] = useState('');
  const [newReqSkills, setNewReqSkills] = useState('python, fastapi, react, postgresql');
  const [newPrefSkills, setNewPrefSkills] = useState('docker, aws, tailwind css');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [s, u, j] = await Promise.all([
      api.getAdminStats(),
      api.getAdminUsers(),
      api.getJobs()
    ]);
    setStats(s);
    setUsers(u);
    setJobs(j);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCompany || !newDesc) return;

    await api.createJob({
      title: newTitle,
      company: newCompany,
      location: newLocation,
      experience_level: newExp,
      salary_range: newSalary,
      description: newDesc,
      required_skills: newReqSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
      preferred_skills: newPrefSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    });

    setShowAddJobModal(false);
    // Reset form
    setNewTitle('');
    setNewCompany('');
    setNewDesc('');
    loadData();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Staff Management Console
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Administrator Control Center</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage active job descriptions, monitor candidate throughput, and oversee platform analytics.
          </p>
        </div>

        <button
          onClick={() => setShowAddJobModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Job Opening
        </button>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Users</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">{stats?.total_users || 142}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resumes Audited</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">{stats?.total_resumes || 384}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Job Roles</span>
            <Briefcase className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">{jobs.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Avg ATS</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">{stats?.average_platform_ats_score || 79.4}</div>
        </div>
      </div>

      {/* Jobs Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Platform Job Descriptions</h3>
            <p className="text-xs text-slate-500">Curated opportunities available for candidate matching</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-6">Role Title</th>
                <th className="py-3 px-6">Company</th>
                <th className="py-3 px-6">Experience</th>
                <th className="py-3 px-6">Required Skills</th>
                <th className="py-3 px-6">Salary Range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900">{j.title}</td>
                  <td className="py-3.5 px-6 text-purple-700 font-semibold">{j.company}</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {j.experience_level}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 max-w-xs truncate">
                    {j.required_skills.slice(0, 4).join(', ')}...
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-700">{j.salary_range || "Competitive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">Registered Candidates & Staff</h3>
          <p className="text-xs text-slate-500">Overview of active registered platform accounts</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Resumes</th>
                <th className="py-3 px-6">Matches Run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900">{u.full_name}</td>
                  <td className="py-3.5 px-6 text-slate-600">{u.email}</td>
                  <td className="py-3.5 px-6">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-semibold">{u.resumes_count}</td>
                  <td className="py-3.5 px-6 font-semibold">{u.analyses_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Job Opening</h3>
              <button onClick={() => setShowAddJobModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Cloud Architect"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Cloud"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Experience Level</label>
                  <select
                    value={newExp}
                    onChange={(e) => setNewExp(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-purple-600"
                  >
                    <option>Entry-Level</option>
                    <option>Mid-Level</option>
                    <option>Senior</option>
                    <option>Staff / Principal</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. python, fastapi, react, postgresql"
                  value={newReqSkills}
                  onChange={(e) => setNewReqSkills(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Job Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Responsibilities, requirements, and qualifications..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-md"
                >
                  Save Job Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

