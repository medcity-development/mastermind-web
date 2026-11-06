export function getHistoryLoadStatus(results, failedTypes = []) {
  const unverifiedTypes = [];
  let unresolvedCount = 0;

  for (const [type, result] of results) {
    if (!result.partialVerification) continue;
    unverifiedTypes.push(type);
    unresolvedCount += Math.max(0, Number(result.unresolvedCount) || 0);
  }

  return {
    historyIncomplete: failedTypes.length > 0 || unverifiedTypes.length > 0,
    failedTypes: [...failedTypes],
    unverifiedTypes,
    unresolvedCount,
  };
}
