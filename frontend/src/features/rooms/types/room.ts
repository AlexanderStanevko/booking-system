import { z } from 'zod';

export const equipmentSchema = z.enum(['Projector', 'TvScreen', 'VideoConferencing', 'Whiteboard']);
export type Equipment = z.infer<typeof equipmentSchema>;

export const equipmentLabels = {
  Projector: 'Projector',
  TvScreen: 'TV screen',
  VideoConferencing: 'Video conferencing',
  Whiteboard: 'Whiteboard',
} satisfies Record<Equipment, string>;

export const roomSchema = z.object({
  id: z.guid(),
  name: z.string(),
  capacity: z.number().int(),
  floor: z.number().int(),
  location: z.string(),
  equipment: z.string(),
  isActive: z.boolean(),
});
export type Room = z.infer<typeof roomSchema>;

export interface RoomFilters {
  minCapacity?: number;
  equipment?: Equipment[];
  floor?: number;
}

export function equipmentNames(value: string): string[] {
  if (value === 'None') return [];
  return value.split(',').map((name) => {
    const equipment = equipmentSchema.safeParse(name.trim());
    return equipment.success ? equipmentLabels[equipment.data] : 'Other equipment';
  });
}
