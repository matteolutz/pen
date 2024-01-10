import * as dotenv from "dotenv";
import prompt from "prompt-sync";

import PenPerson, {
  mergePersons,
  PenAddress,
  PenAddressPrecisionLevel, prettyPrintPerson
} from "./lib/pen/person";
import { pipe } from "./lib/pen/pipe";
import PenArticlesToEmailTransform
  from "./lib/pen/transform/impl/articlesToEmailTransform";
import PenNameAndAddressToPhoneNumberTransform
  from "./lib/pen/transform/impl/nameAndAddressToPhoneNumberTransform";
import PenNameAndHomeAddressToGoogleResults
  from "./lib/pen/transform/impl/nameAndHomeAddressToGoogleResults";
import { geocodeSearch, reverseGeocodeSearch } from "./lib/pen/utils/geocode";
import { TITLE } from "./util/ascii";
import PenLogger from "./util/logger";
import { MergeTransform } from "./lib/pen/transform";
import PenLinkedinArticleToPictureTransform
  from "./lib/pen/transform/impl/linkedinArticleToPictureTransform";

dotenv.config();

const p = prompt({ sigint: true });

console.log(TITLE);

(async () => {
  const name = p('Name: ');
  const surname = p('Surname: ');
  const homeAddressString = p('Home address: ');

  PenLogger.instance.loading('Starting search...');
  const searchStartTime = Date.now();

  const homeAddress = await geocodeSearch(homeAddressString);
  if (!homeAddress) {
    PenLogger.instance.error('Could not find home address');
    process.exit(1);
  }

  const person: Pick<PenPerson, 'name' | 'surname' | 'homeAddress' | 'phone' | 'email' | 'articles' | 'images'> = {
    name,
    surname,
    homeAddress: {
      lat: homeAddress.lat,
      lon: homeAddress.lon,
      reverseLookup: await reverseGeocodeSearch(homeAddress),
      precisionLevel: PenAddressPrecisionLevel.CITY
    } as PenAddress,
    phone: [],
    email: [],
    articles: [],
    images: []
  };

  PenLogger.instance.info(
    `Searching with initial data: ${JSON.stringify(person)}`
  );

  const addressToGoogleTransform = new PenNameAndHomeAddressToGoogleResults();

  try {

    const people = await pipe(
      person,
      new MergeTransform(person, new PenNameAndAddressToPhoneNumberTransform()),
      addressToGoogleTransform,
      new PenArticlesToEmailTransform(),
      new PenLinkedinArticleToPictureTransform()
    );

    const result = mergePersons(people);

    PenLogger.instance.raw("\n--------------------\n");
    PenLogger.instance.info("Search results:");
    PenLogger.instance.dir(result);
    PenLogger.instance.raw("\n--------------------\n");

    PenLogger.instance.raw(prettyPrintPerson(result[0]));
    PenLogger.instance.raw("\n--------------------\n");

    PenLogger.instance.success(
      `Search completed in ${Date.now() - searchStartTime}ms`
    );
  } catch (e) {
    PenLogger.instance.error('Search failed: ' + e);
  }
})();
