const fs = require('fs');
const j = JSON.parse(fs.readFileSync('magicui.json'));
fs.mkdirSync('src/components/ui', {recursive: true});

let content = j.files[0].content;
content = content.replace('import { cn } from "@/lib/utils"', 'const cn = (...args: any[]) => args.filter(Boolean).join(" ");');

fs.writeFileSync('src/components/ui/animated-theme-toggler.tsx', content);

fs.appendFileSync('src/app/globals.css', '\n\n/* MagicUI Animated Theme Toggler */\n::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }\n');
console.log('Success');
