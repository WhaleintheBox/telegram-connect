import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage } from "wagmi";
import { base } from '@reown/appkit/networks';

export const projectId = "1558da14b9f93fe89954b32c5e17e840";

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