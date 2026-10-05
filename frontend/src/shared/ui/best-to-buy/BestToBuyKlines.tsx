import type { AssetKlines } from "../../../features/assets/api/assetsApi.ts";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { memo, useMemo } from "react";

type BestToBuyKlinesProps = {
  klines: AssetKlines[];
};

const BestToBuyKlines = ({ klines }: BestToBuyKlinesProps) => {
  const dataKlines = useMemo(
    () => klines.map((kline) => ({ price: Number(kline.close) })),
    [klines],
  );

  return (
    <div className="w-full h-[150px]">
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={dataKlines}>
          <Area
            type="monotone"
            dataKey="price"
            stroke="#429EFF"
            strokeWidth={3}
            fill="#429EFF"
            fillOpacity={0.06}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default memo(BestToBuyKlines);
