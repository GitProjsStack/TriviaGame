'use client';

import { useRef, useState, useEffect } from 'react';
import {
    getAuthenticatedUser,
    getUSERProfile,
    uploadToUSERProfilePics,
    generateUSERProfilePicSignedUrl
} from '../../app/supabasefuncs/helperSupabaseFuncs';

import '../cssStyling/ProfilePicture.css';

export default function ProfilePicture() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [currentProfilePicPath, setCurrentProfilePicPath] = useState<string | null>(null);

    useEffect(() => {
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
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMsg(null);
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        if (file.size > 1048576) {
            setErrorMsg('File too large. Max 1MB allowed.');
            return;
        }

        const newPath = `${userId}/${Date.now()}-${file.name}`;
        const success = await uploadToUSERProfilePics(userId, newPath, file, currentProfilePicPath || undefined);

        if (!success) {
            setErrorMsg('Upload failed.');
            return;
        }

        const signedUrl = await generateUSERProfilePicSignedUrl(newPath);
        if (signedUrl) {
            setImageUrl(signedUrl);
            setCurrentProfilePicPath(newPath); // update current path
        }
    };

    return (
        <>
            <div
                className="profile-pic-upload clickable"
                onClick={() => fileInputRef.current?.click()}
            >
                {imageUrl ? (
                    <img src={imageUrl} alt="Profile" className="profile-pic-image" />
                ) : (
                    <div />
                )}
            </div>

            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleUpload}
            />

            {errorMsg && (
                <p style={{ color: 'red', marginTop: '0.5rem', fontWeight: '600' }}>{errorMsg}</p>
            )}
        </>
    );
}