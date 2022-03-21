import styleText from "bundle-text:./nvc-word.scss";
import { Tag } from "../../services/nvc-tagger";

export class NvcWord extends HTMLElement {
  #shadow: ShadowRoot;
  #label: Text;

  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: "closed" });

    const temp = document.createDocumentFragment();
    const styleElem = document.createElement("style");
    styleElem.innerText = styleText;
    temp.appendChild(styleElem);

    this.#label = document.createTextNode("");
    temp.appendChild(this.#label);

    this.#shadow.appendChild(temp);
    this.#update();
  }

  #update() {
    const tagStr = this.getAttribute("data-tag");
    if (!tagStr) {
      return;
    }
    const tag: Tag = JSON.parse(tagStr);

    const parts = tag.fullGuess.split(":");
    const confidence =
      tag.confidence >= 1
        ? "confirmed"
        : tag.confidence > 0.6
        ? "high"
        : tag.confidence < 0.3
        ? "low"
        : "medium";

    this.setAttribute("data-type", parts[0]);
    this.setAttribute("data-confidence", confidence);
    this.setAttribute("data-num-confidence", "" + tag.confidence);
    this.setAttribute("data-match", tag.match.join(","));
    this.setAttribute("title", tag.fullGuess);

    const label = this.getAttribute("data-show") || tag.leafWord;

    this.#label.textContent = label;
    this.removeAttribute("data-tag");
  }
}
customElements.define("nvc-word", NvcWord);
