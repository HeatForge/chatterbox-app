import { type AppType } from "next/app";
import { Geist } from "next/font/google";

import { ThemeSync } from "~/components/ThemeSync";
import { OverlayProvider } from "~/components/overlays";
import { NavBar } from "~/components/primitives/NavBar";
import { api } from "~/utils/api";

import "~/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={geist.className}>
      <ThemeSync />
      <OverlayProvider>
        <NavBar />
        <Component {...pageProps} />
      </OverlayProvider>
    </div>
  );
};

export default api.withTRPC(MyApp);
