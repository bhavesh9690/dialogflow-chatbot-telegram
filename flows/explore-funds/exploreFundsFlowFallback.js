const { Payload, Suggestion } = require("dialogflow-fulfillment");
const {
  handleExploreFundsFlow,
  showFunds,
} = require("./exploreFundsFlow");
const { setUIRichresponse } = require("../../utilities/utils");

const handleCategoryFallbackIntent = (agent) => {
  const categoryContext = agent.context.get("awaiting_category_selection");
  if (categoryContext) {
    setUIRichresponse("<b> ❌ Error:</b> This is not valid category, Please choose the correct one", agent);
    agent.context.set({ name: 'awaiting_category_selection', lifespan: 2 });
    handleExploreFundsFlow(agent);
  }
};

const handleFundFallbackContent = (agent) => {
    setUIRichresponse("<b> ❌ Error:</b> Selected fund is not the valid fund, please choose the correct one", agent);
    const selectedCategory = agent.context.get('awaiting_funds_selection')?.parameters?.['fund-category'];
    showFunds(agent, selectedCategory);
};

const handleInvestOptionFallback = (agent) => {
    setUIRichresponse("<b> ❌ Error:</b> Please select the provided option", agent);
    agent.add(new Suggestion("Invest"));
    agent.add(new Suggestion("Return to Main Menu"));
    agent.context.set({ name: 'selected_funds', lifespan: 2 });
}

const handleIncorrectAmount = (agent) => {
  setUIRichresponse("<b> ❌ Error:</b> Please enter the amount in number", agent);
};

module.exports = {
  handleCategoryFallbackIntent,
  handleFundFallbackContent,
  handleIncorrectAmount,
  handleInvestOptionFallback
};
