import { useState } from 'react';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(firstName, lastName, username, password, confirmPassword);
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
        name=""
        id=""
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />

      <label>Confirm password:</label>
      <input
        type="password"
        name=""
        id=""
        onChange={(e) => setConfirmPassword(e.target.value)}
        value={confirmPassword}
      />

      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
