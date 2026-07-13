import SearchableSelect from './SearchableSelect';
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Camera, X, Check, Loader2 } from 'lucide-react';

interface ProfileModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newName: string, newAvatarUrl: string) => void;
}

export default function ProfileModal({ user, isOpen, onClose, onUpdate }: ProfileModalProps) {
  const [name, setName] = useState('');
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shortId, setShortId] = useState<number | null>(null);
  const [phoneNo, setPhoneNo] = useState('');
  const [designation, setDesignation] = useState('');
  
  const isTeacher = user?.user_metadata?.role === 'teacher';
  const hasDesignation = user?.user_metadata?.designation !== undefined || (user?.user_metadata?.profession === 'College / University' || user?.user_metadata?.profession === 'Company');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.user_metadata?.full_name || '');
      setAvatarData(user.user_metadata?.avatar_url || null);
      setPhoneNo(user.user_metadata?.phone_no || '');
      setDesignation(user.user_metadata?.designation || '');
      setErrorMsg('');

      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('short_id')
            .eq('id', user.id)
            .single();
            
          if (data && !error) {
            setShortId(data.short_id);
          }
        } catch (err) {
          console.error("Error fetching profile short_id:", err);
        }
      };
      
      fetchProfile();
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Compress image to < 50KB using HTML5 Canvas
  const processImage = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality JPEG
          
          if (dataUrl.length > 70000) {
            setErrorMsg('Image is too large. Please select a smaller photo or solid color.');
          } else {
            setAvatarData(dataUrl);
            setErrorMsg('');
          }
        }
      };
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.');
      return;
    }
    processImage(file);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Name cannot be empty');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const updates: any = {
        full_name: name,
        avatar_url: avatarData || undefined
      };
      if (isTeacher) {
        updates.phone_no = phoneNo;
        if (hasDesignation) updates.designation = designation;
      }
      
      const { error } = await supabase.auth.updateUser({
        data: updates
      });
      if (error) throw error;
      
      onUpdate(name, avatarData || '');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '24px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Edit Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '13px', fontWeight: '500' }}>
              {errorMsg}
            </div>
          )}

          {/* Avatar Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div 
              style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#f1f5f9', position: 'relative', cursor: 'pointer', overflow: 'hidden', border: '3px solid #e2e8f0' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarData ? (
                <img src={avatarData} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <Camera size={32} />
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px', textAlign: 'center', color: '#fff', fontSize: '10px', fontWeight: '600' }}>
                Change
              </div>
            </div>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp" 
              style={{ display: 'none' }} 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
          </div>

          {/* User ID Display */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>User ID</label>
            <div style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
              {shortId !== null ? `ID: ${shortId}` : 'LOADING...'}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Display Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e: any) => setName(e.target.value)}
              placeholder="Enter your full name"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#0f172a', outline: 'none' }}
            />
          </div>

          {isTeacher && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Phone Number</label>
                <input 
                  type="text" 
                  value={phoneNo} 
                  onChange={(e: any) => setPhoneNo(e.target.value)}
                  placeholder="Enter your phone number"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#0f172a', outline: 'none' }}
                />
              </div>
              
              {hasDesignation && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Designation</label>
                  <SearchableSelect 
                    value={designation} 
                    onChange={(e: any) => setDesignation(e.target.value)}
                    style={{ 
                      width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', 
                      fontSize: '14px', color: '#0f172a', outline: 'none', appearance: 'none', backgroundColor: '#fff',
                      backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3A%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3A%22292.4%22%20height%3A%22292.4%22%3E%3Cpath%20fill%3A%22%23475569%22%20d%3A%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', 
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px top 50%', backgroundSize: '12px auto' 
                    }}
                  >
                    <option value="" disabled>Select Designation</option>
                    {user?.user_metadata?.profession === 'Company' ? (
                      <>
                        <option value="HR">HR</option>
                        <option value="Trainer">Trainer</option>
                        <option value="Manager">Manager</option>
                        <option value="Team Lead">Team Lead</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Recruiter">Recruiter</option>
                      </>
                    ) : (
                      <>
                        <option value="Lecturer">Lecturer</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Professor">Professor</option>
                        <option value="Senior Professor">Senior Professor</option>
                        <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                        <option value="Dean">Dean</option>
                        <option value="Course Coordinator">Course Coordinator</option>
                        <option value="Teaching Assistant">Teaching Assistant</option>
                      </>
                    )}
                  </SearchableSelect>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={onClose}
            style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#475569', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#ffffff', backgroundColor: '#3b82f6', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
