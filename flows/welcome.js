const { Suggestion, Payload } = require('dialogflow-fulfillment');
const configsData = require('../data/constants');
const { isValidPhoneNumber, clearAllExcept } = require("../utilities/utils");
const { handlePortfolioFlowAfterContactValidation } = require("./portfolio/portfolioFlow");
const { handleTransactionFlow } = require("./transactions-history/transactionFlow");
const { handleInvestFunds } = require("./explore-funds/exploreFundsFlow");

const handleWelcome = (agent) => {
    clearAllExcept(agent);
    agent.add(configsData.welcomeText);
    configsData.quickSuggestions.forEach(sug => agent.add(new Suggestion(sug)));
}

// Intent: ContactNumber, context: need_contact_number
const handleContactValidation = (agent) => {
    const contact = agent.query;
    const nextFlow = agent.context.get('need_contact_number')?.parameters?.next_flow;
    const selectedFund = agent.context.get('need_contact_number')?.parameters?.fund_name;
    if (isValidPhoneNumber(contact)) {
        agent.context.set({ name: 'contact_available', lifespan: 20, parameters: { 'phone-number': contact } });
        switch (nextFlow) {
            case 'portfolio': return handlePortfolioFlowAfterContactValidation(agent);
            case 'transaction': return handleTransactionFlow(agent);
            case 'investFund': {
                agent.context.set({ name: 'selected_funds', lifespan: 2, parameters: { fund_name: selectedFund } });
                return handleInvestFunds(agent);
            }
        }
    } else {
        console.log(contact);
        agent.context.set({ name: 'need_contact_number', lifespan: 1, parameters: { next_flow: nextFlow } });
        agent.add('Invalid contact number. Please enter a valid 10-digit number.');
    }
}

module.exports = {
    handleWelcome,
    handleContactValidation
}