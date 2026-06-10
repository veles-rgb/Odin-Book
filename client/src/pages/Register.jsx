import { useState } from 'react';
import { useRegister } from '../hooks/useRegister';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { registerUser, error, isLoading } = useRegister();

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const showPasswordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) return;

    await registerUser(firstName, lastName, username, password);
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h3>Register</h3>

      <label>First name:</label>
      <input
        type="text"
        onChange={(e) => setFirstName(e.target.value)}
        value={firstName}
      />

      <label>Last name:</label>
      <input
        type="text"
        onChange={(e) => setLastName(e.target.value)}
        value={lastName}
      />

      <label>Username:</label>
      <input
        type="text"
        onChange={(e) => setUsername(e.target.value)}
        value={username}
      />

      <label>Password:</label>
      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />

      <label>Confirm password:</label>
      <input
        type="password"
        onChange={(e) => setConfirmPassword(e.target.value)}
        value={confirmPassword}
        className={
          showPasswordMismatch
            ? 'input-error'
            : passwordsMatch
              ? 'input-success'
              : ''
        }
      />

      {showPasswordMismatch && (
        <div className="error">Passwords do not match.</div>
      )}

      {passwordsMatch && <div className="success">✓ Passwords match</div>}

      <button
        type="submit"
        disabled={
          isLoading ||
          !password ||
          !confirmPassword ||
          password !== confirmPassword
        }
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>

      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default Register;
