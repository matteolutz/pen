import axios from 'axios';
import * as jsdom from 'jsdom';

import PenPerson from '../../person';
import PenTransform from '../index';

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
    const phoneNumbers = [];

    // region DasÖrtliche.de
    try {
      const domText = (
        await axios.get(
         `https://www.dasoertliche.de/?zvo_ok=&buc=&plz=&quarter=&district=&ciid=&kw=${input.name} ${input.surname}&ci=${input.homeAddress.reverseLookup.address.town}&kgs=&buab=&zbuab=&form_name=search_nat`
        )
      ).data;
      const dom = new jsdom.JSDOM(domText);
      const entries = dom.window.document.querySelectorAll('#hitwrap .hit');
      phoneNumbers.push(
        ...Array.from(entries)
          .map(
            (entry) =>
              entry
                .querySelector('.phoneblock > span')
                ?.textContent?.split('Tel. ')[1]
          )
          .filter(Boolean)
      );
    } catch {}
    // endregion

    return phoneNumbers.map((phoneNumber) => ({
      ...input,
      phone: phoneNumber!
    }));
  }
}

export default PenNameAndAddressToPhoneNumberTransform;
