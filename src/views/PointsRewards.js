"use client"

import { useState, useEffect } from "react"
import "../stylesheets/PointsRewards.css"
import {
  Award,
  Gift,
  TrendingUp,
  Calendar,
  CheckCircle,
  PiggyBank,
  DollarSign,
  BookOpen,
  CreditCard,
  AlertCircle,
  Zap,
  Users,
  MessageSquare,
} from "lucide-react"

function PointsRewards() {
  const [currentPoints, setCurrentPoints] = useState(105)
  const [nextMilestone, setNextMilestone] = useState(150)
  const [pointsToNextMilestone, setPointsToNextMilestone] = useState(nextMilestone - currentPoints)
  const [progressPercentage, setProgressPercentage] = useState((currentPoints / nextMilestone) * 100)
  const [showPointsAdded, setShowPointsAdded] = useState(null)
  const [weeklyAssets, setWeeklyAssets] = useState(35)
  const [weeklyLiabilities, setWeeklyLiabilities] = useState(7)
  const [weeklyScore, setWeeklyScore] = useState(weeklyAssets - weeklyLiabilities)
  const [activeTab, setActiveTab] = useState("rewards")
  const [redeemedRewards, setRedeemedRewards] = useState([]);

  useEffect(() => {
    setPointsToNextMilestone(nextMilestone - currentPoints)
    setProgressPercentage((currentPoints / nextMilestone) * 100)
    setWeeklyScore(weeklyAssets - weeklyLiabilities)
  }, [currentPoints, nextMilestone, weeklyAssets, weeklyLiabilities])

  const addPoints = (points) => {
    setCurrentPoints((prev) => prev + points)
    if (points >= 0) {
      setWeeklyAssets((prev) => prev + points)
    } else {
      setWeeklyLiabilities((prev) => prev + Math.abs(points))
    }
    const type = points >= 0 ? "asset" : "liability"
    setShowPointsAdded({ points, type, timestamp: Date.now() })
    setTimeout(() => {
      setShowPointsAdded(null)
    }, 2000)
  }

  const redeemReward = (rewardId, cost) => {
    if (redeemedRewards.includes(rewardId)) {
      alert("✅ You've already redeemed this reward.");
      return;
    }
  
    if (currentPoints >= cost) {
      setCurrentPoints((prev) => prev - cost);
      setRedeemedRewards((prev) => [...prev, rewardId]);
      setShowPointsAdded({ points: -cost, type: "redeem", timestamp: Date.now() });
      setTimeout(() => setShowPointsAdded(null), 2000);
      alert(`🎉 You redeemed ${cost} points!`);
    } else {
      alert(`❌ You need ${cost - currentPoints} more points to redeem this reward.`);
    }
  };  

  return (
    <div className="rewards-container">
      {showPointsAdded && (
        <div className={`points-added-notification ${showPointsAdded.type}`}>
          <span>{showPointsAdded.points > 0 ? `+${showPointsAdded.points}` : showPointsAdded.points} points!</span>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Rewards & Points</h1>
        <p className="page-subtitle">
          Track your financial health score and earn rewards for good financial habits
        </p>
      </div>

      <div className="points-overview-card">
        <div className="points-overview-content">
          <div className="points-header">
            <Award className="points-icon" />
            <h2 className="points-title">You've Earned</h2>
          </div>
          <div className="points-value">
            <span className="points-number">{currentPoints}</span>
            <span className="points-label">Points</span>
            <span className="points-emoji">🎉</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
          <p className="progress-text">
            {pointsToNextMilestone} more points until your next reward tier
          </p>
        </div>
      </div>

      <div className="health-score-card">
        <div className="card-header">
          <h2 className="card-title">Weekly Financial Health Score</h2>
          <p className="card-description">
            Your financial health score is calculated by subtracting liabilities from assets
          </p>
        </div>
        <div className="health-score-content">
          <div className="score-item">
            <h3 className="score-label assets">Assets</h3>
            <span className="score-value assets">{weeklyAssets}</span>
            <p className="score-description">Points from positive actions</p>
          </div>
          <div className="score-operator">−</div>
          <div className="score-item">
            <h3 className="score-label liabilities">Liabilities</h3>
            <span className="score-value liabilities">{weeklyLiabilities}</span>
            <p className="score-description">Points from negative actions</p>
          </div>
          <div className="score-operator">=</div>
          <div className="score-item total">
            <h3 className="score-label total">Weekly Score</h3>
            <span className="score-value total">{weeklyScore}</span>
            <p className="score-description">Your financial health score</p>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          {['rewards', 'assets', 'liabilities', 'bonus'].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Reward Cards */}
        {activeTab === 'rewards' && (
          <div className="tab-content">
            <div className="rewards-grid">

              {/* Reward Card 1 */}
              <div className="reward-card">
                <div className="reward-card-header">
                  <div className="reward-badge available">Available</div>
                  <div className="reward-points">50 Points</div>
                </div>
                <h3 className="reward-title">$10 Amazon Gift Card</h3>
                <p className="reward-description">Redeem your points for an Amazon gift card</p>
                <div className="reward-icon-container">
                  <Gift className="reward-icon" />
                </div>
                <button
                  className="reward-button"
                  onClick={() => redeemReward("amazon10", 50)}
                  disabled={redeemedRewards.includes("amazon10")}
                >
                  {redeemedRewards.includes("amazon10") ? "Redeemed" : "Redeem Reward"}
                </button>
              </div>

              {/* Reward Card 2 */}
              <div className="reward-card">
                <div className="reward-card-header">
                  <div className="reward-badge available">Available</div>
                  <div className="reward-points">100 Points</div>
                </div>
                <h3 className="reward-title">$100 Gift Card Raffle Entry</h3>
                <p className="reward-description">Get entered into a raffle for a $100 gift card</p>
                <div className="reward-icon-container">
                  <TrendingUp className="reward-icon" />
                </div>
                <button
                  className="reward-button"
                  onClick={() => redeemReward("raffle100", 100)}
                  disabled={redeemedRewards.includes("raffle100")}
                >
                  {redeemedRewards.includes("raffle100") ? "Redeemed" : "Redeem Reward"}
                </button>
              </div>

              {/* Reward Card 3 (locked) */}
              <div className={`reward-card ${currentPoints < 200 ? "locked" : ""}`}>
                <div className="reward-card-header">
                  <div className={`reward-badge ${currentPoints < 200 ? "locked" : "available"}`}>
                    {currentPoints < 200 ? "Locked" : "Available"}
                  </div>
                  <div className="reward-points">200 Points</div>
                </div>
                <h3 className="reward-title">EmpowerHERto Merch</h3>
                <p className="reward-description">Tote bag, T-shirt, or notebook with our logo</p>
                <div className={`reward-icon-container ${currentPoints < 200 ? "locked" : ""}`}>
                  <Calendar className="reward-icon" />
                </div>
                <button
                  className={`reward-button ${currentPoints < 200 ? "locked" : ""}`}
                  onClick={() => redeemReward("empowerherMerch", 200)}
                  disabled={currentPoints < 200 || redeemedRewards.includes("empowerherMerch")}
                >
                  {redeemedRewards.includes("empowerherMerch")
                    ? "Redeemed"
                    : currentPoints < 200
                      ? `Need ${200 - currentPoints} More Points`
                      : "Redeem Reward"}
                </button>
              </div>

            </div>
          </div>
        )}
 
        {/* Asset Items */}
        {activeTab === 'assets' && (
          <div className="tab-content">
            <div className="assets-card">
              <div className="card-header">
                <h3 className="card-title">Assets ‑ Things That Add Value</h3>
                <p className="card-description">
                  Complete these actions to earn points and build your financial health score
                </p>
              </div>
              <div className="assets-list">
                {[
                  { action: "Savings in Bank or Cash Jar", points: 10, description: "Any amount saved at the end of each week", icon: <PiggyBank className="asset-icon" /> },
                  { action: "Emergency Fund Started", points: 10, description: "Even if it's small, the habit matters", icon: <DollarSign className="asset-icon" /> },
                  { action: "Budget Created & Followed This Week", points: 5, description: "Weekly budget check‑in", icon: <CheckCircle className="asset-icon" /> },
                  { action: "Weekly Allowance/Job Income Earned", points: 2, description: "Must track where it came from", icon: <DollarSign className="asset-icon" /> },
                  { action: "Completed Finance 4 HER Module", points: 10, description: "Learning = value!", icon: <BookOpen className="asset-icon" /> },
                  { action: "Paid a Phone Bill or Personal Expense", points: 5, description: "Showing responsibility", icon: <CreditCard className="asset-icon" /> },
                  { action: "Money Made from Hustle", points: 5, description: "Must be able to show proof (e.g. hair, art, tutoring)", icon: <Zap className="asset-icon" /> },
                  { action: "Added to Savings This Week", points: 3, description: "Any amount counts", icon: <PiggyBank className="asset-icon" /> },
                  { action: "No‑Spend Day", points: 1, description: "Tracked using the app (once a week)", icon: <Calendar className="asset-icon" /> },
                ].map((item, i) => (
                  <div key={i} className="asset-item">
                    <div className="asset-info">
                      <div className="asset-icon-container">{item.icon}</div>
                      <div>
                        <div className="asset-title">{item.action}</div>
                        <div className="asset-description">{item.description}</div>
                      </div>
                    </div>
                    <button
                      className="asset-points-button"
                      onClick={() => addPoints(item.points)}
                    >
                      +{item.points} points
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Liability Items */}
        {activeTab === 'liabilities' && (
          <div className="tab-content">
            <div className="liabilities-card">
              <div className="card-header">
                <h3 className="card-title">Liabilities - Things That Take Value Away</h3>
                <p className="card-description">
                  These help identify spending habits that affect financial growth
                </p>
              </div>
              <div className="liabilities-list">
                {[
                  {
                    action: "Impulse Purchase (Not in Budget)",
                    points: 2,
                    description: "Buying without planning",
                    icon: <CreditCard className="liability-icon" />,
                  },
                  {
                    action: "Borrowed Money You Haven't Paid Back",
                    points: 5,
                    description: "Friends, family, or anyone else",
                    icon: <AlertCircle className="liability-icon" />,
                  },
                  {
                    action: "Late Payment (Phone, Netflix, etc.)",
                    points: 5,
                    description: "Real-world consequence (each one)",
                    icon: <Calendar className="liability-icon" />,
                  },
                  {
                    action: "Used All Weekly Allowance Without Saving",
                    points: 3,
                    description: "Missed savings opportunity",
                    icon: <DollarSign className="liability-icon" />,
                  },
                  {
                    action: "Spent More Than You Earned This Week",
                    points: 4,
                    description: "Red flag behavior",
                    icon: <TrendingUp className="liability-icon" />,
                  },
                  {
                    action: "No Budget Activity This Week",
                    points: 2,
                    description: "Didn't check or update app",
                    icon: <AlertCircle className="liability-icon" />,
                  },
                ].map((item, i) => (
                  <div key={i} className="liability-item">
                    <div className="liability-info">
                      <div className="liability-icon-container">{item.icon}</div>
                      <div>
                        <div className="liability-title">{item.action}</div>
                        <div className="liability-description">{item.description}</div>
                      </div>
                    </div>
                    <button
                      className="liability-points-button"
                      onClick={() => addPoints(-item.points)}
                    >
                      -{item.points} points
                    </button>
                  </div>
                ))}
              </div>
              <div className="card-footer">
                <p className="liability-note">
                  These are not meant to punish, just to help track habits that may affect your financial growth.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bonus Rewards */}
        {activeTab === 'bonus' && (
          <div className="tab-content">
            <div className="bonus-card">
              <div className="card-header">
                <h3 className="card-title">Community Activity Rewards</h3>
                <p className="card-description">
                  Earn bonus points by helping others and participating
                </p>
              </div>
              <div className="bonus-list">
                {[
                  {
                    title: "Help with Budgeting",
                    description: "Help another girl with her budget",
                    points: 2,
                    icon: <Users className="bonus-icon users" />,
                  },
                  {
                    title: "Participate in Money Talk",
                    description: "Join a peer discussion about finances",
                    points: 3,
                    icon: <MessageSquare className="bonus-icon message" />,
                  },
                  {
                    title: "Share Financial Win",
                    description: "Post a financial win in the Finance 4 HER Discord",
                    points: 2,
                    icon: <Award className="bonus-icon award" />,
                  },
                ].map((item, i) => (
                  <div key={i} className="bonus-item">
                    <div className="bonus-info">
                      <div className="bonus-icon-container">{item.icon}</div>
                      <div>
                        <div className="bonus-title">{item.title}</div>
                        <div className="bonus-description">{item.description}</div>
                      </div>
                    </div>
                    <button
                      className="asset-points-button"
                      onClick={() => addPoints(item.points)}
                    >
                      +{item.points} points
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PointsRewards