/* ---------------------------------------------------
   This function detects if the website you are on is a shopping site. 
   This is sometimes triggered on non-shopping sites as well if you try to shop, just to remind you of what you are about to do as well
--------------------------------------------------- */
function isShoppingSite() {
  const bodyText = document.body.innerText.toLowerCase();

  const shoppingKeywords = [
    "add to cart", "add to bag", "add to basket",
    "buy now", "checkout", "free shipping", "in stock",
    "cart", "bag", "basket"
  ];
  const keywordHit = shoppingKeywords.some(k => bodyText.includes(k));

  const buttons = [...document.querySelectorAll("button, a, input")];
  const classHit = buttons.some(b => /(add|cart|bag|basket|buy|checkout)/i.test(b.className));

  const urlHit = /(product|item|cart|checkout|shop)/.test(location.pathname.toLowerCase());

  const hasProductSchema = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .some(tag => {
      try {
        const data = JSON.parse(tag.textContent);
        return data["@type"] === "Product" ||
               (Array.isArray(data) && data.some(d => d["@type"] === "Product"));
      } catch { return false; }
    });

  return keywordHit || classHit || urlHit || hasProductSchema;
}



/* ---------------------------------------------------
   Cloud Guy Level Characters and Matching Speech Bubbles sets
--------------------------------------------------- */
const baseImages = [
   "e1.png", "e2.png", "e3.png", "e4.png",
  "e5.png", "e6.png", "e7.png", "e8.png",
  "e9.png", "e10.png","e11.png", "e12.png",
   "e13.png", "e14.png","e15.png", "e16.png",
   "e17.png", "e18.png","e19.png", "e20.png"
];
const tbImages = [
  "ems1_b.png", "ems2_b.png", "ems3_b.png", "ems4_b.png",
  "ems5_b.png", "ems6_b.png", "ems7_b.png", "ems8_b.png",
  "ems9_b.png", "ems10_b.png","ems11_b.png", "ems12_b.png",
   "ems13_b.png", "ems14_b.png","ems15_b.png", "ems16_b.png",
   "ems17_b.png", "ems18_b.png","ems19_b.png", "ems20_b.png", "ems21_b.png"
];

let currentImageIndex = 0;
let activeImage = null;
let activeBubble = null;


/* ---------------------------------------------------
   Weather effects -- determine if there is an associated weather effect
--------------------------------------------------- */
const weatherMode = {
  0: "blank",
  1: "blank",
  2: "blank",
  3: "waterdrop",
  4: "waterdrop",
  5: "waterdrop",
  6: "blank",
  7: "blank",
  8: "waterdrop",
  9: "lightning",
  10: "lightning",
   11: "lightning",
  12: "lightning",
  13: "lightning",
  14: "lightning",
  15: "lightning",
   16: "lightning",
  17: "lightning",
  18: "lightning",
  19: "lightning",
   20: "lightning"
};



/* ---------------------------------------------------
   Show cloud guy emissions image top right, near the shopping cart
--------------------------------------------------- */
function showEMS(filename) {
  if (!activeImage) {
    activeImage = document.createElement("img");
    Object.assign(activeImage.style, {
      position: "fixed",
      right: "20px",
      top: "20px",
      width: "100px",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity .5s",
      zIndex: "9999"
    });
    document.body.appendChild(activeImage);
  }

  activeImage.src = chrome.runtime.getURL(filename);
  
  requestAnimationFrame(() => activeImage.style.opacity = "1");
}



/* ---------------------------------------------------
   Show the speech bubbles for Cloud guy for 4 seconds 
--------------------------------------------------- */
function showBubble(index) {
  const file = tbImages[index - 1];
  if (!file) return;

  if (activeBubble) activeBubble.remove();

  const bubble = document.createElement("img");
  bubble.src = chrome.runtime.getURL(file);

  Object.assign(bubble.style, {
    position: "fixed",
    right: "130px",
    top: "60px",
    width: "200px",
    opacity: "0",
    transition: "opacity .4s",
    pointerEvents: "none",
    zIndex: "10000"
  });

  document.body.appendChild(bubble);
  requestAnimationFrame(() => bubble.style.opacity = "1");

  activeBubble = bubble;

  setTimeout(() => {
    bubble.style.opacity = "0";
    setTimeout(() => bubble.remove(), 500);
  }, 4000);
}



/* ---------------------------------------------------
   Weather Effects 
   - water drops
   - lightning
   - blank = nothing
--------------------------------------------------- */

let activeWeather = null; 



/* ---------------------------------------------------
   KEYFRAME ANIMATIONS
       ChatGPT helped with setting this animation up - the base image for water rain is a continous pattern and a lightning drawing
--------------------------------------------------- */
const style = document.createElement("style");
style.textContent = `
@keyframes rainScroll {
  from { background-position-y: 0; }
  to   { background-position-y: -100%; } /* ##added rain scrolls downward */
}

@keyframes lightningFlash {
  0%, 100% { opacity: 0; }
  30% { opacity: .9; }
  60% { opacity: .2; }
}
`;
document.head.appendChild(style);



/* ---------------------------------------------------
   WEATHER DISPLAY FUNCTION
--------------------------------------------------- */
function showWeather(mode, clickY = null, clickX = null) { /* ##added clickX */
  if (activeWeather) activeWeather.remove();
  if (mode === "blank") return;

  const div = document.createElement("div");

  Object.assign(div.style, {
    position: "fixed",

    /* ##added: rain = full LENGTH only (height 100vh), not full width */
    top: mode === "lightning" ? clickY + "px" : "0px",   /* ##added rain top */
    left: mode === "lightning" ? clickX + "px" : "20px", /* ##added lightning x-pos; rain stays at right */

    width: mode === "lightning" ? "80px" : "120px",   /* ##added lightning smaller */
    height: mode === "lightning" ? "120px" : "100vh", /* ##added rain full LENGHT */

    pointerEvents: "none",
    opacity: "0",
    transition: "opacity .4s",
    zIndex: "9998"
  });



  /* ---------------------------------------------------
     WATERDROP MODE
     - Repeating texture, animates smoothly down
  --------------------------------------------------- */
  if (mode === "waterdrop") {
    div.style.backgroundImage = `url(${chrome.runtime.getURL("waterdrops.png")})`;
    div.style.backgroundRepeat = "repeat";
    div.style.backgroundSize = "120px auto";
    div.style.animation = "rainScroll 5s linear infinite";
  }



  /* ---------------------------------------------------
     LIGHTNING MODE
     - Appears where user clicks (x,y)
     - Smaller box
     - Flashes using keyframes
  --------------------------------------------------- */
  if (mode === "lightning") {
    div.style.backgroundImage = `url(${chrome.runtime.getURL("lightning.png")})`;
    div.style.backgroundSize = "contain"; /* ##added lightning fits smaller */
    div.style.backgroundRepeat = "no-repeat"; /* ##added */
    div.style.animation = "lightningFlash 1s ease-in-out infinite";
  }



  document.body.appendChild(div);
  requestAnimationFrame(() => (div.style.opacity = "1"));

  activeWeather = div;

  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => div.remove(), 400);
  }, 5000);
}



/* ---------------------------------------------------
   Load cloudguy when we reach a shopping website
--------------------------------------------------- */
if (isShoppingSite()) {
  const saved = Number(localStorage.getItem("currentImageIndex"));
  currentImageIndex = isNaN(saved) ? 0 : saved;
  showEMS(baseImages[currentImageIndex]);
}



/* ---------------------------------------------------
   CLICK LISTENER (Add / Remove)
--------------------------------------------------- */
document.addEventListener("click", (e) => {
  if (!isShoppingSite()) return;

  const button = e.target.closest("button, a");
  if (!button) return;

  const text = (button.textContent || "").toLowerCase();
  const aria = (button.getAttribute("aria-label") || "").toLowerCase();
  const cls  = (button.className || "").toLowerCase();

  const addWords = ["add to cart", "add to bag", "buy now", "purchase", "shop now", "order now", "add", "+"];
  const delWords = ["remove", "minus"];

  const isAdd = addWords.some(w => text.includes(w) || aria.includes(w) || cls.includes(w));
  const isDel = delWords.some(w => text.includes(w) || aria.includes(w) || cls.includes(w));


  /* ADD button increases the level of cloud guy up + bubble + weather effect */
  if (isAdd) {
    currentImageIndex = Math.min(currentImageIndex + 1, baseImages.length - 1);
    showEMS(baseImages[currentImageIndex]);
    showBubble(currentImageIndex);

    const mode = weatherMode[currentImageIndex];

    if (mode === "lightning") {
      showWeather(mode, e.clientY, e.clientX); /* ##added X and Y position */
    } else {
      showWeather(mode);
    }

    localStorage.setItem("currentImageIndex", currentImageIndex);
  }


  /* REMOVE → EMS level down */
  if (isDel) {
    currentImageIndex = Math.max(currentImageIndex - 1, 0);
    showEMS(baseImages[currentImageIndex]);

    showWeather("blank"); // ##added no weather on remove

    localStorage.setItem("currentImageIndex", currentImageIndex);
  }
});
