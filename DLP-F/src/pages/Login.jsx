// // src/pages/LoginPage.jsx
// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import "./Login.css";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState({});

//   const validate = () => {
//     const newErrors = {};

//     if (!email) {
//       newErrors.email = "Email is required";
//     } else if (!/^\S+@\S+\.\S+$/.test(email)) {
//       newErrors.email = "Enter a valid email address";
//     }

//     if (!password) {
//       newErrors.password = "Password is required";
//     } else if (password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     // For now just log, no real authentication
//     console.log("Login form submitted:", { email, password });
//   };

//   return (
//     <div className="login-root">
//       <div className="login-card">
//         <div className="login-header">
//           <h1 className="login-title">Daily Learning Planner</h1>
//           <p className="login-subtitle">
//             Sign in to track your goals and daily study progress.
//           </p>
//         </div>

//         <form className="login-form" onSubmit={handleSubmit} noValidate>
//           {/* Email field */}
//           <div className="form-group">
//             <label htmlFor="email" className="form-label">
//               Email
//             </label>
//             <div className="input-wrapper">
//               {/* <span className="input-icon" aria-hidden="true">
//                 ✉️
//               </span> */}
//               <input
//                 id="email"
//                 type="email"
//                 className={`form-input ${errors.email ? "has-error" : ""}`}
//                 placeholder="you@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             {errors.email && <p className="error-text">{errors.email}</p>}
//           </div>

//           {/* Password field */}
//           <div className="form-group">
//             <label htmlFor="password" className="form-label">
//               Password
//             </label>
//             <div className="input-wrapper">
//               {/* <span className="input-icon" aria-hidden="true">
//                 🔒
//               </span> */}
//               <input
//                 id="password"
//                 type="password"
//                 className={`form-input ${errors.password ? "has-error" : ""}`}
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//             {errors.password && (
//               <p className="error-text">{errors.password}</p>
//             )}
//           </div>

//           {/* Login button */}
//           <button type="submit" className="login-button">
//             Login
//           </button>
//         </form>

//         <div className="login-footer">
//           <p className="helper-text">
//             New here?{" "}
//             <Link to="/register" className="register-link">
//               Create an account
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }





// PRODUCTION


// src/pages/LoginPage.jsx
// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "./Login.css";

// const API_BASE = "https://dailylearningplan.onrender.com/api";

// export default function Login() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [errors, setErrors] = useState({});
//   const [serverError, setServerError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const validate = () => {
//     const newErrors = {};

//     if (!email) {
//       newErrors.email = "Email is required";
//     } else if (!/^\S+@\S+\.\S+$/.test(email)) {
//       newErrors.email = "Please enter a valid email";
//     }

//     if (!password) {
//       newErrors.password = "Password is required";
//     } else if (password.length < 2) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setServerError("");

//     if (!validate()) return;

//     try {
//       setLoading(true);

//       const res = await fetch(`${API_BASE}/login/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         // Adjust keys if your backend expects different names
//         body: JSON.stringify({ email, password }),
//         credentials: "include", // if you use session auth / cookies
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         setServerError(
//           data.detail ||
//             data.error ||
//             "Login failed. Please check your credentials."
//         );
//         return;
//       }

//       const data = await res.json().catch(() => ({}));

//       // If backend returns a token, you can store it:
//       if (data.token) {
//         localStorage.setItem("authToken", data.token);
//       }

//       // You can also store basic user info if returned
//       if (data.user) {
//         localStorage.setItem("userInfo", JSON.stringify(data.user));
//       }

//       navigate("/dashboard");
//     } catch (err) {
//       console.error("Login error:", err);
//       setServerError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-root">
//       <div className="login-card">
//         <div className="login-header">
//           <h1 className="login-title">Daily Learning Planner</h1>
//           <p className="login-subtitle">
//             Sign in to track your goals and daily study progress.
//           </p>
//         </div>

//         {serverError && <p className="error-text server-error">{serverError}</p>}

//         <form className="login-form" onSubmit={handleSubmit} noValidate>
//           {/* Email */}
//           <div className="form-group">
//             <label htmlFor="email" className="form-label">
//               Email
//             </label>
//             <div className="input-wrapper">
//               <input
//                 id="email"
//                 type="email"
//                 className={`form-input ${errors.email ? "has-error" : ""}`}
//                 placeholder="you@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             {errors.email && <p className="error-text">{errors.email}</p>}
//           </div>

//           {/* Password */}
//           <div className="form-group">
//             <label htmlFor="password" className="form-label">
//               Password
//             </label>
//             <div className="input-wrapper">
//               <input
//                 id="password"
//                 type="password"
//                 className={`form-input ${errors.password ? "has-error" : ""}`}
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//             {errors.password && (
//               <p className="error-text">{errors.password}</p>
//             )}
//           </div>

//           {/* Login button */}
//           <button type="submit" className="login-button" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <div className="login-footer">
//           <p className="helper-text">
//             New here?{" "}
//             <Link to="/register" className="register-link">
//               Create an account
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }



// PRODUCTION WITH COOKIE

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

// const API_BASE = "https://dailylearningplan.onrender.com/api";
// const API_BASE="http://127.0.0.1:8000/api"
// export const API_BASE = "/api";
export const API_BASE = "https://dailylearningplan.onrender.com/api";



export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 2) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // your Django view expects { email, password }
        body: JSON.stringify({ email, password }),
        credentials: "include", // important: lets browser store auth_token cookie
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(
          data.detail ||
            data.error ||
            "Login failed. Please check your credentials."
        );
        return;
      }

      const data = await res.json().catch(() => ({}));
      // data from backend: { message, user_id, name, token }

      // We DON'T need to store the token, it's in an HttpOnly cookie already.
      // Just store basic user info for display & "logged in" check.
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          id: data.user_id,
          name: data.name || "Learner",
          email: email, // backend doesn't send email, so we reuse the one we submitted
        })
      );

      // No authToken in localStorage, we're going cookie-only:
      // localStorage.setItem("authToken", data.token); // ❌ not needed

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Daily Learning Planner</h1>
          <p className="login-subtitle">
            Sign in to track your goals and daily study progress.
          </p>
        </div>

        {serverError && (
          <p className="error-text server-error">{serverError}</p>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? "has-error" : ""}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type="password"
                className={`form-input ${errors.password ? "has-error" : ""}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errors.password && (
              <p className="error-text">{errors.password}</p>
            )}
          </div>

          {/* Login button */}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <p className="helper-text">
            New here?{" "}
            <Link to="/register" className="register-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
