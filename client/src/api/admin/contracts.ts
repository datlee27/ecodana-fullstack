import axiosClient from '../axios';
import type { Contract, ContractFilters } from '../../types/admin';

const BASE_URL = '/admin/api/contracts';

export async function getAdminContracts(filters?: ContractFilters): Promise<Contract[]> {
  const res = await axiosClient.get<Contract[]>(BASE_URL, { params: filters });
  return res.data;
}

export async function getAdminContractById(id: string): Promise<Contract> {
  const res = await axiosClient.get<Contract>(`${BASE_URL}/${id}`);
  return res.data;
}
