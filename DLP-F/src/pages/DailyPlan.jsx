import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DailyPlan.css";

/**
 * Fallback sample goals (used only if API fails)
 */
const sampleGoals = [
  { id: 1, title: "Python Basics" },
  { id: 2, title: "SQL Fundamentals" },
  { id: 3, title: "React Beginner" },
];

// const API_BASE = "https://dailylearningplan.onrender.com/api";
// const API_BASE="http://127.0.0.1:8000/api"
// export const API_BASE = "/api";
export const API_BASE = "https://your-backend.onrender.com/api";



export default function DailyPlan() {
  const navigate = useNavigate();

  const [goals, setGoals] = useState(sampleGoals);
  const [form, setForm] = useState({
    date: "",
    goal_id: "",
    topics: "",
    study_hours: "",
    // is_completed: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------------------
  // Load goals from API (no redirect here)
  // ---------------------------
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch(`${API_BASE}/goals/`, {
          credentials: "include", // send auth_token cookie
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.warn("Failed to fetch goals, using sample goals fallback.");
          return;
        }

        const data = await res.json().catch(() => []);
        if (Array.isArray(data) && data.length > 0) {
          setGoals(data);
        }
      } catch (err) {
        console.error("Error fetching goals:", err);
        // keep fallback sampleGoals
      }
    };

    fetchGoals();
  }, []);

  // ---------------------------
  // Handlers
  // ---------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.date) newErrors.date = "Date is required";
    if (!form.goal_id) newErrors.goal_id = "Please select a goal";
    if (!form.topics) newErrors.topics = "Topics are required"; 
    if (!form.study_hours) {
      newErrors.study_hours = "Study hours is required";
    } else if (isNaN(Number(form.study_hours))) {
      newErrors.study_hours = "Study hours must be a number";
    }
    if (Number(form.study_hours) > 24) {
      newErrors.study_hours = "Study hours cannot exceed 24 per day";
    }
    const today = new Date().toISOString().split("T")[0];
    if (form.date < today) {
      newErrors.date = "You cannot select past dates";
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
        date: form.date, // "YYYY-MM-DD"
        goal: Number(form.goal_id), // FK id
        topics: form.topics,
        // study_hours: Number(form.study_hours),
        planned_hours: Number(form.study_hours),
        is_completed: form.is_completed,
      };

      const res = await fetch(`${API_BASE}/daily-plans/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // IMPORTANT: send cookie
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(
          data.detail || data.error || "Failed to save daily plan."
        );
        return;
      }

      // Success → go back to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Daily plan create error:", err);
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // JSX – same UI structure
  // ---------------------------
  return (
    <div className="daily-root">
      <div className="daily-card">
        <div className="daily-header">
          <h1 className="daily-title">Create Daily Plan</h1>
          <p className="daily-subtitle">
            Plan what you will study today based on your goals.
          </p>
        </div>

        {serverError && (
          <p className="error-text server-error">{serverError}</p>
        )}

        <form className="daily-form" onSubmit={handleSubmit} noValidate>
          {/* Date */}
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date
            </label>
            <div className="input-wrapper">
              <input
                id="date"
                name="date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className={`form-input ${errors.date ? "has-error" : ""}`}
                value={form.date}
                onChange={handleChange}
              />
            </div>
            {errors.date && <p className="error-text">{errors.date}</p>}
          </div>

          {/* Goal Select */}
          <div className="form-group">
            <label htmlFor="goal_id" className="form-label">
              Goal
            </label>
            <div className="input-wrapper">
              <select
                id="goal_id"
                name="goal_id"
                className={`form-input ${errors.goal_id ? "has-error" : ""}`}
                value={form.goal_id}
                onChange={handleChange}
              >
                <option value="">Select a goal</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>
            {errors.goal_id && <p className="error-text">{errors.goal_id}</p>}
          </div>

          {/* Topics */}
          <div className="form-group">
            <label htmlFor="topics" className="form-label">
              Topics / Tasks for Today
            </label>
            <div className="input-wrapper">
              <textarea
                id="topics"
                name="topics"
                className={`form-textarea ${
                  errors.topics ? "has-error" : ""
                }`}
                placeholder="List the topics or tasks you will study..."
                value={form.topics}
                onChange={handleChange}
              />
            </div>
            {errors.topics && <p className="error-text">{errors.topics}</p>}
          </div>

          {/* Study Hours */}
          <div className="form-group">
            <label htmlFor="study_hours" className="form-label">
              Planned Study Hours
            </label>
            <div className="input-wrapper">
              <input
                id="study_hours"
                name="study_hours"
                type="number"
                min="0.5"
                step="0.5"
                className={`form-input ${
                  errors.study_hours ? "has-error" : ""
                }`}
                placeholder="e.g. 2"
                value={form.study_hours}
                onChange={handleChange}
              />
            </div>
            {errors.study_hours && (
              <p className="error-text">{errors.study_hours}</p>
            )}
          </div>

          {/* Completed Checkbox */}
          {/* <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_completed"
                checked={form.is_completed}
                onChange={handleChange}
              />
              <span>Mark as completed</span>
            </label>
          </div> */}

          {/* Submit */}
          <button type="submit" className="daily-button" disabled={loading}>
            {loading ? "Saving..." : "Save Daily Plan"}
          </button>
        </form>
      </div>
    </div>
  );
}
