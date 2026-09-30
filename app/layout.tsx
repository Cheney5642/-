import type { Metadata } from "next";
import "./globals.css";
import { ServiceProvider } from "@/store/service-store";

export const metadata: Metadata = {
  title: "小布守护 · 履约质量守护",
  description: "猫咪上门喂养服务过程风险识别 MVP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><ServiceProvider>{children}</ServiceProvider></body></html>;
}
