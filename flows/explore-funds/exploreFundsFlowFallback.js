const { Payload, Suggestion } = require("dialogflow-fulfillment");
const {
  handleExploreFundsFlow,
  showFunds,
} = require("./exploreFundsFlow");

const handleCategoryFallbackIntent = (agent) => {
  const categoryContext = agent.context.get("awaiting_category_selection");
  if (categoryContext) {
    agent.add(
      new Payload(
        agent.TELEGRAM,
        {
          telegram: {
            text: "<b> ❌ Error:</b> This is not valid category, Please choose the correct one",
            parse_mode: "HTML",
          },
        },
        { rawPayload: true, sendAsMessage: true }
      )
    );
    agent.context.set({ name: 'awaiting_category_selection', lifespan: 2 });
    handleExploreFundsFlow(agent);
  }
};

const handleFundFallbackContent = (agent) => {
  agent.add(
    new Payload(
      agent.TELEGRAM,
      {
        telegram: {
          text: "<b> ❌ Error:</b> Selected fund is not the valid fund, please choose the correct one",
          parse_mode: "HTML",
        },
      },
      { rawPayload: true, sendAsMessage: true }
    )
  );
  const selectedCategory = agent.context.get('awaiting_funds_selection')?.parameters?.['fund-category'];
  showFunds(agent, selectedCategory);
};

const handleInvestOptionFallback = (agent) => {
    agent.add(
      new Payload(
        agent.TELEGRAM,
        {
          telegram: {
            text: "<b> ❌ Error:</b> Please select the provided option",
            parse_mode: "HTML",
          },
        },
        { rawPayload: true, sendAsMessage: true }
      )
    );
    agent.add(new Suggestion("Invest"));
    agent.add(new Suggestion("Return to Main Menu"));
    agent.context.set({ name: 'selected_funds', lifespan: 2 });
}

const handleIncorrectAmount = (agent) => {
  agent.add(
    new Payload(
      agent.TELEGRAM,
      {
        telegram: {
          text: "<b> ❌ Error:</b> Please enter the amount in number",
          parse_mode: "HTML",
        },
      },
      { rawPayload: true, sendAsMessage: true }
    )
  );
};

module.exports = {
  handleCategoryFallbackIntent,
  handleFundFallbackContent,
  handleIncorrectAmount,
  handleInvestOptionFallback
};
