import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRegister } from '../hooks/useRegister';
import IsLoading from '../components/IsLoading';

const Register = () => {
  const { registerUser, error, isLoading } = useRegister();

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
        /^[a-zA-O0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
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
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    await registerUser(
      data.first_name,
      data.last_name,
      data.username,
      data.password,
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="register-form">
      <h3>Register</h3>

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

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>

      {error && <div className="register-error">{error}</div>}
      {isLoading && <IsLoading message="Creating account..." />}
    </form>
  );
};

export default Register;
