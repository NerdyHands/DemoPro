import { listCustomers } from './customers';

export async function customerNameMap(): Promise<Map<string, string>> {
  const customers = await listCustomers();
  return new Map(customers.map(customer => [customer.id, customer.name]));
}
