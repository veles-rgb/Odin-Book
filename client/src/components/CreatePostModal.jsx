import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';

import { useApiFetch } from '../hooks/useApiFetch';
import { FaRegImage } from 'react-icons/fa';

const schema = yup.object({
  content: yup
    .string()
    .trim()
    .required('Post content cannot be blank.')
    .max(2000, 'Post cannot be longer than 2000 characters.'),
});

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const [postIsLoading, setPostIsLoading] = useState(false);
  const [postError, setPostError] = useState(null);

  const fileInputRef = useRef(null);
  const [imageSelected, setImageSelected] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const { apiFetch } = useApiFetch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      content: '',
    },
  });

  useEffect(() => {
    if (!imagePreview) return;

    return () => {
      URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const uploadImageToCloudinary = async () => {
    if (!imageSelected) return null;

    const imageData = new FormData();

    imageData.append('file', imageSelected);
    imageData.append('upload_preset', 'vel-media');

    const response = await axios.post(
      'https://api.cloudinary.com/v1_1/dz4v29v5h/image/upload',
      imageData,
    );

    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
    };
  };

  const onSubmit = async (formData) => {
    try {
      setPostIsLoading(true);
      setPostError(null);

      const uploadedImage = await uploadImageToCloudinary();

      const response = await apiFetch('/api/post/create', {
        method: 'POST',
        body: JSON.stringify({
          content: formData.content.trim(),
          media_url: uploadedImage?.url || null,
          media_public_id: uploadedImage?.publicId || null,
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setPostError(data.error || 'Failed to create post.');
        return;
      }

      onPostCreated?.(data.post);

      reset();
      setImageSelected(null);
      setImagePreview('');

      onClose();
    } catch {
      setPostError('Something went wrong.');
    } finally {
      setPostIsLoading(false);
    }
  };

  const handleImageIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setImageSelected(null);
      setImagePreview('');
      return;
    }

    setImageSelected(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageSelected(null);
    setImagePreview('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3>Create a new post</h3>

          <textarea
            placeholder="What do you have in mind?"
            disabled={postIsLoading}
            {...register('content')}
          />

          <div className="post-upload-actions">
            <button
              type="button"
              className="image-upload-button"
              onClick={handleImageIconClick}
              disabled={postIsLoading}
            >
              <FaRegImage />
              <span>Add image</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </div>

          {imagePreview && (
            <div className="post-image-preview-wrapper">
              <img
                src={imagePreview}
                alt="Selected post preview"
                className="post-image-preview"
              />

              <button
                type="button"
                className="remove-image-button"
                onClick={handleRemoveImage}
                disabled={postIsLoading}
              >
                Remove image
              </button>
            </div>
          )}

          <div className="modal-error">{errors.content?.message}</div>

          {postError && <div className="modal-error">{postError}</div>}

          <div className="modal-actions">
            <button type="submit" disabled={postIsLoading}>
              {postIsLoading ? 'Posting...' : 'Post'}
            </button>

            <button type="button" disabled={postIsLoading} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body,
  );
};

export default CreatePostModal;
