import { describe, expect, it } from '@jest/globals';
import { WorkflowEvaluator } from './workflow-evaluator';
import { ConditionOperator } from './dto/condition.dto';
import { WorkflowEvent } from './dto/trigger.dto';

describe('WorkflowEvaluator', () => {
  describe('matchesTrigger', () => {
    it('matches RECORD_CREATED trigger on create event', () => {
      const result = WorkflowEvaluator.matchesTrigger(
        { event: WorkflowEvent.RECORD_CREATED },
        'RECORD_CREATED',
        null,
        {},
      );

      expect(result).toBe(true);
    });

    it('does not match RECORD_CREATED trigger on update event', () => {
      const result = WorkflowEvaluator.matchesTrigger(
        { event: WorkflowEvent.RECORD_CREATED },
        'RECORD_UPDATED',
        {},
        {},
      );

      expect(result).toBe(false);
    });

    it('matches FIELD_CHANGED when the field value differs', () => {
      const result = WorkflowEvaluator.matchesTrigger(
        { event: WorkflowEvent.FIELD_CHANGED, fieldKey: 'status' },
        'RECORD_UPDATED',
        { status: 'Новий' },
        { status: 'Завершено' },
      );

      expect(result).toBe(true);
    });

    it('does not match FIELD_CHANGED when the field value is the same', () => {
      const result = WorkflowEvaluator.matchesTrigger(
        { event: WorkflowEvent.FIELD_CHANGED, fieldKey: 'status' },
        'RECORD_UPDATED',
        { status: 'Новий' },
        { status: 'Новий' },
      );

      expect(result).toBe(false);
    });

    it('does not match FIELD_CHANGED without previousData', () => {
      const result = WorkflowEvaluator.matchesTrigger(
        { event: WorkflowEvent.FIELD_CHANGED, fieldKey: 'status' },
        'RECORD_CREATED',
        null,
        { status: 'Новий' },
      );

      expect(result).toBe(false);
    });

    it('does not match FIELD_CHANGED without fieldKey', () => {
      const result = WorkflowEvaluator.matchesTrigger(
        { event: WorkflowEvent.FIELD_CHANGED },
        'RECORD_UPDATED',
        { status: 'Новий' },
        { status: 'Завершено' },
      );

      expect(result).toBe(false);
    });
  });

  describe('evaluateCondition', () => {
    it('evaluates equals correctly', () => {
      const result = WorkflowEvaluator.evaluateCondition(
        {
          fieldKey: 'status',
          operator: ConditionOperator.EQUALS,
          value: 'Завершено',
        },
        { status: 'Завершено' },
      );

      expect(result).toBe(true);
    });

    it('evaluates not_equals correctly', () => {
      const result = WorkflowEvaluator.evaluateCondition(
        {
          fieldKey: 'status',
          operator: ConditionOperator.NOT_EQUALS,
          value: 'Завершено',
        },
        { status: 'Новий' },
      );

      expect(result).toBe(true);
    });

    it('evaluates gt correctly for numbers', () => {
      const result = WorkflowEvaluator.evaluateCondition(
        { fieldKey: 'price', operator: ConditionOperator.GT, value: 100 },
        { price: 150 },
      );

      expect(result).toBe(true);
    });

    it('returns false for gt when types do not match', () => {
      const result = WorkflowEvaluator.evaluateCondition(
        { fieldKey: 'price', operator: ConditionOperator.GT, value: 100 },
        { price: '150' },
      );

      expect(result).toBe(false);
    });

    it('evaluates lt correctly for numbers', () => {
      const result = WorkflowEvaluator.evaluateCondition(
        { fieldKey: 'stock', operator: ConditionOperator.LT, value: 10 },
        { stock: 5 },
      );

      expect(result).toBe(true);
    });
  });
});
