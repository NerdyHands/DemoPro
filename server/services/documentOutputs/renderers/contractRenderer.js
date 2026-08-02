const { buildContractDocxBlocks } = require('../contractDocumentContent');

function renderContractDocx(contract, customer, estimate, milestones = []) {
  return buildContractDocxBlocks(contract, customer, estimate, milestones);
}

module.exports = { renderContractDocx };
