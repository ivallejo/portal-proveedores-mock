import { AreaMembership } from './area-membership';

/** Unidad interna presente en una o más sociedades; los usuarios internos (aprobadores, contabilidad) pertenecen a un área. */
export interface Area {
  id: string;
  name: string;
  description: string | null;
  societies: AreaMembership[];
  isActive: boolean;
  userCount: number;
}
