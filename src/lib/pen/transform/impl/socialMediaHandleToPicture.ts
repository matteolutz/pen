import axios from 'axios';

import PenPerson from '../../person';
import Transform from '../index';

class PenSocialMediaHandleToPicture<
  A extends Partial<PenPerson>
> extends Transform<'socialMediaHandle', 'images', A> {
  public constructor() {
    super('SocialMediaHandleToPicture');
  }

  protected async _transform(
    input: A & Pick<PenPerson, 'socialMediaHandle'>
  ): Promise<Array<A & Pick<PenPerson, 'socialMediaHandle' | 'images'>>> {
    // region Instagram
    const response = await axios.get(
      `https://www.instagram.com/${input.socialMediaHandle}/?__a=1`
    );
    console.log(response.data);
    // const dom = new jsdom.JSDOM(response.data);
    // endregion Instagram

    return [];
  }
}

export default PenSocialMediaHandleToPicture;
