import { formatNumber } from "../../../../shared/utils/formatNumber.ts";

type CustomTooltipProps = {
  active?: boolean;
  payload?: {
    dataKey: string;
    value: number;
  }[];
  label?: string | number;
};

const PortfolioHistoryCustomTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="px-4 py-3 rounded-xl border border-[#263452] bg-[#111827] text-white shadow-lg">
      <p className="text-sm text-[#A7B0C3] mb-3">{label}</p>

      <div className="flex flex-col gap-2">
        {payload.map((item) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-6"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor:
                    item.dataKey === "totalValue" ? "#429EFF" : "#9CA3AF",
                }}
              />

              <span className="text-sm text-[#A7B0C3]">
                {item.dataKey === "totalValue"
                  ? "Total Value"
                  : "Wallet Balance"}
              </span>
            </div>

            <span className="text-sm font-medium text-white">
              ${formatNumber(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioHistoryCustomTooltip;
