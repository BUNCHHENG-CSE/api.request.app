import type {Metadata} from "next";
import {Geist, Geist_Mono, Montserrat, Public_Sans} from "next/font/google";
import "./globals.css";
import {cn} from "@/lib/utils";
import React from "react";
import {ThemeProvider} from "@/components/web/theme-provider"

const publicSansHeading = Public_Sans({subsets: ['latin'], variable: '--font-heading'});

const montserrat = Montserrat({subsets: ['latin'], variable: '--font-sans'});
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "FlowAPI — API Client",
    description: "A modern, beautiful API client for developers. Test, debug, and explore your APIs.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            suppressHydrationWarning
            lang="en"
            className={cn("h-full bg-background antialiased dark", geistSans.variable, geistMono.variable, "font-sans", montserrat.variable, publicSansHeading.variable)}
        >
        <body className="min-h-full flex flex-col">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}
