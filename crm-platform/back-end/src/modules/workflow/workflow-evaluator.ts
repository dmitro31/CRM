import { ConditionOperator } from './dto/condition.dto'
import { WorkflowEvent } from './dto/trigger.dto'

export class WorkflowEvaluator {
  static matchesTrigger(
    trigger: { event: string; fieldKey?: string },
    event: 'RECORD_CREATED' | 'RECORD_UPDATED',
    previousData: Record<string, unknown> | null,
    currentData: Record<string, unknown>,
  ): boolean {
    if (trigger.event === WorkflowEvent.RECORD_CREATED) {
      return event === 'RECORD_CREATED'
    }

    if (trigger.event === WorkflowEvent.RECORD_UPDATED) {
      return event === 'RECORD_UPDATED'
    }

    if (trigger.event === WorkflowEvent.FIELD_CHANGED) {
      if (event !== 'RECORD_UPDATED' || !previousData) {
        return false
      }

      const fieldKey = trigger.fieldKey

      if (!fieldKey) {
        return false
      }

      return previousData[fieldKey] !== currentData[fieldKey]
    }

    return false
  }

  static evaluateCondition(
    condition: {
      fieldKey: string
      operator: ConditionOperator
      value: unknown
    },
    data: Record<string, unknown>,
  ): boolean {
    const actual = data[condition.fieldKey]

    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        return actual === condition.value
      case ConditionOperator.NOT_EQUALS:
        return actual !== condition.value
      case ConditionOperator.GT:
        return (
          typeof actual === 'number' &&
          typeof condition.value === 'number' &&
          actual > condition.value
        )
      case ConditionOperator.LT:
        return (
          typeof actual === 'number' &&
          typeof condition.value === 'number' &&
          actual < condition.value
        )
      default:
        return false
    }
  }
}