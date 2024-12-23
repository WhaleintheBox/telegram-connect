import { z } from 'zod'

export const ADDRESS_REGEX = /(0x[a-fA-F0-9]{40})/g

// Définition et export de tous les schémas
export const connectionDataSchema = z.object({
  type: z.literal('connect_wallet'),
  address: z.string().regex(ADDRESS_REGEX),
  connect: z.boolean()
});

export const transactionDataSchema = z.object({
  chainId: z.number().gte(1).lte(10000000),
  address: z.string().regex(ADDRESS_REGEX),
  abi: z.string().array(),
  functionName: z.string(),
  args: z.any().array().optional()
});

export const domainSchema = z.object({
  name: z.string(),
  version: z.string(),
  chainId: z.number(),
  verifyingContract: z.string()
});

export const signMessageDataSchema = z.object({
  domain: domainSchema,
  primaryType: z.string(),
  types: z.object({}),
  message: z.object({})
});

// Export des types
export type ConnectionData = z.infer<typeof connectionDataSchema>;
export type TransactionData = z.infer<typeof transactionDataSchema>;
export type SignatureData = z.infer<typeof signMessageDataSchema>;

export const getSchemaError = (operationType: string, data: any) => {
  let schema;
  switch (operationType) {
    case 'connect_wallet':
      schema = connectionDataSchema;
      break;
    case 'signature':
      schema = signMessageDataSchema;
      break;
    default:
      schema = transactionDataSchema;
  }
  
  const response = schema.safeParse(JSON.parse(JSON.stringify(data)));
  if (!response.success) {
    return response.error;
  }

  return null;
}

export const sendEvent = (uid: string, endpoint: string, onCallbackError: (error: any) => void, result: any) => {
  console.log('Sending event:', { uid, endpoint, result }); // Debug log
  
  const xhr = new XMLHttpRequest();
  xhr.open("POST", endpoint, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log('Success:', xhr.responseText);
      } else {
        console.error('Error:', xhr.statusText);
        onCallbackError({
          status: xhr.status,
          text: xhr.statusText
        });
      }
    }
  };
  xhr.onerror = () => {
    console.error('XHR Error:', xhr.statusText);
    onCallbackError({
      status: xhr.status,
      text: xhr.statusText
    });
  };
  xhr.send(JSON.stringify({
    ...result,
    uid 
  }));
}