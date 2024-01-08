import { TITLE } from "./util/ascii";
import prompt from 'prompt-sync';
import PenLogger from "./util/logger";
import PenNameToSocialMediaHandleTransform
  from "./lib/pen/transform/impl/nameToSocialMediaHandle";
import PenSocialMediaHandleToPicture
  from "./lib/pen/transform/impl/socialMediaHandleToPicture";

const p = prompt({ sigint: true });

console.log(TITLE);

const person = {
  name: p('Name: '),
  surname: p('Surname: '),
};

const socialMediaHandleTransform = new PenNameToSocialMediaHandleTransform();
const socialMediaHandleToPictureTransform = new PenSocialMediaHandleToPicture();

const persons = socialMediaHandleTransform.transform(person);

persons.forEach(async (p) => {
  const personWithPicture = await socialMediaHandleToPictureTransform.transform(p);
  PenLogger.instance.info(`Hello ${personWithPicture.flatMap((p) => p.pictures).join(", ")}!`);
});

PenLogger.instance.info(`Hello ${persons.map((p) => p.socialMediaHandle).join(", ")}!`);