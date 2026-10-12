// Original top-view sports car drawn in SVG, rotated so the front points RIGHT
export default function Car({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 420 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Top view of a sports car"
      role="img"
    >
      <defs>
        <linearGradient id="body" x1="0" x2="1">
          <stop offset="0" stopColor="#ff7a18" />
          <stop offset="0.5" stopColor="#ffb347" />
          <stop offset="1" stopColor="#ff6a00" />
        </linearGradient>
        <linearGradient id="glass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1b2433" />
          <stop offset="1" stopColor="#0b0f17" />
        </linearGradient>
        {/* dx is in the car's own (pre-rotation) space, so it ends up pointing down on screen */}
        <filter id="shadow" x="-10%" y="-30%" width="130%" height="160%">
          <feDropShadow
            dx="14"
            dy="0"
            stdDeviation="10"
            floodColor="#000"
            floodOpacity="0.45"
          />
        </filter>
      </defs>

      {/* original car is drawn nose-up in a 200x420 box; rotate 90deg so the nose points right */}
      <g transform="translate(420 0) rotate(90)">
        {/* wheels */}
        <g fill="#0c0c0f" stroke="#2a2a31" strokeWidth="2">
          <rect x="14" y="78" width="26" height="62" rx="9" />
          <rect x="160" y="78" width="26" height="62" rx="9" />
          <rect x="12" y="276" width="28" height="68" rx="10" />
          <rect x="160" y="276" width="28" height="68" rx="10" />
        </g>

        <g filter="url(#shadow)">
          {/* main body */}
          <path
            d="M100 8 C142 8 164 40 168 92 C171 130 172 170 170 220 C169 280 172 340 160 384 C154 404 128 414 100 414 C72 414 46 404 40 384 C28 340 31 280 30 220 C28 170 29 130 32 92 C36 40 58 8 100 8 Z"
            fill="url(#body)"
          />
          {/* hood centre line + vents */}
          <path
            d="M100 18 L100 120"
            stroke="#c2540a"
            strokeWidth="2"
            opacity="0.6"
          />
          <path
            d="M70 70 L86 100 M130 70 L114 100"
            stroke="#c2540a"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* windshield */}
          <path
            d="M54 142 C70 124 130 124 146 142 L140 190 L60 190 Z"
            fill="url(#glass)"
          />
          {/* roof */}
          <path
            d="M60 190 L140 190 C142 226 142 250 138 276 L62 276 C58 250 58 226 60 190 Z"
            fill="#e8620a"
          />
          <path
            d="M70 200 L130 200 M70 262 L130 262"
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="2"
          />
          {/* rear window */}
          <path
            d="M62 276 L138 276 C132 300 126 312 118 320 L82 320 C74 312 68 300 62 276 Z"
            fill="url(#glass)"
          />
          {/* side mirrors */}
          <rect x="22" y="132" width="16" height="9" rx="4" fill="#d95a08" />
          <rect x="162" y="132" width="16" height="9" rx="4" fill="#d95a08" />
          {/* headlights */}
          <path
            d="M44 48 C52 34 66 28 78 26 L74 40 C64 42 54 48 48 58 Z"
            fill="#fff8d6"
          />
          <path
            d="M156 48 C148 34 134 28 122 26 L126 40 C136 42 146 48 152 58 Z"
            fill="#fff8d6"
          />
          {/* tail lights */}
          <rect x="46" y="388" width="34" height="8" rx="4" fill="#ff2d2d" />
          <rect x="120" y="388" width="34" height="8" rx="4" fill="#ff2d2d" />
          {/* rear wing */}
          <rect x="40" y="368" width="120" height="10" rx="5" fill="#1a1a20" />
        </g>
      </g>
    </svg>
  );
}
