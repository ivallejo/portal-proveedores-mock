/** Unidad interna de una sociedad; los usuarios internos (aprobadores, contabilidad) pertenecen a un área. */
export interface Area {
  id: string;
  name: string;
  description: string | null;
  societyId: string;
  societyCode: string;
  societyName: string;
  isActive: boolean;
  userCount: number;
}
