import { useEffect, useMemo, useState } from "react";
import { useBaseStore } from "@/stores/baseStore";
import type { IToken, IRwa } from "@/service/base/types";
import { marketQuoteOptions } from "@/queries";
import { useQuery } from "@tanstack/react-query";
import { useTokenBalances } from "@/hooks/useCaCommon";
import { parseAmountToDecimal, multiply, sum } from "@/utils/index";
import type { IMarketQuote } from "@/service/quote/types";

export function useAssetsList(chainId: number, account: string) {
  const baseStore = useBaseStore();
  const { tokenList, rwaList } = baseStore;
  const [amountList, setAmountList] = useState<bigint[]>([]);

  const { getTokenBalancesByTradingContract } = useTokenBalances();

  useEffect(() => {
    baseStore.autoInitialize(chainId);
  }, [chainId]);

  const {
    data: marketQuoteData,
    isPending,
    status,
    isError,
    error,
  } = useQuery(marketQuoteOptions(chainId));

  const tokenAddressList = useMemo(() => {
    return [...tokenList, ...rwaList].map((item) => item.address);
  }, [tokenList, rwaList]);

  useEffect(() => {
    if (!account || tokenAddressList.length === 0) return;
    const realTokenAddressList = [
      "0xbeD5856646F1faBDFc565F47f8Ea18685466B745",
      "0xE6d44C1f14D98AEf73c822d0319751701D54D4cc",
    ];
    (async () => {
      try {
        const res: bigint[] = await getTokenBalancesByTradingContract(
          account,
          realTokenAddressList
        );
        setAmountList(res);
      } catch (error) {
        console.log("getTokenBalancesByTradingContract error", error);
      }
    })();
  }, [account, tokenAddressList]);

  const marketQuoteMap = useMemo(() => {
    return marketQuoteData?.reduce(
      (acc: { [key: string]: IMarketQuote }, cur: IMarketQuote) => {
        acc[cur.rwaId] = cur;
        return acc;
      },
      {} as { [key: string]: IMarketQuote }
    );
  }, [marketQuoteData]);

  const assetList = useMemo(() => {
    return [
      ...tokenList.map(getAssetItemFromToken),
      ...rwaList.map(getAssetItemFromRwa),
    ].map((item, idx) => {
      const quote = marketQuoteMap && item.rwaId && marketQuoteMap[item.rwaId];
      const holdings =
        amountList[idx] !== undefined && item.decimals !== undefined
          ? parseAmountToDecimal(amountList[idx], item.decimals)
          : undefined;
      item = {
        ...item,
        rwaPrice: quote?.price,
        holdings: holdings,
        rwaState: quote?.rwaState,
      };
      const price = item.tokenPrice ?? item.rwaPrice;
      if (price !== undefined && item.holdings !== undefined) {
        item.value = multiply(price, item.holdings);
      }
      return item;
    });
  }, [tokenList, rwaList, marketQuoteMap, amountList]);

  const estimatedBalance = useMemo(() => {
    return sum(...assetList.map((item) => item.value ?? "0"));
  }, [assetList]);

  return { assetList, estimatedBalance };
}

function getAssetItemFromToken(token: IToken): IAssetItem {
  return {
    token: token.symbol,
    name: token.name,
    tokenPrice: "1",
    decimals: token.decimals,
    icon: token.icon,
    address: token.address,
  };
}

function getAssetItemFromRwa(rwa: IRwa): IAssetItem {
  return {
    rwaId: rwa.id,
    token: rwa.symbol,
    name: rwa.name,
    decimals: rwa.decimals,
    address: rwa.address,
    icon: rwa.icon,
  };
}

export interface IAssetItem {
  rwaId?: number;
  token?: string;
  name?: string;
  holdings?: string;
  decimals?: number;
  // token price 和 rwa price 区分开
  // token price
  tokenPrice?: string;
  // rwa price
  rwaPrice?: string;
  value?: string;
  rwaState?: number;
  icon?: string;
  address: string;
}
