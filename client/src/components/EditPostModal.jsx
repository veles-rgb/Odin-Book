import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';

import { useApiFetch } from '../hooks/useApiFetch';
import { useAuthContext } from '../hooks/useAuthContext';
import { FaRegImage } from 'react-icons/fa';

const schema = yup.object({
  content: yup
    .string()
    .trim()
    .required('Post content cannot be blank.')
    .max(2000, 'Post cannot be longer than 2000 characters.'),
});

const EditPostModal = ({ post, onClose, onPostEdited }) => {
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const [imageSelected, setImageSelected] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);

  const { user } = useAuthContext();
  const { apiFetch } = useApiFetch();

  const userOwnsPost = user.id === post.user_id;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      content: post.content || '',
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
      setIsLoading(true);
      setServerError(null);

      if (!userOwnsPost) {
        setServerError('You cannot edit this post.');
        return;
      }

      const confirmed = window.confirm(
        'Are you sure you want to edit this post?',
      );

      if (!confirmed) return;

      const uploadedImage = await uploadImageToCloudinary();

      const finalMediaUrl = removeImage
        ? null
        : uploadedImage?.url || post.media_url || null;

      const finalMediaPublicId = removeImage
        ? null
        : uploadedImage?.publicId || post.media_public_id || null;

      const response = await apiFetch(`/api/post/edit/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          content: formData.content.trim(),
          media_url: finalMediaUrl,
          media_public_id: finalMediaPublicId,
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || 'Failed to edit post.');
        return;
      }

      onPostEdited?.(data.post);
      onClose();
    } catch {
      setServerError('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setRemoveImage(false);
    setImageSelected(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageSelected(null);
    setImagePreview('');
    setRemoveImage(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3>Edit Post</h3>

          <textarea
            placeholder="What's on your mind?"
            disabled={isLoading}
            {...register('content')}
          />

          <div className="post-upload-actions">
            <button
              type="button"
              className="image-upload-button"
              onClick={handleImageIconClick}
              disabled={isLoading}
            >
              <FaRegImage />
              <span>{post.media_url ? 'Change image' : 'Add image'}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </div>

          {(imagePreview || (!removeImage && post.media_url)) && (
            <div className="post-image-preview-wrapper">
              <img
                src={imagePreview || post.media_url}
                alt="Post preview"
                className="post-image-preview"
              />

              <button
                type="button"
                className="remove-image-button dangerButton"
                onClick={handleRemoveImage}
                disabled={isLoading}
              >
                Remove image
              </button>
            </div>
          )}

          <div className="modal-error">{errors.content?.message}</div>

          {serverError && <div className="modal-error">{serverError}</div>}

          <div className="modal-actions">
            <button type="submit" disabled={isLoading} className="actionButton">
              {isLoading ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cancelButton"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body,
  );
};

export default EditPostModal;
