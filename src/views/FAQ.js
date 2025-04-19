import { useState } from "react"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import "../stylesheets/FAQ.css"

function FAQ() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedIndex, setExpandedIndex] = useState(null)

  const faqItems = [
    {
      question: "What's the difference between a checking and a savings account?",
      answer:
        "A checking account is for daily spending—you can use it for purchases, bills, or cash withdrawals. A savings account is meant to store money for future goals and usually earns interest, helping your money grow over time.",
    },
    {
      question: "How do I open a bank account and what do I need to bring with me?",
      answer:
        "To open a bank account, you typically need valid ID (like a student card, passport, or government-issued ID), proof of address, and sometimes a guardian if you're under 18. Many banks offer youth accounts with no fees.",
    },
    {
      question: "Why is saving money important and how much should I save?",
      answer:
        "Saving helps you prepare for emergencies, big goals, and your future. Try to save at least 10% of your income. Start small—what matters most is building the habit.",
    },
    {
      question: "What's a budget and how do I make one that works for me?",
      answer:
        "A budget is a plan for your money. Write down how much you earn and your expenses, then set limits for different categories (like food, entertainment, savings).",
    },
    {
      question: "What's the best way to track my spending?",
      answer:
        "Use budgeting apps, keep a spending journal, or check your bank statements weekly. Knowing where your money goes is the first step to gaining control.",
    },
    {
      question: "How can I start saving if I only make a little bit of money?",
      answer:
        'Start with small amounts—like $1 or $5 a week. Use the "pay yourself first" method: as soon as you get money, put some into savings before spending the rest.',
    },
    {
      question: "What are needs vs. wants, and how do I manage them?",
      answer:
        "Needs are essentials (food, shelter, school supplies), wants are extras (new clothes, fast food, entertainment). Ask yourself: Do I need this now? Can I afford it without skipping savings?",
    },
    {
      question: "What is interest, and how does it work in savings or credit?",
      answer:
        "Interest is extra money earned on savings (good!) or extra money owed on borrowed money (not so good). In savings, banks pay you interest. With loans or credit cards, you pay interest on what you borrow.",
    },
    {
      question: "What is credit, and when should I start thinking about it?",
      answer:
        "Credit is borrowed money you pay back later. You start building a credit history once you get a credit card, phone plan, or student loan. It affects your ability to get loans, apartments, and sometimes jobs. Learn early!",
    },
    {
      question: "How do credit cards work—and should I get one when I turn 18?",
      answer:
        "A credit card lets you buy now and pay later—but if you don't pay the full amount each month, you'll pay interest. Start with a low-limit student card, use it for small purchases, and always pay it off in full.",
    },
    {
      question: "How can I make money as a teenager or young adult?",
      answer:
        "Babysitting, freelancing, part-time jobs, tutoring, starting a small business (like lashes, braids, digital art), or selling items online are great options. Look for something that builds your skills too.",
    },
    {
      question: "What's the difference between gross and net income?",
      answer:
        "Gross income is what you earn before taxes. Net income is what you actually take home after deductions. Net income = your real paycheck.",
    },
    {
      question: "How do taxes work, and why do I see deductions on my paycheck?",
      answer:
        "Taxes fund government services (like schools and roads). Your paycheck might have deductions like income tax, Canada Pension Plan (CPP), and Employment Insurance (EI). You may get a refund when you file taxes.",
    },
    {
      question: "What is financial aid, and how can I pay for college or training programs?",
      answer:
        "Financial aid includes grants, scholarships, and student loans. In Canada, OSAP (Ontario) or provincial student aid programs can help. Look for bursaries and awards at schools or through community organizations.",
    },
    {
      question: "How can I protect myself from scams or fraud?",
      answer:
        "Never share banking info or passwords. Watch for fake emails or texts asking for money or gift cards. If it sounds too good to be true—it probably is. Use strong passwords and report anything suspicious.",
    },
    {
      question: "What is investing, and when should I start learning about it?",
      answer:
        "Investing is using your money to make more money over time—like in stocks, ETFs, or mutual funds. You can start learning as soon as you want, even with apps like Wealthsimple. Start investing once you've saved up an emergency fund.",
    },
    {
      question: "What does it mean to build wealth, and how can I start?",
      answer:
        "Building wealth means growing your money over time through saving, investing, and smart financial choices. Start by saving regularly, avoiding debt, and learning about financial tools like TFSA and RRSP.",
    },
    {
      question: "How can I be financially independent before I turn 25?",
      answer:
        "Build good habits now: budget, save consistently, learn to invest, and avoid unnecessary debt. Get financial advice, set goals, and keep learning. Independence comes with preparation and discipline.",
    },
    {
      question: "What apps or tools can help me manage my money better?",
      answer:
        "Some great tools include: Mint – for budgeting, Koho – for saving automatically, Wealthsimple – for investing, Spending Tracker – for tracking daily expenses. Use what works for you and check it weekly.",
    },
    {
      question: "Who can I talk to if I have questions about money and don't know where to start?",
      answer:
        "Talk to a trusted adult, teacher, or financial advisor. You can also connect with programs like Finance 4 HER, attend workshops, or watch YouTube videos from reliable sources.",
    },
  ]

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="faq-container">
      <div className="page-header">
        <h1 className="page-title">Frequently Asked Questions</h1>
        <p className="page-subtitle">Find answers to common financial questions</p>
      </div>

      <div className="faq-card">
        <div className="search-container">
          <div className="input-with-icon search-input">
            <div className="input-icon">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="faq-list">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item, index) => (
              <div key={index} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => handleToggle(index)}
                  aria-expanded={expandedIndex === index}
                >
                  <span>{item.question}</span>
                  {expandedIndex === index ? <ChevronUp className="faq-icon" /> : <ChevronDown className="faq-icon" />}
                </button>
                {expandedIndex === index && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No matching questions found. Try a different search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FAQ