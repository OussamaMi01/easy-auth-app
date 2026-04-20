import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "linear-gradient(145deg, #6b6fd4 0%, #4b4fbe 60%, #3a3da8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Long shadow overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "60%",
            height: "60%",
            background: "rgba(30, 30, 90, 0.35)",
            borderRadius: "50% 0 50% 0",
            transform: "rotate(0deg)",
          }}
        />

        {/* Phone body */}
        <div
          style={{
            width: 14,
            height: 20,
            borderRadius: 3,
            background: "#4dd9f0",
            border: "1.5px solid #2a6db5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Notch */}
          <div
            style={{
              position: "absolute",
              top: 2,
              width: 5,
              height: 1.5,
              borderRadius: 2,
              background: "#2a6db5",
            }}
          />

          {/* Screen circle */}
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#1a2f7a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 2,
            }}
          >
            {/* Lock / bag icon */}
            <svg
              width="5"
              height="6"
              viewBox="0 0 10 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Bag handle */}
              <path
                d="M3 4.5 Q3 2 5 2 Q7 2 7 4.5"
                stroke="#f5c842"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              />
              {/* Bag body */}
              <rect x="1.5" y="4" width="7" height="6" rx="1" fill="#f5c842" />
              {/* Bag highlight line */}
              <line x1="3.5" y1="6.5" x2="6.5" y2="6.5" stroke="#e8a800" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              position: "absolute",
              bottom: 2,
              width: 5,
              height: 1,
              borderRadius: 1,
              background: "#a0eef8",
            }}
          />
        </div>

        {/* Phone side buttons */}
        <div
          style={{
            position: "absolute",
            left: 5,
            top: 9,
            width: 1.5,
            height: 4,
            borderRadius: 1,
            background: "#2a6db5",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 5,
            top: 10,
            width: 1.5,
            height: 3,
            borderRadius: 1,
            background: "#2a6db5",
            zIndex: 2,
          }}
        />
      </div>
    ),
    { ...size },
  );
}