import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import '@/assets/styles/globals.css'
import { APP_NAME, APP_DESCRIPTION, SERVER_URL } from '@/lib/constants';
import { ThemeProvider } from 'next-themes';
// import { UserProvider } from '@auth0/nextjs-auth0/client';

const inter = Inter( { subsets: ['latin']})

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"></link>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"></link>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"></link>
        <link rel="manifest" href="/site.webmanifest"></link>
      </head>

        <body className={`${inter.className}  antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem
          disableTransitionOnChange
        >
          {children}
          </ThemeProvider>
        </body>


    </html>
  );
}


// // from CG
// export default function RootLayout({ 
//   children 
// }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         <UserProvider>{children}
//       </body>
//     </html>
//   );
// }

// from authO
// export default function RootLayout({ 
//   children 
// }) {
//   return (
//     <html lang="en">
//     <UserProvider>
//       <body>{children}</body>
//     </UserProvider>
//     </html>
//   );
// }


