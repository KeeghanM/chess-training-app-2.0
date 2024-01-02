import Script from 'next/script'

import { Suspense } from 'react'
import type { ReactNode } from 'react'

import CookieBanner from './components/template/CookieBanner'
import Footer from './components/template/footer/Footer'
import Header from './components/template/header/Header'

import { PostHogPageview, PosthogProvider } from './_util/PostHog'
import { ThemeSwitchProvider } from './_util/ThemeProvider'

import './globals.css'

export const metadata = {
  title: 'ChessTraining.app - The best way to improve your chess',
  description:
    'Use our powerful training tools, backed by science and Grand Master training methods, to shape up your chess and bring in the wins!',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      <Script id="brevo-conversations">
        {`(function(d, w, c) {
        w.BrevoConversationsID = '656f5685f955fb046f086532';
        w[c] = w[c] || function() {
          (w[c].q = w[c].q || []).push(arguments);
        };
        var s = d.createElement('script');
        s.async = true;
        s.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
        if (d.head) d.head.appendChild(s);
      })(document, window, 'BrevoConversations');`}
      </Script>
      <html lang="en" suppressHydrationWarning>
        <Suspense>
          <PostHogPageview />
        </Suspense>
        <PosthogProvider>
          <body>
            <ThemeSwitchProvider>
              <Header />
              {children}
              <Footer />
              <CookieBanner />
            </ThemeSwitchProvider>
          </body>
        </PosthogProvider>
      </html>
    </>
  )
}
