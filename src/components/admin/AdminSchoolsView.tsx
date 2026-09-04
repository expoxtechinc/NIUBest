import React, { useState, useEffect } from 'react';
import { School, Department } from '../../types';
import { fetchSchools, fetchDepartments, saveSchool, saveDepartment } from '../../lib/academicService';
import { Building, Plus, Layers } from 'lucide-react';

export const AdminSchoolsView: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [showAddSchool, setShowAddSchool] = useState(false);

  const loadData = async () => {
    try {
      const [sList, dList] = await Promise.all([fetchSchools(), fetchDepartments()]);
      setSchools(sList);
      setDepartments(dList);
    } catch (err) {
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolCode) return;
    try {
      await saveSchool({
        name: newSchoolName,
        code: newSchoolCode,
        description: `School dedicated to professional excellence in ${newSchoolName}.`,
      });
      setNewSchoolName('');
      setNewSchoolCode('');
      setShowAddSchool(false);
      await loadData();
    } catch (err) {
      console.error('Error creating school:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
            Institutional Structure
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
            Schools & Academic Departments
          </h1>
        </div>

        <button
          onClick={() => setShowAddSchool(!showAddSchool)}
          className="px-4 py-2 bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddSchool ? 'Close' : 'Add School'}</span>
        </button>
      </div>

      {showAddSchool && (
        <form
          onSubmit={handleCreateSchool}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs animate-in fade-in"
        >
          <h3 className="font-serif font-bold text-slate-900">Add Academic School</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">School Name</label>
              <input
                type="text"
                required
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="e.g. School of Computing & Informatics"
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Code</label>
              <input
                type="text"
                required
                value={newSchoolCode}
                onChange={(e) => setNewSchoolCode(e.target.value)}
                placeholder="e.g. SCI"
                className="w-full p-2 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddSchool(false)}
              className="px-3 py-1.5 text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-900 text-white rounded font-semibold"
            >
              Create School
            </button>
          </div>
        </form>
      )}

      {/* List of Schools & Departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schools.map((s) => {
          const deptList = departments.filter((d) => d.schoolId === s.id);
          return (
            <div key={s.id} className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-900" />
                  <h3 className="text-sm font-serif font-bold text-slate-900">{s.name}</h3>
                </div>
                <span className="font-mono text-xs text-slate-500 font-semibold">{s.code}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>

              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Constituent Departments ({deptList.length})
                </span>
                <div className="space-y-1.5">
                  {deptList.map((d) => (
                    <div
                      key={d.id}
                      className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-800">{d.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{d.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
