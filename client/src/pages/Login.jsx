import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useLogin } from '../hooks/useLogin';
import IsLoading from '../components/IsLoading';

const schema = yup.object({
  username: yup.string().trim().required('Username is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const { loginUser, error, isLoading } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data) => {
    await loginUser(data.username, data.password);
  };

  return (
    <>
      {isLoading && <IsLoading message="Logging in..." />}

      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <h3>Login</h3>

        <div className="login-username-container">
          <label>Username:</label>

          <input type="text" placeholder="johndoe" {...register('username')} />

          <div className="login-error">{errors.username?.message}</div>
        </div>

        <div className="login-password-container">
          <label>Password:</label>

          <input type="password" {...register('password')} />

          <div className="login-error">{errors.password?.message}</div>
        </div>

        {error && <div className="login-server-error">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="login-submit-button"
        >
          Login
        </button>
        <p>
          Don't have an account?{' '}
          <a href="/register" style={{ color: 'var(--color-brand)' }}>
            Register
          </a>
        </p>
      </form>
    </>
  );
};

export default Login;
