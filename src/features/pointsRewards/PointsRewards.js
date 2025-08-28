import { useState, useEffect } from "react"
import "./PointsRewards.css"
import { Award, Gift, TrendingUp, Calendar, CheckCircle, PiggyBank, DollarSign, BookOpen, CreditCard, AlertCircle, Zap, Users, MessageSquare, Upload } from 'lucide-react'

function PointsRewards() {
  const [currentPoints, setCurrentPoints] = useState(0)
  const [pointsToNextMilestone, setPointsToNextMilestone] = useState(0)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [showPointsAdded, setShowPointsAdded] = useState(null)
  const [weeklyAssets, setWeeklyAssets] = useState(0)
  const [weeklyLiabilities, setWeeklyLiabilities] = useState(0)
  const [weeklyScore, setWeeklyScore] = useState(weeklyAssets - weeklyLiabilities)
  const [activeTab, setActiveTab] = useState("rewards")
  const [redeemedRewards, setRedeemedRewards] = useState([])
  const [uploadedFile, setUploadedFile] = useState(null)


  // Calculate next milestone and progress
  useEffect(() => {
    // Define the reward tiers inside the effect
    const REWARD_TIERS = [50, 100, 200]
    const MAX_PROGRESS = 200

    // Find the next milestone
    const next = REWARD_TIERS.find((tier) => tier > currentPoints) || REWARD_TIERS[REWARD_TIERS.length - 1]

    // Calculate points to next milestone
    setPointsToNextMilestone(next > currentPoints ? next - currentPoints : 0)

    // Calculate progress percentage (capped at 200 points)
    const pointsForProgress = Math.min(currentPoints, MAX_PROGRESS)
    setProgressPercentage((pointsForProgress / MAX_PROGRESS) * 100)

    // Update weekly score
    setWeeklyScore(weeklyAssets - weeklyLiabilities)
  }, [currentPoints, weeklyAssets, weeklyLiabilities])

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

  const redeemReward = (rewardId, requiredPoints, tierLevel) => {
    // Check if already redeemed
    if (redeemedRewards.includes(rewardId)) {
      alert("✅ You've already redeemed this reward.")
      return
    }

    // Check if user has enough points
    if (currentPoints < requiredPoints) {
      alert(`❌ You need ${requiredPoints - currentPoints} more points to unlock this reward.`)
      return
    }

    // Check if previous tiers are unlocked
    if (tierLevel > 1) {
      // For tier 2, check if tier 1 is redeemed
      if (tierLevel === 2 && !redeemedRewards.includes("amazon10")) {
        alert("❌ You need to redeem the previous tier reward first.")
        return
      }
      // For tier 3, check if tier 2 is redeemed
      if (tierLevel === 3 && !redeemedRewards.includes("raffle100")) {
        alert("❌ You need to redeem the previous tier reward first.")
        return
      }
    }

    // Add to redeemed rewards without deducting points
    setRedeemedRewards((prev) => [...prev, rewardId])
    setShowPointsAdded({ points: 0, type: "redeem", timestamp: Date.now() })
    setTimeout(() => setShowPointsAdded(null), 2000)
    alert(`🎉 You've redeemed this reward!`)
  }

  // Helper function to check if a reward is available based on previous tier redemption
  const isRewardAvailable = (tierLevel) => {
    if (tierLevel === 1) return true
    if (tierLevel === 2) return redeemedRewards.includes("amazon10")
    if (tierLevel === 3) return redeemedRewards.includes("raffle100")
    return false
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.')
      return
    }
    setUploadedFile(file)          // store file for UI
    addPoints(10)                  // award 10 points
    alert(`You've uploaded ${file.name} and earned 10 points!`)
  }


  return (
    <div className="container">
      {showPointsAdded && (
        <div className={`points-added-notification ${showPointsAdded.type}`}>
          <span>{showPointsAdded.points > 0 ? `+${showPointsAdded.points}` : showPointsAdded.points} points!</span>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Rewards & Points</h1>
        <p className="page-subtitle">Track your financial health score and earn rewards for good financial habits</p>
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
          {pointsToNextMilestone > 0 ? (
            <p className="progress-text">{pointsToNextMilestone} more points until your next reward tier</p>
          ) : (
            <p className="progress-text">You've reached the maximum reward tier!</p>
          )}
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
          {["rewards", "assets", "liabilities", "bonus", "upload"].map((tab) => (
            <button key={tab} className={`tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "rewards" && (
          <div className="tab-content">
            <div className="rewards-grid">
              {/* Reward Card 1 - Tier 1 */}
              <div className="reward-card">
                <div className="reward-card-header">
                  <div className={`reward-badge ${redeemedRewards.includes("amazon10") ? "redeemed" : "available"}`}>
                    {redeemedRewards.includes("amazon10") ? "Redeemed" : "Available"}
                  </div>
                  <div className="reward-points">50 Points</div>
                </div>
                <h3 className="reward-title">$10 Amazon Gift Card</h3>
                <p className="reward-description">Redeem your points for an Amazon gift card</p>
                <div className={`reward-icon-container ${redeemedRewards.includes("amazon10") ? "redeemed" : ""}`}>
                  <Gift className={`reward-icon ${redeemedRewards.includes("amazon10") ? "redeemed" : ""}`} />
                </div>
                <button
                  className={`btn-primary ${redeemedRewards.includes("amazon10") ? "redeemed" : ""}`}
                  onClick={() => redeemReward("amazon10", 50, 1)}
                  disabled={redeemedRewards.includes("amazon10") || currentPoints < 50}
                >
                  {redeemedRewards.includes("amazon10")
                    ? "Redeemed"
                    : currentPoints < 50
                      ? `Need ${50 - currentPoints} More Points`
                      : "Redeem Reward"}
                </button>
              </div>

              {/* Reward Card 2 - Tier 2 */}
              <div className="reward-card">
                <div className="reward-card-header">
                  <div
                    className={`reward-badge ${redeemedRewards.includes("raffle100")
                        ? "redeemed"
                        : !isRewardAvailable(2)
                          ? "locked"
                          : "available"
                      }`}
                  >
                    {redeemedRewards.includes("raffle100")
                      ? "Redeemed"
                      : !isRewardAvailable(2)
                        ? "Locked"
                        : "Available"}
                  </div>
                  <div className="reward-points">100 Points</div>
                </div>
                <h3 className="reward-title">$100 Gift Card Raffle Entry</h3>
                <p className="reward-description">Get entered into a raffle for a $100 gift card</p>
                <div
                  className={`reward-icon-container ${redeemedRewards.includes("raffle100") ? "redeemed" : !isRewardAvailable(2) ? "locked" : ""
                    }`}
                >
                  <TrendingUp
                    className={`reward-icon ${redeemedRewards.includes("raffle100") ? "redeemed" : !isRewardAvailable(2) ? "locked" : ""
                      }`}
                  />
                </div>
                <button
                  className={`btn-primary ${redeemedRewards.includes("raffle100") ? "redeemed" : !isRewardAvailable(2) ? "locked" : ""
                    }`}
                  onClick={() => redeemReward("raffle100", 100, 2)}
                  disabled={redeemedRewards.includes("raffle100") || !isRewardAvailable(2) || currentPoints < 100}
                >
                  {redeemedRewards.includes("raffle100")
                    ? "Redeemed"
                    : !isRewardAvailable(2)
                      ? "Unlock Previous Tier First"
                      : currentPoints < 100
                        ? `Need ${100 - currentPoints} More Points`
                        : "Redeem Reward"}
                </button>
              </div>

              {/* Reward Card 3 - Tier 3 */}
              <div className="reward-card">
                <div className="reward-card-header">
                  <div
                    className={`reward-badge ${redeemedRewards.includes("empowerherMerch")
                        ? "redeemed"
                        : !isRewardAvailable(3)
                          ? "locked"
                          : "available"
                      }`}
                  >
                    {redeemedRewards.includes("empowerherMerch")
                      ? "Redeemed"
                      : !isRewardAvailable(3)
                        ? "Locked"
                        : "Available"}
                  </div>
                  <div className="reward-points">200 Points</div>
                </div>
                <h3 className="reward-title">EmpowerHERto Merch</h3>
                <p className="reward-description">Tote bag, T-shirt, or notebook with our logo</p>
                <div
                  className={`reward-icon-container ${redeemedRewards.includes("empowerherMerch") ? "redeemed" : !isRewardAvailable(3) ? "locked" : ""
                    }`}
                >
                  <Calendar
                    className={`reward-icon ${redeemedRewards.includes("empowerherMerch") ? "redeemed" : !isRewardAvailable(3) ? "locked" : ""
                      }`}
                  />
                </div>
                <button
                  className={`btn-primary ${redeemedRewards.includes("empowerherMerch") ? "redeemed" : !isRewardAvailable(3) ? "locked" : ""
                    }`}
                  onClick={() => redeemReward("empowerherMerch", 200, 3)}
                  disabled={redeemedRewards.includes("empowerherMerch") || !isRewardAvailable(3) || currentPoints < 200}
                >
                  {redeemedRewards.includes("empowerherMerch")
                    ? "Redeemed"
                    : !isRewardAvailable(3)
                      ? "Unlock Previous Tier First"
                      : currentPoints < 200
                        ? `Need ${200 - currentPoints} More Points`
                        : "Redeem Reward"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Asset Items */}
        {activeTab === "assets" && (
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
                  {
                    action: "Savings in Bank or Cash Jar",
                    points: 10,
                    description: "Any amount saved at the end of each week",
                    icon: <PiggyBank className="asset-icon" />,
                  },
                  {
                    action: "Emergency Fund Started",
                    points: 10,
                    description: "Even if it's small, the habit matters",
                    icon: <DollarSign className="asset-icon" />,
                  },
                  {
                    action: "Budget Created & Followed This Week",
                    points: 5,
                    description: "Weekly budget check‑in",
                    icon: <CheckCircle className="asset-icon" />,
                  },
                  {
                    action: "Weekly Allowance/Job Income Earned",
                    points: 2,
                    description: "Must track where it came from",
                    icon: <DollarSign className="asset-icon" />,
                  },
                  {
                    action: "Completed Finance 4 HER Module",
                    points: 10,
                    description: "Learning = value!",
                    icon: <BookOpen className="asset-icon" />,
                  },
                  {
                    action: "Paid a Phone Bill or Personal Expense",
                    points: 5,
                    description: "Showing responsibility",
                    icon: <CreditCard className="asset-icon" />,
                  },
                  {
                    action: "Money Made from Hustle",
                    points: 5,
                    description: "Must be able to show proof (e.g. hair, art, tutoring)",
                    icon: <Zap className="asset-icon" />,
                  },
                  {
                    action: "Added to Savings This Week",
                    points: 3,
                    description: "Any amount counts",
                    icon: <PiggyBank className="asset-icon" />,
                  },
                  {
                    action: "No‑Spend Day",
                    points: 1,
                    description: "Tracked using the app (once a week)",
                    icon: <Calendar className="asset-icon" />,
                  },
                ].map((item, i) => (
                  <div key={i} className="asset-item">
                    <div className="asset-info">
                      <div className="asset-icon-container">{item.icon}</div>
                      <div>
                        <div className="asset-title">{item.action}</div>
                        <div className="asset-description">{item.description}</div>
                      </div>
                    </div>
                    <button className="asset-points-button" onClick={() => addPoints(item.points)}>
                      +{item.points} points
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Liability Items */}
        {activeTab === "liabilities" && (
          <div className="tab-content">
            <div className="liabilities-card">
              <div className="card-header">
                <h3 className="card-title">Liabilities - Things That Take Value Away</h3>
                <p className="card-description">These help identify spending habits that affect financial growth</p>
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
                    <button className="liability-points-button" onClick={() => addPoints(-item.points)}>
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
        {activeTab === "bonus" && (
          <div className="tab-content">
            <div className="bonus-card">
              <div className="card-header">
                <h3 className="card-title">Community Activity Rewards</h3>
                <p className="card-description">Earn bonus points by helping others and participating</p>
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
                    <button className="asset-points-button" onClick={() => addPoints(item.points)}>
                      +{item.points} points
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {activeTab === "upload" && (
        <div className="tab-content">
          <div className="upload-card">
            <div className="card-header">
              <h3 className="card-title">Upload</h3>
              <p className="card-description">Attach your PDF to earn points.</p>
            </div>
            <div className="upload-container">
              <label htmlFor="pdf-upload" className="upload-label">
                <Upload className="upload-icon" /> Select PDF to Upload
              </label>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {uploadedFile && (
                <div className="uploaded-file-info">
                  <CheckCircle className="uploaded-icon" />
                  <span>{uploadedFile.name} uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default PointsRewards