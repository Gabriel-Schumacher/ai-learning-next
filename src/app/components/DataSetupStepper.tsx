import OneIcon from "@/app/components/customSvg/One";
import TwoIcon from "@/app/components/customSvg/Two";

export default function DataSetupStepper({ step }: { step: number }) {
  return (
    <div className="flex gap-4">
      <div className={`flex gap-1 ${step === 1 ? "text-primary-500" : "text-surface-700"}`}>
        <div className="w-[24px] h-[24px]">
          <OneIcon color={step === 1 ? "text-primary-500" : "text-surface-700"} />
        </div>
        Setup
      </div>
      <div className={`flex gap-1 ${step === 2 ? "text-primary-500" : "text-surface-700"}`}>
        <div className="w-[24px] h-[24px]">
          <TwoIcon color={step === 2 ? "text-primary-500" : "text-surface-700"} />
        </div>
        Customize
      </div>
    </div>
  );
}
