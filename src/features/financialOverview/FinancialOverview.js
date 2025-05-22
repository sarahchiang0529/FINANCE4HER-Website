import { useMemo } from "react"
import { useFinancial } from "../../contexts/FinancialContext"
import ChartComponent from "../../components/Charts/ChartComponent"
import { formatCurrency, formatMonthYear, getMonthDateRange } from "../../utils/financialUtils"
import "./FinancialOverview.css"

function FinancialOverview() {
  const { income, expenses } = useFinancial()

  // Get current month's date range
  const currentMonth = new Date()
  const dateRange = getMonthDateRange(currentMonth)

  // Filter transactions for current month
  const currentMonthIncome = useMemo(() => {
    // Get fresh data from localStorage each time to ensure we have the latest
    const storedIncome = localStorage.getItem("incomeData")
    const parsedIncome = storedIncome ? JSON.parse(storedIncome) : []

    return parsedIncome.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= dateRange.start && itemDate <= dateRange.end
    })
  }, [dateRange, income])

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= dateRange.start && itemDate <= dateRange.end
    })
  }, [expenses, dateRange])

  // Calculate totals
  const totalIncome = useMemo(() => currentMonthIncome.reduce((sum, item) => sum + item.value, 0), [currentMonthIncome])

  const totalExpenses = useMemo(
    () => currentMonthExpenses.reduce((sum, item) => sum + item.value, 0),
    [currentMonthExpenses],
  )

  const balance = totalIncome - totalExpenses

  // Prepare chart data
  const incomeChartData = useMemo(
    () =>
      currentMonthIncome.map((item) => ({
        category: item.category,
        value: item.value,
      })),
    [currentMonthIncome],
  )

  const expenseChartData = useMemo(
    () =>
      currentMonthExpenses.map((item) => ({
        category: item.category,
        value: item.value,
      })),
    [currentMonthExpenses],
  )

  return (
    <div className="financial-overview-container">
      <div className="page-header">
        <h1 className="page-title">Financial Overview</h1>
        <p className="page-subtitle">Overview of your finances for {formatMonthYear(currentMonth)}</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-content">
            <div className="summary-icon-wrapper income-icon">
              <div className="summary-icon">💰</div>
            </div>
            <h3 className="summary-title">Total Income</h3>
            <p className="summary-value">{formatCurrency(totalIncome)}</p>
            <p className="summary-period">{formatMonthYear(currentMonth)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <div className="summary-icon-wrapper expense-icon">
              <div className="summary-icon">💸</div>
            </div>
            <h3 className="summary-title">Total Expenses</h3>
            <p className="summary-value">{formatCurrency(totalExpenses)}</p>
            <p className="summary-period">{formatMonthYear(currentMonth)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <div className={`summary-icon-wrapper ${balance >= 0 ? "positive-icon" : "negative-icon"}`}>
              <div className="summary-icon">{balance >= 0 ? "✅" : "⚠️"}</div>
            </div>
            <h3 className="summary-title">Balance</h3>
            <p className={`summary-value ${balance >= 0 ? "positive-balance" : "negative-balance"}`}>
              {formatCurrency(balance)}
            </p>
            <p className="summary-period">{formatMonthYear(currentMonth)}</p>
          </div>
        </div>
      </div>

      <div className="financial-overview-grid">
        <div className="card">
          <h2 className="card-title">Income Distribution</h2>
          <p className="card-description">Breakdown of your income sources</p>

          {incomeChartData.length > 0 ? (
            <div className="chart-container-wrapper">
              <ChartComponent data={incomeChartData} chartType="doughnut" />
            </div>
          ) : (
            <div className="no-data-message">
              <p>No income data for this period.</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">Expense Distribution</h2>
          <p className="card-description">Breakdown of your spending</p>

          {expenseChartData.length > 0 ? (
            <div className="chart-container-wrapper">
              <ChartComponent data={expenseChartData} chartType="doughnut" />
            </div>
          ) : (
            <div className="no-data-message">
              <p>No expense data for this period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FinancialOverview