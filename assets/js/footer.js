(() => {
  const loaderScript = document.currentScript;
  const siteRoot = new URL(loaderScript.src);
  siteRoot.pathname = siteRoot.pathname.replace(/assets\/js\/footer\.js$/, "");
  siteRoot.search = "";
  siteRoot.hash = "";
  const placeholder = document.querySelector("[data-shared-footer]");

  if (!placeholder) return;

  fetch(new URL("footer.html", siteRoot))
    .then((response) => {
      if (!response.ok) throw new Error(`Footer request failed: ${response.status}`);
      return response.text();
    })
    .then((markup) => {
      const template = document.createElement("template");
      template.innerHTML = markup.replaceAll("{{root}}", siteRoot.href);
      placeholder.replaceWith(template.content);
    })
    .catch((error) => console.error("Unable to load the shared footer.", error));
})();
