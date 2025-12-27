import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useState } from "react";
import "../styles/Auth.css"; // optional for styling

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const login = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/login", {
        email: e.target.email.value,
        password: e.target.password.value,
      });

      // Store user info in localStorage (no JWT)
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);

      // Redirect based on role
      if (res.data.role === "admin") navigate("/admin");
      else navigate("/"); // normal user

    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  const logout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  // If user is logged in, show logout button
  if (role && name) {
    return (
      <div className="auth-box">
        <h2>Welcome, {name}!</h2>
        <button className="btn-primary" onClick={logout}>Logout</button>
      </div>
    );
  }

  // Otherwise, show login form
  return (
    <div className="auth-box">
      <h2>Login</h2>
      <form onSubmit={login}>
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button className="btn-primary">Login</button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default Login;
