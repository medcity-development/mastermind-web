export default function SidebarBackdrop({
    open,
    onClose,
  }) {
    return (
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={onClose}
        className={`
          fixed
          inset-0
          z-40
  
          bg-[#020617]/70
          backdrop-blur-[4px]
  
          transition-all
          duration-300
  
          xl:hidden
  
          ${
            open
              ? `
                  pointer-events-auto
                  opacity-100
                `
              : `
                  pointer-events-none
                  opacity-0
                `
          }
        `}
      />
    );
  }