import { NextRequest, NextResponse } from 'next/server';
import { getContract } from '@/lib/crm/contracts';
import { getCustomer } from '@/lib/crm/customers';
import { getEstimate } from '@/lib/crm/estimates';
import { generateContractPdfBuffer } from '@/lib/pdf/contract-pdf';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const contract = await getContract(id);
    if (!contract) return jsonError(404, 'Contract not found');

    const [customer, estimate] = await Promise.all([
      contract.customerId ? getCustomer(contract.customerId) : Promise.resolve(null),
      contract.estimateId ? getEstimate(contract.estimateId) : Promise.resolve(null)
    ]);

    const { buffer, fileName } = await generateContractPdfBuffer(contract, customer, estimate);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } catch (error) {
    return handleCrmError(error);
  }
}
