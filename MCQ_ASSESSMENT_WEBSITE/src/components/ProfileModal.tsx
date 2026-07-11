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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.user_metadata?.full_name || '');
      setAvatarData(user.user_metadata?.avatar_url || null);
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
      const updates = {
        full_name: name,
        avatar_url: avatarData || undefined
      };
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
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#0f172a', outline: 'none' }}
            />
          </div>
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
