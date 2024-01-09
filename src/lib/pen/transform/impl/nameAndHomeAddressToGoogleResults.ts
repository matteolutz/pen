import PenTransform from "../index";
import PenPerson from "../../person";
import { reverseGeocodeSearch } from "../../utils/geocode";
import axios from "axios";

class PenNameAndHomeAddressToGoogleResults extends PenTransform<'name' | 'surname' | 'homeAddress', 'articles'> {
  async transform<A extends Partial<PenPerson>>(input: A & Pick<PenPerson, "name" | "surname" | "homeAddress">): Promise<Array<A & Pick<PenPerson, "name" | "surname" | "homeAddress" | "articles">>>  {
    const reverseGeocode = await reverseGeocodeSearch(input.homeAddress);
    const items = (await axios
      .get<{ items: Array<{ title: string; link: string }> }>(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_CX}&q=${encodeURIComponent(`"${input.name} ${input.surname}" "${reverseGeocode.address.town}"`)}`)
    ).data.items
      .filter((item) => {
        if (item.title.includes("LinkedIn")) {
          return item.title.includes(input.name) && item.title.includes(input.surname);
        }

        return true;
      });

    return [{
      ...input,
      articles: [...input.articles ?? [], ...items.map((i) => i.link)]
    }];
  }

}

export default PenNameAndHomeAddressToGoogleResults;