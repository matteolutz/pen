import axios from 'axios';
import * as jsdom from 'jsdom';

import PenPerson, { PenAddress, PenAddressPrecisionLevel } from "../../person";
import PenTransform from '../index';
import { getPercentageOfMatchingWords } from "../../utils/string";
import { geocodeSearch, reverseGeocodeSearch } from "../../utils/geocode";

export type NameAndAddressToPhoneNumberTransformInputKeys =
  | 'name'
  | 'surname'
  | 'homeAddress';

class PenNameAndAddressToPhoneNumberTransform<
  A extends Partial<PenPerson>
> extends PenTransform<
  NameAndAddressToPhoneNumberTransformInputKeys,
  'phone',
  A
> {
  public constructor() {
    super('NameAndAddressToPhoneNumberTransform');
  }

  protected async _transform(
    input: Pick<PenPerson, NameAndAddressToPhoneNumberTransformInputKeys> & A
  ): Promise<
    Array<
      Pick<PenPerson, NameAndAddressToPhoneNumberTransformInputKeys | 'phone'> &
        A
    >
  > {
    const phoneNumbersAndAddresses: Array<[string, PenAddress]> = [];
    const reqAddress = input.homeAddress.reverseLookup.address.town ?? input.homeAddress.reverseLookup.address.village;

    // region DasÖrtliche.de
    try {
      const domText = (
        await axios.get(
         `https://www.dasoertliche.de/?zvo_ok=&buc=&plz=&quarter=&district=&ciid=&kw=${input.name} ${input.surname}&ci=${reqAddress}&kgs=&buab=&zbuab=&form_name=search_nat`
        )
      ).data;
      const dom = new jsdom.JSDOM(domText);
      const entries = dom.window.document.querySelectorAll('#hitwrap .hit');
      phoneNumbersAndAddresses.push(
        ...(await Promise.all(Array.from(entries)
          .filter((entry) => getPercentageOfMatchingWords(entry.querySelector(".hitlnk_name")?.textContent ?? "", `${input.name} ${input.surname}`) > 0.9)
          .map(
            async (entry) => {
              const phoneNumber = entry.querySelector('.phoneblock > span')?.textContent?.split('Tel. ')[1];
              const addressString = entry.querySelector("address")?.textContent?.trim()?.replace(/\s+/g, " ");
              const address = await geocodeSearch(addressString!);

              if (!phoneNumber || !address) {
                return undefined;
              }

              return [phoneNumber, {
                lat: address.lat,
                lon: address.lon,
                reverseLookup: await reverseGeocodeSearch(address),
                precisionLevel: PenAddressPrecisionLevel.HOUSE
              } as PenAddress];
            }
          )
        )).filter((entry) => entry !== undefined) as Array<[string, PenAddress]>
      );
    } catch {}
    // endregion

    return phoneNumbersAndAddresses.map(([phoneNumber, address]) => ({
      ...input,
      homeAddress: address,
      phone: [phoneNumber!]
    }));
  }
}

export default PenNameAndAddressToPhoneNumberTransform;
