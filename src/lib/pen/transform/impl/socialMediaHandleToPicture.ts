import Transform from "../index";
import PenPerson from "../../person";
import axios from "axios";

class PenSocialMediaHandleToPicture extends Transform<'socialMediaHandle', 'pictures'> {

  async transform<A extends Partial<PenPerson>>(input: A & Pick<PenPerson, "socialMediaHandle">): Promise<Array<A & Pick<PenPerson, "socialMediaHandle" | "pictures">>> {
    // region Instagram
    const response = await axios.get(`https://www.instagram.com/${input.socialMediaHandle}/?__a=1`);
    console.log(response.data);
    // const dom = new jsdom.JSDOM(response.data);
    // endregion Instagram

    return [];
  }

}

export default PenSocialMediaHandleToPicture;