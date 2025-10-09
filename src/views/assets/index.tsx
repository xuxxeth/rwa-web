import { useState } from "react";
import { Menus } from "@/components/menu";
import { XFooter } from "@/components/footer";
import { MainLayout } from "@/layouts/main";
import ContentLayout from "@/layouts/content";
import { useAccount, useChainId } from "ca-common-web";
import WalletNotConnected from "@/components/wallet-not-connected";
import AccountDetail from "./Account";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";
import AssetsTable from "./assetsTable";
import { useAssetsList } from "./assetsList";
import OrderHistory from "./OrderHistory";

function Assets() {
  const account = useAccount();
  const chainId = useChainId();

  const { t } = useTranslation();

  const walltedConnected = account && chainId;

  const [activeTab, setActiveTab] = useState("assets");

  const { assetList, estimatedBalance } = useAssetsList(chainId!, account);

  return (
    <>
      <Menus />
      <MainLayout>
        <ContentLayout>
          {walltedConnected ? (
            <div className="px-[95px] pt-10">
              <AccountDetail
                estimatedBalance={estimatedBalance}
                chainId={chainId}
              />
              <Tabs defaultValue={activeTab} className="mt-8">
                <TabsList className="bg-transparent px-0 pl-2 gap-6">
                  {[
                    { key: "assets" },
                    { key: "orderHistory" },
                    { key: "tradeHistory" },
                  ].map(({ key }) => (
                    <TabsTrigger
                      onClick={() => setActiveTab(key)}
                      className="text-xl/7 cursor-pointer px-0 py-2 font-medium!"
                      value={key}
                    >
                      {t(`assets.tabList.${key}`)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={activeTab} className="mt-4">
                  {activeTab === "assets" && (
                    <AssetsTable
                      assetList={assetList}
                      chainId={chainId}
                      account={account}
                    />
                  )}
                  {activeTab === "orderHistory" && (
                    <OrderHistory chainId={chainId} account={account} />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <WalletNotConnected />
          )}
        </ContentLayout>
      </MainLayout>
      <XFooter />
    </>
  );
}

export default Assets;
