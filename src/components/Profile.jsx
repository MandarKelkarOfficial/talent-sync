import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FaceCapture from './FaceCapture';
import '../assets/css/Profile.css';

const Profile = ({ onProfileUpdated }) => {
  const { user: authUser, setUser } = useAuth();
  const navigate = useNavigate();


  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000"

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    pincode: '',
    birthdate: '',
    gender: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text: '...' }
  const [isEditing, setIsEditing] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [uploadingFace, setUploadingFace] = useState(false);

  // store the current object URL so we can revoke it to avoid leaks
  const currentObjectUrl = useRef(null);
  const msgTimeoutRef = useRef(null);

  useEffect(() => {
    if (authUser) {
      setForm({
        name: authUser.name || '',
        email: authUser.email || '',
        mobile: authUser.phoneNumber || '',
        address: authUser.address || '',
        pincode: authUser.pincode || '',
        birthdate: authUser.dateOfBirth ? new Date(authUser.dateOfBirth).toISOString().split('T')[0] : '',
        gender: authUser.gender || ''
      });

      // *** INTEGRATION CHANGE 1: Correctly set the avatar URL ***
      // If the user's face is verified, construct the URL to the dedicated image endpoint.
      // Otherwise, fall back to the manually uploaded avatarUrl.
     
      if (authUser.faceVerified) {
        setAvatarPreview(`${serverUrl}/api/face-profile/${authUser._id}/image`);
      } else {
        setAvatarPreview(authUser.avatarUrl || '');

      }
    }
    // cleanup on unmount
    return () => {
      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
        currentObjectUrl.current = null;
      }
      if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);
    };
  }, [authUser]);

  // helper to show messages and auto-clear
  const showMessage = (m) => {
    setMsg(m);
    if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);
    msgTimeoutRef.current = setTimeout(() => setMsg(null), 5000);
  };

  const handleChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleAvatarSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate file size (5MB)
    if (f.size > 5 * 1024 * 1024) {
      showMessage({ type: 'error', text: 'File size too large. Please select an image under 5MB.' });
      return;
    }

    // Validate file type
    if (!f.type.startsWith('image/')) {
      showMessage({ type: 'error', text: 'Please select a valid image file.' });
      return;
    }

    // revoke previous preview if it was an object URL
    if (currentObjectUrl.current) {
      try { URL.revokeObjectURL(currentObjectUrl.current); } catch (e) { }
      currentObjectUrl.current = null;
    }

    const url = URL.createObjectURL(f);
    currentObjectUrl.current = url;
    setAvatarFile(f);
    setAvatarPreview(url);
    setMsg(null);
  };

  // called by FaceCapture component with a Blob (or File)
  const handleFaceCapture = async (faceBlob) => {
    setUploadingFace(true);
    setShowFaceCapture(false);
    try {
      if (!authUser || !authUser._id) throw new Error('Not authenticated');

      const formData = new FormData();
      // face capture upload
      formData.append('faceImage', faceBlob, 'face-capture.jpg');
      formData.append('studentId', authUser._id);

      const response = await axios.post('/api/face-profile/capture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.success) {
        // *** INTEGRATION CHANGE 2: Update state after successful face capture ***

        // The new, persistent URL for the captured face image.
        // Appending a timestamp busts the browser cache, ensuring the new image is shown immediately.
        const newAvatarUrl = `/api/face-profile/${authUser._id}/image?t=${new Date().getTime()}`;

        setAvatarPreview(newAvatarUrl); // Update the preview to use the server endpoint.
        setAvatarFile(faceBlob); // Keep the blob for the manual "Save Changes" logic.

        // Update the global user state with the correct URL and verified status.
        if (setUser && authUser) {
          setUser({ ...authUser, faceVerified: true, avatarUrl: newAvatarUrl });
        }

        // Clean up any old temporary blob URLs to prevent memory leaks.
        if (currentObjectUrl.current) {
          try { URL.revokeObjectURL(currentObjectUrl.current); } catch (e) { }
          currentObjectUrl.current = null;
        }

        showMessage({ type: 'success', text: 'Face captured successfully! This will be your profile picture.' });
      } else {
        throw new Error(response.data?.message || 'Failed to save face data');
      }
    } catch (err) {
      console.error('Face capture error:', err);
      showMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to capture face image' });
    } finally {
      setUploadingFace(false);
    }
  };

  const isEmailVerified = authUser?.isVerified || false;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      if (!authUser || !authUser._id) throw new Error('Not authenticated');

      const payload = {
        mobile: form.mobile?.trim(),
        address: form.address?.trim(),
        pincode: form.pincode?.trim()
      };

      const profileResponse = await axios.patch(`/api/auth/profile/${authUser._id}`, payload);

      // upload avatar (either file from file input or face capture blob)
      if (avatarFile) {
        const fd = new FormData();
        // avatarFile might be a Blob without a name — provide fallback name
        fd.append('avatar', avatarFile, avatarFile.name || 'profile-image.jpg');

        try {
          const avatarRes = await axios.post(`/api/auth/profile/${authUser._id}/avatar`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          // if server returns updated avatar URL, merge it into user
          if (avatarRes.data?.user) {
            // prefer server user
            if (setUser) setUser(avatarRes.data.user);
          } else if (avatarRes.data?.avatarUrl && setUser) {
            setUser(prev => ({ ...(prev || {}), avatarUrl: avatarRes.data.avatarUrl }));
          }
        } catch (avatarError) {
          console.warn('Avatar upload failed, but profile was updated:', avatarError);
          showMessage({ type: 'error', text: 'Profile saved but avatar upload failed.' });
        }
      }

      // update context from profile response if provided
      if (setUser && profileResponse.data?.user) {
        setUser(profileResponse.data.user);
      }

      showMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      if (typeof onProfileUpdated === 'function') onProfileUpdated();

      // clear local file reference
      setAvatarFile(null);
    } catch (err) {
      console.error('Profile save error', err);
      showMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (authUser) {
      setForm({
        name: authUser.name || '',
        email: authUser.email || '',
        mobile: authUser.phoneNumber || '',
        address: authUser.address || '',
        pincode: authUser.pincode || '',
        birthdate: authUser.dateOfBirth ? new Date(authUser.dateOfBirth).toISOString().split('T')[0] : '',
        gender: authUser.gender || ''
      });
    }
    if (currentObjectUrl.current) {
      try { URL.revokeObjectURL(currentObjectUrl.current); } catch (e) { }
      currentObjectUrl.current = null;
    }
    setAvatarFile(null);
    setAvatarPreview(authUser?.avatarUrl || '');
    setIsEditing(false);
    setMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-indigo-100 mt-2">Manage your personal information and profile picture</p>
        </div>

        <div className="p-6">
          {/* Avatar + basic info */}
          <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-gray-100">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden flex items-center justify-center shadow-lg">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="avatar" className="object-cover w-full h-full" />
                ) : (
                  <div className="text-indigo-600 font-bold text-2xl">
                    {form.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* Controls near avatar */}
              <div className="absolute -bottom-1 -right-1 flex gap-2">
                <label className="bg-white hover:bg-indigo-50 text-indigo-600 rounded-full p-2 shadow-md cursor-pointer transition-all duration-300 hover:scale-110">
                  <button
                    onClick={() => setShowFaceCapture(true)}
                    disabled={loading || uploadingFace}
                    title="Capture with camera"
                    hidden
                  >
                  </button>

                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>

              {uploadingFace && (
                <div className="absolute inset-0 bg-blur bg-opacity-40 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                <h2 className="text-2xl font-bold text-gray-800">{form.name || 'Your Name'}</h2>
                <div className="flex flex-wrap gap-2">
                  {isEmailVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293A1 1 0 006.293 10.707l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Email Verified
                    </span>
                  )}
                  {authUser?.faceVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Face Verified
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mt-1">{authUser?.role || 'Student'}</p>
              <p className="text-gray-500 text-sm mt-2">{form.email}</p>

              <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  Back to Dashboard
                </button>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <input
                    name="name"
                    value={form.name}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed pr-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Name is read-only. Contact support to change it.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    name="email"
                    value={form.email}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed pr-10"
                  />
                </div>
                <div className="flex items-center mt-2">
                  {isEmailVerified ? (
                    <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Email verified
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Not verified</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DOB</label>
                <div className="relative">
                  <input
                    name="birthdate"
                    value={form.birthdate}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed pr-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Birthdate is read-only. Contact support to change it.</p>
              </div>


            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 disabled:bg-gray-50"
                  placeholder="Enter your mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <input
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 disabled:bg-gray-50"
                  placeholder="Enter your gender"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 disabled:bg-gray-50"
                  placeholder="Enter your pincode"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                disabled={!isEditing || loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 disabled:bg-gray-50"
                rows={3}
                placeholder="Enter your full address"
              />
            </div>

            {/* Message */}
            {msg && (
              <div className={`rounded-lg p-4 ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'} transition-all duration-300 animate-fade-in`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <span className="text-sm">{msg.text}</span>
                  </div>
                  <button onClick={() => setMsg(null)} className="text-gray-400 hover:text-gray-600 ml-4">✕</button>
                </div>
              </div>
            )}

            {/* Save bar */}
            {isEditing && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading || uploadingFace}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading || uploadingFace}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                >
                  Cancel
                </button>

                {(avatarFile || uploadingFace) && (
                  <div className="flex items-center text-sm text-gray-600">
                    Profile picture will be updated
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Account info cards */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Member Since</p>
                    <p className="text-xs text-gray-500">
                      {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Account Status</p>
                    <p className="text-xs text-gray-500">
                      {authUser?.accountStatus || 'Active'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${authUser?.faceVerified ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${authUser?.faceVerified ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Face Verification</p>
                    <p className="text-xs text-gray-500">
                      {authUser?.faceVerified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Face Capture Modal */}
      <FaceCapture
        isOpen={showFaceCapture}
        onCapture={handleFaceCapture}
        onClose={() => setShowFaceCapture(false)}
      />


    </div>
  );
};

export default Profile;