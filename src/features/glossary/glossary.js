import React, { useState } from "react";
import "./glossary.css";

const terms = [
  { title: "Interest Rate", desc: "The extra money you pay when you borrow, or the extra money you earn when you save." },
  { title: "APR (Annual Percentage Rate)", desc: "How much borrowing money actually costs you in a year. Higher APR = more expensive debt." },
  { title: "Assets", desc: "Anything you own that’s worth money, like cash, a laptop, jewelry, or a business." },
  { title: "Liabilities", desc: "Money you owe — like student loans, credit cards, or a car note." },
  { title: "Budget", desc: "A plan for how you’ll spend and save your money." },
  { title: "Credit Score", desc: "A number (300–850) that shows how well you pay back money you borrow. Higher = better." },
  { title: "Compound Interest", desc: "When the money you save earns money, and then that money earns money too." },
  { title: "Emergency Fund", desc: "Money you put aside for unexpected stuff — like a broken phone or medical bill." },
  { title: "Diversify", desc: "Not putting all your money in one place. If one thing loses value, you’ve still got others." },
  { title: "Net Worth", desc: "What you own (assets) minus what you owe (liabilities)." }
];

const tips = [
  { title: "Think about your thinking", desc: "Take a moment to “think about your thinking.” That might sound a little weird but to make a good decision it helps to take a minute or so to think about the choice you are making – and why you are making it. Many people make decisions without really thinking about why they are making that particular decision. Is it because it’s the kind of decision you have always made – because you are trying to make someone happy – because you think it will make you happy – because of what someone taught you – because it’s part of who you are and reflects your values …?" },
  { title: "Your Opportunity Cost", desc: "Consider your opportunity cost – that is, what are you giving up in making the decision? Every decision has an opportunity cost – giving up one thing to get another. You could be giving up something else you could buy with the money you are spending, or something else you could do with the time you are investing, or another city you could be visiting, or another course at school you could be taking. Among all the possible alternatives, what’s the “next best thing” you will be giving up? That is your opportunity cost." },
  { title: "Future Trade-offs", desc: "Consider the future possibilities. That is, in addition to what you might be giving up today, what might you be giving up in the future because of your decision? What could be different if you waited?" },
  { title: "Can you afford the cost?", desc: "Finally, can you afford it? Do you have the money to pay for it? If not, and you are going to use a credit card, will you have the money to pay off the credit card balance when you get your bill? Or will you be “carrying the cost” into the future – and paying interest? If you are going to pay interest you should consider that as part of your costs – and as part of your decision." }
];

const Glossary = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleTip = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="glossary-container">
      <h1>Glossary & Tips</h1>
      <p className="subtitle">Understand financial terms and learn tips to make better money decisions.</p>

      {/* Financial Terms */}
      <h2>Financial Terms Glossary</h2>
      <div className="card-grid">
        {terms.map((item, index) => (
          <div className="info-card" key={index}>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Tips with Dropdowns */}
      <h2>Tips for Making Good Money Decisions</h2>
      <div className="tips-container">
        {tips.map((tip, index) => (
          <div className="tip-item" key={index}>
            <div className="tip-header" onClick={() => toggleTip(index)}>
              <span>{tip.title}</span>
              <span className="arrow">{openIndex === index ? "▲" : "▼"}</span>
            </div>
            {openIndex === index && <div className="tip-content">{tip.desc}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Glossary;
