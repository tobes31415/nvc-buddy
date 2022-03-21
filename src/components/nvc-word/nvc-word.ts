import styleText from "bundle-text:./nvc-word.scss";

export class NvcWord extends HTMLElement {
  #shadow: ShadowRoot;

  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: "closed" });

    const temp = document.createDocumentFragment();
    const styleElem = document.createElement("style");
    styleElem.innerText = styleText;
    temp.appendChild(styleElem);

    const slot = document.createElement("slot");
    temp.appendChild(slot);

    this.#shadow.appendChild(temp);
  }
}
customElements.define("nvc-word", NvcWord);
