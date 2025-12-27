import { useState } from "react";
import Signup from "./Signup";
import "../styles/Home.css"; 

const Home = () => {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="home-page">
      {showSignup ? (
        <div className="signup-wrapper">
          <Signup />
          <button 
            className="btn-outline" 
            onClick={() => setShowSignup(false)}
          >
            ← Back
          </button>
        </div>
      ) : (
        <div className="hero">
          <h1 className="hero-title">
            Learn Without Limits, <span>Think Global</span>
          </h1>

          <p className="hero-subtitle">
            A comprehensive learning management system with role-based access,
            course management, community forums, and verified certificates.
            Transform your learning experience today.
          </p>

          <div className="hero-buttons">
            <button
              className="btn-primary"
              onClick={() => setShowSignup(true)}
            >
              ⚡ Start Learning Free
            </button>

            <button
              className="btn-outline"
              onClick={() => window.location.href = "/courses"}
            >
              Explore Courses
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
