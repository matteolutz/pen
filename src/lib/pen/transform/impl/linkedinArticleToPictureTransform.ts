import axios from "axios";
import * as jsdom from "jsdom";
import PenPerson from "../../person";
import PenTransform from "../index";

class PenLinkedinArticleToPictureTransform<
  A extends Partial<PenPerson>
> extends PenTransform<'articles' | 'name' | 'surname', 'images', A> {
  public constructor() {
    super('LinkedinArticleToPictureTransform');
  }

  protected async _transform(input: Pick<PenPerson, "articles" | "name" | "surname"> & A): Promise<Array<Pick<PenPerson, "articles" | "name" | "surname" | "images"> & A>> {
    // get all linkedin articles
    const articles = input.articles.filter((a) => a.includes('linkedin.com'));
    const pictures = await Promise.all(articles.map<Promise<string | undefined>>(async (a) => {
      let domText;
      try {
        domText = await axios.get(a, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.2.3) Gecko/20100401 Firefox/3.6.3'
          }
        });
      } catch (e) {
        this._logger.warn(`LinkedIn request failed for ${a}: ` + e);
        return undefined;
      }
      const dom = new jsdom.JSDOM(domText.data);

      const name = dom.window.document.querySelector("#ember33 > h1")?.textContent;
      if (!name || name.toLowerCase() !== `${input.name} ${input.surname}`.toLowerCase()) {
        return undefined;
      }

      const profilePic = dom.window.document.querySelector("#ember31");
      if (profilePic) {
        return (profilePic as HTMLImageElement).src;
      }

      return undefined;
    }));

    return [{
      ...input,
      images: [...input.images ?? [], ...(pictures.filter(Boolean) as Array<string>)]
    }]
  }

}

export default PenLinkedinArticleToPictureTransform;