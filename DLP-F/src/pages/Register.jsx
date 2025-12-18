// // src/pages/RegisterPage.jsx
// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import "./Register.css";

// export default function Register() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const validate = () => {
//     const newErrors = {};

//     if (!form.name) newErrors.name = "Name is required";

//     if (!form.email) newErrors.email = "Email is required";
//     else if (!/^\S+@\S+\.\S+$/.test(form.email))
//       newErrors.email = "Enter a valid email";

//     if (!form.password) newErrors.password = "Password is required";
//     else if (form.password.length < 6)
//       newErrors.password = "Password must be at least 6 characters";

//     if (!form.confirmPassword)
//       newErrors.confirmPassword = "Confirm password is required";
//     else if (form.confirmPassword !== form.password)
//       newErrors.confirmPassword = "Passwords do not match";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     console.log("Register form submitted:", form);
//   };

//   return (
//     <div className="register-root">
//       <div className="register-card">
//         <div className="register-header">
//           <h1 className="register-title">Create an Account</h1>
//           <p className="register-subtitle">Join Daily Learning Planner</p>
//         </div>

//         <form className="register-form" onSubmit={handleSubmit} noValidate>
//           {/* Name */}
//           <div className="form-group">
//             <label className="form-label">Full Name</label>
//             <input
//               type="text"
//               name="name"
//               placeholder="Your full name"
//               className={`form-input ${errors.name ? "has-error" : ""}`}
//               value={form.name}
//               onChange={handleChange}
//             />
//             {errors.name && <p className="error-text">{errors.name}</p>}
//           </div>

//           {/* Email */}
//           <div className="form-group">
//             <label className="form-label">Email</label>
//             <input
//               type="email"
//               name="email"
//               placeholder="you@example.com"
//               className={`form-input ${errors.email ? "has-error" : ""}`}
//               value={form.email}
//               onChange={handleChange}
//             />
//             {errors.email && <p className="error-text">{errors.email}</p>}
//           </div>

//           {/* Password */}
//           <div className="form-group">
//             <label className="form-label">Password</label>
//             <input
//               type="password"
//               name="password"
//               placeholder="Create password"
//               className={`form-input ${errors.password ? "has-error" : ""}`}
//               value={form.password}
//               onChange={handleChange}
//             />
//             {errors.password && (
//               <p className="error-text">{errors.password}</p>
//             )}
//           </div>

//           {/* Confirm Password */}
//           <div className="form-group">
//             <label className="form-label">Confirm Password</label>
//             <input
//               type="password"
//               name="confirmPassword"
//               placeholder="Re-enter password"
//               className={`form-input ${
//                 errors.confirmPassword ? "has-error" : ""
//               }`}
//               value={form.confirmPassword}
//               onChange={handleChange}
//             />
//             {errors.confirmPassword && (
//               <p className="error-text">{errors.confirmPassword}</p>
//             )}
//           </div>

//           {/* Register button */}
//           <button type="submit" className="register-button">
//             Register
//           </button>
//         </form>

//         <div className="register-footer">
//           <p className="helper-text">
//             Already have an account?{" "}
//             <Link to="/login" className="login-link">
//               Login
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }







// PRODUCTION

// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

// const API_BASE = "https://dailylearningplan.onrender.com/api";
// const API_BASE="http://127.0.0.1:8000/api"
// export const API_BASE = "/api";
export const API_BASE = "https://dailylearningplan.onrender.com/api";



export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name) newErrors.name = "Name is required";

    if (!form.email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Please enter a valid email";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    else if (form.confirmPassword !== form.password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Adjust keys according to your Django view/serializer
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(
          data.detail || data.error || "Registration failed. Try again."
        );
        return;
      }

      // If you want to use response:
      // const data = await res.json();

      // After successful registration, go to login
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-root">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Create your account</h1>
          <p className="register-subtitle">
            Start planning your daily learning in minutes.
          </p>
        </div>

        {serverError && (
          <p className="error-text server-error">{serverError}</p>
        )}

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <div className="input-wrapper">
              <input
                id="name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? "has-error" : ""}`}
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? "has-error" : ""}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <input
                id="password"
                name="password"
                type="password"
                className={`form-input ${errors.password ? "has-error" : ""}`}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            {errors.password && (
              <p className="error-text">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`form-input ${
                  errors.confirmPassword ? "has-error" : ""
                }`}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="register-footer">
          <p className="helper-text">
            Already have an account?{" "}
            <Link to="/login" className="login-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
