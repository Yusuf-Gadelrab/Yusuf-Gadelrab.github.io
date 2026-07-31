const path = require("path");
const fs = require("fs");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..", "public");

const pages = [{ file: "freightdesk.html", formId: "pilotForm", emailId: "pfEmail" }];

(async () => {
  for (const p of pages) {
    const file = path.join(root, p.file);
    const html = fs.readFileSync(file, "utf8");
    const dom = new JSDOM(html, {
      url: "http://localhost:8934/" + p.file,
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true,
    });
    await new Promise((resolve) => {
      dom.window.addEventListener("load", resolve);
      setTimeout(resolve, 4000);
    });
    const win = dom.window;
    const hasRail = !!win.YGWaitlist;
    const form = win.document.getElementById(p.formId);
    const email = win.document.getElementById(p.emailId);
    const wired = !!(form && email);
    console.log(
      `${p.file}: YGWaitlist=${hasRail} form#${p.formId}=${!!form} email#${p.emailId}=${!!email} => ${hasRail && wired ? "PASS" : "FAIL"}`
    );
    dom.window.close();
  }
})();
