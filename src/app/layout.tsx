import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Content OS — Scene-Based Video Production",
    description:
        "A scene-native operating system for serious video creators. Structure, script, and execute your productions.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen antialiased">{children}</body>
        </html>
    );
}
