
import React from "react";
import { Button } from "@/components/ui/button";
import { Github, Terminal } from "lucide-react";

const CIIntegration: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">CI/CD Integration</h3>
        <div className="bg-slate-900 text-slate-50 p-4 rounded-md">
          <div className="font-mono text-sm">
            <div><span className="text-blue-400">// .github/workflows/mobile-tests.yml</span></div>
            <div>name: Mobile Testing</div>
            <div>on:</div>
            <div>&nbsp;&nbsp;push:</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;branches: [ main ]</div>
            <div>&nbsp;&nbsp;pull_request:</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;branches: [ main ]</div>
            <div></div>
            <div>jobs:</div>
            <div>&nbsp;&nbsp;mobile-tests:</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;runs-on: ubuntu-latest</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;steps:</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- uses: actions/checkout@v3</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- uses: actions/setup-node@v3</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;with:</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;node-version: 18</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- name: Install dependencies</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;run: npm ci</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- name: Install Playwright</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;run: npx playwright install --with-deps</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- name: Build the app</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;run: npm run build</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- name: Run mobile tests</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;run: npx playwright test --project="Mobile Chrome" --project="Mobile Safari"</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- name: Upload test results</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if: always()</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;uses: actions/upload-artifact@v3</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;with:</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name: playwright-report</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;path: playwright-report/</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;retention-days: 30</div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline">
          <Github className="h-4 w-4 mr-2" /> View Test Repository
        </Button>
        <Button variant="outline">
          <Terminal className="h-4 w-4 mr-2" /> Test Dashboard
        </Button>
      </div>
    </div>
  );
};

export default CIIntegration;
