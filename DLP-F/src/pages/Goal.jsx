// // src/pages/GoalForm.jsx
// import React, { useState } from "react";
// import "./Goal.css";

// export default function Goal() {
//   const [goal, setGoal] = useState({
//     title: "",
//     description: "",
//     deadline: "",
//     total_hours: "",
//   });

//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     setGoal({ ...goal, [e.target.name]: e.target.value });
//   };

//   const validate = () => {
//     const newErrors = {};
//     if (!goal.title) newErrors.title = "Goal title is required";
//     if (!goal.deadline) newErrors.deadline = "Deadline is required";
//     if (!goal.total_hours) newErrors.total_hours = "Total hours required";
//     else if (goal.total_hours < 1)
//       newErrors.total_hours = "Hours must be a positive number";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     console.log("Goal created:", goal);
//   };

//   return (
//     <div className="goal-root">
//       <div className="goal-card">
//         <h1 className="goal-title">Create Learning Goal</h1>
//         <p className="goal-subtitle">
//           Add your learning objectives and track progress easily.
//         </p>

//         <form className="goal-form" onSubmit={handleSubmit} noValidate>
//           {/* Title */}
//           <div className="form-group">
//             <label className="form-label">Goal Title</label>
//             <input
//               type="text"
//               name="title"
//               placeholder="e.g., Learn JavaScript"
//               className={`form-input ${errors.title ? "has-error" : ""}`}
//               value={goal.title}
//               onChange={handleChange}
//             />
//             {errors.title && <p className="error-text">{errors.title}</p>}
//           </div>

//           {/* Description */}
//           <div className="form-group">
//             <label className="form-label">Description</label>
//             <textarea
//               name="description"
//               placeholder="Write a short description..."
//               className="form-textarea"
//               value={goal.description}
//               onChange={handleChange}
//             />
//           </div>

//           {/* Deadline */}
//           <div className="form-group">
//             <label className="form-label">Deadline</label>
//             <input
//               type="date"
//               name="deadline"
//               className={`form-input ${errors.deadline ? "has-error" : ""}`}
//               value={goal.deadline}
//               onChange={handleChange}
//             />
//             {errors.deadline && <p className="error-text">{errors.deadline}</p>}
//           </div>

//           {/* Total Hours */}
//           <div className="form-group">
//             <label className="form-label">Total Hours Needed</label>
//             <input
//               type="number"
//               name="total_hours"
//               placeholder="e.g., 20"
//               className={`form-input ${
//                 errors.total_hours ? "has-error" : ""
//               }`}
//               value={goal.total_hours}
//               onChange={handleChange}
//             />
//             {errors.total_hours && (
//               <p className="error-text">{errors.total_hours}</p>
//             )}
//           </div>

//           {/* Submit Button */}
//           <button type="submit" className="goal-button">
//             Save Goal
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }




// GOAL


// src/pages/GoalForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Goal.css";

// const API_BASE = "https://dailylearningplan.onrender.com/api";
// const API_BASE="http://127.0.0.1:8000/api"
// export const API_BASE = "/api";
export const API_BASE = "https://dailylearningplan.onrender.com/api";



export default function Goal() {
  const navigate = useNavigate();

  const [goal, setGoal] = useState({
    title: "",
    description: "",
    deadline: "",
    total_hours: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setGoal({ ...goal, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!goal.title) newErrors.title = "Title is required";
    if (!goal.description) newErrors.description = "Description is required";
    if (!goal.deadline) newErrors.deadline = "Deadline is required";
    if (!goal.total_hours) {
      newErrors.total_hours = "Total hours is required";
    } else if (isNaN(Number(goal.total_hours))) {
      newErrors.total_hours = "Total hours must be a number";
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

      const payload = {
        title: goal.title,
        description: goal.description,
        deadline: goal.deadline, // make sure format matches backend (e.g. "YYYY-MM-DD")
        total_hours: Number(goal.total_hours),
      };

      const res = await fetch(`${API_BASE}/goals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If using token auth:
          // Authorization: `Token ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message =
        data.detail || data.error || "The Mentioned Goal Title is already Exists";

      setServerError(message);
      alert(message); // 👈 show in alert box
        return;
      }

      // const data = await res.json();
      // Optionally use `data`

      // After save, go to dashboard or goals list
      navigate("/dashboard");
    }catch (err) {
    console.error("Goal create error:", err);
    const message = "Something went wrong. Please try again.";
    setServerError(message);
    alert(message); // 👈 also show alert on network error
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="goal-root">
      <div className="goal-card">
        <div className="goal-header">
          <h1 className="goal-title">Create a New Goal</h1>
          <p className="goal-subtitle">
            Define your learning goal and how many hours you want to invest.
          </p>
        </div>

        {serverError && (
          <p className="error-text server-error">{serverError}</p>
        )}

        <form className="goal-form" onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Goal Title
            </label>
            <div className="input-wrapper">
              <input
                id="title"
                name="title"
                type="text"
                className={`form-input ${errors.title ? "has-error" : ""}`}
                placeholder="e.g. Complete Python Basics"
                value={goal.title}
                onChange={handleChange}
              />
            </div>
            {errors.title && <p className="error-text">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <div className="input-wrapper">
              <textarea
                id="description"
                name="description"
                className={`form-textarea ${
                  errors.description ? "has-error" : ""
                }`}
                placeholder="Describe this learning goal..."
                value={goal.description}
                onChange={handleChange}
              />
            </div>
            {errors.description && (
              <p className="error-text">{errors.description}</p>
            )}
          </div>

          {/* Deadline */}
          <div className="form-group">
            <label htmlFor="deadline" className="form-label">
              Target Deadline
            </label>
            <div className="input-wrapper">
              <input
                id="deadline"
                name="deadline"
                type="date"
                className={`form-input ${errors.deadline ? "has-error" : ""}`}
                value={goal.deadline}
                onChange={handleChange}
              />
            </div>
            {errors.deadline && (
              <p className="error-text">{errors.deadline}</p>
            )}
          </div>

          {/* Total Hours */}
          <div className="form-group">
            <label htmlFor="total_hours" className="form-label">
              Total Hours (for this goal)
            </label>
            <div className="input-wrapper">
              <input
                id="total_hours"
                name="total_hours"
                type="number"
                min="1"
                className={`form-input ${
                  errors.total_hours ? "has-error" : ""
                }`}
                placeholder="e.g. 30"
                value={goal.total_hours}
                onChange={handleChange}
              />
            </div>
            {errors.total_hours && (
              <p className="error-text">{errors.total_hours}</p>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="goal-button" disabled={loading}>
            {loading ? "Saving..." : "Save Goal"}
          </button>
        </form>
      </div>
    </div>
  );
}
