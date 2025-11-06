// [P1][INTEGRITY][TEST] Zod schema tests for schedules and shifts
// Tags: P1, INTEGRITY, TEST, ZOD, VALIDATION
import { describe, it, expect } from 'vitest';

import {
  Schedule,
  ScheduleCreateSchema,
  ScheduleUpdateSchema,
  Shift,
  ShiftCreateSchema,
  ShiftUpdateSchema,
} from '../../src/schedules';

function iso(date: string) { return new Date(date).toISOString(); }

describe('Schedule schemas', () => {
  it('validates a full Schedule record', () => {
    const data = {
      id: 'sched-1',
      orgId: 'org-1',
      name: 'Week 1',
      description: 'First week',
      startDate: iso('2025-01-01T09:00:00Z'),
      endDate: iso('2025-01-07T17:00:00Z'),
      status: 'draft',
      createdAt: iso('2025-01-01T00:00:00Z'),
      createdBy: 'user-1',
    };
    expect(() => Schedule.parse(data)).not.toThrow();
  });

  it('ScheduleCreateSchema enforces startDate <= endDate', () => {
    const valid = {
      name: 'Week 1',
      startDate: iso('2025-01-01T00:00:00Z'),
      endDate: iso('2025-01-02T00:00:00Z'),
    };
    const invalid = {
      name: 'Week bad',
      startDate: iso('2025-01-03T00:00:00Z'),
      endDate: iso('2025-01-02T00:00:00Z'),
    };
    expect(() => ScheduleCreateSchema.parse(valid)).not.toThrow();
    expect(() => ScheduleCreateSchema.parse(invalid)).toThrow(/startDate must be before or equal to endDate/);
  });

  it('ScheduleUpdateSchema allows partial updates', () => {
    expect(() => ScheduleUpdateSchema.parse({ name: 'New name' })).not.toThrow();
    expect(() => ScheduleUpdateSchema.parse({ status: 'published' })).not.toThrow();
  });
});

describe('Shift schemas', () => {
  it('validates a full Shift record', () => {
    const data = {
      id: 'shift-1',
      scheduleId: 'sched-1',
      positionId: 'pos-1',
      userId: 'user-1',
      startTime: iso('2025-01-01T09:00:00Z'),
      endTime: iso('2025-01-01T17:00:00Z'),
      status: 'draft',
      breakMinutes: 30,
      createdAt: iso('2025-01-01T00:00:00Z'),
    };
    expect(() => Shift.parse(data)).not.toThrow();
  });

  it('ShiftCreateSchema enforces startTime < endTime', () => {
    const good = {
      positionId: 'pos-1',
      startTime: iso('2025-01-01T09:00:00Z'),
      endTime: iso('2025-01-01T10:00:00Z'),
      breakMinutes: 15,
    };
    const bad = {
      positionId: 'pos-1',
      startTime: iso('2025-01-01T10:00:00Z'),
      endTime: iso('2025-01-01T09:00:00Z'),
    };
    expect(() => ShiftCreateSchema.parse(good)).not.toThrow();
    expect(() => ShiftCreateSchema.parse(bad)).toThrow(/startTime must be before endTime/);
  });

  it('ShiftCreateSchema ensures breakMinutes < duration', () => {
    const tooLongBreak: Record<string, unknown> = {
      positionId: 'pos-1',
      startTime: iso('2025-01-01T09:00:00Z'),
      endTime: iso('2025-01-01T10:00:00Z'),
      breakMinutes: 120,
    };
    expect(() => ShiftCreateSchema.parse(tooLongBreak)).toThrow(/Break minutes must be less than shift duration/);
  });

  it('ShiftUpdateSchema allows partial updates', () => {
    expect(() => ShiftUpdateSchema.parse({ notes: 'updated' })).not.toThrow();
    expect(() => ShiftUpdateSchema.parse({ status: 'cancelled' })).not.toThrow();
  });
});
