'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/hooks';
import { useAppContext } from '@/lib/context';
import { apiClient } from '@/lib/api';
import { clearToken } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { ChipSelect } from '@/components/ui/ChipSelect';
import { Button } from '@/components/ui/Button';
import { TopNav } from '@/components/ui/TopNav';
import { EditIcon, LogOutIcon, TrashIcon, UserIcon, CatIcon, CheckIcon } from '@/components/icons';

type View = 'main' | 'edit_owner' | 'edit_pet' | 'delete';

const GENDER_OPTIONS = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'unknown', label: 'Unknown' }];
const NEUTERED_OPTIONS = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'Not yet' }, { value: 'unknown', label: 'Not sure' }];
const SOURCE_OPTIONS = [{ value: 'shelter', label: 'Shelter' }, { value: 'breeder', label: 'Breeder' }, { value: 'friend_family', label: 'Friend / Family' }, { value: 'stray', label: 'Found stray' }, { value: 'other', label: 'Other' }];
const SIBLING_OPTIONS = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' }];

export default function ProfilePage() {
  const router = useRouter();
  const { user, pet, setUser, setPet } = useAppContext();
  const { loading } = useAuthGuard();
  const [view, setView] = useState<View>('main');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Owner edit form
  const [ownerForm, setOwnerForm] = useState({ first_name: user?.first_name ?? '', last_name: user?.last_name ?? '' });

  // Pet edit form
  const [petForm, setPetForm] = useState({
    name: pet?.name ?? '',
    age_months: String(pet?.age_months ?? ''),
    gender: pet?.gender ?? '',
    neutered_spayed: pet?.neutered_spayed ?? '',
    breed: pet?.breed ?? '',
    source: pet?.source ?? '',
    sibling_bonded: pet?.sibling_bonded ?? '',
  });

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleSaveOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true); setError('');
    try {
      const updated = await apiClient.updateUser(user.id, { first_name: ownerForm.first_name, last_name: ownerForm.last_name });
      setUser(updated);
      showSaved();
      setView('main');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    setSaving(true); setError('');
    try {
      const updated = await apiClient.updatePet(pet.id, {
        name: petForm.name,
        age_months: Number(petForm.age_months),
        gender: petForm.gender as 'male' | 'female' | 'unknown',
        neutered_spayed: (petForm.neutered_spayed || undefined) as 'yes' | 'no' | 'unknown' | undefined,
        breed: petForm.breed || undefined,
        source: (petForm.source || undefined) as 'shelter' | 'breeder' | 'friend_family' | 'stray' | 'other' | undefined,
        sibling_bonded: (petForm.sibling_bonded || undefined) as 'yes' | 'no' | 'unsure' | undefined,
      });
      setPet(updated);
      showSaved();
      setView('main');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('kittencompanion_token') : null;
    try {
      if (token) await apiClient.logout(token);
    } catch { /* ignore */ }
    clearToken();
    setUser(null);
    setPet(null);
    router.replace('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  // ── Edit owner ──────────────────────────────────────────────────
  if (view === 'edit_owner') {
    return (
      <>
        <TopNav title="Edit owner" onBack={() => setView('main')} />
        <div className="px-5 pt-5">
          <form onSubmit={handleSaveOwner}>
            <Input id="first_name" label="First name" value={ownerForm.first_name} onChange={e => setOwnerForm(f => ({ ...f, first_name: e.target.value }))} />
            <Input id="last_name" label="Last name" value={ownerForm.last_name} onChange={e => setOwnerForm(f => ({ ...f, last_name: e.target.value }))} />
            <Input id="email_readonly" label="Email" value={user.email} disabled hint="Email cannot be changed" />
            {error && <p className="text-[13px] text-[#e85d5d] mb-3">{error}</p>}
            <Button type="submit" fullWidth loading={saving}>Save changes</Button>
          </form>
        </div>
      </>
    );
  }

  // ── Edit pet ────────────────────────────────────────────────────
  if (view === 'edit_pet') {
    return (
      <>
        <TopNav title="Edit pet" onBack={() => setView('main')} />
        <div className="px-5 pt-5 pb-8">
          <form onSubmit={handleSavePet}>
            <div className="flex gap-3">
              <div style={{ flex: 2 }}>
                <Input id="pet_name" label="Kitten's name" value={petForm.name} onChange={e => setPetForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Scooter" />
              </div>
              <div style={{ flex: 1 }}>
                <Input id="pet_age" label="Age (mo.)" type="number" value={petForm.age_months} onChange={e => setPetForm(f => ({ ...f, age_months: e.target.value }))} placeholder="2" hint="0 if < 1mo" />
              </div>
            </div>
            <Input id="pet_breed" label="Breed" optional value={petForm.breed} onChange={e => setPetForm(f => ({ ...f, breed: e.target.value }))} placeholder="Mixed" />
            <ChipSelect label="Gender" value={petForm.gender} onChange={v => setPetForm(f => ({ ...f, gender: v }))} options={GENDER_OPTIONS} />
            <ChipSelect label="Neutered / Spayed" optional value={petForm.neutered_spayed} onChange={v => setPetForm(f => ({ ...f, neutered_spayed: v }))} options={NEUTERED_OPTIONS} />
            <ChipSelect label="Where did you adopt from" optional value={petForm.source} onChange={v => setPetForm(f => ({ ...f, source: v }))} options={SOURCE_OPTIONS} />
            <ChipSelect label="Did they have a sibling" optional value={petForm.sibling_bonded} onChange={v => setPetForm(f => ({ ...f, sibling_bonded: v }))} options={SIBLING_OPTIONS} />
            {error && <p className="text-[13px] text-[#e85d5d] mb-3">{error}</p>}
            <Button type="submit" fullWidth loading={saving}>Save changes</Button>
          </form>
        </div>
      </>
    );
  }

  // ── Delete confirmation ─────────────────────────────────────────
  if (view === 'delete') {
    return (
      <>
        <TopNav title="Delete account" onBack={() => setView('main')} />
        <div className="px-5 pt-5">
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-[16px] p-5 mb-4">
            <p className="text-[14px] font-bold text-[#991b1b] mb-2">This action is permanent.</p>
            <p className="text-[13px] text-[#991b1b] m-0 leading-[1.6]">
              All your data — account, pet profiles, check-ins, concerns, and reports — will be permanently deleted within 30 days.
            </p>
          </div>
          <Button variant="danger" fullWidth onClick={() => alert('Deletion confirmation email sent. Check your inbox.')}>
            Delete my account
          </Button>
          <Button variant="ghost" fullWidth className="mt-2" onClick={() => setView('main')}>
            Cancel
          </Button>
        </div>
      </>
    );
  }

  // ── Main view ───────────────────────────────────────────────────
  return (
    <div className="px-5 pt-5 pb-2">
      <h2 className="text-[22px] font-extrabold text-[#111] tracking-[-0.4px] mb-4">Profile</h2>

      {saved && (
        <div className="bg-[#f0faf4] border-[1.5px] border-[#bbf0d0] rounded-[12px] p-3 mb-4 flex items-center gap-2 text-[#166534] text-[13px] font-semibold">
          <CheckIcon size={16} /> Details saved!
        </div>
      )}

      {/* Owner card */}
      <div className="bg-white rounded-[16px] p-5 mb-3 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#555]"><UserIcon size={18} /></div>
            <div>
              <p className="m-0 text-[15px] font-bold text-[#111]">{user.first_name} {user.last_name}</p>
              <p className="m-0 text-[12px] text-[#aaa]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { setOwnerForm({ first_name: user.first_name, last_name: user.last_name }); setView('edit_owner'); }}
            className="flex items-center gap-1 text-[12px] text-[#555] bg-[#f5f5f5] border-none rounded-[8px] px-3 py-1.5 cursor-pointer font-sans"
          >
            <EditIcon size={13} /> Edit
          </button>
        </div>
      </div>

      {/* Pet card */}
      {pet && (
        <div className="bg-white rounded-[16px] p-5 mb-3 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#555]"><CatIcon size={18} /></div>
              <div>
                <p className="m-0 text-[15px] font-bold text-[#111]">{pet.name}</p>
                <p className="m-0 text-[12px] text-[#aaa]">{pet.age_months} months · {pet.gender}{pet.breed ? ` · ${pet.breed}` : ''}</p>
              </div>
            </div>
            <button
              onClick={() => { setPetForm({ name: pet.name, age_months: String(pet.age_months), gender: pet.gender, neutered_spayed: pet.neutered_spayed ?? '', breed: pet.breed ?? '', source: pet.source ?? '', sibling_bonded: pet.sibling_bonded ?? '' }); setView('edit_pet'); }}
              className="flex items-center gap-1 text-[12px] text-[#555] bg-[#f5f5f5] border-none rounded-[8px] px-3 py-1.5 cursor-pointer font-sans"
            >
              <EditIcon size={13} /> Edit
            </button>
          </div>
          <div className="text-[12px] text-[#aaa] space-y-0.5">
            {pet.adoption_date && <p className="m-0">Adopted: {new Date(pet.adoption_date).toLocaleDateString()}</p>}
            {pet.source && <p className="m-0">Source: {pet.source.replace('_', ' ')}</p>}
            <p className="m-0">Neutered/spayed: {pet.neutered_spayed}</p>
          </div>
        </div>
      )}

      {/* Account section */}
      <div className="bg-white rounded-[16px] overflow-hidden shadow-[0_1px_8px_rgba(0,0,0,0.06)] mb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 border-none bg-transparent text-left cursor-pointer border-b border-[#f5f5f5] font-sans hover:bg-[#f9f9f9] transition-colors"
        >
          <LogOutIcon size={16} />
          <span className="text-[14px] text-[#555]">Log out</span>
        </button>
        <button
          onClick={() => setView('delete')}
          className="w-full flex items-center gap-3 px-5 py-4 border-none bg-transparent text-left cursor-pointer font-sans hover:bg-[#fef9f9] transition-colors"
        >
          <TrashIcon size={16} />
          <span className="text-[14px] text-[#e85d5d]">Delete account</span>
        </button>
      </div>

      <p className="text-center text-[11px] text-[#ccc]">© 2026 Kitten Companion · v0.1</p>
    </div>
  );
}
