const { Suggestion } = require('dialogflow-fulfillment');
const { getTransactionsData, saveTransactionsData, clearAllExcept } = require("../../utilities/utils")
const fundData = require('../../data/fund&categorysample.json');

const handleExploreFundsFlow = (agent) => {
    agent.add('Kindly select one of the categories to see funds:');
    fundData.forEach(c => agent.add(new Suggestion(c.category)));
    agent.context.set({ name: 'awaiting_category_selection', lifespan: 2 });
}

// Intent:  Category-Selection, context: awaiting_category_selection
const handleFundsCategorySelection = (agent) => {
    const selectedCategory = agent.context.get('awaiting_category_selection')?.parameters?.['fund-category'];
    agent.context.delete('awaiting_category_selection');
    showFunds(agent, selectedCategory);
}

const showFunds = (agent, selectedCategory) => {
    const category = fundData.find(data => data.category === selectedCategory);
    if (category) {
        agent.add("Select one of below fund:");
        category.funds.forEach(fund => agent.add(new Suggestion(fund.fund_name)));
        agent.context.set({ name: 'awaiting_funds_selection', lifespan: 2, parameters: {'fund-category': selectedCategory} });
    }
}

// Intent:  Fund-Selection, context: awaiting_funds_selection
const handleFundsSelection = (agent) => {
    const selectedFund = agent.context.get('awaiting_funds_selection')?.parameters?.['fund-name'];
    agent.add(`Selected fund details:\n
        It has ratio as 30%(Debt) - 30%(Large Cap Equity)\n
        20%(Mid Cap Equity) - 20%(Small Cap Equity) with a 15% CAGR\n
        For more details click: https://www.moneycontrol.com/mutual-funds/nav/hdfc-focused-30-fund-direct-plan-growth/MHD1150`);
    agent.context.set({ name: 'selected_funds', lifespan: 5, parameters: { fund_name: selectedFund } });
    agent.add(new Suggestion("Invest"));
    agent.add(new Suggestion("Return to Main Menu"));
    agent.context.delete('awaiting_funds_selection');
}

// Intent:  Invest, context: selected_funds
const handleInvestFunds = (agent) => {
    const contact = agent.context.get('contact_available')?.parameters?.['phone-number'];
    const selectedFund = agent.context.get('selected_funds')?.parameters?.['fund_name'];
    agent.context.delete("selected_funds");
    if (!contact) {
        agent.context.set({ name: 'need_contact_number', lifespan: 1, parameters: { next_flow: 'investFund', fund_name: selectedFund } });
        return agent.add('Please enter your registered 10-digit contact number.');
    }
    agent.add("Enter amount in Rupees");
    ["1000", "2000", "5000", "10000"].forEach(amount => agent.add(new Suggestion(amount)));
    agent.context.set({ name: 'store_amount', lifespan: 1, parameters: {fund_name:selectedFund} });
}

// Intent: store-amount, context: store_amount
const handleStoreInvestedAmount = (agent) => {
    const amount = agent.context.get('store_amount')?.parameters?.number;
    const fundName = agent.context.get('store_amount')?.parameters?.fund_name;
    const contact = agent.context.get('contact_available')?.parameters?.['phone-number'];
    const fundId = fundData.flatMap(c => c.funds).find(f => f.fund_name === fundName)?.fund_id;

    if (!contact || !fundName || !fundId) return agent.add("Something went wrong. Please try again.");
    if (amount >= 50000) {
        agent.context.set({ name: 'store_amount', lifespan: 1 });
        return agent.add("Enter amount less than 50000");
    }

    const investment = { date: new Date().toISOString().split('T')[0], amount: +amount, fund_id: fundId, fund_name: fundName };
    const allInvestments = getTransactionsData();
    const user = allInvestments.find(u => u.mobile === contact);

    if (user) user.transactions.push(investment);
    else allInvestments.push({ mobile: contact, transactions: [investment] });

    saveTransactionsData(allInvestments);
    agent.add("We have successfully invested your fund.")
    agent.add("Thank you for choosing our services");
    clearAllExcept(agent);
}



const handleInvestMoreDecision = (agent) => {
    return agent.query.toLowerCase() === 'yes' ? handleExploreFundsFlow(agent) : agent.add("Thank you for choosing our services");
}

module.exports = {
    handleFundsCategorySelection,
    handleFundsSelection,
    handleInvestFunds,
    handleStoreInvestedAmount,
    handleInvestMoreDecision,
    handleExploreFundsFlow,
    showFunds
}