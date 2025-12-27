import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useState } from "react";
import "../styles/Auth.css"; // make sure this has .auth-box styles

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/signup", {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
      });

      setSuccess(res.data.message);
      setError("");

      // Redirect to login after 1s
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-box">
      <h2>Create Account</h2>
      <form onSubmit={submit}>
        <input name="name" placeholder="Full Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit" className="btn-primary">Sign Up</button>
      </form>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
    </div>
  );
};

export default Signup;
