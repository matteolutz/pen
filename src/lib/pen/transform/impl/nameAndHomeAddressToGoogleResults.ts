import axios from 'axios';

import PenPerson from '../../person';
import PenTransform from '../index';

class PenNameAndHomeAddressToGoogleResults<
  A extends Partial<PenPerson>
> extends PenTransform<'name' | 'surname' | 'homeAddress', 'articles' | 'images', A> {
  public constructor() {
    super('NameAndHomeAddressToGoogleResults');
  }

  protected async _transform(
    input: A & Pick<PenPerson, 'name' | 'surname' | 'homeAddress'>
  ): Promise<
    Array<A & Pick<PenPerson, 'name' | 'surname' | 'homeAddress' | 'articles' | 'images'>>
  > {
    const reqAddress = input.homeAddress.reverseLookup.address.town ?? input.homeAddress.reverseLookup.address.village;

    const items = (
      await axios.get<{ items: Array<{ title: string; link: string }> }>(
        `https://www.googleapis.com/customsearch/v1?key=${
          process.env.GOOGLE_SEARCH_KEY
        }&cx=${process.env.GOOGLE_SEARCH_ENGINE_CX}&q=${encodeURIComponent(
          `"${input.name} ${input.surname}" "${reqAddress}"`
        )}`
      )
    )?.data?.items?.filter((item) => {
      if (item.title.includes('LinkedIn')) {
        return (
          item.title.includes(input.name) && item.title.includes(input.surname)
        );
      }

      return true;
    });

    const images = await axios.get<{ items: Array<{ title: string; link: string }> }>(
      `https://www.googleapis.com/customsearch/v1?key=${
        process.env.GOOGLE_SEARCH_KEY
      }&cx=${process.env.GOOGLE_SEARCH_ENGINE_CX}&q=${encodeURIComponent(
        `"${input.name} ${input.surname}" "${reqAddress}"`
      )}&searchType=image`
    );

    return [
      {
        ...input,
        articles: [...(input.articles ?? []), ...(items?.map((i) => i.link) ?? [])],
        images: [...input.images ?? [], ...(images.data.items.slice(0, 3).map((i) => i.link) ?? [])]
      }
    ];
  }
}

export default PenNameAndHomeAddressToGoogleResults;
