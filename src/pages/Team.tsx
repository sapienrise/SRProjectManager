import { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Users, CheckSquare, FolderKanban } from 'lucide-react';
import { useStore } from '../store';
import { Modal } from '../components/ui/Modal';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { TeamMember } from '../types';
import { getAvatarColor } from '../utils/format';
import clsx from 'clsx';

interface MemberFormProps {
  initial?: Partial<TeamMember>;
  onSave: (data: Omit<TeamMember, 'id'>) => void;
  onCancel: () => void;
}

function MemberForm({ initial, onSave, onCancel }: MemberFormProps) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    role: initial?.role || '',
    department: initial?.department || '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div>
        <label className="label">Full Name *</label>
        <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Alice Johnson" />
      </div>
      <div>
        <label className="label">Email *</label>
        <input className="input" required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="alice@tlxworks.com" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Role *</label>
          <input className="input" required value={form.role} onChange={e => set('role', e.target.value)} placeholder="Project Manager" />
        </div>
        <div>
          <label className="label">Department</label>
          <input className="input" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Engineering" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save Member</button>
      </div>
    </form>
  );
}

export function Team() {
  const { teamMembers, projects, actionItems, addTeamMember, updateTeamMember, deleteTeamMember } = useStore();
  const [modal, setModal] = useState<null | 'add' | { type: 'edit'; member: TeamMember } | { type: 'delete'; member: TeamMember }>(null);
  const [search, setSearch] = useState('');

  const filtered = teamMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.department.toLowerCase().includes(search.toLowerCase())
  );

  const getMemberStats = (id: string) => ({
    projects: projects.filter(p => p.teamMemberIds.includes(id)),
    openActions: actionItems.filter(a => a.assigneeId === id && a.status !== 'done' && a.status !== 'cancelled'),
    doneActions: actionItems.filter(a => a.assigneeId === id && a.status === 'done'),
  });

  const handleAdd = (data: Omit<TeamMember, 'id'>) => { addTeamMember(data); setModal(null); };
  const handleEdit = (data: Omit<TeamMember, 'id'>) => {
    if (modal && typeof modal === 'object' && modal.type === 'edit') { updateTeamMember(modal.member.id, data); setModal(null); }
  };
  const handleDelete = () => {
    if (modal && typeof modal === 'object' && modal.type === 'delete') { deleteTeamMember(modal.member.id); setModal(null); }
  };

  // Departments summary
  const depts: Record<string, number> = {};
  teamMembers.forEach(m => { depts[m.department || 'Other'] = (depts[m.department || 'Other'] || 0) + 1; });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-0.5">{teamMembers.length} members across {Object.keys(depts).length} departments</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('add')}><Plus size={16} /> Add Member</button>
      </div>

      {/* Dept pills */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(depts).map(([dept, count]) => (
          <span key={dept} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{dept} · {count}</span>
        ))}
      </div>

      {/* Search */}
      <input className="input max-w-xs" placeholder="Search team members..." value={search} onChange={e => setSearch(e.target.value)} />

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="No team members" description="Add team members to assign them to projects."
          action={<button className="btn-primary" onClick={() => setModal('add')}><Plus size={14} /> Add Member</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(m => {
            const stats = getMemberStats(m.id);
            return (
              <div key={m.id} className="card p-5 flex flex-col gap-4">
                {/* Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} id={m.id} size="lg" />
                    <div>
                      <p className="font-semibold text-gray-900">{m.name}</p>
                      <p className="text-sm text-gray-500">{m.role}</p>
                      {m.department && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mt-1 inline-block">{m.department}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ type: 'edit', member: m })} className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><Edit2 size={13} /></button>
                    <button onClick={() => setModal({ type: 'delete', member: m })} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                </div>

                {/* Email */}
                <a href={`mailto:${m.email}`} className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 truncate">
                  <Mail size={13} /> {m.email}
                </a>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center border border-gray-100 rounded-xl p-3">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1 text-blue-500"><FolderKanban size={13} /></div>
                    <p className="text-xl font-bold text-gray-900">{stats.projects.length}</p>
                    <p className="text-xs text-gray-400">Projects</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1 text-amber-500"><CheckSquare size={13} /></div>
                    <p className="text-xl font-bold text-gray-900">{stats.openActions.length}</p>
                    <p className="text-xs text-gray-400">Open Tasks</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1 text-green-500"><CheckSquare size={13} /></div>
                    <p className="text-xl font-bold text-gray-900">{stats.doneActions.length}</p>
                    <p className="text-xs text-gray-400">Done</p>
                  </div>
                </div>

                {/* Assigned projects */}
                {stats.projects.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1.5">Assigned Projects</p>
                    <div className="flex flex-wrap gap-1">
                      {stats.projects.slice(0, 3).map(p => (
                        <span key={p.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[120px]">{p.name}</span>
                      ))}
                      {stats.projects.length > 3 && <span className="text-xs text-gray-400">+{stats.projects.length - 3} more</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {modal === 'add' && (
        <Modal title="Add Team Member" onClose={() => setModal(null)} size="md">
          <MemberForm onSave={handleAdd} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal && typeof modal === 'object' && modal.type === 'edit' && (
        <Modal title="Edit Team Member" onClose={() => setModal(null)} size="md">
          <MemberForm initial={modal.member} onSave={handleEdit} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal && typeof modal === 'object' && modal.type === 'delete' && (
        <Modal title="Remove Team Member" onClose={() => setModal(null)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Remove <strong>{modal.member.name}</strong> from the team?</p>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Remove</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
