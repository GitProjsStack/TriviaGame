'use client';

import { useRef, useState, useEffect } from 'react';
import {
  getAuthenticatedUser,
  getUSERProfile,
  uploadToUSERProfilePics,
  generateUSERProfilePicSignedUrl
} from '../../app/supabasefuncs/helperSupabaseFuncs';

import '../cssStyling/ProfilePicture.css';

type Props = {
  src?: string | null;
  alt?: string;
  clickable?: boolean; // If true, clicking will trigger upload
};

// Sanitize filename: replace spaces with underscores and remove unsafe chars
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\s+/g, '_')       // replace spaces with underscores
    .replace(/[^\w.-]/g, '');   // remove characters other than letters, numbers, underscore, dot, dash
}

export default function ProfilePicture({ src, alt = 'User profile picture', clickable = false }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentProfilePicPath, setCurrentProfilePicPath] = useState<string | null>(null);

  useEffect(() => {
    if (src !== undefined) return; // Don't run if using passed-in src (display-only mode)

    async function fetchPic() {
      const user = await getAuthenticatedUser();
      if (!user) return;

      setUserId(user.id);

      const profile = await getUSERProfile(user.id);
      if (!profile) return;

      const profilePicPath = profile.profile_pic_url;
      if (profilePicPath) {
        setCurrentProfilePicPath(profilePicPath);
        const signedUrl = await generateUSERProfilePicSignedUrl(profilePicPath);
        if (signedUrl) setImageUrl(signedUrl);
      }
    }

    fetchPic();
  }, [src]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 1048576) {
      setErrorMsg('File too large. Max 1MB allowed.');
      return;
    }

    const safeFileName = sanitizeFilename(file.name);
    const newPath = `${userId}/${Date.now()}-${safeFileName}`;

    const success = await uploadToUSERProfilePics(userId, newPath, file, currentProfilePicPath || undefined);

    if (!success) {
      setErrorMsg('Upload failed.');
      return;
    }

    const signedUrl = await generateUSERProfilePicSignedUrl(newPath);
    if (signedUrl) {
      setImageUrl(signedUrl);
      setCurrentProfilePicPath(newPath);
    }
  };

  const finalSrc = src ?? imageUrl;

  return (
    <>
      <div
        className="profile-pic-upload clickable"
        onClick={() => clickable && fileInputRef.current?.click()}
      >
        {finalSrc ? (
          <img src={finalSrc} alt={alt} className="profile-pic-image" />
        ) : (
          <div className="profile-placeholder">👤</div>
        )}
      </div>

      {clickable && (
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleUpload}
        />
      )}

      {errorMsg && (
        <p style={{ color: 'red', marginTop: '0.5rem', fontWeight: '600' }}>{errorMsg}</p>
      )}
    </>
  );
}