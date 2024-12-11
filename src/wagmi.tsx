import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { cookieStorage, createStorage } from "wagmi";
import { base } from '@reown/appkit/networks';

export const projectId = process.env.VITE_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

export const networks = [base];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: false,
  networks,
  projectId
});

export const config = wagmiAdapter.wagmiConfig;