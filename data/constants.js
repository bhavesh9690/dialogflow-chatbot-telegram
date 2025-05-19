module.exports = {
    welcomeText: "Welcome to ABC Mutual Fund Services, What service would you like to use?",
    quickSuggestions: ["Portfolio Evaluation", "Explore Funds", "Transaction History"],
    mobileNumberText: "Kindly enter registered contact number",
    fundCategoryText: "Kindly select one of the categories to see funds:",
    mobileNumberInvalidText: "Please enter valid 10 digit mobile number",
    portfolioText: "Kindly select one of your portfolios",
    fundOptions: {
        Equity: ['ABC Nifty 50 Fund'],
        Hybrid: ['ABC Hybrid Fund']
    },
    portfolios: {
        '9876543210': ['QFP-123', 'QTF-456']
    },
    transactionData: {
        '9876543210': [
            { date: '2025-04-01', portfolio: 'QFP-123', amount: 10000 },
            { date: '2025-04-05', portfolio: 'QTF-456', amount: 15000 },
        ]
    }
};