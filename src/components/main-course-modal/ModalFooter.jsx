export default function ModalFooter() {
    return (
      <div
        className="
          mt-6
          flex
          items-center
          justify-center
          gap-3
          text-center
          text-[9px]
          font-bold
          uppercase
          tracking-[0.2em]
          text-[#164fa5]/50
          sm:text-[10px]
        "
      >
        <span className="h-px w-7 bg-[#164fa5]/20" />
  
        <span>
          Learn • Practice • Succeed
        </span>
  
        <span className="h-px w-7 bg-[#164fa5]/20" />
      </div>
    );
  }