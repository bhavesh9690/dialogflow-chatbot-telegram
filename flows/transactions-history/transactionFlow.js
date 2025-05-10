const { Suggestion, Payload } = require('dialogflow-fulfillment');
const { getFinancialYearRange, withContextManagement, getTransactionsData } = require("../../utilities/utils");

const handleTransactionHistory = withContextManagement(
    function (agent) {
        if (!agent.context.get('contact_available')) {
            agent.context.set({ name: 'need_contact_number', lifespan: 1, parameters: { next_flow: 'transaction' } });
            return agent.add('Please enter your registered 10-digit contact number.');
        }
        return handleTransactionFlow(agent);
    },
    {
        clearOnEntry: true,
        keepContexts: ['need_contact_number', 'contact_available'],
        flowName: 'transaction'
    }
);

const handleTransactionFlow = (agent) => {
    agent.context.set({ name: 'awaiting_time_period', lifespan: 1 });
    agent.add('Kindly provide a time period.');
    agent.add(new Suggestion('Current Financial Year'));
    agent.add(new Suggestion('Previous Financial Year'));
}


const handleFinancialYearSelection = (agent) => {
    const selectedOption = agent.query;
    const contact = agent.context.get('contact_available')?.parameters?.['phone-number'];
    const { start, end } = getFinancialYearRange(selectedOption);

    const userData = getTransactionsData().find(tran => tran.mobile === contact);
    const transactions = userData?.transactions || [];

    const filtered = transactions.filter(tran => {
        const tranDate = new Date(tran.date);
        return tranDate >= start && tranDate <= end;
    });

    if (filtered.length === 0) {
        agent.add("No transactions found for the selected financial year.");
        return;
    }

    let message = '*Transactions in Selected Financial Year:*\n\n';
    message += 'Date       | Portfolio          | Amount          \n';
    message += '-----------|--------------------|-----------------\n';
    filtered.slice(-3).forEach(row => {
        message += `${row.date} | ${row.fund_name} | ₹${row.amount}\n`;
    });

    agent.context.set({ name: 'awaiting_investment_choice', lifespan: 1 });
    agent.add(new Payload(agent.TELEGRAM, {
        "telegram": {
            text: `<pre>${message}</pre>`,
            parse_mode: "HTML"
        }
    }, { rawPayload: true, sendAsMessage: true }));

    agent.add("Do you want to invest more?");
    agent.add(new Suggestion("Yes"));
    agent.add(new Suggestion("No"));
}

module.exports = { handleTransactionHistory, handleFinancialYearSelection, handleTransactionFlow}