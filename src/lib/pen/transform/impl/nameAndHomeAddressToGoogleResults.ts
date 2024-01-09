import PenTransform from "../index";
import PenPerson from "../../person";
import { reverseGeocodeSearch } from "../../utils/geocode";
import axios from "axios";
import * as jsdom from "jsdom";

const userAgents = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36"];

class PenNameAndHomeAddressToGoogleResults extends PenTransform<'name' | 'surname' | 'homeAddress', 'articles'> {
  async transform<A extends Partial<PenPerson>>(input: A & Pick<PenPerson, "name" | "surname" | "homeAddress">): Promise<Array<A & Pick<PenPerson, "name" | "surname" | "homeAddress" | "articles">>>  {
    const reverseGeocode = await reverseGeocodeSearch(input.homeAddress);
    const response = await axios.get(
      `https://google.com/search?q=${encodeURIComponent(`"${input.name} ${input.surname}" "${reverseGeocode.address.town}"`)}`,
      {
        headers: {
          'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
        }
      });

    const dom = new jsdom.JSDOM(response.data);
    const links = dom.window.document.getElementById('main')?.querySelectorAll('a');
    for (const link of links!) {
      try {
        const url = new URL(link.href);
        console.log(url.searchParams.toString());
        console.log(url.searchParams.get('url'));
      } catch {}
    }

    return [];
  }

}

export default PenNameAndHomeAddressToGoogleResults;