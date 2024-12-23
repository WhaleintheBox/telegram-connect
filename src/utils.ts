import { z } from 'zod'

export const ADDRESS_REGEX = /(0x[a-fA-F0-9]{40})/g

export const connectionDataSchema = z.object({
  type: z.literal('connect_wallet'),
  address: z.string().regex(ADDRESS_REGEX),
  connect: z.boolean()
});

const transactionDataSchema = z.object({
  chainId: z.number().gte(1).lte(10000000),
  address: z.string().regex(ADDRESS_REGEX),
  abi: z.string().array(),
  functionName: z.string(),
  args: z.any().array().optional()
});

const domainSchema = z.object({
  name: z.string(),
  version: z.string(),
  chainId: z.number(),
  verifyingContract: z.string()
});

const signMessageDataSchema = z.object({
  domain: domainSchema,
  primaryType: z.string(),
  types: z.object({}),
  message: z.object({})
});

export type ConnectionData = z.infer<typeof connectionDataSchema>;
export type TransactionData = z.infer<typeof transactionDataSchema>;
export type SignatureData = z.infer<typeof signMessageDataSchema>;

export const getSchemaError = (operationType: string, data: unknown) => {
  let schema: z.ZodSchema;
  switch (operationType) {
    case "connect_wallet":
      schema = connectionDataSchema;
      break;
    case "signature":
      schema = signMessageDataSchema;
      break;
    case "transaction":
      schema = transactionDataSchema;
      break;
    default:
      throw new Error(`Unknown operation type: ${operationType}`);
  }

  const response = schema.safeParse(data);
  if (!response.success) {
    return response.error;
  }

  return null;
}

export const sendEvent = (uid: string, endpoint: string, onCallbackError: (error: any) => void, data: unknown) => {
  // Validate connection data before sending
  const validationResult = connectionDataSchema.safeParse(data);
  if (!validationResult.success) {
    console.error('Validation error:', validationResult.error);
    onCallbackError({
      status: 400,
      text: 'Invalid connection data',
      errors: validationResult.error.errors
    });
    return;
  }

  const xhr = new XMLHttpRequest();
  xhr.open("POST", endpoint, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log(xhr.responseText);
      } else {
        console.error(xhr.statusText);
        onCallbackError({
          status: xhr.status,
          text: xhr.statusText
        });
      }
    }
  };
  xhr.onerror = () => {
    console.error(xhr.statusText);
    onCallbackError({
      status: xhr.status,
      text: xhr.statusText
    });
  };

  xhr.send(JSON.stringify({
    ...validationResult.data,
    uid
  }));
}