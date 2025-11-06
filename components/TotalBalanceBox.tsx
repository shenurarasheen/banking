import { formatAmount } from "@/lib/utils";
import AnimatedCounter from "./AnimatedCounter";
import { Doughnut } from "react-chartjs-2";
import DoughnutChart from "./DoughnutChart";

const TotalBalanceBox = ({ accounts = [], totalBanks, totalCurrentBalance }: TotlaBalanceBoxProps) => {
    return (
        <section className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 shadow-sm sm:gap-6 sm:p-6">
            <div className="flex size-full max-w-[100px] items-center sm:max-w-[120px]">

                {/* chart */}
                <DoughnutChart accounts={accounts} />

            </div>
            <div className="flex flex-col gap-6">
                <h2 className="text-lg font-semibold">
                    Bank Accounts: {totalBanks}
                </h2>
                <div className="flex flex-col gap-2">
                    <p className="total-balance-label">
                        Total Current Balance
                    </p>
                    <p className="text-[22px] lg:text-30 flex-1 font-semibold text-gray-900 flex-center gap-2">
                        <AnimatedCounter
                            amount={totalCurrentBalance}
                        />
                    </p>
                </div>
            </div>
        </section>
    )
}

export default TotalBalanceBox;