import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { MobileFrame } from "./MobileFrame";
import { PageContainer } from "./PageContainer";

export function Layout() {
  return (
    <MobileFrame>
      <Header />
      <PageContainer>
        <Outlet />
      </PageContainer>
      <BottomNav />
    </MobileFrame>
  );
}
