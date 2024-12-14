import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage } from "wagmi";
import { base } from '@reown/appkit/networks';

export const projectId = "1558da14b9f93fe89954b32c5e17e840";

if (!projectId) throw new Error("Project ID is not defined");

export const networks = [base];

const storage = createStorage({
  storage: cookieStorage
});

export const wagmiAdapter = new WagmiAdapter({
  storage,
  ssr: false,
  networks,
  projectId
});

export const config = wagmiAdapter.wagmiConfig;