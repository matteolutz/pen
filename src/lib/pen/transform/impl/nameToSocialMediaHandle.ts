import Transform from "../index";
import PenPerson from "../../person";

class PenNameToSocialMediaHandleTransform extends Transform<'name' | 'surname', 'socialMediaHandle'> {

  private _removeVowels(input: string): string {
    return input.replace(/[aeiou]/gi, '');
  }

  transform<A extends Partial<PenPerson>>(input: A & Pick<PenPerson, "name" | "surname">): Array<A & Pick<PenPerson, "name" |  "surname" | "socialMediaHandle">> {
    const handles = [
      `${input.name.toLowerCase()}${input.surname.toLowerCase()}`,
      `${input.name.toLowerCase()}.${input.surname.toLowerCase()}`,
      `${input.name.toLowerCase()}_${input.surname.toLowerCase()}`,
      `${input.name.toLowerCase()}-${input.surname.toLowerCase()}`,
      `${input.name.substring(0, 1).toLowerCase()}${input.surname.toLowerCase()}`,
      `${input.name.substring(0, 1).toLowerCase()}.${input.surname.toLowerCase()}`,
      `${input.name.substring(0, 1).toLowerCase()}_${input.surname.toLowerCase()}`,
      `${input.name.substring(0, 1).toLowerCase()}-${input.surname.toLowerCase()}`,
      `${input.name.toLowerCase()}${this._removeVowels(input.surname.toLocaleLowerCase())}`,
      `${input.name.toLowerCase()}.${this._removeVowels(input.surname.toLocaleLowerCase())}`,
      `${input.name.toLowerCase()}_${this._removeVowels(input.surname.toLocaleLowerCase())}`,
      `${input.name.toLowerCase()}-${this._removeVowels(input.surname.toLocaleLowerCase())}`,
    ];

    return handles.map((h) => ({
      ...input,
      socialMediaHandle: h,
    }));
  }

}

export default PenNameToSocialMediaHandleTransform;