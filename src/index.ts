import { TITLE } from "./util/ascii";
import prompt from 'prompt-sync';
import PenLogger from "./util/logger";
import PenNameToSocialMediaHandleTransform
  from "./lib/pen/transform/impl/nameToSocialMediaHandle";
import { geocodeSearch } from "./lib/pen/utils/geocode";
import { PenCoordinates } from "./lib/pen/person";
import PenNameAndHomeAddressToGoogleResults
  from "./lib/pen/transform/impl/nameAndHomeAddressToGoogleResults";
// import PenSocialMediaHandleToPicture from "./lib/pen/transform/impl/socialMediaHandleToPicture";

const p = prompt({ sigint: true });

console.log(TITLE);

(async () => {
  const person = {
    name: p('Name: '),
    surname: p('Surname: '),
    homeAddress: (await geocodeSearch(p('Home adress: '))) as PenCoordinates
  };

  await new PenNameAndHomeAddressToGoogleResults().transform(person);

  const socialMediaHandleTransform = new PenNameToSocialMediaHandleTransform();

  const persons = socialMediaHandleTransform.transform(person);


  PenLogger.instance.info(`Hello ${persons.map((p) => p.socialMediaHandle).join(", ")}!`);
})();