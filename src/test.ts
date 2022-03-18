import { DI } from "@tobes31415/dependency-injection";
import { NvcTaggerService } from "./services/nvc-tagger";

const lookupSvc = DI.resolve(NvcTaggerService);
(globalThis as any).lookupSvc = lookupSvc;

(globalThis as any).updateTags = () => {
  const tagsSection =
    document.querySelector<HTMLDivElement>("#tags") || undefined;
  const userInput = document.querySelector<HTMLTextAreaElement>("#userText");
  if (tagsSection && userInput) {
    tagsSection.innerHTML = lookupSvc.tag(userInput.value);
  }
};

setTimeout((globalThis as any).updateTags);
