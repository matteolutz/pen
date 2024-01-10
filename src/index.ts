import * as dotenv from 'dotenv';
import prompt from 'prompt-sync';

import { mergePersons, PenAddress } from './lib/pen/person';
import { pipe } from './lib/pen/pipe';
import PenArticlesToEmailTransform from './lib/pen/transform/impl/articlesToEmailTransform';
import PenNameAndAddressToPhoneNumberTransform from './lib/pen/transform/impl/nameAndAddressToPhoneNumberTransform';
import PenNameAndHomeAddressToGoogleResults from './lib/pen/transform/impl/nameAndHomeAddressToGoogleResults';
import { geocodeSearch, reverseGeocodeSearch } from './lib/pen/utils/geocode';
import { TITLE } from './util/ascii';
import PenLogger from './util/logger';

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

  const person = {
    name,
    surname,
    homeAddress: {
      lat: homeAddress.lat,
      lon: homeAddress.lon,
      reverseLookup: await reverseGeocodeSearch(homeAddress)
    } as PenAddress,
    articles: [],
    pictures: []
  };

  PenLogger.instance.info(
    `Searching with initial data: ${JSON.stringify(person)}`
  );

  const addressToGoogleTransform = new PenNameAndHomeAddressToGoogleResults();

  try {
    /*const results = await addressToGoogleTransform.transformWithPipes(
     person,
     [
       new PenArticlesToEmailTransform(),
       new PenNameAndAddressToPhoneNumberTransform()
     ]
   );*/
    const result = await pipe(
      person,
      addressToGoogleTransform,
      new PenArticlesToEmailTransform(),
      new PenNameAndAddressToPhoneNumberTransform()
    );

    // PenLogger.instance.raw(mergePersons(results));
    PenLogger.instance.raw(mergePersons(result));

    PenLogger.instance.success(
      `Search completed in ${Date.now() - searchStartTime}ms`
    );
  } catch (e) {
    PenLogger.instance.error('Search failed: ' + e);
  }
})();
