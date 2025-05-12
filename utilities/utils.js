const fs = require('fs');
const path = require('path');
const { Payload } = require("dialogflow-fulfillment");

const transactionsDataPath = path.join(__dirname, '../data/transactionhistory.json');

const clearAllExcept = (agent, keep = []) => {
    const contexts = agent.contexts || [];
    contexts.forEach(ctx => {
        const name = ctx.name;
        if (!keep.includes(name)) {
            agent.context.set({ name, lifespan: 0 });
        }
    });
}

const isValidPhoneNumber = (number) => /^\d{10}$/.test(number);
const getTransactionsData = () => fs.existsSync(transactionsDataPath) ? JSON.parse(fs.readFileSync(transactionsDataPath)) : [];
const saveTransactionsData = (data) => fs.writeFileSync(transactionsDataPath, JSON.stringify(data, null, 2));

const getFinancialYearRange = (option) => {
    const now = new Date();
    let start, end;

    const year = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();

    if (option === 'Current Financial Year') {
        start = new Date(`${year}-04-01`);
        end = now;
    } else if (option === 'Previous Financial Year') {
        start = new Date(`${year - 1}-04-01`);
        end = new Date(`${year}-03-31`);
    }

    return { start, end };
}

const withContextManagement = (handler, options = {}) => {
    return function wrappedHandler(agent) {
        const keepContexts = options.keepContexts || [];
        if (options.clearOnEntry) {
            clearAllExcept(agent, keepContexts);
        }
        return handler(agent);
    };
}

const setUIRichresponse = (text, agent) => {
    return agent.add(
      new Payload(
        agent.TELEGRAM,
        {
          telegram: {
            text,
            parse_mode: "HTML",
          },
        },
        { rawPayload: true, sendAsMessage: true }
      )
    );
}

module.exports = { withContextManagement, isValidPhoneNumber, getFinancialYearRange, getTransactionsData, saveTransactionsData, clearAllExcept, setUIRichresponse };