/** `GET api/admin/users/catalog`. */
export interface UserCatalogResponseDto {
  roles: {
    code: string;
    name: string;
    description: string | null;
    isProvider: boolean;
    isActive: boolean;
  }[];
  areas: {
    id: string;
    name: string;
    companyCode: string;
    companyName: string;
    isActive: boolean;
  }[];
  companies: { code: string; name: string; ruc: string | null; isActive: boolean }[];
}
