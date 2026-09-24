export default function ResultBox({
    label,
    value,
    icon: Icon,
    tone = "blue",
  }) {
    const toneClasses = {
      blue: "bg-blue-50 text-blue-700",
      cyan: "bg-cyan-50 text-cyan-700",
      emerald:
        "bg-emerald-50 text-emerald-700",
      rose: "bg-rose-50 text-rose-700",
    };
  
    return (
      <div
        className="
          min-w-[105px]
          rounded-[14px]
          border
          border-white
          bg-white
          p-3
          shadow-sm
        "
      >
        <div
          className={`
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-[9px]
            ${toneClasses[tone]}
          `}
        >
          <Icon size={15} />
        </div>
  
        <p
          className="
            mt-3
            text-[9px]
            font-bold
            uppercase
            tracking-[0.08em]
            text-slate-400
          "
        >
          {label}
        </p>
  
        <p
          className="
            mt-1
            text-[19px]
            font-extrabold
            text-[#0b1f44]
          "
        >
          {value}
        </p>
      </div>
    );
  }