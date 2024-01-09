import axios from 'axios';

import PenPerson from '../../person';
import PenTransform from '../index';

class PenNameAndHomeAddressToGoogleResults<
  A extends Partial<PenPerson>
> extends PenTransform<'name' | 'surname' | 'homeAddress', 'articles', A> {
  public constructor() {
    super('NameAndHomeAddressToGoogleResults');
  }

  protected async _transform(
    input: A & Pick<PenPerson, 'name' | 'surname' | 'homeAddress'>
  ): Promise<
    Array<A & Pick<PenPerson, 'name' | 'surname' | 'homeAddress' | 'articles'>>
  > {
    const items = (
      await axios.get<{ items: Array<{ title: string; link: string }> }>(
        `https://www.googleapis.com/customsearch/v1?key=${
          process.env.GOOGLE_SEARCH_KEY
        }&cx=${process.env.GOOGLE_SEARCH_ENGINE_CX}&q=${encodeURIComponent(
          `"${input.name} ${input.surname}" "${input.homeAddress.reverseLookup.address.town}"`
        )}`
      )
    ).data.items.filter((item) => {
      if (item.title.includes('LinkedIn')) {
        return (
          item.title.includes(input.name) && item.title.includes(input.surname)
        );
      }

      return true;
    });

    return [
      {
        ...input,
        articles: [...(input.articles ?? []), ...items.map((i) => i.link)]
      }
    ];
  }
}

export default PenNameAndHomeAddressToGoogleResults;
