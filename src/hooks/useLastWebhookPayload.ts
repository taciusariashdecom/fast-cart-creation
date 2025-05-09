import { useState } from 'react';

export function useLastWebhookPayload() {
  const [lastPayload, setLastPayload] = useState<any>(null);

  const updatePayload = (payload: any) => {
    setLastPayload(payload);
  };

  return { lastPayload, updatePayload };
}