import { ContextProvider } from './Context';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Whale in the Box</title>
        <meta name="description" content="Our Decentralized Betting Platform" />
      </head>
      <body>
        <ContextProvider>
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}