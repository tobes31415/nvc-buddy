import { DI } from "@tobes31415/dependency-injection";
import { NvcTaggerService } from "./services/nvc-tagger";

const lookupSvc: NvcTaggerService = DI.resolve(NvcTaggerService);
(globalThis as any).lookupSvc = lookupSvc;

(globalThis as any).updateTags = () => {
  const tagsSection =
    document.querySelector<HTMLDivElement>("#tags") || undefined;
  const userInput = document.querySelector<HTMLTextAreaElement>("#userText");
  const taggedTextSection =
    document.querySelector<HTMLDivElement>("#taggedText");
  if (tagsSection && userInput && taggedTextSection) {
    const usersText = userInput.value;
    const tags = lookupSvc.tag(usersText);
    tagsSection.innerHTML = tags
      .map((tag) => {
        return `<nvc-word data-tag='${JSON.stringify(tag)}'></nvc-word>`;
      })
      .join(" ");

    taggedTextSection.setAttribute("data-text", usersText);
    taggedTextSection.setAttribute("data-tags", JSON.stringify(tags));
  } else {
    console.error("Missing required target");
  }
};

setTimeout((globalThis as any).updateTags);
