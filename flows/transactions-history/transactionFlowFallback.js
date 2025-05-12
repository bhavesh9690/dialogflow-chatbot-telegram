const { setUIRichresponse } = require('../../utilities/utils')

const handleTransactionTimeRange = (agent) => {
  setUIRichresponse("<b> ❌ Error:</b> Please enter valid date", agent);
};

module.exports = {
  handleTransactionTimeRange
};
