// AI UPDATED

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

// const API_BASE = "https://dailylearningplan.onrender.com/api";
// export const API_BASE = "http://localhost:8000/api";
// export const API_BASE = "/api";
export const API_BASE = "https://dailylearningplan.onrender.com/api";


export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "Learner",
    email: "",
  });

  const [goals, setGoals] = useState([]);
  const [dailyPlans, setDailyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHint, setAiHint] = useState(
    "Click the button to generate an AI-powered study suggestion."
  );
  const [error, setError] = useState("");

  // collapse states
  const [showTodayFull, setShowTodayFull] = useState(false);
  const [showGoalsFull, setShowGoalsFull] = useState(false);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState("");


  // ---------------------------
  // Load user & fetch data
  // ---------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("userInfo");
      navigate("/login");
      return;
    }

    const sortDailyPlans = (plans) => {
      return plans.sort((a, b) => {
        // 1) UNCOMPLETED FIRST
        if (a.is_completed !== b.is_completed) {
          return a.is_completed ? 1 : -1;
        }

        // 2) Newest-by-date (or id if backend sends same date)
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA; // Newest first
        }

        // 3) If same day → newest ID first
        return b.id - a.id;
      });
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [goalsRes, plansRes] = await Promise.all([
          fetch(`${API_BASE}/goals/`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${API_BASE}/daily-plans/`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        if (!goalsRes.ok || !plansRes.ok) {
          setError("Failed to load data from server.");
          setGoals([]);
          setDailyPlans([]);
          return;
        }

        const goalsData = await goalsRes.json().catch(() => []);
        const plansData = await plansRes.json().catch(() => []);

        setGoals(Array.isArray(goalsData) ? goalsData : []);
        // setDailyPlans(Array.isArray(plansData) ? plansData : []);
        setDailyPlans(
          Array.isArray(plansData) ? sortDailyPlans(plansData) : []
        );
      } catch (err) {
        console.error("Dashboard data error:", err);
        setError("Something went wrong while loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // ---------------------------
  // Today's Plan
  // ---------------------------
  const todaysPlan = useMemo(() => {
    if (!dailyPlans.length) return [];

    const todayISO = new Date().toLocaleDateString("en-CA");

    return dailyPlans
      .filter(
        (dp) =>
          dp.date && new Date(dp.date).toLocaleDateString("en-CA") === todayISO
      )
      .map((dp) => {
        const goalTitle = dp.goal_title || dp.goal?.title || "Daily Plan";

        let topicsArray = [];
        if (Array.isArray(dp.topics)) topicsArray = dp.topics;
        else if (typeof dp.topics === "string")
          topicsArray = dp.topics
            .split(/[\n,]/)
            .map((t) => t.trim())
            .filter(Boolean);

        const totalTopics = topicsArray.length || 1;
        const completed = dp.is_completed ? totalTopics : 0;

        return {
          id: dp.id,
          goalTitle,
          topics: topicsArray,
          plannedHours: dp.planned_hours || 0,
          completed,
          totalTopics,
        };
      });
  }, [dailyPlans]);

  const handleMarkComplete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/daily-plans/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_completed: true }),
      });

      if (!res.ok) {
        console.error("Failed to update plan");
        return;
      }

      // Update local UI instantly
      // setDailyPlans((prev) =>
      //   prev.map((dp) =>
      //     dp.id === id ? { ...dp, is_completed: true } : dp
      //   )
      // );

      const sortDailyPlans = (plans) => {
        return plans.sort((a, b) => {
          // 1) UNCOMPLETED FIRST
          if (a.is_completed !== b.is_completed) {
            return a.is_completed ? 1 : -1;
          }

          // 2) Newest-by-date (or id if backend sends same date)
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          if (dateA.getTime() !== dateB.getTime()) {
            return dateB - dateA; // Newest first
          }

          // 3) If same day → newest ID first
          return b.id - a.id;
        });
      };

      setDailyPlans((prev) =>
        sortDailyPlans(
          prev.map((dp) => (dp.id === id ? { ...dp, is_completed: true } : dp))
        )
      );
    } catch (error) {
      console.error("Error completing plan:", error);
    }
  };

  // ---------------------------
  // Weekly Progress
  // ---------------------------
  const weeklyProgress = useMemo(() => {
    if (!dailyPlans.length)
      return { hoursPlanned: 0, hoursCompleted: 0, percent: 0 };

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);

    let planned = 0;
    let completed = 0;

    for (const dp of dailyPlans) {
      if (!dp.date) continue;
      const d = new Date(dp.date);
      if (isNaN(d)) continue;

      if (d >= sevenDaysAgo && d <= now) {
        const hrs = Number(dp.planned_hours) || 0;
        planned += hrs;
        if (dp.is_completed) completed += hrs;
      }
    }

    const percent = planned ? Math.round((completed / planned) * 100) : 0;

    return { hoursPlanned: planned, hoursCompleted: completed, percent };
  }, [dailyPlans]);

  // ---------------------------
  // AI Parsing
  // ---------------------------
  const parsedAiPlan = useMemo(() => {
    const text = aiHint || "";
    const lower = text.toLowerCase();

    if (
      !text ||
      lower.startsWith("click") ||
      lower.startsWith("you need") ||
      lower.startsWith("generating") ||
      lower.startsWith("something went wrong") ||
      lower.startsWith("could not")
    )
      return [];

    const result = [];
    const regex = /Day\s+(\d+):\s*([^]+?)(?=(?:Day\s+\d+:)|$)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      result.push({
        day: Number(match[1]),
        content: match[2].trim(),
      });
    }

    return result;
  }, [aiHint]);

  // ---------------------------
  // AI Generate Plan — UPDATED
  // ---------------------------
  const handleGenerateAIPlan = async () => {
    if (!goals.length) {
      setAiHint("You need to create at least one goal first.");
      return;
    }

    try {
      setAiLoading(true);
      setAiHint("Generating plan...");

      const activeGoal = goals[0];

      const today = new Date();
      const deadline = new Date(activeGoal.deadline);

      let days = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

      if (days < 1) days = 1; // ensure minimum 1 day

      const res = await fetch(`${API_BASE}/ai/generate-plan/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          goal_id: activeGoal.id,
          days: days,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAiHint(
          data.detail ||
            data.error ||
            "Could not generate a plan. Try again later."
        );
        return;
      }

      setAiHint(data.plan || data.suggestion || data.message);
    } catch (err) {
      console.error(err);
      setAiHint("Something went wrong.");
    } finally {
      setAiLoading(false);
    }
  };

  // ---------------------
  // automatically add to todays plan
  // --------------------

  const handleAddAiPlanToToday = async () => {
  if (!parsedAiPlan.length || !aiHint) {
    alert("Generate AI plan first");
    return;
  }

  if (!goals.length) {
    alert("No goal found");
    return;
  }

  try {
    setAiLoading(true);

    const activeGoal = goals[0]; // using first goal (same as AI generate)

    const res = await fetch(`${API_BASE}/ai/add-to-daily-plan/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        goal_id: activeGoal.id,
        plan: aiHint, // full AI text
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
         if (res.status === 409) {
              alert("AI plan already added for this goal ❗");
     } else {
        alert(data.detail || "Failed to add AI plan");
        }
             return;
              }


    alert("AI plan added to today's schedule ✅");

    // Reload dashboard data
    window.location.reload();

  } catch (error) {
    console.error(error);
    alert("Something went wrong while adding AI plan");
  } finally {
    setAiLoading(false);
  }
};


  // ---------------------------
  // Logout
  // ---------------------------
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const todayText = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const {
    hoursPlanned,
    hoursCompleted,
    percent: weeklyPercent,
  } = weeklyProgress;

  // ---------------------------
  // JSX UI (unchanged)
  // ---------------------------
  return (
    <div className="dash-root">
      <div className="dash-container">
        {/* HEADER */}
        <header className="dash-header">
          <div className="dash-greeting">
            <p className="dash-greeting-label">Welcome back,</p>
            <h1 className="dash-greeting-title">
              <span className="dash-greeting-name">{user.name}</span>
              <span className="emoji">👋</span>
            </h1>
            <p className="dash-greeting-subtitle">
              Today is <span className="pill pill-date">{todayText}</span> —
              stay consistent!
            </p>
          </div>

          <div className="dash-user-card">
            <div className="dash-user-info">
              <div className="dash-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <p className="dash-user-name">{user.name}</p>
                {user.email && <p className="dash-user-email">{user.email}</p>}
              </div>
            </div>

            <button className="dash-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Server Error */}
        {error && <p className="error-text server-error">{error}</p>}

        {/* ---------------------------------- */}
        {/* TODAY’S PLAN */}
        {/* ---------------------------------- */}
        <main className="dash-main">
          <section className="dash-card dash-today">
            <div className="dash-card-header">
              <h2>Today&apos;s Plan</h2>
              <button
                className="ghost-btn"
                onClick={() => navigate("/DailyPlan")}
              >
                + Add Plan
              </button>
            </div>

            {loading ? (
              <p className="loading-text">Loading...</p>
            ) : todaysPlan.length === 0 ? (
              <p>No plans yet.</p>
            ) : (
              <div className="today-list">
                {(showTodayFull ? todaysPlan : todaysPlan.slice(0, 2)).map(
                  (plan) => {
                    const percent = Math.round(
                      (plan.completed / plan.totalTopics) * 100
                    );

                    return (
                      <div key={plan.id} className="today-item">
                        {/* <div className="today-item-header">
                          <div className="today-item-goal">
                            <span className="today-goal-pill">
                              {plan.goalTitle}
                            </span>
                            <span className="today-hours">
                              {plan.plannedHours} hrs
                            </span>
                          </div>
                          <span className="today-progress-label">
                            {plan.completed}/{plan.totalTopics} done
                          </span>
                        </div> */}

                        <div className="today-info">
                          <div className="today-title-row">
                            <span className="today-goal-name">
                              {plan.goalTitle}
                            </span>
                            <span className="today-hours">
                              {plan.plannedHours} hrs
                            </span>
                          </div>

                          <div className="today-progress-row">
                            <span className="today-progress-status">
                              {plan.completed}/{plan.totalTopics} done
                            </span>
                          </div>

                          <div className="today-topic-row">
                            {plan.topics.map((topic, idx) => (
                              <span key={idx} className="topic-chip">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* <div className="today-topics">
                          {plan.topics.map((topic, idx) => (
                            <div key={idx} className="topic-pill">
                              <span className="topic-dot" />
                              <span>{topic}</span>
                            </div>
                          ))}
                        </div> */}

                        <div className="today-progress-bar">
                          <div
                            className="today-progress-fill"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        {/* COMPLETE BUTTON */}
                        <div className="complete-btn-wrapper">
                          {plan.completed >= plan.totalTopics ? (
                            <button className="completed-btn">
                              Completed ✔
                            </button>
                          ) : (
                            <button
                              className="mark-btn"
                              onClick={() => handleMarkComplete(plan.id)}
                            >
                              Mark as Complete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}

                {todaysPlan.length > 2 && (
                  <button
                    className="collapse-btn"
                    onClick={() => setShowTodayFull(!showTodayFull)}
                  >
                    {showTodayFull
                      ? "Show Less"
                      : `Show ${todaysPlan.length - 2} More`}
                  </button>
                )}
              </div>
            )}
          </section>

          {/* ---------------------------------- */}
          {/* GOALS & DEADLINES */}
          {/* ---------------------------------- */}
          <section className="dash-card dash-goals">
            <div className="dash-card-header">
              <h2>Goals & Deadlines</h2>
              <button className="ghost-btn" onClick={() => navigate("/goal")}>
                Manage Goals
              </button>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : goals.length === 0 ? (
              <p>No goals yet.</p>
            ) : (
              <div className="goals-list">
                {(showGoalsFull ? goals : goals.slice(0, 3)).map((goal) => {
                  const progress =
                    typeof goal.progress === "number" ? goal.progress : 0;

                  const status =
                    goal.status ||
                    (progress >= 100
                      ? "Completed"
                      : progress > 0
                      ? "In Progress"
                      : "Not Started");

                  return (
                    <div key={goal.id} className="goal-item">
                      <div className="goal-main">
                        <p className="goal-title">{goal.title}</p>
                        {goal.deadline && (
                          <p className="goal-deadline">
                            Due:{" "}
                            <span>
                              {new Date(goal.deadline).toLocaleDateString()}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="goal-meta">
                        <span
                          className={`status-pill status-${status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {status}
                        </span>

                        <div className="goal-progress">
                          <div
                            className="goal-progress-fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <span className="goal-progress-text">{progress}%</span>
                      </div>
                    </div>
                  );
                })}

                {goals.length > 3 && (
                  <button
                    className="collapse-btn"
                    onClick={() => setShowGoalsFull(!showGoalsFull)}
                  >
                    {showGoalsFull
                      ? "Show Less"
                      : `Show ${goals.length - 3} More`}
                  </button>
                )}
              </div>
            )}
          </section>
        </main>

        {/* ---------------------------------- */}
        {/* BOTTOM SECTION */}
        {/* ---------------------------------- */}
        <section className="dash-bottom">
          {/* WEEKLY PROGRESS */}
          <div className="dash-card dash-progress">
            <div className="dash-card-header">
              <h2>Weekly Progress</h2>
            </div>

            <div className="progress-summary">
              <div className="progress-numbers">
                <div>
                  <p className="progress-label">Planned</p>
                  <p className="progress-value">{hoursPlanned} hrs</p>
                </div>

                <div>
                  <p className="progress-label">Completed</p>
                  <p className="progress-value">{hoursCompleted} hrs</p>
                </div>

                <div>
                  <p className="progress-label">Completion</p>
                  <p className="progress-value">{weeklyPercent}%</p>
                </div>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${weeklyPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
         {/* AI Suggestions */}
<div className="dash-card dash-ai">
  <div className="dash-card-header">
    <h2>AI Study Suggestions</h2>
    <span className="pill pill-ai">Smart Tips</span>
  </div>

  {/* AI OUTPUT */}
  {parsedAiPlan.length > 0 ? (
    <div className="ai-plan-list">
      {parsedAiPlan.map((item) => (
        <div key={item.day} className="ai-day-card">
          <div className="ai-day-header">
            <span className="ai-day-pill">Day {item.day}</span>
          </div>
          <p className="ai-day-content">{item.content}</p>
        </div>
      ))}
    </div>
  ) : (
    <p className="ai-text">{aiHint}</p>
  )}

            {/* ✅ ADD THIS BLOCK (GOAL SELECTOR) */}
            {showGoalSelector && (
              <div className="ai-goal-selector">
                <label className="ai-label">Select Goal</label>

                <select
                  className="ai-select"
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                >
                  <option value="">-- Choose a Goal --</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>

                <button
                  className="primary-btn"
                  disabled={!selectedGoalId || aiLoading}
                  onClick={handleGenerateAIPlan}
                >
                  Generate Study Plan
                </button>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="ai-actions">
              <button
                className="primary-btn"
                onClick={() => setShowGoalSelector(true)}
                disabled={aiLoading}
              >
                {aiLoading ? "Generating..." : "Open AI Planner"}
              </button>

              <button
                className="ghost-btn subtle"
                onClick={handleGenerateAIPlan}
                disabled={aiLoading}
              >
                Refresh Suggestion
              </button>

              {parsedAiPlan.length > 0 && (
                <button
                  className="primary-btn success-btn"
                  onClick={handleAddAiPlanToToday}
                  disabled={aiLoading}
                >
                  Add Plan to Calendar
                </button>
              )}
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
