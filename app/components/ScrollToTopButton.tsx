"use client";

export default function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className="fixed top-6 left-6 z-50 bg-black text-white px-4 py-3 rounded-full"
    >
      ↑
    </button>
  );
}