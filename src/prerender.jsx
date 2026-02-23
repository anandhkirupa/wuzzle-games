import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";

import App from "./App.jsx";

const PRERENDER_ROUTES = [
  "/",
  "/game",
  "/leaderboard",
  "/faq",
  "/profile",
  "/how-to-play",
  "/stats",
  // SEO landings
  "/multiplayer-wuzzle",
  "/multi-board-wuzzle",
  "/wuzzle-speedrun",
  "/wuzzle-marathon",
];

function toHeadElements(helmet) {
  const reactEls = [
    ...(helmet?.meta?.toComponent?.() || []),
    ...(helmet?.link?.toComponent?.() || []),
    ...(helmet?.script?.toComponent?.() || []),
  ]
    .flat()
    .filter(Boolean);

  return new Set(
    reactEls.map((el) => {
      // Ensure all props are serializable strings
      const props = {};
      if (el.props) {
        Object.keys(el.props).forEach(key => {
          const value = el.props[key];
          // Convert to string if not already
          props[key] = typeof value === 'string' ? value : String(value || '');
        });
      }
      return {
        type: el.type,
        props: props,
      };
    })
  );
}

export async function prerender(data) {
  const url = data?.url || "/";
  const helmetContext = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url} basename="/">
        <App />
      </StaticRouter>
    </HelmetProvider>
  );

  const helmet = helmetContext.helmet;
  
  // Extract clean title text without HTML tags or data-rh attributes
  let titleText = "Wuzzle Games";
  if (helmet?.title) {
    const titleStr = helmet.title.toString();
    // Remove all HTML tags and extract just the text content
    titleText = titleStr.replace(/<[^>]*>/g, '').trim() || "Wuzzle Games";
  }

  return {
    html,
    links: new Set(PRERENDER_ROUTES),
    head: {
      lang: "en",
      title: titleText,
      elements: toHeadElements(helmet),
    },
  };
}
