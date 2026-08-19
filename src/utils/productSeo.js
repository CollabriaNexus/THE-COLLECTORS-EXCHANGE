const NEW_CONDITION = 'https://schema.org/NewCondition';
const USED_CONDITION = 'https://schema.org/UsedCondition';

export function getProductSchemaCondition(condition) {
  return condition === 'New' ? NEW_CONDITION : USED_CONDITION;
}
