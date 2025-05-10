const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");

const { handleWelcome, handleContactValidation } = require("./flows/welcome");

const {
  handlePortfolioFlowAfterContactValidation,
  handlePortfolioBeforeContactValidation,
  handlePortfolioFundSelection,
} = require("./flows/portfolio/portfolioFlow");

const {
  handleTransactionHistory,
  handleFinancialYearSelection,
} = require("./flows/transactions-history/transactionFlow");

const {
  handleFundsCategorySelection,
  handleFundsSelection,
  handleInvestFunds,
  handleStoreInvestedAmount,
  handleInvestMoreDecision,
  handleExploreFundsFlow,
} = require("./flows/explore-funds/exploreFundsFlow");

const app = express();
const PORT = process.env.PORT || 8080;

// Root endpoint to verify server is up
app.get("/", (req, res) => res.send("Server is online and running! bhavesh"));

// Dialogflow webhook handler
app.post("/webhook", express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });
  const intentMap = new Map();
  console.log(agent.intent);
  console.log(JSON.stringify(agent.contexts));
  intentMap.set("welcomeMutualFund", handleWelcome);
  intentMap.set("PortfolioFlow", handlePortfolioFlowAfterContactValidation);
  intentMap.set("ContactNumber", handleContactValidation);
  intentMap.set("Portfolio", handlePortfolioBeforeContactValidation);
  intentMap.set("portfolio-selection", handlePortfolioFundSelection);
  intentMap.set("Explore-Funds", handleExploreFundsFlow);
  intentMap.set("Category-Selection", handleFundsCategorySelection);
  intentMap.set("Fund-Selection", handleFundsSelection);
  intentMap.set("Invest", handleInvestFunds);
  intentMap.set("store-amount", handleStoreInvestedAmount);
  intentMap.set("Transaction-history", handleTransactionHistory);
  intentMap.set("Transaction-List", handleFinancialYearSelection);
  intentMap.set("Invest-More", handleInvestMoreDecision);
  agent.handleRequest(intentMap);
});

app.listen(PORT, async () => {
  console.log(`✅ Server started on port ${PORT}`);
});
