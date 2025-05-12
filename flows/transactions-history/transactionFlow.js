const { Suggestion, Payload } = require('dialogflow-fulfillment');
const { getFinancialYearRange, withContextManagement, getTransactionsData } = require("../../utilities/utils");
const { setUIRichresponse } = require("../../utilities/utils");

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
    const dateRange = agent.context.get('awaiting_time_period')?.parameters?.['date-period'];
    const contact = agent.context.get('contact_available')?.parameters?.['phone-number'];
    let start;
    let end;

    const date = agent.context.get('awaiting_time_period')?.parameters?.['date'];
    const date1 = agent.context.get('awaiting_time_period')?.parameters?.['date1'];

    if (date && !date1) {
        agent.context.set({ name: 'awaiting_time_period', lifespan: 1 });
        return agent.add("Please enter end Date Range");
    }

    if (dateRange) {
        start = new Date(dateRange.startDate);
        end = new Date(dateRange.endDate);
    } else {
        start = getFinancialYearRange(selectedOption).start;
        end = getFinancialYearRange(selectedOption).end;
    }
    if (end > new Date()) {
        agent.context.set({ name: 'awaiting_time_period', lifespan: 1 });
        return agent.add("Please enter end Date less than current date");
    }
    const userData = getTransactionsData().find(tran => tran.mobile === contact);
    const transactions = userData?.transactions || [];

    const filtered = transactions.filter(tran => {
        const tranDate = new Date(tran.date);
        return tranDate >= start && tranDate <= end;
    });

    if (filtered.length === 0) {
        agent.add("No transactions found");
        agent.add("Do you want to invest ?");
        agent.add(new Suggestion("Yes"));
        agent.add(new Suggestion("No"));
        agent.context.set({ name: 'awaiting_investment_choice', lifespan: 1 });
        return;
    }

    let message = '*Transactions in Selected Financial Year:*\n\n';
    message += 'Date       | Portfolio          | Amount          \n';
    message += '-----------|--------------------|-----------------\n';
    filtered.slice(-3).forEach(row => {
        message += `${row.date} | ${row.fund_name}  | ₹${row.amount}\n`;
    });

    agent.context.set({ name: 'awaiting_investment_choice', lifespan: 1 });
    setUIRichresponse(`<pre>${message}</pre>`, agent);
    agent.add("Do you want to invest more?");
    agent.add(new Suggestion("Yes"));
    agent.add(new Suggestion("No"));
}

module.exports = { handleTransactionHistory, handleFinancialYearSelection, handleTransactionFlow}