import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../utils/api';
import './UploadVideo.css';

const UploadVideo = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    role: 'consumer'
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('role', form.role);
      formData.append('video', file);

      const res = await videoAPI.uploadVideo(formData);
      setMsg('Video uploaded successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter video title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Enter video description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Account Type</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="consumer">Consumer</option>
            <option value="creator">Creator</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="video">Video File</label>
          <input
            type="file"
            id="video"
            name="video"
            accept="video/*"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
};

export default UploadVideo;
