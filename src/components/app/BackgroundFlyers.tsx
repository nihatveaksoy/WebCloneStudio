"use client"

/**
 * Diagonal scrolling strips of real website UI flyer images.
 * Colorful, visible, slow-moving background decoration.
 */

const IMAGES = [
  "/images/flyers/flyer1.jpg",
  "/images/flyers/flyer2.jpg",
  "/images/flyers/flyer3.jpg",
  "/images/flyers/flyer4.jpg",
  "/images/flyers/flyer5.jpg",
]

function ScrollingStrip({
  images,
  duration,
  reverse,
}: {
  images: string[]
  duration: string
  reverse?: boolean
}) {
  const tripled = [...images, ...images, ...images]

  return (
    <div
      className="flex gap-6 w-max"
      style={{
        animation: `${reverse ? "scroll-right" : "scroll-left"} ${duration} linear infinite`,
      }}
    >
      {tripled.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className="shrink-0 w-[260px] h-[170px] rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}

export function BackgroundFlyers() {
  const row1 = IMAGES
  const row2 = [...IMAGES].reverse()
  const row3 = [IMAGES[2], IMAGES[4], IMAGES[0], IMAGES[3], IMAGES[1]]
  const row4 = [IMAGES[3], IMAGES[1], IMAGES[4], IMAGES[0], IMAGES[2]]
  const row5 = [IMAGES[1], IMAGES[3], IMAGES[0], IMAGES[2], IMAGES[4]]

  return (
    <>
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(calc(-100% / 3)); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-[0.40]"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-1/2 flex flex-col gap-6"
          style={{
            transform: "translate(-50%, -50%) rotate(-12deg)",
            width: "200vw",
          }}
        >
          <ScrollingStrip images={row1} duration="80s" />
          <ScrollingStrip images={row2} duration="100s" reverse />
          <ScrollingStrip images={row3} duration="90s" />
          <ScrollingStrip images={row4} duration="110s" reverse />
          <ScrollingStrip images={row5} duration="85s" />
        </div>
      </div>
    </>
  )
}
