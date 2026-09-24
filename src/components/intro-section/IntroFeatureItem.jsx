export default function IntroFeatureItem({
    icon: Icon,
    title,
  }) {
    return (
      <div
        className="
          flex
          flex-col
          items-center
          text-center
  
          xl:items-start
          xl:text-left
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-[#edf6ff]
            text-[#164fa5]
            shadow-[0_6px_18px_rgba(22,79,165,0.08)]
          "
        >
          <Icon
            size={19}
            strokeWidth={1.9}
          />
        </div>
  
        <p
          className="
            mt-2
            text-[10px]
            font-semibold
            leading-4
            text-[#43516f]
            sm:text-[11px]
          "
        >
          {title}
        </p>
      </div>
    );
  }