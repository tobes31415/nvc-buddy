import styleText from "bundle-text:./nvc-text.scss";
import { Tag } from "../../services/nvc-tagger";

type Replacer = {
  temp: string;
  replacement: string;
};

export class NvcText extends HTMLElement {
  #shadow: ShadowRoot;
  #styleElem: HTMLStyleElement;

  #textAttribute: string = "";
  #tagsAttribute: string = "";

  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: "open" });

    this.#styleElem = document.createElement("style");
    this.#styleElem.innerText = styleText;

    this.#extractAttributes();
  }

  #extractAttributes() {
    this.#textAttribute =
      this.getAttribute("data-text") || this.#textAttribute || "";
    this.#tagsAttribute =
      this.getAttribute("data-tags") || this.#tagsAttribute || "";
    this.removeAttribute("data-tags");
    this.removeAttribute("data-text");
    this.#update();
  }

  #update() {
    if (!this.#tagsAttribute || !this.#textAttribute) {
      return;
    }
    let text = this.#textAttribute;
    const tags: Tag[] = JSON.parse(this.#tagsAttribute);

    const tempFragment = document.createDocumentFragment();
    tempFragment.appendChild(this.#styleElem);

    const replacers: Replacer[] = [];

    tags.forEach((tag) => {
      tag.match.forEach((match) => {
        const replace = {
          temp: `$${Math.floor(Math.random() * 999999)}$`,
          replacement: `<nvc-word data-show='${match}' data-tag='${JSON.stringify(
            tag
          )}'></nvc-word>`,
        };
        replacers.push(replace);
        text = text?.replaceAll(match, replace.temp);
      });
    });
    replacers.forEach(
      (replacer) =>
        (text = text.replaceAll(replacer.temp, replacer.replacement))
    );

    const temp2 = document.createElement("div");
    temp2.innerHTML = text;
    tempFragment.appendChild(temp2);

    this.#shadow.replaceChildren(tempFragment);
  }

  static get observedAttributes() {
    return ["data-tag", "data-text"];
  }

  attributeChangedCallback() {
    setTimeout(() => this.#extractAttributes());
  }
}
customElements.define("nvc-text", NvcText);
