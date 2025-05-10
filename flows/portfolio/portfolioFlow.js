const { Suggestion } = require('dialogflow-fulfillment');
const { withContextManagement, getTransactionsData } = require("../../utilities/utils");


const handlePortfolioBeforeContactValidation = withContextManagement(
    function (agent) {
        if (!agent.context.get('contact_available')) {
            agent.context.set({ name: 'need_contact_number', lifespan: 1, parameters: { next_flow: 'portfolio' } });
            return agent.add('Please enter your registered 10-digit contact number.');
        }
        return handlePortfolioFlowAfterContactValidation(agent);
    },
    {
        clearOnEntry: true,
        keepContexts: ['need_contact_number', 'contact_available'],
        flowName: 'portfolio'
    }
);

function handlePortfolioFlowAfterContactValidation(agent) {
    const contact = agent.context.get('contact_available')?.parameters?.['phone-number'];
    const userData = getTransactionsData().find(tran => tran.mobile === contact);

    if (userData?.transactions?.length > 0) {
        agent.add('Kindly select one of your portfolios:');
        const uniqueFunds = new Set();
        userData.transactions.forEach(fund => {
            if (!uniqueFunds.has(fund.fund_id)) {
                uniqueFunds.add(fund.fund_id);
                agent.add(new Suggestion(`${fund.fund_name} - ${fund.fund_id}`));
            }
        });
        agent.context.set({ name: 'awaiting_portfolio_selection', lifespan: 2 });
    } else {
        agent.add("There are no funds available against your mobile number.");
        agent.add("Please explore funds to invest.");
        agent.add(new Suggestion("Explore Funds"));
    }
}

function handlePortfolioFundSelection(agent) {
    const contact = agent.context.get('contact_available')?.parameters?.['phone-number'];
    const fundId = agent.query.split('-').pop().trim();
    const userFunds = getTransactionsData().find(tran => tran.mobile === contact)?.transactions || [];
    const selectedFund = userFunds.filter(fund => fund.fund_id === fundId);

    if (selectedFund.length > 0) {
        const totalInvestment = selectedFund.reduce((sum, fund) => sum + (+fund.amount), 0);
        agent.add(`Your portfolio ${selectedFund[0].fund_name} valuation is: ₹${totalInvestment} on ${new Date().toLocaleDateString()}`);
    } else {
        agent.add("The selected fund was not found. Please choose a valid one.");
    }
}

module.exports = {
    handlePortfolioBeforeContactValidation,
    handlePortfolioFlowAfterContactValidation,
    handlePortfolioFundSelection
};
