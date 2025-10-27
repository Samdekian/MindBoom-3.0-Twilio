
import React from "react";
import { Code } from "lucide-react";

const PlaywrightSetup: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-slate-50 p-4 rounded-md">
        <div className="font-mono text-sm">
          <div><span className="text-pink-400">$</span> npm install -D @playwright/test</div>
          <div><span className="text-pink-400">$</span> npx playwright install</div>
          <div><span className="text-pink-400">$</span> npx playwright install chromium</div>
          <div><span className="text-pink-400">$</span> npx playwright codegen</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Configuration</h3>
        <div className="bg-slate-900 text-slate-50 p-4 rounded-md">
          <div className="font-mono text-sm">
            <div><span className="text-blue-400">// playwright.config.ts</span></div>
            <div><span className="text-green-400">import</span> {"{ defineConfig }"} <span className="text-green-400">from</span> <span className="text-amber-300">'@playwright/test'</span>;</div>
            <div><span className="text-green-400">export default</span> defineConfig({"{"}</div>
            <div>&nbsp;&nbsp;testDir: <span className="text-amber-300">'./tests'</span>,</div>
            <div>&nbsp;&nbsp;use: {"{"}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;baseURL: <span className="text-amber-300">'http://localhost:8080'</span>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;viewport: {"{"} width: <span className="text-purple-400">375</span>, height: <span className="text-purple-400">667</span> {"}"},</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;screenshot: <span className="text-amber-300">'only-on-failure'</span>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;trace: <span className="text-amber-300">'retain-on-failure'</span>,</div>
            <div>&nbsp;&nbsp;{"}"},</div>
            <div>&nbsp;&nbsp;projects: [</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;{"{"}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name: <span className="text-amber-300">'Mobile Chrome'</span>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;use: {"{"}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;browserName: <span className="text-amber-300">'chromium'</span>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...devices[<span className="text-amber-300">'Pixel 5'</span>],</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"}"},</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;{"}"},</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;{"{"}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name: <span className="text-amber-300">'Mobile Safari'</span>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;use: {"{"}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;browserName: <span className="text-amber-300">'webkit'</span>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...devices[<span className="text-amber-300">'iPhone 12'</span>],</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"}"},</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;{"}"},</div>
            <div>&nbsp;&nbsp;],</div>
            <div>{"}"})</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Sample Test</h3>
        <div className="bg-slate-900 text-slate-50 p-4 rounded-md">
          <div className="font-mono text-sm">
            <div><span className="text-blue-400">// tests/mobile-responsiveness.spec.ts</span></div>
            <div><span className="text-green-400">import</span> {"{ test, expect }"} <span className="text-green-400">from</span> <span className="text-amber-300">'@playwright/test'</span>;</div>
            <div></div>
            <div>test(<span className="text-amber-300">'Dashboard should adapt to mobile viewport'</span>, <span className="text-green-400">async</span> ({"{"} page {"}"}) {"=>"} {"{"}</div>
            <div>&nbsp;&nbsp;<span className="text-green-400">await</span> page.goto(<span className="text-amber-300">'/dashboard'</span>);</div>
            <div>&nbsp;&nbsp;<span className="text-green-400">await</span> page.waitForSelector(<span className="text-amber-300">'.dashboard-container'</span>);</div>
            <div>&nbsp;&nbsp;</div>
            <div>&nbsp;&nbsp;<span className="text-blue-400">// Check if mobile menu is present</span></div>
            <div>&nbsp;&nbsp;<span className="text-green-400">const</span> mobileMenu = <span className="text-green-400">await</span> page.$(<span className="text-amber-300">'.mobile-menu'</span>);</div>
            <div>&nbsp;&nbsp;expect(mobileMenu).not.toBeNull();</div>
            <div>&nbsp;&nbsp;</div>
            <div>&nbsp;&nbsp;<span className="text-blue-400">// Verify single column layout on mobile</span></div>
            <div>&nbsp;&nbsp;<span className="text-green-400">const</span> layout = <span className="text-green-400">await</span> page.$eval(<span className="text-amber-300">'.dashboard-content'</span>, (el) {"=>"} {"{"}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">const</span> style = window.getComputedStyle(el);</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">return</span> style.gridTemplateColumns;</div>
            <div>&nbsp;&nbsp;{"}"});</div>
            <div>&nbsp;&nbsp;expect(layout).toBe(<span className="text-amber-300">'1fr'</span>);</div>
            <div>{"}"});</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaywrightSetup;
