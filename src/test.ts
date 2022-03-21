import { DI } from "@tobes31415/dependency-injection";
import { NvcTaggerService } from "./services/nvc-tagger";

const lookupSvc: NvcTaggerService = DI.resolve(NvcTaggerService);
(globalThis as any).lookupSvc = lookupSvc;

(globalThis as any).updateTags = () => {
  const tagsSection =
    document.querySelector<HTMLDivElement>("#tags") || undefined;
  const userInput = document.querySelector<HTMLTextAreaElement>("#userText");
  if (tagsSection && userInput) {
    const tags = lookupSvc.tag(userInput.value);
    tagsSection.innerHTML = tags
      .map((tag) => {
        return `<nvc-word data-tag='${JSON.stringify(tag)}'></nvc-word>`;
      })
      .join(" ");
  }
};

setTimeout((globalThis as any).updateTags);
