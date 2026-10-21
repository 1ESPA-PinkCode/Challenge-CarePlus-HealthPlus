// app/+html.jsx — <head> da versão web (PWA instalável no iPhone e Android)
import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <title>Health Plus</title>
        <meta name="description" content="Autocuidado gamificado: cumpra missões saudáveis e faça seu jardim florescer." />
        <meta name="theme-color" content="#1C9770" />
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <meta name="darkreader-lock" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Health Plus" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: ":root{color-scheme:light only}html,body{background:#1C9770;overscroll-behavior:none;forced-color-adjust:none}#root{background:#fff}svg{forced-color-adjust:none}" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
