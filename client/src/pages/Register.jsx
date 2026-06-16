import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRegister } from '../hooks/useRegister';
import IsLoading from '../components/IsLoading';
import { useState, useEffect } from 'react';
import axios from 'axios';

const DEFAULT_AVATAR =
  'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg';

const Register = () => {
  const { registerUser, error, isLoading } = useRegister();
  const [imageSelected, setImageSelected] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const schema = yup.object().shape({
    first_name: yup
      .string()
      .required('First name is required')
      .min(1, 'First name must be at least 1 characters')
      .max(20, 'First name cannot be longer than 20 characters'),
    last_name: yup
      .string()
      .required('Last name is required')
      .min(1, 'Last name must be at least 1 characters')
      .max(40, 'Last name cannot be longer than 40 characters'),
    username: yup
      .string()
      .trim()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters long')
      .max(20, 'Username cannot exceed 20 characters')
      .matches(
        /^[a-zA-Z0-9._]+$/,
        'Username can only contain letters, numbers, periods, and underscores',
      ),
    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .matches(/[a-z]/, 'Password must contain a lowercase letter')
      .matches(/[A-Z]/, 'Password must contain an uppercase letter')
      .matches(/[0-9]/, 'Password must contain a number'),
    confirm_password: yup
      .string()
      .required('Please confirm your password')
      .oneOf([yup.ref('password')], 'Passwords must match'),
    profile_picture_url: yup
      .string()
      .trim()
      .url('Profile picture must be a valid URL')
      .nullable()
      .transform((value) => (value === '' ? null : value)),
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const profilePictureUrl = useWatch({
    control,
    name: 'profile_picture_url',
  });

  const uploadImageToCloudinary = async () => {
    if (!imageSelected) return null;

    const imageData = new FormData();

    imageData.append('file', imageSelected);
    imageData.append('upload_preset', 'val-pfp');

    const response = await axios.post(
      'https://api.cloudinary.com/v1_1/dz4v29v5h/image/upload',
      imageData,
    );

    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
    };
  };

  const onSubmit = async (data) => {
    const uploadedImage = await uploadImageToCloudinary();

    await registerUser(
      data.first_name,
      data.last_name,
      data.username,
      data.password,
      uploadedImage?.url || data.profile_picture_url || null,
      uploadedImage?.publicId || null,
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setImageSelected(null);
      setImagePreview('');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    setImageSelected(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="register-form">
      <h3>Register</h3>

      <div className="avatarPreviewWrapper">
        <img
          src={imagePreview || profilePictureUrl || DEFAULT_AVATAR}
          alt=""
          className="avatarPreview"
        />
      </div>

      <div className="first_name_container">
        <label>First name</label>
        <input type="text" placeholder="John" {...register('first_name')} />
        <div className="register-error">{errors.first_name?.message}</div>
      </div>

      <div className="last_name_container">
        <label>Last name</label>
        <input type="text" placeholder="Doe" {...register('last_name')} />
        <div className="register-error">{errors.last_name?.message}</div>
      </div>

      <div className="username_container">
        <label>Username</label>
        <input type="text" placeholder="johndoe" {...register('username')} />
        <div className="register-error">{errors.username?.message}</div>
      </div>

      <div className="password_container">
        <label>Password</label>
        <input type="password" {...register('password')} />
        <div className="register-error">{errors.password?.message}</div>
      </div>

      <div className="confirm_password_container">
        <label>Confirm password</label>
        <input type="password" {...register('confirm_password')} />
        <div className="register-error">{errors.confirm_password?.message}</div>
      </div>

      <div>
        <h4 style={{ alignSelf: 'center' }}>Profile Picture</h4>
        <label>Upload image</label>
        <input
          id="profile-picture-file"
          type="file"
          accept="image/*"
          disabled={isLoading}
          onChange={handleImageChange}
        />
        <div style={{ alignSelf: 'center' }}>-- OR --</div>
        <label htmlFor="">image URL</label>
        <input
          id="profile-picture-url"
          type="url"
          disabled={isLoading}
          placeholder="https://example.com/avatar.jpg"
          {...register('profile_picture_url')}
        />

        <div className="register-error">
          {errors.profile_picture_url?.message}
        </div>
      </div>

      <button type="submit" disabled={isSubmitting || isLoading}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>

      {error && <div className="register-error">{error}</div>}
      {isLoading && <IsLoading message="Creating account..." />}
    </form>
  );
};

export default Register;
